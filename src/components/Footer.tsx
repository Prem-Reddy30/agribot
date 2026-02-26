import { Leaf, Mail, Facebook, Twitter, Instagram, Youtube, Linkedin, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

type FooterProps = {
  onNavigate?: (page: string) => void;
};

export function Footer({ onNavigate }: FooterProps) {
  const { t } = useLanguage();

  return (
    <footer id="footer" className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-green-600 p-2 rounded-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">KrishiSahay</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors" title="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors" title="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors" title="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors" title="YouTube">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors" title="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-400">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate?.('disease')} className="text-gray-300 hover:text-green-400 transition-colors text-sm text-left">
                  {t('nav.disease')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('location')} className="text-gray-300 hover:text-green-400 transition-colors text-sm text-left">
                  {t('nav.location')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('market')} className="text-gray-300 hover:text-green-400 transition-colors text-sm text-left">
                  {t('nav.market')}
                </button>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-400">{t('footer.services')}</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate?.('disease')} className="text-gray-300 hover:text-green-400 transition-colors text-sm text-left">
                  {t('nav.disease')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('market')} className="text-gray-300 hover:text-green-400 transition-colors text-sm text-left">
                  {t('nav.market')}
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-400">{t('footer.contactUs')}</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <Mail className="w-4 h-4" />
                <span>support@krishisahay.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 KrishiSahay. {t('footer.rights')}
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                {t('footer.privacy')}
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                {t('footer.terms')}
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                {t('footer.cookie')}
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                {t('footer.sitemap')}
              </a>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('admin-login')}
                  className="text-gray-500 hover:text-green-400 transition-colors flex items-center gap-1"
                  title="Admin Access"
                >
                  <Shield className="w-3 h-3" />
                  <span>{t('footer.admin')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
}
