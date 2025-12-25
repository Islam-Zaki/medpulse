
import React, { useEffect, useState } from 'react';
import type { NavigateFunction, ApiArticle, Category, ApiAuthor } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import SectionTitle from '../components/SectionTitle';
import ArticleCard from '../components/ArticleCard';
import ShareButton from '../components/ShareButton';
import { api } from '../services/api';
import SEO from '../components/SEO';

interface ArticleDetailsPageProps {
  navigate: NavigateFunction;
  articleId: number;
}

const DOMAIN = 'https://medpulse-production.up.railway.app';

const ArticleDetailsPage: React.FC<ArticleDetailsPageProps> = ({ navigate, articleId }) => {
  const { t, language } = useLocalization();
  const [article, setArticle] = useState<ApiArticle | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState<ApiArticle[]>([]);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch article
            const articleRes = await api.getArticle(articleId);
            setArticle(articleRes.data || articleRes);

            // Fetch categories to resolve name
            try {
                const catRes = await api.getCategories();
                const cats = Array.isArray(catRes.data) ? catRes.data : (Array.isArray(catRes) ? catRes : []);
                setCategories(cats);
            } catch (error) {
                console.warn("Failed to fetch categories, proceeding without them.", error);
            }

            // Fetch latest articles for "Related" section
            try {
                const relatedRes = await api.getArticles();
                const allRelated = relatedRes.data?.data || relatedRes.data || [];
                setRelatedArticles(allRelated.filter((a: ApiArticle) => a.id !== articleId).slice(0, 3));
            } catch(e) {
                console.error("Failed to load related articles", e);
            }

        } catch (error) {
            console.error("Failed to load article details", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [articleId]);

  if (loading) {
      return <div className="py-20 text-center text-gray-500">{t({ar: 'جارٍ التحميل...', en: 'Loading...'})}</div>;
  }

  if (!article) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold">{t({ ar: 'المقال غير موجود', en: 'Article not found' })}</h1>
        <button onClick={() => navigate('articles')} className="mt-4 text-med-tech-blue hover:underline">
          {t({ ar: 'العودة إلى المقالات', en: 'Back to articles' })}
        </button>
      </div>
    );
  }

  const categoryObj = categories.find(c => c.id === Number(article.category_id));
  const categoryName = language === 'ar' ? categoryObj?.name_ar : categoryObj?.name_en;
  
  const title = language === 'ar' ? article.title_ar : article.title_en;
  const description = language === 'ar' ? article.description_ar : article.description_en;
  
  const images = article.images?.map(img => ({
      src: `${DOMAIN}${img.base_url}${img.name}`,
      type: 'image'
  })) || [];
  
  const videos = article.videos || []; 

  return (
    <div className="font-arabic bg-white py-16">
      <SEO page="articles" dynamicTitle={title} dynamicDescription={description.substring(0, 160)} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header Section */}
          <div className="mb-8 text-center md:text-start rtl:md:text-right">
              {/* Category First Head */}
              {categoryName && (
                  <p className="text-med-tech-blue font-bold text-lg uppercase tracking-wide mb-3">
                      {categoryName}
                  </p>
              )}
              {/* Big Title */}
              <h1 className="text-3xl md:text-5xl font-bold text-clinical-charcoal font-arabic leading-tight mb-4">
                  {title}
              </h1>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-gray-500 text-sm border-b border-gray-100 pb-6">
                  <div>
                      {article.created_at && (
                          <span>{new Date(article.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      )}
                  </div>
                  <ShareButton title={title} text={description.substring(0, 100)} />
              </div>
          </div>

          {/* Media Section (Images & Videos) */}
          <div className="mb-10 space-y-6">
              {videos.length > 0 && (
                  <div className="grid gap-4">
                      {videos.map((vid: any, idx: number) => (
                          <div key={`vid-${idx}`} className="rounded-xl overflow-hidden shadow-lg aspect-video bg-black">
                              <iframe 
                                src={`https://www.youtube.com/embed/${vid.name}`} 
                                className="w-full h-full" 
                                title={`Article Video ${idx + 1}`}
                                allowFullScreen
                              />
                          </div>
                      ))}
                  </div>
              )}

              {images.length > 0 && (
                  <div className={`grid gap-4 ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {images.map((img, idx) => (
                          <div key={`img-${idx}`} className={`rounded-xl overflow-hidden shadow-md ${images.length === 1 ? 'aspect-video' : 'aspect-[4/3]'}`}>
                              <img src={img.src} alt={title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                          </div>
                      ))}
                  </div>
              )}
          </div>

          {/* Description Section - UPDATED for Rich Text */}
          <div 
            className="rich-text-container prose lg:prose-xl max-w-none text-gray-800 leading-relaxed font-arabic mb-12"
            dangerouslySetInnerHTML={{ __html: description }}
          />

          {/* Authors Section */}
          {article.authors && article.authors.length > 0 && (
              <div className="mt-12 pt-10 border-t border-gray-200">
                  <h3 className="text-2xl font-bold text-clinical-charcoal mb-8 text-center">{t({ar: 'المؤلفون والمشاركون', en: 'Authors & Contributors'})}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-center">
                      {article.authors.map((author: ApiAuthor, index) => {
                          const authImg = author.images && author.images.length > 0 
                              ? `${DOMAIN}${author.images[0].base_url}${author.images[0].name}` 
                              : author.image_url || 'https://picsum.photos/seed/auth/200/200';
                          return (
                              <div key={index} className="flex flex-col items-center group">
                                  <div className="w-24 h-24 mb-4 relative">
                                      <img 
                                          src={authImg} 
                                          alt={language === 'ar' ? author.name_ar : author.name_en} 
                                          className="w-full h-full rounded-full shadow-lg object-cover border-4 border-white group-hover:border-med-tech-blue transition-colors duration-300" 
                                      />
                                  </div>
                                  <h4 className="font-bold text-gray-900 mb-1 text-center">{language === 'ar' ? author.name_ar : author.name_en}</h4>
                                  <p className="text-xs text-med-tech-blue font-medium uppercase tracking-wide text-center">{language === 'ar' ? author.speciality_ar : author.speciality_en}</p>
                              </div>
                          );
                      })}
                  </div>
              </div>
          )}

        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
            <div className="max-w-6xl mx-auto mt-24 border-t border-gray-200 pt-12">
                <SectionTitle>{t({ar: 'مقالات ذات صلة', en: 'Related Articles'})}</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {relatedArticles.map((art) => {
                        const category = categories.find(c => c.id === Number(art.category_id));
                        const mappedArticle = {
                            id: art.id,
                            title: { ar: art.title_ar, en: art.title_en },
                            category: { ar: category?.name_ar || '', en: category?.name_en || '' },
                            intro: { ar: art.description_ar, en: art.description_en },
                            author: { ar: art.authors?.[0]?.name_ar || 'MedPulse', en: art.authors?.[0]?.name_en || 'MedPulse' },
                            image: art.images && art.images.length > 0 ? `${DOMAIN}${art.images[0].base_url}${art.images[0].name}` : 'https://picsum.photos/seed/art/400/300'
                        };
                        return (
                            <ArticleCard key={art.id} article={mappedArticle} navigate={navigate} />
                        );
                    })}
                </div>
            </div>
        )}
      </div>
      <style>{`
        .rich-text-container h2 { font-size: 1.875rem; font-weight: bold; margin-top: 2.5rem; margin-bottom: 1.25rem; color: #272827; border-bottom: 2px solid #1463be20; padding-bottom: 0.5rem; }
        .rich-text-container h3 { font-size: 1.5rem; font-weight: bold; margin-top: 2rem; color: #1463be; }
        .rich-text-container ul { list-style-type: disc; padding-inline-start: 1.5rem; margin-bottom: 1.5rem; }
        .rich-text-container ol { list-style-type: decimal; padding-inline-start: 1.5rem; margin-bottom: 1.5rem; }
        .rich-text-container p { margin-bottom: 1rem; }
        .rich-text-container a { color: #1463be; text-decoration: underline; }
      `}</style>
    </div>
  );
};

export default ArticleDetailsPage;
