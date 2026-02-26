# KrishiSahay Backend

A comprehensive backend for the KrishiSahay agricultural AI assistant platform.

## Features

- 🔐 **Firebase Authentication** - Secure user authentication with token verification
- 🤖 **OpenAI Integration** - AI-powered agricultural advice
- 💬 **Chat System** - Conversation history and management
- 👤 **User Profiles** - User data and preferences
- 🔒 **Security** - CORS, helmet, input validation
- 📊 **Logging** - Morgan logging for debugging

## API Endpoints

### Authentication
- All protected routes require valid Firebase token
- Token verification middleware

### Chat & AI
- `POST /api/chat` - Send message to AI
- `GET /api/conversations` - Get user's conversation history
- `DELETE /api/conversations/:id` - Delete conversation

### User Management
- `GET /api/user/profile` - Get user profile
- Auto-creates user profile on first login

### System
- `GET /api/health` - Health check endpoint
- `POST /api/track` - Track feature/page usage (requires auth)

### Admin (Protected)
- `GET /api/admin/metrics` - Get usage metrics (requires Firebase auth + admin email)
- `GET /api/admin/metrics-basic` - Get usage metrics (requires Basic auth)
- `GET /admin` - Admin dashboard HTML page (requires Basic auth)

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
1. Copy `.env.example` to `.env`
2. Add your API keys:
   - Firebase Private Key
   - OpenAI API Key
   - Firebase Client ID

### 3. Firebase Setup
1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate new private key
3. Download JSON file and copy contents to `.env`

### 4. Start Server
```bash
# Development
npm run dev

# Production
npm start
```

## Environment Variables

```env
PORT=5000
NODE_ENV=development
FIREBASE_PROJECT_ID=agriculture-login
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-3.5-turbo
FRONTEND_URL=http://localhost:5173

# Admin Configuration
ADMIN_EMAIL=admin@example.com
ADMIN_PANEL_USER=admin
ADMIN_PANEL_PASS=secure-password
```

## Security Features

- Firebase Admin SDK for secure authentication
- Helmet for security headers
- CORS configured for frontend domain
- Input validation and sanitization
- Error handling and logging

## AI Capabilities

The AI assistant specializes in:
- 🌾 **Crop Cultivation** - Planting, harvesting, crop rotation
- 🐛 **Pest Management** - Identification, organic solutions
- 🏥 **Disease Control** - Symptoms, prevention, treatment
- 🌡️ **Weather & Climate** - Planning, adaptation strategies
- 🌱 **Soil Health** - Testing, fertilization, pH balance
- 📈 **Market Intelligence** - Prices, trends, best selling times
- 🌿 **Sustainable Farming** - Organic practices, water conservation
- 🚜 **Modern Techniques** - Hydroponics, vertical farming, precision agriculture

## Database Schema

### Users Collection
```javascript
{
  email: string,
  name: string,
  createdAt: timestamp,
  lastLoginAt: timestamp,
  preferences: {
    language: string,
    notifications: boolean,
    theme: string
  }
}
```

### Conversations Collection
```javascript
{
  userId: string,
  userEmail: string,
  userMessage: string,
  aiResponse: string,
  timestamp: timestamp,
  metadata: {
    userAgent: string,
    ip: string
  }
}
```

### Usage Events Collection
```javascript
{
  userId: string,
  userEmail: string,
  feature: string | null,
  page: string | null,
  timestamp: timestamp,
  metadata: {
    userAgent: string,
    ip: string
  }
}
```

## Deployment

### Local Development
```bash
npm install
npm run dev
```

### Production (Recommended)
- Use PM2 for process management
- Set up reverse proxy (nginx/apache)
- Configure SSL certificates
- Set NODE_ENV=production

## Monitoring

- Morgan logging for HTTP requests
- Console logging for errors and debugging
- Health check endpoint for monitoring

## Admin Dashboard

The backend provides two admin access methods:

### 1. React Admin Dashboard (Firebase Auth)
- Integrated into the main React application
- Access via footer "Admin" link on the home page
- Requires Firebase authentication
- User email must match `ADMIN_EMAIL` environment variable
- Provides real-time metrics and analytics

### 2. Standalone Admin Panel (Basic Auth)
- Simple HTML dashboard at `/admin` route
- Protected by HTTP Basic Authentication
- Credentials: `ADMIN_PANEL_USER` and `ADMIN_PANEL_PASS`
- Access at: `http://localhost:5000/admin`
- No frontend build required

### Admin Metrics Provided
- Total registered users
- Total conversations
- Unique users who have chatted
- Total usage events tracked
- Usage breakdown by feature
- Usage breakdown by page

### Setting Up Admin Access

1. Add to `backend/.env`:
```env
ADMIN_EMAIL=your-admin@example.com
ADMIN_PANEL_USER=admin
ADMIN_PANEL_PASS=your-secure-password
```

2. Create admin user in Firebase Console:
   - Go to Authentication → Users
   - Add user with email matching `ADMIN_EMAIL`
   - Set a secure password

3. Access the dashboard:
   - React Dashboard: Login with admin credentials via the app
   - Standalone Panel: Visit `/admin` and enter Basic Auth credentials

For detailed admin setup instructions, see `ADMIN_GUIDE.md` in the project root.

## API Usage Examples

### Chat Request
```javascript
const response = await fetch('http://localhost:5000/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + firebaseToken
  },
  body: JSON.stringify({
    message: 'How do I treat tomato blight?',
    conversationHistory: []
  })
});

const data = await response.json();
console.log(data.response); // AI response
```

### Get Conversations
```javascript
const response = await fetch('http://localhost:5000/api/conversations', {
  headers: {
    'Authorization': 'Bearer ' + firebaseToken
  }
});

const { conversations } = await response.json();
```

## Troubleshooting

### Common Issues
1. **Firebase Authentication Error**
   - Check private key format
   - Verify project ID matches

2. **OpenAI API Error**
   - Check API key validity
   - Verify model name

3. **CORS Issues**
   - Check FRONTEND_URL in .env
   - Verify frontend URL matches

4. **Database Connection**
   - Check Firebase project settings
   - Verify service account permissions
