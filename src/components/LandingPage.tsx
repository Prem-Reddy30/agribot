import React from 'react';
import { Leaf } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

type LandingPageProps = {
  onNavigate: (page: string) => void;
};

export function LandingPage({ onNavigate }: LandingPageProps) {
  const { t } = useLanguage();


  const testimonials = [
    { name: 'Ramesh Kumar', rating: 5, comment: t('chat.testimonial1'), location: 'Maharashtra' },
    { name: 'Sita Devi', rating: 5, comment: t('chat.testimonial2'), location: 'Andhra Pradesh' },
    { name: 'Mohammed Ali', rating: 5, comment: t('chat.testimonial3'), location: 'Uttar Pradesh' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-16 pb-20 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {t('home.title')}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {t('home.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => onNavigate('disease')}
              className="px-8 py-4 bg-green-600 text-white rounded-lg font-semibold text-lg shadow-lg hover:bg-green-700"
            >
              <Leaf className="w-5 h-5 mr-2 inline" />
              {t('nav.disease')}
            </button>
            <button
              onClick={() => onNavigate('location')}
              className="px-8 py-4 bg-white text-green-600 border-2 border-green-600 rounded-lg font-semibold text-lg shadow-lg hover:bg-green-50"
            >
              {t('nav.location')}
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
            <div className="relative h-64 sm:h-96 mb-4 rounded-lg overflow-hidden">
              <img
                src="https://www.cultyvate.com/wp-content/uploads/2023/02/Farmer-Empowered-with-mobile-tech.jpg"
                alt="Farmer using smartphone in field"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          </div>
        </div>

        {/* Image Gallery Section */}
        <div className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t('home.successStories.title')}</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {t('home.successStories.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Gallery Image 1 */}
              <div className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <img
                  src="https://tse4.mm.bing.net/th/id/OIP.CWq_VRHDaaecOn_oKmAIsgHaDs?pid=Api&P=0&h=180"
                  alt="Farmer with healthy crops"
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white text-sm font-medium">{t('home.gallery.item1.title')}</p>
                    <p className="text-green-300 text-xs">{t('home.gallery.item1.author')}</p>
                  </div>
                </div>
              </div>

              {/* Gallery Image 2 */}
              <div className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <img
                  src="https://img.freepik.com/premium-photo/hand-expert-farmer-collect-soil-farmer-is-checking-soil-quality-before-sowing-agriculture_217236-16099.jpg"
                  alt="Farmer checking soil quality"
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white text-sm font-medium">{t('home.gallery.item2.title')}</p>
                    <p className="text-green-300 text-xs">{t('home.gallery.item2.author')}</p>
                  </div>
                </div>
              </div>

              {/* Gallery Image 3 */}
              <div className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <img
                  src="https://tse3.mm.bing.net/th/id/OIP.VuojdVh4xwARXSrrTtiB1QHaE8?pid=Api&P=0&h=180"
                  alt="Farmer using tablet in field"
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white text-sm font-medium">{t('home.gallery.item3.title')}</p>
                    <p className="text-green-300 text-xs">{t('home.gallery.item3.author')}</p>
                  </div>
                </div>
              </div>

              {/* Gallery Image 4 */}
              <div className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <img
                  src="https://tse1.mm.bing.net/th/id/OIP.P_hnLapw5PBBN5PSfieCLwHaHa?pid=Api&P=0&h=180"
                  alt="Farmer with smartphone"
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white text-sm font-medium">{t('home.gallery.item4.title')}</p>
                    <p className="text-green-300 text-xs">{t('home.gallery.item4.author')}</p>
                  </div>
                </div>
              </div>

              {/* Gallery Image 5 */}
              <div className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <img
                  src="https://tse2.mm.bing.net/th/id/OIP.k_pd0s129zKVPqAbx_cPCAHaE7?pid=Api&P=0&h=180"
                  alt="Farmer with irrigation system"
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white text-sm font-medium">{t('home.gallery.item5.title')}</p>
                    <p className="text-green-300 text-xs">{t('home.gallery.item5.author')}</p>
                  </div>
                </div>
              </div>

              {/* Gallery Image 6 */}
              <div className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <img
                  src="https://tse4.mm.bing.net/th/id/OIP.QjZRz6k6Uiq_UHQ4tH2GAwHaE8?pid=Api&P=0&h=180"
                  alt="Happy farmer family"
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white text-sm font-medium">{t('home.gallery.item6.title')}</p>
                    <p className="text-green-300 text-xs">{t('home.gallery.item6.author')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pb-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">{t('home.testimonials.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-600">{testimonial.rating}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.location}</div>
                  </div>
                </div>
                <div className="text-gray-600 mb-4">
                  {testimonial.comment}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-green-600 rounded-2xl shadow-xl p-8 sm:p-12 mb-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t('home.getStarted')}</h2>
          <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">{t('home.getStarted')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => onNavigate('disease')} className="px-8 py-4 bg-white text-green-600 rounded-lg font-semibold">{t('nav.disease')}</button>
            <button onClick={() => onNavigate('location')} className="px-8 py-4 bg-green-700 text-white rounded-lg font-semibold">{t('nav.location')}</button>
          </div>
        </div>

      </div>
    </div>
  );
}
