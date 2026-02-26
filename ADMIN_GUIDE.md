# Admin Dashboard Guide

## Overview
The admin dashboard provides monitoring and analytics for your Agricultural AI Assistant application. It tracks user activity, feature usage, and conversation metrics.

## Accessing the Admin Dashboard

### 1. Navigate to Admin Login
- Go to the home page
- Scroll to the footer
- Click the "Admin" link in the bottom right corner
- Or directly navigate to the admin login page

### 2. Login with Admin Credentials
- Enter your admin email address
- Enter your admin password
- Click "Sign In"

The admin login uses Firebase Authentication, so you'll need to create an admin user account in your Firebase console.

## Dashboard Features

### Metrics Overview
The dashboard displays four key metrics:

1. **Total Users** - Total number of registered users
2. **Total Chats** - Total number of conversations
3. **Unique Chat Users** - Number of unique users who have used the chat feature
4. **Usage Events** - Total number of tracked feature usage events

### Usage Analytics

#### Usage by Feature
Shows how many times each feature has been used:
- Chat interactions
- Disease prediction
- Location suggestions
- Market price checks
- Other tracked features

#### Usage by Page
Shows page visit statistics:
- Home page visits
- Chatbot page visits
- Disease prediction page visits
- Location suggestions page visits
- Market prices page visits

### Dashboard Controls

- **Refresh Button** - Reload the latest metrics from the server
- **Back Button** - Return to the home page (logs out of admin session)

## Backend Requirements

The admin dashboard requires the following backend endpoint:

```
GET /api/admin/metrics
```

This endpoint should return:
```json
{
  "users": {
    "total": 0
  },
  "conversations": {
    "total": 0,
    "uniqueUsers": 0
  },
  "usageEvents": {
    "total": 0,
    "uniqueUsers": 0,
    "byFeature": {
      "feature_name": count
    },
    "byPage": {
      "page_name": count
    }
  }
}
```

### Backend Environment Variables

Add the following to your `backend/.env` file:

```env
# Admin Configuration
ADMIN_EMAIL=your-admin@example.com

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Optional: Basic Auth Admin Panel (for /admin route)
ADMIN_PANEL_USER=admin
ADMIN_PANEL_PASS=your-secure-password
```

The backend has two admin access methods:

1. **Firebase Auth Admin** (used by the React dashboard)
   - Requires Firebase authentication
   - User email must match `ADMIN_EMAIL` environment variable
   - Endpoint: `GET /api/admin/metrics`

2. **Basic Auth Admin Panel** (standalone HTML page)
   - Uses HTTP Basic Authentication
   - Access at: `http://localhost:5000/admin`
   - Credentials from `ADMIN_PANEL_USER` and `ADMIN_PANEL_PASS`
   - Endpoint: `GET /api/admin/metrics-basic`

## Security Notes

1. The admin login uses Firebase Authentication
2. Admin access should be restricted to authorized personnel only
3. Consider implementing role-based access control (RBAC) in your backend
4. The admin dashboard link is subtle in the footer to prevent unauthorized access attempts
5. Admin sessions are separate from regular user sessions

## Setting Up Admin Users

To create an admin user:

1. Go to your Firebase Console
2. Navigate to Authentication > Users
3. Add a new user with email and password
4. Optionally, add custom claims to mark the user as an admin in your backend

## Troubleshooting

### Cannot Access Dashboard
- Ensure you're using valid admin credentials
- Check that Firebase Authentication is properly configured
- Verify the backend `/api/admin/metrics` endpoint is accessible

### No Data Showing
- Ensure users are logged in when using features (tracking only works for authenticated users)
- Check that the `trackUsage()` function is being called in your components
- Verify the backend is storing usage events correctly

### Metrics Not Updating
- Click the Refresh button to reload data
- Check browser console for any API errors
- Verify backend database connections

## Future Enhancements

Consider adding:
- Date range filters for metrics
- Export functionality for reports
- Real-time updates using WebSockets
- User management features
- System health monitoring
- Detailed conversation logs
- Performance metrics
