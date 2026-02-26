const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const Groq = require('groq-sdk');

// Load environment variables
dotenv.config();

// Initialize Groq
const apiKey = (process.env.GROQ_API_KEY || '').trim();
console.log('API Key loaded (length):', apiKey.length);
if (apiKey.startsWith('gsk_')) {
  console.log('API Key starts with gsk_');
}

const groq = new Groq({
  apiKey: apiKey,
});

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mock agricultural responses
const mockResponses = {
  en: {
    greeting: "Hello! I'm KrishiSahay, your AI agricultural assistant. How can I help you with your farming needs today?",
    rice: "For rice cultivation, I recommend: 1) Use high-quality seeds, 2) Maintain proper water levels (2-3 inches), 3) Apply balanced fertilizer (NPK 4:2:1), 4) Monitor for pests like brown planthopper. What specific aspect of rice farming would you like to know more about?",
    wheat: "For wheat farming: 1) Sow in November-December, 2) Use seed rate of 100kg/acre, 3) Apply DAP fertilizer at sowing, 4) Irrigate at crown root initiation and flowering stages. Need more specific advice?",
    pests: "Common pests include aphids, whiteflies, and mites. I recommend: 1) Use neem oil spray, 2) Introduce ladybugs, 3) Remove infected plants, 4) Maintain proper spacing. Which pest are you dealing with?",
    weather: "Based on current weather patterns, consider: 1) Delay sowing if heavy rains expected, 2) Use drought-resistant varieties in dry areas, 3) Plan irrigation around monsoon schedule. What's your location?",
    default: "I can help you with crop selection, pest management, irrigation techniques, fertilizer recommendations, weather-based farming advice, and market information. Please specify your farming question or concern."
  },
  hi: {
    greeting: "नमस्ते! मैं कृषिसहाय हूं, आपका AI कृषि सहायक। आज मैं आपकी कृषि जरूरतों में कैसे मदद कर सकता हूं?",
    rice: "धान की खेती के लिए: 1) उच्च गुणवत्त बीज उपयोग करें, 2) उचित जल स्तर (2-3 इंच) बनाए रखें, 3) संतुलित उर्वरक (NPK 4:2:1) उपयोग करें, 4) भूरी प्लांटॉपर जैसे निगराने के लिए देखें। धान की खेती के किस पहलू पर अधिक जानकारी चाहिए?",
    wheat: "गेहूं की खेती के लिए: 1) नवंबर-दिसंबर में बोएं, 2) 100kg/एकड़ की बीज दर उपयोग करें, 3) बोने के समय DAP उर्वरक लगाएं, 4) क्राउन रूट आरंभावन और फूलन के चरणों में सिंचाईं। अधिक विशिष ज्ञता चाहिए?",
    default: "मैं आपकी फसल चयन, कीट प्रबंधन, सिंचाई तकनीक, उर्वरक सिफारिश, मौसम-आधारित कृषि सलाह, और बाजार जानकारी में मदद कर सकता हूं। कृपया अपना कृषि प्रश्न या चिंता बताएं।"
  }
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// AI Chat endpoint (mock responses)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [], language = 'en' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('Chat request:', message, 'Language:', language);
    let response = '';

    // Language-specific system prompts
    const systemPrompts = {
      en: "You are KrishiSahay, an AI specialized in agriculture. Format your answers clearly with emojis, bullet points, bold headings, and short paragraphs for readability. Always provide structured advice like ChatGPT. Use icons like 🌾, 🐛, 🚜, 💧 where appropriate.",
      hi: "आप कृषिसहाय हैं, कृषि में विशेषज्ञ। अपनी उत्तरों को इमोजी, बुलेट पॉइंट्स, बोल्ड हेडिंग्स और छोटे अनुच्छेदों के साथ स्पष्ट रूप से प्रारूपित करें। 🌾, 🐛, 🚜 जैसे आइकन का उपयोग करें।",
      te: "మీరు కృషిసహాయ, వ్యవసాయ నిపుణులు. ఎమోజీలు, బుల్లెట్ పాయింట్లు మరియు బోల్డ్ హెడ్డింగ్లతో మీ సమాధానాలను అందంగా ఫార్మాట్ చేయండి. 🌾, 🚜 వంటి చిహ్నాలను వాడండి.",
      ta: "நீங்கள் கிருஷிசஹாய், வேளாண் நிபுணர். எமோஜிகள், புல்லட் பாயிண்டுகள் மற்றும் தலைப்புகளுடன் பதிலளிக்கவும். 🌾, 🐛, 🚜 போன்றவற்றை பயன்படுத்துங்கள்.",
      ml: "നിങ്ങൾ കൃഷിസഹായ, കൃഷി വിദഗ്ധൻ. ഇമോജികൾ, ബുള്ളറ്റ് പോയിന്റുകൾ, ബോൾഡ് ഹെഡിംഗുകൾ എന്നിവ ഉപയോഗിച്ച് മറുപടി നൽകുക. 🌾, 🐛, 🚜 എന്നിവ ഉൾപ്പെടുത്തുക."
    };

    if (process.env.GROQ_API_KEY) {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompts[language] || systemPrompts.en },
          ...conversationHistory,
          { role: 'user', content: message }
        ],
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        temperature: 0.7,
      });
      response = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
    } else {
      // Generate mock response based on message content
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('नमस्ते')) {
        response = mockResponses[language]?.greeting || mockResponses.en.greeting;
      } else if (lowerMessage.includes('rice') || lowerMessage.includes('धान')) {
        response = mockResponses[language]?.rice || mockResponses.en.rice;
      } else if (lowerMessage.includes('wheat') || lowerMessage.includes('गेहूं')) {
        response = mockResponses[language]?.wheat || mockResponses.en.wheat;
      } else if (lowerMessage.includes('pest') || lowerMessage.includes('कीट')) {
        response = mockResponses[language]?.pests || mockResponses.en.pests;
      } else if (lowerMessage.includes('weather') || lowerMessage.includes('मौसम')) {
        response = mockResponses[language]?.weather || mockResponses.en.weather;
      } else {
        response = mockResponses[language]?.default || mockResponses.en.default;
      }
    }

    res.json({
      response: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error DETAILS:', error);
    res.status(500).json({
      error: 'Failed to process chat request',
      details: error.message,
      stack: error.stack
    });
  }
});

// Simple conversation history (in-memory for demo)
let conversations = [];

// Get conversation history
app.get('/api/conversations', (req, res) => {
  res.json({ conversations });
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
