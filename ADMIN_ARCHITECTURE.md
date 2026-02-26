# Admin Dashboard Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Agricultural AI Assistant                    │
│                         Admin System                             │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐              ┌──────────────────────┐
│   React Frontend     │              │   Backend Server     │
│   (Port 5173)        │◄────────────►│   (Port 5000)        │
└──────────────────────┘              └──────────────────────┘
         │                                      │
         │                                      │
         ▼                                      ▼
┌──────────────────────┐              ┌──────────────────────┐
│  Admin Components    │              │  Admin Endpoints     │
│  ├─ AdminLoginPage   │              │  ├─ /api/admin/      │
│  └─ AdminDashboard   │              │  │   metrics          │
└──────────────────────┘              │  ├─ /api/admin/      │
                                      │  │   metrics-basic    │
                                      │  └─ /admin (HTML)    │
                                      └──────────────────────┘
                                               │
                                               ▼
                                      ┌──────────────────────┐
                                      │  Firebase Firestore  │
                                      │  ├─ users            │
                                      │  ├─ conversations    │
                                      │  └─ usageEvents      │
                                      └──────────────────────┘
```

## Access Flow

### React Admin Dashboard Flow

```
User visits homepage
       │
       ▼
Clicks "Admin" link in footer
       │
       ▼
Redirected to AdminLoginPage
       │
       ▼
Enters email & password
       │
       ▼
Firebase Authentication
       │
       ├─ Success ──────────────┐
       │                        │
       └─ Failure               ▼
          (Error message)   Backend verifies
                           email = ADMIN_EMAIL
                                  │
                                  ├─ Match ────────┐
                                  │                 │
                                  └─ No Match       ▼
                                     (403 Error)  AdminDashboard
                                                  displays metrics
```

### Standalone Admin Panel Flow

```
User visits /admin
       │
       ▼
Browser prompts for
Basic Auth credentials
       │
       ▼
User enters username/password
       │
       ▼
Backend verifies against
ADMIN_PANEL_USER & ADMIN_PANEL_PASS
       │
       ├─ Match ────────────┐
       │                    │
       └─ No Match          ▼
          (401 Error)   HTML dashboard
                        displays metrics
```

## Component Architecture

### Frontend Components

```
App.tsx
  │
  ├─ Navigation
  │    └─ (No admin link here)
  │
  ├─ Footer
  │    └─ Admin Link (subtle, bottom right)
  │
  ├─ AdminLoginPage
  │    ├─ Email input
  │    ├─ Password input (with show/hide)
  │    ├─ Sign In button
  │    └─ Back button
  │
  └─ AdminDashboard
       ├─ Header (with Refresh & Back buttons)
       ├─ Metrics Cards
       │    ├─ Total Users
       │    ├─ Total Chats
       │    ├─ Unique Chat Users
       │    └─ Usage Events
       ├─ Usage by Feature (table)
       └─ Usage by Page (table)
```

### Backend Endpoints

```
server.js
  │
  ├─ Middleware
  │    ├─ verifyFirebaseToken()
  │    ├─ verifyAdmin()
  │    └─ verifyBasicAdmin()
  │
  ├─ Admin Routes
  │    ├─ GET /api/admin/metrics
  │    │    ├─ Requires: Firebase token
  │    │    ├─ Requires: Email = ADMIN_EMAIL
  │    │    └─ Returns: JSON metrics
  │    │
  │    ├─ GET /api/admin/metrics-basic
  │    │    ├─ Requires: Basic Auth
  │    │    └─ Returns: JSON metrics
  │    │
  │    └─ GET /admin
  │         ├─ Requires: Basic Auth
  │         └─ Returns: HTML dashboard
  │
  └─ Helper Functions
       └─ buildAdminMetrics()
            ├─ Queries Firestore collections
            ├─ Aggregates data
            └─ Returns formatted metrics
```

## Data Flow

### Tracking User Activity

```
User interacts with app
       │
       ▼
Component calls trackUsage()
       │
       ▼
POST /api/track
       │
       ▼
Backend saves to Firestore
usageEvents collection
       │
       ▼
Data available for admin dashboard
```

### Fetching Admin Metrics

```
Admin opens dashboard
       │
       ▼
AdminDashboard.tsx calls
getAdminMetrics()
       │
       ▼
GET /api/admin/metrics
(with Firebase token)
       │
       ▼
Backend verifies token & email
       │
       ▼
buildAdminMetrics() queries:
  ├─ users collection
  ├─ conversations collection
  └─ usageEvents collection
       │
       ▼
Aggregates and formats data
       │
       ▼
Returns JSON to frontend
       │
       ▼
Dashboard displays metrics
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     Security Layers                          │
└─────────────────────────────────────────────────────────────┘

Layer 1: UI Access Control
  └─ Admin link subtle in footer (not prominent)

Layer 2: Firebase Authentication
  └─ Valid Firebase user required

Layer 3: Email Verification
  └─ User email must match ADMIN_EMAIL env var

Layer 4: Token Verification
  └─ Firebase token verified on every request

Layer 5: CORS Protection
  └─ Only configured frontend URL allowed

Layer 6: Basic Auth (Standalone Panel)
  └─ Username/password required for /admin route
```

## Database Collections

### users
```javascript
{
  id: "firebase-uid",
  email: "user@example.com",
  name: "User Name",
  createdAt: timestamp,
  lastLoginAt: timestamp,
  preferences: { ... }
}
```

### conversations
```javascript
{
  id: "auto-generated",
  userId: "firebase-uid",
  userEmail: "user@example.com",
  userMessage: "How do I grow tomatoes?",
  aiResponse: "To grow tomatoes...",
  language: "en",
  timestamp: timestamp,
  metadata: { userAgent, ip }
}
```

### usageEvents
```javascript
{
  id: "auto-generated",
  userId: "firebase-uid",
  userEmail: "user@example.com",
  feature: "chat" | "disease" | "location" | "market",
  page: "home" | "chatbot" | "disease" | etc.,
  timestamp: timestamp,
  metadata: { userAgent, ip }
}
```

## Environment Configuration

### Frontend (.env)
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
# ... other Firebase config
```

### Backend (.env)
```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...

# Admin Access
ADMIN_EMAIL=admin@example.com
ADMIN_PANEL_USER=admin
ADMIN_PANEL_PASS=secure-password

# API Keys
OPENAI_API_KEY=...

# Server Config
PORT=5000
FRONTEND_URL=http://localhost:5173
```

## Deployment Considerations

### Development
- Frontend: `npm run dev` (Vite dev server)
- Backend: `npm start` or `npm run dev`
- Both run on localhost

### Production
- Frontend: Build with `npm run build`, serve static files
- Backend: Use PM2 or similar process manager
- Use HTTPS for all connections
- Set strong passwords for admin access
- Configure proper CORS origins
- Use environment-specific configs
- Enable rate limiting
- Add request logging
- Set up monitoring and alerts

## Future Enhancements

### Potential Features
- Role-based access control (multiple admin levels)
- User management (ban, delete, edit users)
- Conversation search and filtering
- Export metrics to CSV/PDF
- Real-time updates with WebSockets
- Date range filters for metrics
- Charts and graphs for visualization
- Email notifications for admin alerts
- Audit logs for admin actions
- System health monitoring
- Performance metrics
- API usage statistics

### Scalability
- Add caching layer (Redis)
- Implement pagination for large datasets
- Use database indexes for faster queries
- Add CDN for static assets
- Implement load balancing
- Use message queues for async tasks
