import { Leaf, Sprout, MapPin, TrendingUp, Star, ArrowRight, Shield, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

type LandingPageProps = {
  onNavigate: (page: string) => void;
};

export function LandingPage({ onNavigate }: LandingPageProps) {
  const { t } = useLanguage();

  const features = [
    { icon: Sprout, title: t('nav.disease'), description: t('disease.subtitle'), page: 'disease', color: 'emerald' },
    { icon: MapPin, title: t('nav.location'), description: t('location.subtitle'), page: 'location', color: 'teal' },
    { icon: TrendingUp, title: t('nav.market'), description: t('market.subtitle'), page: 'market', color: 'cyan' },
  ];

  const testimonials = [
    { name: 'Ramesh Kumar', rating: 5, comment: t('chat.testimonial1'), location: 'Maharashtra' },
    { name: 'Sita Devi', rating: 5, comment: t('chat.testimonial2'), location: 'Andhra Pradesh' },
    { name: 'Mohammed Ali', rating: 5, comment: t('chat.testimonial3'), location: 'Uttar Pradesh' },
  ];

  return (
    <div className="page-gradient relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="blob blob-1 w-96 h-96 bg-emerald-300 dark:bg-emerald-600 top-20 -left-48"></div>
      <div className="blob blob-2 w-80 h-80 bg-teal-300 dark:bg-teal-600 top-60 right-0"></div>
      <div className="blob blob-3 w-72 h-72 bg-cyan-200 dark:bg-cyan-700 bottom-40 left-1/3"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ══ Hero Section ══════════════════════════ */}
        <section className="pt-20 pb-24 text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-emerald-100/80 dark:bg-emerald-900/40 backdrop-blur-sm text-emerald-700 dark:text-emerald-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-emerald-200/60 dark:border-emerald-700/40">
            <Zap className="w-3.5 h-3.5" />
            AI-Powered Agriculture
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
            {t('home.title')}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
            {t('home.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('disease')}
              className="btn-primary px-8 py-4 text-lg flex items-center justify-center gap-2"
            >
              <Leaf className="w-5 h-5" />
              {t('nav.disease')}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('location')}
              className="px-8 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 rounded-xl font-semibold text-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              {t('nav.location')}
            </button>
          </div>
        </section>

        {/* ══ Hero Image ═══════════════════════════ */}
        <section className="pb-20">
          <div className="premium-card overflow-hidden">
            <div className="relative h-64 sm:h-96 rounded-[1.25rem] overflow-hidden m-2">
              <img
                src="https://www.cultyvate.com/wp-content/uploads/2023/02/Farmer-Empowered-with-mobile-tech.jpg"
                alt="Farmer using smartphone in field"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white/90 text-sm font-medium">Empowering farmers with AI-driven insights</p>
              </div>
            </div>
          </div>
        </section>

        {/* ══ Features ═════════════════════════════ */}
        <section className="pb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              <span className="gradient-text">Smart Features</span> for Smart Farming
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to make data-driven farming decisions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <button
                key={index}
                onClick={() => onNavigate(feature.page)}
                className="premium-card p-8 text-left group cursor-pointer"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                  {feature.description}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400 group-hover:gap-2 transition-all">
                  Explore <ArrowRight className="w-4 h-4" />
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ══ Gallery ══════════════════════════════ */}
        <section className="pb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              {t('home.successStories.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {t('home.successStories.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { src: 'https://tse4.mm.bing.net/th/id/OIP.CWq_VRHDaaecOn_oKmAIsgHaDs?pid=Api&P=0&h=180', alt: 'Farmer with healthy crops', key: 'item1' },
              { src: 'https://img.freepik.com/premium-photo/hand-expert-farmer-collect-soil-farmer-is-checking-soil-quality-before-sowing-agriculture_217236-16099.jpg', alt: 'Farmer checking soil quality', key: 'item2' },
              { src: 'https://tse3.mm.bing.net/th/id/OIP.VuojdVh4xwARXSrrTtiB1QHaE8?pid=Api&P=0&h=180', alt: 'Farmer using tablet in field', key: 'item3' },
              { src: 'https://tse1.mm.bing.net/th/id/OIP.P_hnLapw5PBBN5PSfieCLwHaHa?pid=Api&P=0&h=180', alt: 'Farmer with smartphone', key: 'item4' },
              { src: 'https://tse2.mm.bing.net/th/id/OIP.k_pd0s129zKVPqAbx_cPCAHaE7?pid=Api&P=0&h=180', alt: 'Farmer with irrigation system', key: 'item5' },
              { src: 'https://tse4.mm.bing.net/th/id/OIP.QjZRz6k6Uiq_UHQ4tH2GAwHaE8?pid=Api&P=0&h=180', alt: 'Happy farmer family', key: 'item6' },
            ].map((img, index) => (
              <div key={index} className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white text-sm font-medium">{t(`home.gallery.${img.key}.title`)}</p>
                    <p className="text-emerald-300 text-xs">{t(`home.gallery.${img.key}.author`)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ Testimonials ═════════════════════════ */}
        <section className="pb-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            {t('home.testimonials.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="premium-card p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 italic">
                  "{testimonial.comment}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">{testimonial.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ CTA Banner ═══════════════════════════ */}
        <section className="pb-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 p-10 sm:p-14 text-center shadow-2xl shadow-emerald-600/20">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-white/90 text-sm font-medium mb-6">
                <Shield className="w-4 h-4" />
                Free to use
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t('home.getStarted')}</h2>
              <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of farmers using AI to grow smarter
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => onNavigate('disease')}
                  className="px-8 py-4 bg-white text-emerald-700 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  {t('nav.disease')}
                </button>
                <button
                  onClick={() => onNavigate('location')}
                  className="px-8 py-4 bg-emerald-700/50 backdrop-blur-sm text-white border border-white/30 rounded-xl font-semibold hover:bg-emerald-700/70 transition-all"
                >
                  {t('nav.location')}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
