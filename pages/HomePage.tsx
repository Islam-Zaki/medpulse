import React, { useState, useEffect } from 'react';
import type { NavigateFunction, Conference, Article, ApiEvent, ApiArticle, Category } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import SectionTitle from '../components/SectionTitle';
import ConferenceCard from '../components/ConferenceCard';
import ArticleCard from '../components/ArticleCard';
import SEO from '../components/SEO';
import { FOUNDER_DATA, HOME_PAGE_CONTENT } from '../constants';
import { api } from '../services/api';


// SVG Icons
const CheckCircleIcon: React.FC = () => (
  <svg className="w-6 h-6 text-med-vital-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);

const DOMAIN = 'https://medpulse-production.up.railway.app';

const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-med-tech-blue"></div>
    </div>
);

interface HomePageProps {
  navigate: NavigateFunction;
}

const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const { t, config, language } = useLocalization();
  const c = HOME_PAGE_CONTENT;
  const [displayEvents, setDisplayEvents] = useState<Conference[]>([]);
  const [displayArticles, setDisplayArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Hero Section State
  const [heroMode, setHeroMode] = useState<'images' | 'video'>('images');
  const [carouselImages, setCarouselImages] = useState<string[]>(['https://picsum.photos/seed/bg/1920/1080']);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [videoEmbedUrl, setVideoEmbedUrl] = useState('');

  // Config Content
  const heroTitle = config?.home[`hero_title_${language}` as keyof typeof config.home] || t(c.hero.title);
  const heroSubtitle = config?.home[`hero_subtitle_${language}` as keyof typeof config.home] || t(c.hero.subtitle);
  const heroDesc = config?.home[`hero_desc_${language}` as keyof typeof config.home] || t(c.hero.description);
  
  const aboutTitle = config?.home[`about_title_${language}` as keyof typeof config.home] || t(c.about.title);
  const aboutDesc = config?.home[`about_desc_${language}` as keyof typeof config.home] || t(c.about.description);
  const aboutPoints = [
      config?.home[`about_p1_${language}` as keyof typeof config.home] || t(c.about.points[0]),
      config?.home[`about_p2_${language}` as keyof typeof config.home] || t(c.about.points[1]),
      config?.home[`about_p3_${language}` as keyof typeof config.home] || t(c.about.points[2]),
      config?.home[`about_p4_${language}` as keyof typeof config.home] || t(c.about.points[3]),
  ];

  const founderSecTitle = config?.home[`founder_sec_title_${language}` as keyof typeof config.home] || t(c.founder.title);
  const founderSecDesc = config?.home[`founder_sec_desc_${language}` as keyof typeof config.home] || t(c.founder.description);

  useEffect(() => {
      const fetchHomeContent = async () => {
          setLoading(true);
          try {
              const res = await api.getHomeContent();
              const eventsList: ApiEvent[] = res.data?.events || [];
              const articlesList: ApiArticle[] = res.data?.articles || [];
              
              let cats: Category[] = [];
              try {
                  const catsRes = await api.getCategories();
                  cats = Array.isArray(catsRes.data) ? catsRes.data : (Array.isArray(catsRes) ? catsRes : []);
              } catch (error) { console.warn(error); }

              const mappedEvents: Conference[] = eventsList.map(e => ({
                  id: e.id,
                  title: { ar: e.title_ar, en: e.title_en },
                  organizer: { ar: e.organizer_ar, en: e.organizer_en },
                  location: { ar: e.location, en: e.location },
                  city: { ar: e.location, en: e.location },
                  date: { ar: e.date_of_happening, en: e.date_of_happening },
                  image: e.images && e.images.length > 0 ? `${DOMAIN}${e.images[0].base_url}${e.images[0].name}` : 'https://picsum.photos/seed/conf/400/300',
                  score: Number(e.rate) * 10,
                  stars: e.stars,
                  description: { ar: e.description_ar, en: e.description_en },
                  scoreText: { ar: '', en: '' },
                  evaluation: { scientificContent: [0, 25], organization: [0, 20], speakers: [0, 15], sponsors: [0, 20], socialImpact: [0, 20] },
                  specialty: { ar: e.subjects_ar?.[0] || '', en: e.subjects_en?.[0] || '' },
                  year: new Date(e.date_of_happening).getFullYear()
              }));
              setDisplayEvents(mappedEvents);

              const mappedArticles: Article[] = articlesList.map(a => {
                  const category = cats.find(c => c.id === Number(a.category_id));
                  return {
                      id: a.id,
                      title: { ar: a.title_ar, en: a.title_en },
                      category: { ar: category?.name_ar || 'عام', en: category?.name_en || 'General' },
                      intro: { ar: a.description_ar, en: a.description_en },
                      author: { ar: a.authors?.[0]?.name_ar || 'MedPulse', en: a.authors?.[0]?.name_en || 'MedPulse' },
                      image: a.images && a.images.length > 0 ? `${DOMAIN}${a.images[0].base_url}${a.images[0].name}` : 'https://picsum.photos/seed/art/400/300',
                  };
              });
              setDisplayArticles(mappedArticles);

              try {
                  const frontRes = await api.getFrontSettings();
                  const frontData = frontRes.data || frontRes;
                  const settings = Array.isArray(frontData) && frontData.length > 0 ? frontData[0] : null;
                  
                  if (settings) {
                      setHeroMode(settings.mode || 'images');
                      if (settings.mode === 'video' && settings.videos?.length > 0) {
                          const vid = settings.videos[0];
                          if (vid.base_url && vid.name) {
                              let fullUrl = vid.base_url + vid.name;
                              if(fullUrl.includes('embed')) {
                                  fullUrl += `?autoplay=1&mute=1&controls=0&loop=1&playlist=${vid.name}&origin=${window.location.origin}`;
                              }
                              setVideoEmbedUrl(fullUrl);
                          }
                      } else if (settings.images?.length > 0) {
                          setCarouselImages(settings.images.map((img: any) => `${DOMAIN}${img.base_url}${img.name}`));
                      }
                  }
              } catch (settingsError) { console.warn(settingsError); }

          } catch (e) { console.error(e); } 
          finally { setLoading(false); }
      };
      fetchHomeContent();
  }, []);

  useEffect(() => {
      if (heroMode !== 'images' || carouselImages.length <= 1) return;
      const interval = setInterval(() => { setCurrentSlide(prev => (prev + 1) % carouselImages.length); }, 5000);
      return () => clearInterval(interval);
  }, [carouselImages, heroMode]);

  return (
    <div className="font-arabic bg-sterile-light-grey">
      <SEO page="home" />
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] text-white flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-clinical-charcoal">
            {heroMode === 'video' && videoEmbedUrl ? (
                <div className="absolute inset-0 w-full h-full pointer-events-none">
                    <iframe className="w-full h-full object-cover scale-150" src={videoEmbedUrl} title="Hero Video" allow="autoplay; encrypted-media;" referrerPolicy="strict-origin-when-cross-origin"></iframe>
                </div>
            ) : (
                carouselImages.map((img, index) => (
                    <div key={index} className={`absolute top-0 left-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundImage: `url('${img}')` }}></div>
                ))
            )}
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-clinical-charcoal/70 z-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-20 text-center md:text-start rtl:md:text-right relative">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight drop-shadow-lg">{heroTitle}</h1>
          <p className="mt-2 text-xl md:text-2xl font-light drop-shadow-md">{heroSubtitle}</p>
          <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto md:mx-0 opacity-90 drop-shadow-sm">{heroDesc}</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button onClick={() => navigate('conferences')} className="bg-med-vital-green hover:bg-green-700 transition-all duration-300 text-white font-bold py-3 px-8 rounded-md text-lg shadow-lg">{t(c.hero.button1)}</button>
            <button onClick={() => navigate('about')} className="bg-med-tech-blue hover:bg-blue-800 transition-colors text-white font-bold py-3 px-8 rounded-md text-lg shadow-lg">{t(c.hero.button2)}</button>
          </div>
        </div>
      </section>

      {/* What is MedPulse */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
             <SectionTitle>{aboutTitle}</SectionTitle>
             <p className="text-clinical-charcoal leading-relaxed text-lg mb-8">{aboutDesc}</p>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 max-w-3xl mx-auto text-start rtl:text-right">
                {aboutPoints.map((point, index) => (
                    <div key={index} className="flex items-center gap-3"><CheckCircleIcon /><span className="text-gray-800">{point}</span></div>
                ))}
            </div>
        </div>
      </section>

      {/* Latest Content Sections */}
      <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <SectionTitle>{t(c.latestConferences.title)}</SectionTitle>
              {loading ? <LoadingSpinner /> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {displayEvents.map(conf => <ConferenceCard key={conf.id} conference={conf} navigate={navigate} stars={conf.stars} />)}
                  </div>
              )}
          </div>
      </section>

      <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <SectionTitle>{t(c.latestArticles.title)}</SectionTitle>
              {loading ? <LoadingSpinner /> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {displayArticles.map(article => <ArticleCard key={article.id} article={article} navigate={navigate} />)}
                  </div>
              )}
          </div>
      </section>

      {/* Founder Summary */}
      <section className="py-20 bg-sterile-light-grey">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <SectionTitle>{founderSecTitle}</SectionTitle>
              <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                  <div className="order-2 md:order-1 text-center md:text-start rtl:md:text-right">
                      <h3 className="text-2xl font-bold text-clinical-charcoal font-arabic">{config?.founder[`name_${language}` as keyof typeof config.founder] || t(FOUNDER_DATA.name)}</h3>
                      <p className="text-med-tech-blue font-semibold">{config?.founder[`main_title_${language}` as keyof typeof config.founder] || t(FOUNDER_DATA.title)}</p>
                      <p className="mt-4 text-gray-700">{founderSecDesc}</p>
                      <button onClick={() => navigate('founder')} className="mt-6 bg-med-tech-blue hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-md transition-colors shadow-md">
                          {t({ ar: 'تعرف أكثر على الدكتور خالد العطوي', en: 'Learn More About Dr. Khaled Al-Atawi' })}
                      </button>
                  </div>
                  <div className="order-1 md:order-2 flex justify-center">
                      <img src={FOUNDER_DATA.image} alt="Founder" className="w-64 h-64 rounded-full shadow-lg object-cover border-4 border-med-tech-blue"/>
                  </div>
              </div>
          </div>
      </section>

      <section className="py-20 bg-med-tech-blue text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold font-arabic">{t(c.cta.title)}</h2>
              <p className="mt-4 text-lg max-w-2xl mx-auto text-gray-200">{t(c.cta.description)}</p>
              <button onClick={() => navigate('contact')} className="mt-8 bg-med-vital-green hover:bg-white hover:text-med-tech-blue transition-colors text-white font-bold py-3 px-8 rounded-md text-lg shadow-lg">
                  {t(c.cta.button)}
              </button>
          </div>
      </section>
    </div>
  );
};

export default HomePage;