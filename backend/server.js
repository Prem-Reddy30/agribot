const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const OpenAI = require('openai');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const Groq = require('groq-sdk');

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail:
    process.env.FIREBASE_CLIENT_EMAIL ||
    (process.env.FIREBASE_CLIENT_ID
      ? `firebase-adminsdk-${process.env.FIREBASE_CLIENT_ID.split(':')[0]}@agriculture-login.iam.gserviceaccount.com`
      : undefined),
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
  throw new Error(
    'Firebase Admin SDK is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and either FIREBASE_CLIENT_EMAIL or FIREBASE_CLIENT_ID.'
  );
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID,
});

const db = admin.firestore();
const auth = admin.auth();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Helper function to verify Firebase token
async function verifyFirebaseToken(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function verifyAdmin(req, res, next) {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    return res.status(500).json({ error: 'Admin email not configured' });
  }

  if (!req.user?.email || req.user.email !== adminEmail) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
}

function verifyBasicAdmin(req, res, next) {
  const user = process.env.ADMIN_PANEL_USER;
  const pass = process.env.ADMIN_PANEL_PASS;

  if (!user || !pass) {
    return res.status(500).send('Admin panel is not configured. Set ADMIN_PANEL_USER and ADMIN_PANEL_PASS.');
  }

  const header = req.headers.authorization || '';
  const [scheme, encoded] = header.split(' ');

  if (scheme !== 'Basic' || !encoded) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Panel"');
    return res.status(401).send('Authentication required');
  }

  const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
  const idx = decoded.indexOf(':');
  const u = idx >= 0 ? decoded.slice(0, idx) : '';
  const p = idx >= 0 ? decoded.slice(idx + 1) : '';

  if (u !== user || p !== pass) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Panel"');
    return res.status(401).send('Invalid credentials');
  }

  next();
}

async function buildAdminMetrics() {
  const [usersSnap, conversationsSnap, eventsSnap] = await Promise.all([
    db.collection('users').get(),
    db.collection('conversations').get(),
    db.collection('usageEvents').get()
  ]);

  const uniqueConversationUsers = new Set();
  conversationsSnap.forEach((doc) => {
    const d = doc.data();
    if (d.userId) uniqueConversationUsers.add(d.userId);
  });

  const featureCounts = {};
  const pageCounts = {};
  const uniqueEventUsers = new Set();
  eventsSnap.forEach((doc) => {
    const d = doc.data();
    if (d.userId) uniqueEventUsers.add(d.userId);

    if (d.feature) {
      featureCounts[d.feature] = (featureCounts[d.feature] || 0) + 1;
    }
    if (d.page) {
      pageCounts[d.page] = (pageCounts[d.page] || 0) + 1;
    }
  });

  return {
    users: {
      total: usersSnap.size
    },
    conversations: {
      total: conversationsSnap.size,
      uniqueUsers: uniqueConversationUsers.size
    },
    usageEvents: {
      total: eventsSnap.size,
      uniqueUsers: uniqueEventUsers.size,
      byFeature: featureCounts,
      byPage: pageCounts
    }
  };
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// AI Chat endpoint
app.post('/api/chat', verifyFirebaseToken, async (req, res) => {
  try {
    const { message, conversationHistory = [], language = 'en' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('Chat request from user:', req.user.email, 'Language:', language);

    // Language-specific system prompts
    const systemPrompts = {
      en: `You are KrishiSahay, an AI assistant specialized in agriculture. You help farmers with:
        - Crop cultivation advice
        - Pest and disease management
        - Weather and climate information
        - Soil health and fertilizer recommendations
        - Modern farming techniques
        - Market prices and trends
        - Sustainable farming practices
        
        Provide helpful, practical advice in English. If you don't know something, admit it and suggest consulting local agricultural experts.`,

      hi: `आप कृषिसहाय हैं, कृषि में विशेषज्ञता रखने वाला एक AI सहायक हैं। आप किसानों की मदद करते हैं:
        - फसल उगाने की सलाह
        - कीट और रोग प्रबंधन
        - मौसम और जलवायु जानकारी
        - मृदा स्वास्थ्य और उर्वरक सिफारिशें
        - आधुनिक खेती तकनीक
        - बाजार मूल्य और रुझान
        - टिकाऊ खेती प्रथाएं
        
        कृपया हिंदी में उपयोगी, व्यावहारिक सलाह प्रदान करें। यदि आप कुछ नहीं जानते, तो स्वीकार करें और स्थानीय कृषि विशेषज्ञों से परामर्श करने का सुझाव दें।`,

      te: `మీరు కృషిసహాయ, వ్యవసాయంలో నైపుణ్యం కలిగిన AI సహాయకుడు. మీరు రైతులకు సహాయం చేస్తారు:
        - పంటల సాగు సలహాలు
        - పురుగులు మరియు వ్యాధుల నిర్వహణ
        - వాతావరణం మరియు వాతావరణ సమాచారం
        - నేల ఆరోగ్యం మరియు ఎరువుల సిఫార్సులు
        - ఆధునిక వ్యవసాయ పద్ధతులు
        - మార్కెట్ ధరలు మరియు ధోరణులు
        - స్థిరమైన వ్యవసాయ పద్ధతులు
        
        దయచేసి తెలుగులో ఉపయోగకరమైన, ప్రాయోగిక సలహాలు అందించండి. మీకు ఏమీ తెలియకపోతే, అది ఒప్పుకుని స్థానిక వ్యవసాయ నిపుణులను సంప్రదించమని సూచించండి.`,

      ta: `நீங்கள் கிருஷிசஹாய், வேளாண்மையில் நிபுணத்துவம் கொண்ட ஒரு AI உதவியாளர். நீங்கள் விவசாயிகளுக்கு உதவுகிறீர்கள்:
        - பயிர் பயிரிடும் ஆலோசனை
        - பூச்சிகள் மற்றும் நோய்கள் மேலாண்மை
        - வானிலை மற்றும் காலநிலை தகவல்
        - மண் ஆரோக்கியம் மற்றும் உரப் பரிந்துரைகள்
        - நவீன வேளாண்மை நுட்பங்கள்
        - சந்தை விலைகள் மற்றும் போக்குகள்
        - நிலையான வேளாண்மை நடைமுறைகள்
        
        தயவுசெய்து தமிழில் பயனுள்ள, நடைமுறை ஆலோசனைகளை வழங்கவும். உங்களுக்கு ஏதும் தெரியாவிட்டால், ஒப்புக்கொண்டு உள்ளூர் வேளாண்மை நிபுணர்களை அணுகுமாறு பரிந்துரைக்கவும்.`,

      ml: `നിങ്ങൾ കൃഷിസഹായ, കൃഷിയിൽ വൈദഗ്ധ്യമുള്ള ഒരു AI സഹായി. നിങ്ങൾ കർഷകർക്ക് സഹായം ചെയ്യുന്നു:
        - വിള കൃഷി ഉപദേശം
        - കീടങ്ങളും രോഗങ്ങളും നിയന്ത്രണം
        - കാലാവസ്ഥയും കാലാവസ്ഥാ വിവരങ്ങളും
        - മണ്ണിന്റെ ആരോഗ്യവും വളപ്പെടുത്തൽ ശുപാർശകളും
        - ആധുനിക കൃഷി രീതികൾ
        - വിപണി വിലകളും ട്രെൻഡുകളും
        - നിലവിലായ കൃഷി രീതികൾ
        
        ദയവായി മലയാളത്തിൽ ഉപകാരപ്രദമായ, പ്രായോഗിക ഉപദേശങ്ങൾ നൽകുക. നിങ്ങൾക്ക് ന്നും അറിയില്ലെങ്കിൽ, അത് സമ്മതിച്ച് പ്രാദേശിക കാർഷിക വിദഗ്ധരെ സമീപിക്കാൻ നിർദ്ദേശിക്കുക.`
    };

    // Prepare conversation for OpenAI
    const messages = [
      {
        role: 'system',
        content: systemPrompts[language] || systemPrompts.en
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message
      }
    ];

    // AI Engine Selection
    let aiResponse = '';

    if (process.env.GROQ_API_KEY) {
      console.log('Using Groq AI for response...');
      const completion = await groq.chat.completions.create({
        messages: messages,
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1024,
      });
      aiResponse = completion.choices[0]?.message?.content || "";
    } else {
      console.log('Using OpenAI for response...');
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      });
      aiResponse = completion.choices[0].message.content;
    }

    // Save conversation to Firestore
    await db.collection('conversations').add({
      userId: req.user.uid,
      userEmail: req.user.email,
      userMessage: message,
      aiResponse: aiResponse,
      language: language,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: {
        userAgent: req.headers['user-agent'],
        ip: req.ip
      }
    });

    res.json({
      response: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({
      error: 'Failed to process chat request',
      details: error.message
    });
  }
});

// Track feature usage
app.post('/api/track', verifyFirebaseToken, async (req, res) => {
  try {
    const { feature, page } = req.body;

    if (!feature && !page) {
      return res.status(400).json({ error: 'feature or page is required' });
    }

    await db.collection('usageEvents').add({
      userId: req.user.uid,
      userEmail: req.user.email,
      feature: feature || null,
      page: page || null,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: {
        userAgent: req.headers['user-agent'],
        ip: req.ip
      }
    });

    res.json({ ok: true });
  } catch (error) {
    console.error('Track usage error:', error);
    res.status(500).json({ error: 'Failed to track usage' });
  }
});

// Admin metrics
app.get('/api/admin/metrics', verifyFirebaseToken, verifyAdmin, async (req, res) => {
  try {
    const metrics = await buildAdminMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Admin metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Basic-auth protected metrics for separate admin panel
app.get('/api/admin/metrics-basic', verifyBasicAdmin, async (req, res) => {
  try {
    const metrics = await buildAdminMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Admin metrics (basic) error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Separate admin panel page (basic auth)
app.get('/admin', verifyBasicAdmin, (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Admin Panel</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
    <div class="max-w-6xl mx-auto px-4 py-10">
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="bg-green-600 p-6 flex items-start justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-white">Admin Panel</h1>
            <p class="text-green-100 mt-2">Usage monitoring dashboard</p>
          </div>
          <button id="refresh" class="bg-white/10 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/20 transition-colors">
            Refresh
          </button>
        </div>

        <div class="p-6 space-y-6">
          <div id="error" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"></div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div class="text-xs text-gray-500">Total Users</div>
              <div id="usersTotal" class="text-xl font-bold text-gray-900">-</div>
            </div>
            <div class="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div class="text-xs text-gray-500">Total Chats</div>
              <div id="chatsTotal" class="text-xl font-bold text-gray-900">-</div>
            </div>
            <div class="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div class="text-xs text-gray-500">Unique Chat Users</div>
              <div id="uniqueChatUsers" class="text-xl font-bold text-gray-900">-</div>
            </div>
            <div class="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div class="text-xs text-gray-500">Usage Events</div>
              <div id="eventsTotal" class="text-xl font-bold text-gray-900">-</div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="border border-gray-200 rounded-xl overflow-hidden">
              <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 font-semibold text-gray-900">Usage by Feature</div>
              <div id="features" class="p-4 text-sm text-gray-700">-</div>
            </div>
            <div class="border border-gray-200 rounded-xl overflow-hidden">
              <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 font-semibold text-gray-900">Usage by Page</div>
              <div id="pages" class="p-4 text-sm text-gray-700">-</div>
            </div>
          </div>

          <div class="text-xs text-gray-500">This page is protected by Basic Auth. Configure ADMIN_PANEL_USER and ADMIN_PANEL_PASS in backend env.</div>
        </div>
      </div>
    </div>

    <script>
      function renderMap(obj) {
        const entries = Object.entries(obj || {}).sort((a,b)=>b[1]-a[1]);
        if (!entries.length) return '<div class="text-gray-500">No data</div>';
        return entries.map(([k,v]) => `< div class= "flex items-center justify-between py-1" ><div>${k}</div><div class="font-semibold">${v}</div></div > `).join('');
      }

      async function load() {
        const errorEl = document.getElementById('error');
        errorEl.classList.add('hidden');
        errorEl.textContent = '';

        try {
          const res = await fetch('/api/admin/metrics-basic');
          if (!res.ok) throw new Error(`Failed: ${ res.status } ${ res.statusText }`);
          const data = await res.json();

          document.getElementById('usersTotal').textContent = data?.users?.total ?? '-';
          document.getElementById('chatsTotal').textContent = data?.conversations?.total ?? '-';
          document.getElementById('uniqueChatUsers').textContent = data?.conversations?.uniqueUsers ?? '-';
          document.getElementById('eventsTotal').textContent = data?.usageEvents?.total ?? '-';

          document.getElementById('features').innerHTML = renderMap(data?.usageEvents?.byFeature);
          document.getElementById('pages').innerHTML = renderMap(data?.usageEvents?.byPage);
        } catch (e) {
          errorEl.textContent = e.message || String(e);
          errorEl.classList.remove('hidden');
        }
      }

      document.getElementById('refresh').addEventListener('click', load);
      load();
    </script>
  </body>
</html>`);
});

// Get conversation history
app.get('/api/conversations', verifyFirebaseToken, async (req, res) => {
  try {
    const conversationsSnapshot = await db
      .collection('conversations')
      .where('userId', '==', req.user.uid)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    const conversations = [];
    conversationsSnapshot.forEach(doc => {
      conversations.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Delete conversation
app.delete('/api/conversations/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    const conversationRef = db.collection('conversations').doc(id);
    const conversation = await conversationRef.get();

    if (!conversation.exists) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Verify user owns this conversation
    if (conversation.data().userId !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await conversationRef.delete();
    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// User profile endpoint
app.get('/api/user/profile', verifyFirebaseToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();

    if (!userDoc.exists) {
      // Create user profile if it doesn't exist
      await db.collection('users').doc(req.user.uid).set({
        email: req.user.email,
        name: req.user.name || req.user.email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
        preferences: {
          language: 'en',
          notifications: true,
          theme: 'light'
        }
      });
    }

    const userProfile = await db.collection('users').doc(req.user.uid).get();
    res.json({ profile: userProfile.data() });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 KrishiSahay Backend Server running on port ${PORT}`);
  console.log(`📅 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
});
