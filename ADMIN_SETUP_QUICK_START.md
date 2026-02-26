# Admin Dashboard - Quick Start Guide

## What's Been Added

Your Agricultural AI Assistant now has a complete admin dashboard system with two access methods:

### 1. React Admin Dashboard (Main App)
- Beautiful, responsive admin interface integrated into your React app
- Access via the "Admin" link in the footer
- Firebase authentication required
- Real-time metrics and analytics

### 2. Standalone Admin Panel (Backend)
- Simple HTML dashboard served by the backend
- Access at `http://localhost:5000/admin`
- Basic HTTP authentication
- No frontend build required

## Quick Setup (3 Steps)

### Step 1: Configure Backend Environment

Add these variables to `backend/.env`:

```env
# Admin email for React dashboard (must match Firebase user)
ADMIN_EMAIL=admin@example.com

# Credentials for standalone admin panel
ADMIN_PANEL_USER=admin
ADMIN_PANEL_PASS=your-secure-password
```

### Step 2: Create Admin User in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Users**
4. Click **Add User**
5. Enter email (must match `ADMIN_EMAIL` from Step 1)
6. Set a secure password
7. Click **Add User**

### Step 3: Start Your Servers

```bash
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend
npm install
npm run dev
```

## Accessing the Admin Dashboard

### Method 1: React Dashboard (Recommended)
1. Open your app at `http://localhost:5173`
2. Scroll to the footer
3. Click the "Admin" link (bottom right)
4. Login with your admin Firebase credentials
5. View metrics and analytics

### Method 2: Standalone Panel
1. Open `http://localhost:5000/admin` in your browser
2. Enter Basic Auth credentials:
   - Username: value of `ADMIN_PANEL_USER`
   - Password: value of `ADMIN_PANEL_PASS`
3. View metrics

## What You Can Monitor

Both dashboards show:

- **Total Users** - Number of registered users
- **Total Chats** - Number of conversations
- **Unique Chat Users** - Users who have used the chat feature
- **Usage Events** - Tracked feature interactions
- **Usage by Feature** - Which features are most popular
- **Usage by Page** - Which pages get the most visits

## Files Modified/Created

### New Files
- `src/components/AdminLoginPage.tsx` - Admin login component
- `src/components/AdminDashboard.tsx` - Admin dashboard component
- `ADMIN_GUIDE.md` - Detailed admin documentation
- `ADMIN_SETUP_QUICK_START.md` - This file

### Modified Files
- `src/App.tsx` - Added admin routing
- `src/components/Footer.tsx` - Added admin link
- `backend/README.md` - Added admin documentation
- `src/services/api.ts` - Already had `getAdminMetrics()` function

### Backend (Already Implemented)
- `backend/server.js` - Admin endpoints already exist:
  - `GET /api/admin/metrics` - Firebase auth protected
  - `GET /api/admin/metrics-basic` - Basic auth protected
  - `GET /admin` - Standalone HTML dashboard

## Security Notes

1. **Admin Email**: Only the user with email matching `ADMIN_EMAIL` can access the React dashboard
2. **Basic Auth**: The standalone panel uses HTTP Basic Authentication
3. **Firebase Auth**: All admin API calls require valid Firebase tokens
4. **Subtle Access**: The admin link is intentionally subtle in the footer
5. **Production**: Use HTTPS in production and strong passwords

## Troubleshooting

### "Admin access required" error
- Verify `ADMIN_EMAIL` in `backend/.env` matches your Firebase user email exactly
- Check that the Firebase user exists and is active

### Cannot access standalone panel
- Verify `ADMIN_PANEL_USER` and `ADMIN_PANEL_PASS` are set in `backend/.env`
- Check that the backend server is running on port 5000

### No data showing
- Users must be logged in for tracking to work
- Check that `trackUsage()` is being called in components
- Verify Firebase Firestore collections exist

### Backend not starting
- Ensure all Firebase environment variables are set
- Check that `FIREBASE_PRIVATE_KEY` is properly formatted with `\n` for newlines
- Verify OpenAI API key is valid

## Next Steps

1. **Test the Dashboard**: Login and verify metrics are displaying
2. **Customize Metrics**: Add more tracking events in your components
3. **Add Features**: Consider adding user management, export functionality
4. **Secure Production**: Use environment-specific configs and HTTPS
5. **Monitor Usage**: Regularly check the dashboard to understand user behavior

## Need More Help?

See `ADMIN_GUIDE.md` for detailed documentation including:
- Complete feature descriptions
- Backend API specifications
- Security best practices
- Advanced configuration options
- Future enhancement ideas

---

**Ready to go!** Your admin dashboard is fully integrated and ready to use. Just complete the 3 setup steps above and you're all set! 🚀
