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

  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          onLogin(result.user.email || 'google-user@gmail.com', 'google-auth');
        }
      } catch (err: any) {
        console.error('Redirect error:', err);
        if (err.code === 'auth/operation-not-allowed') {
          setError('Google sign-in is not enabled. Please enable it in Firebase Console.');
        }
      }
    };
    checkRedirect();
  }, [onLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }

      if (!email.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Login timed out. Please check your connection.')), 15000);
      });

      await Promise.race([
        signInWithEmailAndPassword(auth, email, password),
        timeoutPromise
      ]);

      onLogin(email, password);
    } catch (err: any) {
      console.error('Login error:', err);

      if (err.message?.includes('timed out')) {
        setError('Login timed out. Please check your internet connection.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
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
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Sign in timed out.')), 30000);
        });

        const result = await Promise.race([
          signInWithPopup(auth, googleProvider),
          timeoutPromise
        ]) as any;

        onLogin(result.user.email || 'google-user@gmail.com', 'google-auth');
      } catch (popupError: any) {
        if (popupError.code === 'auth/popup-closed-by-user' ||
          popupError.code === 'auth/popup-blocked' ||
          popupError.message?.includes('timed out')) {
          await signInWithRedirect(auth, googleProvider);
          setError('Redirecting to Google sign-in...');
        } else {
          throw popupError;
        }
      }
    } catch (err: any) {
      console.error('Google sign in error:', err);

      if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for Google sign in. Please add it in Firebase Console → Authentication → Settings → Authorized domains.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Google sign-in is not enabled. Enable it in Firebase Console.');
      } else {
        setError(`Google sign in failed: ${err.message || 'Please try again.'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen page-gradient relative flex items-center justify-center px-4 overflow-hidden">
      {/* Background blobs */}
      <div className="blob blob-1 w-80 h-80 bg-emerald-300 dark:bg-emerald-600 top-1/4 left-1/4"></div>
      <div className="blob blob-2 w-96 h-96 bg-teal-300 dark:bg-teal-600 bottom-1/4 right-1/4"></div>

      <div className="max-w-md w-full relative z-10 animate-fade-in-up">
        {/* Glow ring */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-[2rem] blur opacity-20"></div>

        <div className="relative premium-card p-8 sm:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl mb-4 shadow-lg shadow-emerald-500/30 transform rotate-3 hover:rotate-6 transition-transform">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold gradient-text mb-2">{t('login.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">{t('login.subtitle')}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('login.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-all shadow-sm hover:shadow-md backdrop-blur-sm"
                placeholder={t('login.email')}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('login.password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-all shadow-sm hover:shadow-md backdrop-blur-sm"
                  placeholder={t('login.password')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3.5 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('login.signingIn')}
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  {t('login.signIn')}
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm text-gray-500 dark:text-gray-400 text-sm font-medium rounded-full">{t('common.or')}</span>
              </div>
            </div>

            {/* Google */}
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
              className="w-full bg-white/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 py-3.5 rounded-xl font-semibold hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t('login.signInGoogle')}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-6 text-center space-y-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('login.noAccount')}{' '}
              <button onClick={onNavigateToSignUp} className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-semibold">
                {t('login.signUp')}
              </button>
            </div>
            <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              {t('login.forgotPassword')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
