# 🌾 KrishiSahay — AI-Powered Agricultural Assistant

<div align="center">

![KrishiSahay Banner](https://img.shields.io/badge/KrishiSahay-AI%20Agriculture-10B981?style=for-the-badge&logo=leaf&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss)
![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=flat-square&logo=firebase)
![Groq](https://img.shields.io/badge/Groq-LLaMA%203.3-F55036?style=flat-square)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=flat-square&logo=vercel)

**An intelligent, multi-language agricultural assistant powered by AI to help Indian farmers make data-driven decisions.**

[🚀 Live Demo](https://agribot-n28l.vercel.app) · [📦 Repository](https://github.com/Prem-Reddy30/agribot)

</div>

---

## 📖 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [API Endpoints](#-api-endpoints)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🤖 AI Chatbot
- Real-time agricultural Q&A powered by **Groq LLaMA 3.3 70B**
- Multi-language support: English, Hindi, Telugu, Tamil, Malayalam
- Markdown-formatted responses with emojis and structured advice
- Conversation history and context awareness

### 🌱 Disease Prediction
- CNN-based image analysis for plant disease detection
- Symptom-based disease identification
- Environmental factor consideration (temperature, humidity, rainfall)
- Treatment recommendations and prevention tips
- Support for 10+ crop types including Rice, Wheat, Tomato, Cotton

### 📍 Location-Based Suggestions
- Region-specific crop recommendations
- Soil type analysis and suitability mapping
- Climate-based planting calendar
- Local agricultural advisory

### 📊 Market Prices
- Real-time crop price tracking
- Market trend analysis
- Price comparison across mandis (markets)
- Historical price data visualization

### 🔐 Authentication
- Firebase Authentication (Email/Password + Google Sign-In)
- Secure admin dashboard with protected routes
- User profile management
- Session persistence

### 🎨 Premium UI/UX
- Glassmorphism design with frosted glass effects
- Smooth micro-animations and transitions
- Fully responsive (mobile, tablet, desktop)
- Dark mode support
- Custom design system with Inter font

---

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS 3.4, Custom CSS Design System |
| **Authentication** | Firebase Auth (Email + Google OAuth) |
| **AI Engine** | Groq SDK (LLaMA 3.3 70B Versatile) |
| **Backend (Local)** | Node.js, Express.js, CORS, Body-Parser |
| **Backend (Deployed)** | Vercel Serverless Functions |
| **Database** | Supabase (Knowledge Base), Firestore (Conversations) |
| **Markdown** | React Markdown + Remark GFM |
| **Icons** | Lucide React |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
agribot/
├── api/                          # Vercel Serverless Functions
│   ├── chat.js                   # AI Chat endpoint
│   ├── health.js                 # Health check endpoint
│   └── conversations.js          # Conversation history endpoint
├── backend/                      # Local development backend
│   ├── server.js                 # Full backend server (Firebase Admin)
│   ├── simple-server.js          # Simplified dev server (Groq only)
│   ├── package.json
│   └── .env                      # Backend environment variables
├── src/
│   ├── components/               # React Components
│   │   ├── LandingPage.tsx       # Home page with hero, gallery, testimonials
│   │   ├── Navigation.tsx        # Glassmorphic sticky navbar
│   │   ├── LoginPage.tsx         # Firebase login with Google OAuth
│   │   ├── SignUpPage.tsx        # User registration
│   │   ├── DiseasePrediction.tsx # CNN + symptom-based disease analysis
│   │   ├── LocationSuggestions.tsx # Region-based crop suggestions
│   │   ├── MarketPrices.tsx      # Crop market price tracker
│   │   ├── FloatingChatbot.tsx   # AI chatbot widget
│   │   ├── KnowledgeBase.tsx     # Agricultural knowledge articles
│   │   ├── AdminDashboard.tsx    # Admin analytics panel
│   │   ├── AdminLoginPage.tsx    # Admin authentication
│   │   ├── AboutPage.tsx         # About the platform
│   │   ├── Footer.tsx            # Site footer
│   │   ├── LanguageSelector.tsx  # Multi-language dropdown
│   │   ├── SimpleThemeToggle.tsx # Dark/Light mode toggle
│   │   └── ThemeToggle.tsx       # Theme toggle (extended)
│   ├── contexts/
│   │   ├── ThemeContext.tsx       # Dark mode state management
│   │   └── LanguageContext.tsx    # i18n translations (5 languages)
│   ├── services/
│   │   └── api.ts                # API client with auth & timeout
│   ├── lib/
│   │   ├── firebase.ts           # Firebase configuration
│   │   └── supabase.ts           # Supabase client
│   ├── App.tsx                   # Main application router
│   ├── main.tsx                  # React entry point
│   └── index.css                 # Global design system
├── vercel.json                   # Vercel routing configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── vite.config.ts                # Vite build configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and **npm**
- **Firebase** project with Authentication enabled
- **Groq API Key** (free at [console.groq.com](https://console.groq.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Prem-Reddy30/agribot.git
   cd agribot
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Configure environment variables**

   Create `backend/.env`:
   ```env
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   PORT=5000
   GROQ_API_KEY=your_groq_api_key_here
   GROQ_MODEL=llama-3.3-70b-versatile
   ```

5. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

6. **Start the frontend** (in a new terminal)
   ```bash
   npm run dev
   ```

7. **Open the app**
   Navigate to [http://localhost:5173](http://localhost:5173)

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|----------|------------|----------|
| `GROQ_API_KEY` | Groq API key for AI chat | ✅ |
| `GROQ_MODEL` | AI model name | ❌ (default: `llama-3.3-70b-versatile`) |
| `PORT` | Backend server port | ❌ (default: `5000`) |
| `FRONTEND_URL` | Frontend URL for CORS | ❌ (default: `http://localhost:5173`) |
| `NODE_ENV` | Environment mode | ❌ (default: `development`) |

### Vercel Environment Variables

Set these in **Vercel Dashboard → Settings → Environment Variables**:

| Variable | Description |
|----------|------------|
| `GROQ_API_KEY` | Groq API key for deployed chatbot |
| `GROQ_MODEL` | AI model name |

### Firebase Configuration

Firebase config is in `src/lib/firebase.ts`. To use your own Firebase project:
1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Email/Password** and **Google** sign-in methods
3. Add your domain to **Authorized domains**
4. Update the config in `src/lib/firebase.ts`

---

## 🌐 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import repository in [Vercel Dashboard](https://vercel.com/dashboard)
3. Set environment variables (`GROQ_API_KEY`, `GROQ_MODEL`)
4. Add your Vercel domain to Firebase **Authorized domains**
5. Deploy! 🚀

The `api/` folder automatically deploys as Vercel Serverless Functions.

### Manual Build

```bash
npm run build    # Creates production build in dist/
npm run preview  # Preview the production build locally
```

---

## 📸 Screenshots

### 🏠 Landing Page
Premium hero section with animated blobs, feature cards, image gallery, and testimonials.

### 🔐 Login Page
Glassmorphic authentication with Google OAuth support and email/password login.

### 🤖 AI Chatbot
Floating chat widget with Markdown-rendered AI responses and multi-language support.

### 🌱 Disease Prediction
Image upload + symptom selection for CNN-based and rule-based plant disease diagnosis.

### 📊 Market Prices
Real-time crop price tracker with trend analysis and historical data.

---

## 📡 API Endpoints

### Local Development (`http://localhost:5000`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health check |
| `POST` | `/api/chat` | Send message to AI chatbot |
| `GET` | `/api/conversations` | Get conversation history |

### Vercel Deployment (`https://agribot-n28l.vercel.app`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Serverless health check |
| `POST` | `/api/chat` | Serverless AI chat |
| `GET` | `/api/conversations` | Get conversations |

### Chat API Request

```json
POST /api/chat
{
  "message": "How to grow rice in monsoon season?",
  "language": "en",
  "conversationHistory": []
}
```

### Chat API Response

```json
{
  "response": "🌾 **Rice Cultivation in Monsoon Season**\n\n1. **Land Preparation**: ...",
  "timestamp": "2026-02-27T08:00:00.000Z"
}
```

---

## 🌍 Supported Languages

| Language | Code | Status |
|----------|------|--------|
| English | `en` | ✅ Full Support |
| Hindi | `hi` | ✅ Full Support |
| Telugu | `te` | ✅ Full Support |
| Tamil | `ta` | ✅ Full Support |
| Malayalam | `ml` | ✅ Full Support |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Prem Reddy**
- GitHub: [@Prem-Reddy30](https://github.com/Prem-Reddy30)

---

<div align="center">

**Made with ❤️ for Indian Farmers**

🌾 _Empowering agriculture with artificial intelligence_ 🌾

</div>
