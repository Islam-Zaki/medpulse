
import React, { useState, useEffect } from 'react';
import type { NavigateFunction, Article, ApiArticle, Category } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { ARTICLES_PAGE_CONTENT } from '../constants';
import ArticleCard from '../components/ArticleCard';
import SectionTitle from '../components/SectionTitle';
import { api } from '../services/api';
import SEO from '../components/SEO';

const DOMAIN = 'https://medpulse-production.up.railway.app';

interface ArticlesPageProps {
  navigate: NavigateFunction;
}

const ArticlesPage: React.FC<ArticlesPageProps> = ({ navigate }) => {
  const { t, language } = useLocalization();
  const c = ARTICLES_PAGE_CONTENT;

  const [articlesData, setArticlesData] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // Search/Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
      const initData = async () => {
          setLoading(true);
          try {
              // 1. Fetch Categories for mapping
              let cats: Category[] = [];
              try {
                  const catRes = await api.getCategories();
                  cats = Array.isArray(catRes.data) ? catRes.data : (Array.isArray(catRes) ? catRes : []);
                  setCategories(cats);
              } catch (e) {
                  console.warn("Categories fetch failed, defaulting to empty.", e);
              }

              // 2. Fetch Articles (Page 1)
              await fetchArticles(1, cats);
          } catch(e) {
              console.error("Failed to init articles page", e);
          } finally {
              setLoading(false);
          }
      };
      initData();
  }, []);

  const fetchArticles = async (page: number, cats: Category[] = categories) => {
      setLoading(true);
      try {
          const res = await api.getArticles(page);
          const data = res.data?.data || res.data || [];
          const meta = res.data || res;
          
          setLastPage(meta.last_page || 1);
          setCurrentPage(meta.current_page || page);

          const mapped: Article[] = data.map((a: ApiArticle) => {
              const cat = cats.find(c => c.id === Number(a.category_id));
              return {
                  id: a.id,
                  title: { ar: a.title_ar, en: a.title_en },
                  category: { ar: cat?.name_ar || 'General', en: cat?.name_en || 'General' },
                  intro: { ar: a.description_ar, en: a.description_en },
                  author: { ar: a.authors?.[0]?.name_ar || 'MedPulse', en: a.authors?.[0]?.name_en || 'MedPulse' },
                  image: a.images && a.images.length > 0 ? `${DOMAIN}${a.images[0].base_url}${a.images[0].name}` : 'https://picsum.photos/seed/art/400/300',
                  created_at: a.created_at
              };
          });
          setArticlesData(mapped);
      } catch (e) {
          console.error("Failed to load articles", e);
      } finally {
          setLoading(false);
      }
  };

  const handlePageChange = (newPage: number) => {
      if (newPage > 0 && newPage <= lastPage) {
          fetchArticles(newPage);
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };

  const uniqueCategories = ['all', ...categories.map(c => language === 'ar' ? c.name_ar : c.name_en)];

  const filteredArticles = articlesData.filter(article => {
      const titleMatch = t(article.title).toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = selectedCategory === 'all' || t(article.category) === selectedCategory;
      return titleMatch && categoryMatch;
  });

  return (
    <div className="bg-white font-arabic">
        <SEO page="articles" />
        {/* Hero Section */}
        <section className="relative py-20 bg-sterile-light-grey">
            <div className="absolute top-0 right-0 h-full w-1/2 bg-cover bg-center opacity-10" style={{backgroundImage: "url('https://picsum.photos/seed/article-bg/1200/800')"}}></div>
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-clinical-charcoal font-arabic">{t(c.hero.title)}</h1>
                <p className="mt-4 text-lg text-gray-700 max-w-3xl mx-auto">{t(c.hero.subtitle)}</p>
            </div>
        </section>

        {/* Introduction */}
        <section className="py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
                 <p className="text-clinical-charcoal leading-relaxed text-lg mb-8">{t(c.hero.intro)}</p>
                 <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-med-tech-blue">
                     <h2 className="text-2xl font-bold text-clinical-charcoal mb-3 font-arabic">{t(c.mission.title)}</h2>
                     <p className="text-gray-700 italic">"{t(c.mission.text)}"</p>
                 </div>
            </div>
        </section>

        {/* Article Types */}
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <SectionTitle>{t(c.types.title)}</SectionTitle>
                <div className="overflow-x-auto max-w-5xl mx-auto bg-white shadow-lg rounded-lg">
                    <table className="w-full text-left">
                        <thead className="bg-med-tech-blue text-white">
                            <tr>
                                <th className="p-4 font-semibold">{t(c.types.headers.category)}</th>
                                <th className="p-4 font-semibold">{t(c.types.headers.description)}</th>
                                <th className="p-4 font-semibold">{t(c.types.headers.audience)}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {c.types.rows.map((row, i) => (
                                <tr key={i} className="border-b border-gray-200 odd:bg-white even:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-800">{t(row.category)}</td>
                                    <td className="p-4 text-gray-600">{t(row.description)}</td>
                                    <td className="p-4 text-gray-600">{t(row.audience)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
        
        {/* Process */}
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <SectionTitle>{t(c.process.title)}</SectionTitle>
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {c.process.steps.map((step, index) => (
                        <div key={index} className="text-center p-6 bg-white rounded-lg shadow-md border-b-4 border-med-tech-blue flex flex-col items-center">
                            <div className="w-16 h-16 mb-4 rounded-full bg-med-tech-blue text-white flex items-center justify-center text-2xl font-bold">{index + 1}</div>
                            <h3 className="text-xl font-bold text-clinical-charcoal mb-2">{t(step.title)}</h3>
                            <p className="text-gray-600 text-sm">{t(step.description)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
        
        {/* Articles List */}
        <div className="py-16 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <SectionTitle>{t({ar: 'أحدث المقالات', en: 'Latest Articles'})}</SectionTitle>
                <div className="grid lg:grid-cols-4 gap-8">
                    <aside className="lg:col-span-1">
                        <div className="sticky top-24 bg-white p-6 rounded-lg shadow-md space-y-6">
                           <div>
                              <h3 className="text-lg font-semibold text-clinical-charcoal mb-3">{t({ ar: 'بحث', en: 'Search' })}</h3>
                              <input
                                type="text"
                                placeholder={t({ ar: 'ابحث في المقالات...', en: 'Search articles...' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-med-tech-blue focus:border-med-tech-blue"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                              />
                            </div>
                            <div>
                               <h3 className="text-lg font-semibold text-clinical-charcoal mb-3">{t({ ar: 'التصنيفات', en: 'Categories' })}</h3>
                               <div className="space-y-2">
                                   {uniqueCategories.map(cat => (
                                       <button key={cat} onClick={() => setSelectedCategory(cat)} className={`block w-full text-start px-3 py-2 rounded-md text-sm transition-colors ${selectedCategory === cat ? 'bg-sterile-light-grey text-med-tech-blue font-bold' : 'text-gray-600 hover:bg-gray-100'}`}>
                                           {cat === 'all' ? t({ ar: 'كل المقالات', en: 'All Articles'}) : cat}
                                       </button>
                                   ))}
                               </div>
                            </div>
                        </div>
                    </aside>
                    <main className="lg:col-span-3">
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-med-tech-blue"></div>
                            </div>
                        ) : filteredArticles.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {filteredArticles.map(article => (
                                        <ArticleCard key={article.id} article={article} navigate={navigate} />
                                    ))}
                                </div>
                                {/* Pagination Controls */}
                                {lastPage > 1 && (
                                    <div className="flex justify-center items-center mt-12 gap-4">
                                        <button 
                                            onClick={() => handlePageChange(currentPage - 1)} 
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
                                        >
                                            {t({ar: 'السابق', en: 'Previous'})}
                                        </button>
                                        <span className="text-gray-600 font-medium">
                                            {t({ar: 'صفحة', en: 'Page'})} {currentPage} {t({ar: 'من', en: 'of'})} {lastPage}
                                        </span>
                                        <button 
                                            onClick={() => handlePageChange(currentPage + 1)} 
                                            disabled={currentPage === lastPage}
                                            className="px-4 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
                                        >
                                            {t({ar: 'التالي', en: 'Next'})}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-lg shadow-md">
                                <p className="text-xl text-gray-600">{t({ ar: 'لم يتم العثور على مقالات.', en: 'No articles found.' })}</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>

        {/* Goals Section */}
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <SectionTitle>{t(c.goals.title)}</SectionTitle>
                <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {c.goals.items.map((goal, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg">
                             <svg className="w-6 h-6 text-med-tech-blue flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <p className="text-gray-700">{t(goal)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-med-tech-blue text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-bold font-arabic">{t(c.cta.title)}</h2>
                <p className="mt-4 text-lg max-w-3xl mx-auto text-gray-200">{t(c.cta.text)}</p>
                <p className="mt-2 text-sm text-gray-300"><em>{t(c.cta.note)}</em></p>
                <a href="mailto:articles@medpulseuae.com" className="mt-6 inline-block bg-med-vital-green hover:bg-white hover:text-med-tech-blue transition-colors text-white font-bold py-3 px-8 rounded-md text-lg shadow-lg">
                    {t({ ar: 'أرسل مقالك', en: 'Submit Your Article' })}
                </a>
            </div>
        </section>
    </div>
  );
};

export default ArticlesPage;
