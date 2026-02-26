import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { LandingPage } from './components/LandingPage';
import { DiseasePrediction } from './components/DiseasePrediction';
import { LocationSuggestions } from './components/LocationSuggestions';
import { MarketPrices } from './components/MarketPrices';
import { Footer } from './components/Footer';
import { LoginPage } from './components/LoginPage';
import { SignUpPage } from './components/SignUpPage';
import { AdminLoginPage } from './components/AdminLoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { FloatingChatbot } from './components/FloatingChatbot';
import { auth } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { trackUsage } from './services/api';

interface User {
  email: string;
  name?: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in
        setUser({
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User'
        });
        setIsAuthenticated(true);
      } else {
        // User is signed out
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLogin = (_email: string, _password: string) => {
    // Firebase auth state change will handle authentication
    setCurrentPage('chatbot');
  };

  const handleSignUp = (_name: string, _email: string, _password: string) => {
    // Firebase auth state change will handle authentication
    setCurrentPage('chatbot');
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      setIsAdminAuthenticated(false);
      setCurrentPage('home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setCurrentPage('admin-dashboard');
  };

  const handleAdminLoginCancel = () => {
    setCurrentPage('home');
  };

  const handleAdminDashboardBack = () => {
    setIsAdminAuthenticated(false);
    setCurrentPage('home');
  };

  const handleNavigate = (page: string) => {
    if (page === 'about') {
      // Navigate to home page and scroll to footer
      setCurrentPage('home');
      setTimeout(() => {
        const footer = document.getElementById('footer');
        if (footer) {
          footer.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100); // Small delay to ensure page has rendered
    } else {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!currentPage) return;
    trackUsage({ page: currentPage });
  }, [currentPage, isAuthenticated]);

  const renderPage = () => {
    // Show loading screen while Firebase initializes
    if (loading) {
      return (
        <div className="min-h-screen page-gradient flex items-center justify-center">
          <div className="text-center animate-fade-in-up">
            <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Loading KrishiSahay...</p>
          </div>
        </div>
      );
    }

    // Handle admin routes
    if (currentPage === 'admin-login') {
      return <AdminLoginPage onSuccess={handleAdminLoginSuccess} onCancel={handleAdminLoginCancel} />;
    }

    if (currentPage === 'admin-dashboard') {
      if (!isAdminAuthenticated) {
        setCurrentPage('admin-login');
        return null;
      }
      return <AdminDashboard onBack={handleAdminDashboardBack} />;
    }

    // Show login or signup page if not authenticated
    if (!isAuthenticated && currentPage !== 'home') {
      if (currentPage === 'signup') {
        return <SignUpPage onSignUp={handleSignUp} onBackToLogin={() => setCurrentPage('login')} />;
      }
      return <LoginPage onLogin={handleLogin} onNavigateToSignUp={() => setCurrentPage('signup')} />;
    }

    // Render pages based on current page
    switch (currentPage) {
      case 'home':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'disease':
        return <DiseasePrediction />;
      case 'location':
        return <LocationSuggestions />;
      case 'market':
        return <MarketPrices />;
      case 'about':
        return <LandingPage onNavigate={handleNavigate} />; // Will scroll to footer
      case 'login':
        return <LoginPage onLogin={handleLogin} onNavigateToSignUp={() => setCurrentPage('signup')} />;
      case 'signup':
        return <SignUpPage onSignUp={handleSignUp} onBackToLogin={() => setCurrentPage('login')} />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen page-gradient transition-colors flex flex-col">
          {currentPage !== 'login' && currentPage !== 'signup' && currentPage !== 'admin-login' && currentPage !== 'admin-dashboard' && (
            <Navigation
              currentPage={currentPage}
              onNavigate={handleNavigate}
              user={user}
              onLogout={handleLogout}
            />
          )}
          <main className="flex-grow">
            {renderPage()}
          </main>
          {currentPage === 'home' && <Footer onNavigate={handleNavigate} />}
          {isAuthenticated &&
            currentPage !== 'admin-login' &&
            currentPage !== 'admin-dashboard' &&
            currentPage !== 'chatbot' && (
              <FloatingChatbot />
            )}
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
