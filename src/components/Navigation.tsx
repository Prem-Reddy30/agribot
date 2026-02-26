import { Menu, X, Leaf, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { SimpleThemeToggle } from './SimpleThemeToggle';

type NavigationProps = {
  currentPage: string;
  onNavigate: (page: string) => void;
  user?: { email: string; name?: string } | null;
  onLogout?: () => void;
};

export function Navigation({ currentPage, onNavigate, user, onLogout }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();

  const navItems = [
    { id: 'home', label: t('nav.home') },
    { id: 'disease', label: t('nav.disease') },
    { id: 'location', label: t('nav.location') },
    { id: 'market', label: t('nav.market') },
    { id: 'about', label: t('nav.about') },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Left Side */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <div className="bg-green-600 p-2 rounded-lg">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">{t('nav.assistant')}</span>
          </div>

          {/* Navigation Items - Center */}
          <div className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`text - sm font - medium transition - colors ${currentPage === item.id
                    ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                    : 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
                  } py - 1`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <div className="hidden sm:block">
              <SimpleThemeToggle />
            </div>

            {/* Language Selector */}
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>

            {/* Auth Section */}
            {user ? (
              <div className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 hidden md:block max-w-20 truncate">
                    {user.name || user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                {t('nav.login')}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden pb-4 border-t border-gray-200 dark:border-gray-600">
            {/* Mobile Navigation Items */}
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsMenuOpen(false);
                }}
                className={`block w - full text - left px - 4 py - 3 text - sm font - medium ${currentPage === item.id
                    ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  } `}
              >
                {item.label}
              </button>
            ))}

            {/* Mobile Theme & Language */}
            <div className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('nav.theme')}</span>
                <SimpleThemeToggle />
              </div>
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('nav.language')}</span>
                <LanguageSelector />
              </div>
            </div>

            {/* Mobile Auth Section */}
            <div className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
              {user ? (
                <>
                  <div className="px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {user.name || user.email}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onLogout?.();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900"
                  >
                    <div className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      <span>{t('nav.logout')}</span>
                    </div>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    onNavigate('login');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 text-sm font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900"
                >
                  {t('nav.login')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
