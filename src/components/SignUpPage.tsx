import { useState } from 'react';
import { Eye, EyeOff, Leaf, UserPlus, ArrowLeft } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithPopup, auth, googleProvider } from '../lib/firebase';
import { useLanguage } from '../contexts/LanguageContext';

type SignUpPageProps = {
  onSignUp: (name: string, email: string, password: string) => void;
  onBackToLogin: () => void;
};

export function SignUpPage({ onSignUp, onBackToLogin }: SignUpPageProps) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Basic validation
      if (!name || !email || !password || !confirmPassword) {
        setError('Please fill in all fields');
        return;
      }

      if (!email.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      // Firebase authentication
      await createUserWithEmailAndPassword(auth, email, password);

      // Firebase auth state change will handle the rest
      onSignUp(name, email, password);
    } catch (err: any) {
      console.error('Sign up error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting Google sign up...');

      // Firebase Google authentication
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google sign up successful:', result.user);

      // Firebase auth state change will handle the rest
      onSignUp(result.user.displayName || 'Google User', result.user.email || 'google-user@gmail.com', 'google-auth');
    } catch (err: any) {
      console.error('Google sign up error:', err);

      // Provide specific error messages
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign up was cancelled. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups and try again.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Sign up was cancelled. Please try again.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for Google sign in. Please contact support.');
      } else if (err.code === 'auth/api-key-not-allowed') {
        setError('API key is not allowed. Please check Firebase configuration.');
      } else if (err.message && err.message.includes('Google provider is not configured')) {
        setError('Google sign in is not configured. Please enable Google OAuth in Firebase console.');
      } else {
        setError(`Google sign up failed: ${err.message || 'Please try again.'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50 via-green-50 to-teal-100 dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900 flex items-center justify-center px-4 relative overflow-hidden transition-colors duration-500">
      {/* Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-300 dark:bg-emerald-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-40"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-300 dark:bg-teal-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-40"></div>

      <div className="max-w-md w-full relative z-10 transition-all duration-500 hover:scale-[1.01]">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-[2.5rem] blur opacity-20 dark:opacity-30"></div>
        <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 dark:border-slate-800 p-8 sm:p-10">
          {/* Back Button */}
          <button
            onClick={onBackToLogin}
            className="group flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">{t('common.back')}</span>
          </button>

          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl mb-4 shadow-lg shadow-emerald-500/30 transform rotate-3 hover:rotate-6 transition-transform">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 mb-2">{t('signup.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">{t('login.subtitle')}</p>
          </div>

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('signup.fullName')}
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all shadow-sm hover:shadow-md backdrop-blur-sm"
                placeholder={t('signup.namePlaceholder')}
                disabled={isLoading}
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('login.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all shadow-sm hover:shadow-md backdrop-blur-sm"
                placeholder={t('signup.emailPlaceholder')}
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('login.password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all shadow-sm hover:shadow-md backdrop-blur-sm"
                  placeholder={t('signup.passwordPlaceholder')}
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

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('signup.confirmPassword')}
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all shadow-sm hover:shadow-md backdrop-blur-sm"
                  placeholder={t('signup.confirmPlaceholder')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
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
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3.5 rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('signup.creating')}
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  {t('signup.createAccount')}
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400 font-medium rounded-full">{t('common.or')}</span>
              </div>
            </div>

            {/* Google Sign Up Button */}
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleSignUp}
              className="w-full bg-white/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 py-3.5 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t('signup.signUpGoogle')}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <div className="text-sm text-gray-600">
              {t('signup.hasAccount')}{' '}
              <button
                onClick={onBackToLogin}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                {t('signup.signIn')}
              </button>
            </div>
          </div>
        </div>

        {/* Terms Notice */}
        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
          <p>
            {t('signup.termsNotice')}{' '}
            <button className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium underline decoration-emerald-500/30 underline-offset-2">{t('signup.termsOfService')}</button>
            {' '}and{' '}
            <button className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium underline decoration-emerald-500/30 underline-offset-2">{t('signup.privacyPolicy')}</button>.
          </p>
        </div>
      </div>
    </div>
  );
}
