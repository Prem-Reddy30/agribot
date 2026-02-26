import { useState, useEffect } from 'react';
import { Search, BookOpen, Eye, Sprout, Bug, Droplets, CloudSun, Building2, TrendingUp } from 'lucide-react';
import { supabase, type Category, type KnowledgeArticle } from '../lib/supabase';

const iconMap: Record<string, React.ElementType> = {
  sprout: Sprout,
  bug: Bug,
  droplets: Droplets,
  'cloud-sun': CloudSun,
  'building-2': Building2,
  'trending-up': TrendingUp,
};

export function KnowledgeBase() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<KnowledgeArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);

  useEffect(() => {
    loadCategories();
    loadArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [selectedCategory, searchQuery, articles]);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (data) setCategories(data);
  };

  const loadArticles = async () => {
    const { data } = await supabase
      .from('knowledge_articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setArticles(data);
  };

  const filterArticles = () => {
    let filtered = articles;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category_id === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        article =>
          article.title.toLowerCase().includes(query) ||
          article.content.toLowerCase().includes(query) ||
          article.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredArticles(filtered);
  };

  const handleArticleClick = async (article: KnowledgeArticle) => {
    setSelectedArticle(article);

    await supabase
      .from('knowledge_articles')
      .update({ views: article.views + 1 })
      .eq('id', article.id);

    setArticles(articles.map(a =>
      a.id === article.id ? { ...a, views: a.views + 1 } : a
    ));
  };

  const getCategoryById = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <BookOpen className="w-10 h-10 text-green-600" />
            {t('knowledge.title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('knowledge.subtitle')}
          </p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('knowledge.searchPlaceholder')}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`p-4 rounded-xl text-center transition-all ${selectedCategory === 'all'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
          >
            <div className="flex flex-col items-center gap-2">
              <BookOpen className="w-6 h-6" />
              <span className="text-sm font-medium">{t('knowledge.all')}</span>
            </div>
          </button>

          {categories.map((category) => {
            const IconComponent = iconMap[category.icon] || BookOpen;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-4 rounded-xl text-center transition-all ${selectedCategory === category.id
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <IconComponent className="w-6 h-6" />
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
              </button>
            );
          })}
        </div>

        {selectedArticle ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-green-600 p-8">
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-green-100 hover:text-white mb-4 text-sm font-medium"
              >
                ← {t('knowledge.back')}
              </button>
              <h2 className="text-3xl font-bold text-white mb-3">{selectedArticle.title}</h2>
              <div className="flex items-center gap-4 text-green-100 text-sm">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {selectedArticle.views} {t('knowledge.views')}
                </span>
                <span>
                  {getCategoryById(selectedArticle.category_id)?.name}
                </span>
              </div>
            </div>

            <div className="p-8">
              <div className="prose max-w-none">
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                  {selectedArticle.content}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('knowledge.tags')}:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedArticle.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">{t('knowledge.noArticles')}</p>
              </div>
            ) : (
              filteredArticles.map((article) => {
                const category = getCategoryById(article.category_id);
                const IconComponent = category ? iconMap[category.icon] || BookOpen : BookOpen;

                return (
                  <div
                    key={article.id}
                    onClick={() => handleArticleClick(article)}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer overflow-hidden border border-gray-100 hover:border-green-200"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="bg-green-100 p-3 rounded-lg">
                          <IconComponent className="w-6 h-6 text-green-600" />
                        </div>
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <Eye className="w-4 h-4" />
                          {article.views}
                        </span>
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                        {article.title}
                      </h3>

                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {article.content}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-600 font-medium">
                          {category?.name}
                        </span>
                        <span className="text-sm text-gray-400">
                          {t('knowledge.readMore')} →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
