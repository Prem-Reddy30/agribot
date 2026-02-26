import { Leaf, Mail, Facebook, Twitter, Instagram, Youtube, Linkedin, Shield, Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

type FooterProps = {
  onNavigate?: (page: string) => void;
};

export function Footer({ onNavigate }: FooterProps) {
  const { t } = useLanguage();

  const socialLinks = [
    { icon: Facebook, label: 'Facebook' },
    { icon: Twitter, label: 'Twitter' },
    { icon: Instagram, label: 'Instagram' },
    { icon: Youtube, label: 'YouTube' },
    { icon: Linkedin, label: 'LinkedIn' },
  ];

  return (
    <footer id="footer" className="relative bg-gray-950 text-white overflow-hidden">
      {/* Subtle gradient top border */}
      <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>

      {/* Background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">KrishiSahay</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-9 h-9 bg-gray-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-all hover:-translate-y-0.5"
                  title={social.label}
                >
                  <social.icon className="w-4 h-4 text-gray-400 hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">{t('footer.quickLinks')}</h3>
            <ul className="space-y-3">
              {[
                { id: 'disease', label: t('nav.disease') },
                { id: 'location', label: t('nav.location') },
                { id: 'market', label: t('nav.market') },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => onNavigate?.(link.id)}
                    className="text-gray-400 hover:text-emerald-400 transition-colors text-sm flex items-center gap-1 group"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-emerald-400 transition-all"></span>
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">{t('footer.services')}</h3>
            <ul className="space-y-3">
              {[
                { id: 'disease', label: t('nav.disease') },
                { id: 'market', label: t('nav.market') },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => onNavigate?.(link.id)}
                    className="text-gray-400 hover:text-emerald-400 transition-colors text-sm flex items-center gap-1 group"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-emerald-400 transition-all"></span>
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">{t('footer.contactUs')}</h3>
            <div className="flex items-center gap-3 text-gray-400 text-sm">
              <div className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <span>support@krishisahay.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-500 text-sm flex items-center gap-1">
              © {new Date().getFullYear()} KrishiSahay. {t('footer.rights')}
              <Heart className="w-3 h-3 text-red-500 fill-red-500 inline mx-1" />
            </div>
            <div className="flex flex-wrap items-center gap-5 text-sm">
              {[
                { label: t('footer.privacy') },
                { label: t('footer.terms') },
                { label: t('footer.cookie') },
                { label: t('footer.sitemap') },
              ].map((item, index) => (
                <a key={index} href="#" className="text-gray-500 hover:text-emerald-400 transition-colors">
                  {item.label}
                </a>
              ))}
              {onNavigate && (
                <button
                  onClick={() => onNavigate('admin-login')}
                  className="text-gray-600 hover:text-emerald-400 transition-colors flex items-center gap-1"
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
