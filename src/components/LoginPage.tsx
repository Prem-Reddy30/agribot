import { useState, useEffect } from 'react';
import { Eye, EyeOff, Leaf, LogIn } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult, auth, googleProvider } from '../lib/firebase';
import { useLanguage } from '../contexts/LanguageContext';

type LoginPageProps = {
  onLogin: (email: string, password: string) => void;
  onNavigateToSignUp?: () => void;
};

export function LoginPage({ onLogin, onNavigateToSignUp }: LoginPageProps) {
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle redirect callback if user fell back to redirect method
  useEffect(() => {
    const checkRedirect = async () => {
      try {
        setIsLoading(true);
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('Redirect sign in successful:', result.user);
          onLogin(result.user.email || 'google-user@gmail.com', 'google-auth');
        }
      } catch (err: any) {
        console.error('Redirect error:', err);
        // Only show error if it's explicitly about operation not being allowed
        if (err.code === 'auth/operation-not-allowed') {
          setError('Google sign-in is not enabled. Please enable it in Firebase Console.');
        } else {
          setError(`Google sign-in failed: ${err.message || err.code}`);
        }
      } finally {
        setIsLoading(false);
      }
    };
    checkRedirect();
  }, [onLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Basic validation
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }

      if (!email.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }

      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Login timed out. Please check your internet connection and try again.')), 15000); // 15 second timeout
      });

      // Firebase authentication with timeout
      await Promise.race([
        signInWithEmailAndPassword(auth, email, password),
        timeoutPromise
      ]);

      // Firebase auth state change will handle the rest
      onLogin(email, password);
    } catch (err: any) {
      console.error('Login error:', err);

      if (err.message && err.message.includes('timed out')) {
        setError('Login timed out. Please check your internet connection and try again.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting Google sign in...');
      console.log('Auth object:', auth);
      console.log('Google provider:', googleProvider);

      // First try popup method (faster when it works)
      try {
        // Add timeout to prevent infinite loading (increased to 30 seconds)
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Sign in timed out. Please check your internet connection and try again.')), 30000); // 30 second timeout
        });

        // Firebase Google authentication with timeout
        const result = await Promise.race([
          signInWithPopup(auth, googleProvider),
          timeoutPromise
        ]) as any;

        console.log('Google sign in successful:', result.user);

        // Firebase auth state change will handle the rest
        onLogin(result.user.email || 'google-user@gmail.com', 'google-auth');
      } catch (popupError: any) {
        console.log('Popup failed, trying redirect method...');

        // If popup fails, try redirect method
        if (popupError.code === 'auth/popup-closed-by-user' ||
          popupError.code === 'auth/popup-blocked' ||
          popupError.message?.includes('timed out')) {

          console.log('Using redirect method as fallback');
          await signInWithRedirect(auth, googleProvider);

          // The redirect will handle the rest - page will reload
          setError('Redirecting to Google sign-in...');
        } else {
          throw popupError; // Re-throw other errors
        }
      }
    } catch (err: any) {
      console.error('Google sign in error:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      console.error('Full error object:', err);

      // Provide specific error messages
      if (err.message && err.message.includes('timed out')) {
        setError('Sign in timed out. This might be due to slow internet or popup being blocked. Please try again.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign in was cancelled. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups for this site and try again.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Sign in was cancelled. Please try again.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for Google sign in. Please contact support.');
      } else if (err.code === 'auth/api-key-not-allowed') {
        setError('API key is not allowed. Please check Firebase configuration.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Google sign-in is not enabled. Please enable it in Firebase Console.');
      } else if (err.message && err.message.includes('Google provider is not configured')) {
        setError('Google sign in is not configured. Please enable Google OAuth in Firebase console.');
      } else if (err.message && err.message.includes('auth/configuration-not-found')) {
        setError('Firebase configuration not found. Please check your Firebase setup.');
      } else {
        setError(`Google sign in failed: ${err.message || err.code || 'Please try again.'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 transition-colors">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('login.title')}</h1>
            <p className="text-gray-600">{t('login.subtitle')}</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('login.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                placeholder={t('login.email')}
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('login.password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder={t('login.password')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('login.signingIn')}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  {t('login.signIn')}
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t('common.or')}</span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              title="Google sign-in needs to be enabled in Firebase Console"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('login.connecting')}</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {t('login.signInGoogle')}
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-4">
            <div className="text-sm text-gray-600">
              {t('login.noAccount')}{' '}
              <button
                onClick={onNavigateToSignUp}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                {t('login.signUp')}
              </button>
            </div>
            <div className="text-sm">
              <button className="text-gray-600 hover:text-gray-800">
                {t('login.forgotPassword')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
