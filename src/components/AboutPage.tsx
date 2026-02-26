import { Target, Users, Zap, Shield, Globe, Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function AboutPage() {
  const { t } = useLanguage();
  const values = [
    {
      icon: Target,
      title: t('about.values.mission.title'),
      description: t('about.values.mission.description'),
    },
    {
      icon: Users,
      title: t('about.values.community.title'),
      description: t('about.values.community.description'),
    },
    {
      icon: Zap,
      title: t('about.values.innovation.title'),
      description: t('about.values.innovation.description'),
    },
    {
      icon: Shield,
      title: t('about.values.reliability.title'),
      description: t('about.values.reliability.description'),
    },
    {
      icon: Globe,
      title: t('about.values.accessibility.title'),
      description: t('about.values.accessibility.description'),
    },
    {
      icon: Heart,
      title: t('about.values.impact.title'),
      description: t('about.values.impact.description'),
    },
  ];

  const technologies = [
    { name: 'Python', description: t('about.tech.python') },
    { name: 'FAISS', description: t('about.tech.faiss') },
    { name: 'FastAPI', description: t('about.tech.fastapi') },
    { name: 'NLP Models', description: t('about.tech.nlp') },
    { name: 'React', description: t('about.tech.react') },
    { name: 'Supabase', description: t('about.tech.supabase') },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50 via-green-50 to-teal-100 dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900 py-12 relative overflow-hidden transition-colors duration-500">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-300/40 dark:bg-emerald-600/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-50"></div>
      <div className="absolute -bottom-16 right-1/4 w-[30rem] h-[30rem] bg-teal-300/40 dark:bg-teal-600/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-50"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20 animate-fade-in">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 mb-6 drop-shadow-sm">
            {t('about.title')}
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t('about.subtitle')}
          </p>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/50 dark:border-slate-800 rounded-[2.5rem] shadow-2xl p-8 mb-16 hover:shadow-emerald-500/10 transition-shadow duration-500">
          <img
            src="https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Agricultural technology"
            className="w-full h-72 sm:h-[28rem] object-cover rounded-[1.5rem] mb-10 shadow-lg transform hover:scale-[1.01] transition-transform duration-700"
          />
          <div className="prose max-w-none dark:prose-invert">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">{t('about.whatIs.title')}</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-5 leading-relaxed">
              {t('about.whatIs.p1')}
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('about.whatIs.p2')}
            </p>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12 relative inline-block left-1/2 transform -translate-x-1/2">
            {t('about.values.title')}
            <div className="absolute -bottom-3 left-1/4 right-1/4 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full opacity-50"></div>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="group bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[2rem] shadow-lg border border-white/40 dark:border-slate-700/50 hover:shadow-2xl hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-slate-700 dark:to-slate-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{value.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12 relative inline-block left-1/2 transform -translate-x-1/2">
            {t('about.tech.title')}
            <div className="absolute -bottom-3 left-1/4 right-1/4 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full opacity-50"></div>
          </h2>
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-2xl rounded-[2.5rem] shadow-xl border border-white/50 dark:border-slate-800 p-8 sm:p-12">
            <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-10 max-w-2xl mx-auto">
              {t('about.tech.subtitle')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {technologies.map((tech, index) => (
                <div
                  key={index}
                  className="group p-6 bg-gradient-to-br from-white/80 to-emerald-50/50 dark:from-slate-800/80 dark:to-slate-800/40 backdrop-blur-sm border border-emerald-100/50 dark:border-slate-700/50 rounded-2xl hover:border-emerald-300/50 dark:hover:border-emerald-500/30 transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{tech.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{tech.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 dark:from-emerald-900 dark:to-slate-900 rounded-[3rem] shadow-2xl p-10 sm:p-16 text-center">
          {/* Animated decorative circles */}
          <div className="absolute top-0 right-0 -m-20 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -m-20 w-64 h-64 bg-teal-400/20 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 drop-shadow-md">{t('about.join.title')}</h2>
            <p className="text-emerald-50 text-xl font-medium mb-10 max-w-2xl mx-auto leading-relaxed opacity-90">
              {t('about.join.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <button className="px-8 py-4 bg-white text-emerald-700 rounded-full font-bold text-lg shadow-[0_8px_30px_rgb(255,255,255,0.2)] hover:bg-emerald-50 transform hover:scale-105 active:scale-95 transition-all w-full sm:w-auto">
                {t('about.join.getStarted')}
              </button>
              <button className="px-8 py-4 bg-transparent text-white border-2 border-white/80 hover:border-white rounded-full font-bold text-lg hover:bg-white/10 transform hover:scale-105 active:scale-95 transition-all w-full sm:w-auto backdrop-blur-sm">
                {t('about.join.learnMore')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
