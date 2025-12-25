
import React, { useState, useEffect } from 'react';
import type { NavigateFunction, Conference, Article, ApiEvent, ApiArticle, Category } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import SectionTitle from '../components/SectionTitle';
import ConferenceCard from '../components/ConferenceCard';
import ArticleCard from '../components/ArticleCard';
import SEO from '../components/SEO';
import { FOUNDER_DATA, HOME_PAGE_CONTENT, FOUNDER_DATA_DETAILED } from '../constants';
import { api } from '../services/api';

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
  
  const [heroMode, setHeroMode] = useState<'images' | 'video'>('images');
  const [carouselImages, setCarouselImages] = useState<string[]>(['https://picsum.photos/seed/bg/1920/1080']);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [videoEmbedUrl, setVideoEmbedUrl] = useState('');

  // Hero Data
  const heroTitle = config?.home[`hero_title_${language}` as keyof typeof config.home] as string || t(c.hero.title);
  const heroSubtitle = config?.home[`hero_subtitle_${language}` as keyof typeof config.home] as string || t(c.hero.subtitle);
  const heroDesc = config?.home[`hero_desc_${language}` as keyof typeof config.home] as string || t(c.hero.description);
  const heroBtn1 = config?.home[`hero_btn1_${language}` as keyof typeof config.home] as string || t(c.hero.button1);
  const heroBtn2 = config?.home[`hero_btn2_${language}` as keyof typeof config.home] as string || t(c.hero.button2);
  
  // About MedPulse
  const aboutTitle = config?.home[`about_title_${language}` as keyof typeof config.home] as string || t(c.about.title);
  const aboutDesc = config?.home[`about_desc_${language}` as keyof typeof config.home] as string || t(c.about.description);
  const aboutItems = config?.home.about_items || c.about.points.map(p => ({ icon: '✔', text_ar: p.ar, text_en: p.en }));

  // Mission Vision
  const mvTitle = config?.home[`mv_title_${language}` as keyof typeof config.home] as string || t(c.missionVision.title);
  const missionIcon = config?.home.mission_icon || '🎯';
  const missionTitle = config?.home[`mission_title_${language}` as keyof typeof config.home] as string || t(c.missionVision.mission.title);
  const missionText = config?.home[`mission_text_${language}` as keyof typeof config.home] as string || t(c.missionVision.mission.text);
  const missionSummary = config?.home[`mission_summary_${language}` as keyof typeof config.home] as string || '';
  
  const visionIcon = config?.home.vision_icon || '👁️';
  const visionTitle = config?.home[`vision_title_${language}` as keyof typeof config.home] as string || t(c.missionVision.vision.title);
  const visionText = config?.home[`vision_text_${language}` as keyof typeof config.home] as string || t(c.missionVision.vision.text);
  const visionSummary = config?.home[`vision_summary_${language}` as keyof typeof config.home] as string || '';

  // Why MedPulse
  const whyTitle = config?.home[`why_title_${language}` as keyof typeof config.home] as string || t(c.whyMedPulse.title);
  const whyDesc = config?.home[`why_desc_${language}` as keyof typeof config.home] as string || t(c.whyMedPulse.description);
  const whyItems = config?.home.why_items || c.whyMedPulse.points.map(p => ({ icon: '✨', title_ar: p.title.ar, title_en: p.title.en, desc_ar: p.description.ar, desc_en: p.description.en }));

  // How We Evaluate
  const howTitle = config?.home[`how_title_${language}` as keyof typeof config.home] as string || t(c.howWeEvaluate.title);
  const howDesc = config?.home[`how_desc_${language}` as keyof typeof config.home] as string || t(c.howWeEvaluate.description);
  const howSteps = config?.home.how_steps || c.howWeEvaluate.steps.map(s => ({ title_ar: s.title.ar, title_en: s.title.en, desc_ar: s.description.ar, desc_en: s.description.en }));
  const howGoal = config?.home[`how_goal_${language}` as keyof typeof config.home] as string || t(c.howWeEvaluate.goal);

  // Latest Titles
  const latestConfTitle = config?.home[`latest_conf_title_${language}` as keyof typeof config.home] as string || t(c.latestConferences.title);
  const latestArtTitle = config?.home[`latest_art_title_${language}` as keyof typeof config.home] as string || t(c.latestArticles.title);

  // Founder & CTA
  const founderSecTitle = config?.home[`founder_sec_title_${language}` as keyof typeof config.home] as string || t(c.founder.title);
  const founderSecDesc = config?.home[`founder_sec_desc_${language}` as keyof typeof config.home] as string || t(c.founder.description);
  const ctaTitle = config?.home[`cta_title_${language}` as keyof typeof config.home] as string || t(c.cta.title);
  const ctaDesc = config?.home[`cta_desc_${language}` as keyof typeof config.home] as string || t(c.cta.description);
  const ctaBtn = config?.home[`cta_btn_${language}` as keyof typeof config.home] as string || t(c.cta.button);

  useEffect(() => {
      const fetchHomeContent = async () => {
          setLoading(true);
          try {
              // 1. Fetch Limits
              let eventsLimit = 3;
              let postsLimit = 3;
              try {
                  const limitsRes = await api.getHomeSettings();
                  const limits = limitsRes.data || limitsRes;
                  if (limits) {
                      eventsLimit = limits.events_number || 3;
                      postsLimit = limits.posts_number || 3;
                  }
              } catch(e) { console.warn("Limits fetch failed, using fallback 3."); }

              // 2. Fetch Data
              const res = await api.getHomeContent();
              const eventsList: ApiEvent[] = res.data?.events || [];
              const articlesList: ApiArticle[] = res.data?.articles || [];
              
              let cats: Category[] = [];
              try {
                  const catsRes = await api.getCategories();
                  cats = Array.isArray(catsRes.data) ? catsRes.data : (Array.isArray(catsRes) ? catsRes : []);
              } catch (error) { console.warn(error); }

              const mappedEvents: Conference[] = eventsList.slice(0, eventsLimit).map(e => ({
                  id: e.id,
                  title: { ar: e.title_ar, en: e.title_en },
                  organizer: { ar: e.organizer_ar, en: e.organizer_en },
                  location: { ar: e.location, en: e.location },
                  city: { ar: e.location, en: e.location },
                  date: { ar: e.date_of_happening, en: e.date_of_happening },
                  image: e.images && e.images.length > 0 ? api.resolveImageUrl(`${e.images[0].base_url}${e.images[0].name}`) : 'https://picsum.photos/seed/conf/400/300',
                  score: Number(e.rate) * 10, 
                  stars: e.stars,
                  description: { ar: e.description_ar, en: e.description_en },
                  scoreText: { ar: '', en: '' },
                  evaluation: { scientificContent: [0, 25], organization: [0, 20], speakers: [0, 15], sponsors: [0, 20], socialImpact: [0, 20] },
                  specialty: { 
                    ar: (e.subjects_ar?.[0] || '').split('|||MT_SEP|||').pop() || '', 
                    en: (e.subjects_en?.[0] || '').split('|||MT_SEP|||').pop() || '' 
                  },
                  year: new Date(e.date_of_happening).getFullYear()
              }));
              setDisplayEvents(mappedEvents);

              const mappedArticles: Article[] = articlesList.slice(0, postsLimit).map(a => {
                  const category = cats.find(c => c.id === Number(a.category_id));
                  return {
                      id: a.id,
                      title: { ar: a.title_ar, en: a.title_en },
                      category: { ar: category?.name_ar || 'عام', en: category?.name_en || 'General' },
                      intro: { ar: a.description_ar, en: a.description_en },
                      author: { ar: a.authors?.[0]?.name_ar || 'MedPulse', en: a.authors?.[0]?.name_en || 'MedPulse' },
                      image: a.images && a.images.length > 0 ? api.resolveImageUrl(`${a.images[0].base_url}${a.images[0].name}`) : 'https://picsum.photos/seed/art/400/300',
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
                          setCarouselImages(settings.images.map((img: any) => api.resolveImageUrl(`${img.base_url}${img.name}`)));
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

  const finalFounderImage = api.resolveImageUrl(config?.founder?.main_image, FOUNDER_DATA_DETAILED.image);

  return (
    <div className="antialiased bg-gray-50 flex flex-col min-h-screen font-arabic bg-sterile-light-grey">
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
            <button onClick={() => navigate('conferences')} className="bg-med-vital-green hover:bg-green-700 transition-all duration-300 text-white font-bold py-3 px-8 rounded-md text-lg shadow-lg">{heroBtn1}</button>
            <button onClick={() => navigate('about')} className="bg-med-tech-blue hover:bg-blue-800 transition-colors text-white font-bold py-3 px-8 rounded-md text-lg shadow-lg">{heroBtn2}</button>
          </div>
        </div>
      </section>

      {/* What is MedPulse */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
             <SectionTitle>{aboutTitle}</SectionTitle>
             <p className="text-clinical-charcoal leading-relaxed text-lg mb-8">{aboutDesc}</p>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 max-w-3xl mx-auto text-start rtl:text-right">
                {aboutItems.map((point, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <span className="text-med-vital-green text-2xl" role="img">{point.icon || '✔'}</span>
                        <span className="text-gray-800 font-medium">{language === 'ar' ? point.text_ar : point.text_en}</span>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-sterile-light-grey">
           <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <SectionTitle>{mvTitle}</SectionTitle>
              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                  <div className="bg-white p-8 rounded-lg shadow-lg text-center border-t-4 border-med-tech-blue flex flex-col">
                      <span className="text-4xl block mb-4" role="img">{missionIcon}</span>
                      <h3 className="text-2xl font-bold text-clinical-charcoal mb-4 font-arabic">{missionTitle}</h3>
                      <div className="text-gray-700 leading-relaxed mb-6 flex-grow text-start rtl:text-right rich-text-preview" dangerouslySetInnerHTML={{ __html: missionText }} />
                      {missionSummary && (
                          <p className="mt-auto font-semibold text-med-tech-blue bg-sterile-light-grey p-3 rounded-md text-center">{missionSummary}</p>
                      )}
                  </div>
                   <div className="bg-white p-8 rounded-lg shadow-lg text-center border-t-4 border-med-tech-blue flex flex-col">
                      <span className="text-4xl block mb-4" role="img">{visionIcon}</span>
                      <h3 className="text-2xl font-bold text-clinical-charcoal mb-4 font-arabic">{visionTitle}</h3>
                      <div className="text-gray-700 leading-relaxed mb-6 flex-grow text-start rtl:text-right rich-text-preview" dangerouslySetInnerHTML={{ __html: visionText }} />
                      {visionSummary && (
                          <p className="mt-auto font-semibold text-med-tech-blue bg-sterile-light-grey p-3 rounded-md text-center">{visionSummary}</p>
                      )}
                  </div>
              </div>
          </div>
      </section>

      {/* Why MedPulse Section */}
      <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <SectionTitle subtitle={whyDesc}>{whyTitle}</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
                  {whyItems.map((item, index) => (
                      <div key={index} className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col items-center">
                          <span className="text-5xl mb-4 text-med-tech-blue" role="img" style={{ filter: 'drop-shadow(0 2px 2px rgba(20,99,190,0.2))' }}>{item.icon}</span>
                          <h3 className="font-bold text-lg text-clinical-charcoal font-arabic mb-2">{language === 'ar' ? item.title_ar : item.title_en}</h3>
                          <div className="text-gray-600 text-sm rich-text-preview" dangerouslySetInnerHTML={{ __html: language === 'ar' ? item.desc_ar : item.desc_en }} />
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* How We Evaluate Section */}
      <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <SectionTitle subtitle={howDesc}>{howTitle}</SectionTitle>
              <div className="relative max-w-2xl mx-auto">
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 h-full w-1 bg-sterile-light-grey rounded-full"></div>
                  {howSteps.map((item, index) => (
                      <div key={index} className="flex items-start mb-8 relative">
                           <div className="absolute left-4 md:left-1/2 -translate-x-1/2 mt-1.5 w-8 h-8 bg-med-tech-blue rounded-full border-4 border-white flex items-center justify-center text-white font-bold shadow-sm">{index + 1}</div>
                           <div className={`bg-white p-6 rounded-lg shadow-lg ms-12 md:ms-0 md:w-5/12 md:relative md:left-auto border-l-2 border-med-tech-blue rtl:border-l-0 rtl:border-r-2`} style={{[index % 2 === 0 ? 'marginRight' : 'marginLeft']: 'auto'}}>
                              <h3 className="font-bold text-lg text-clinical-charcoal font-arabic">{language === 'ar' ? item.title_ar : item.title_en}</h3>
                              <div className="text-gray-600 text-sm rich-text-preview" dangerouslySetInnerHTML={{ __html: language === 'ar' ? item.desc_ar : item.desc_en }} />
                          </div>
                      </div>
                  ))}
              </div>
              <div className="text-center mt-8 text-lg text-gray-700 italic rich-text-preview" dangerouslySetInnerHTML={{ __html: howGoal }} />
          </div>
      </section>

      {/* Latest Content Sections */}
      <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <SectionTitle>{latestConfTitle}</SectionTitle>
              {loading ? <LoadingSpinner /> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {displayEvents.map(conf => <ConferenceCard key={conf.id} conference={conf} navigate={navigate} stars={conf.stars} />)}
                  </div>
              )}
          </div>
      </section>

      <section className="py-20 bg-sterile-light-grey">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <SectionTitle>{latestArtTitle}</SectionTitle>
              {loading ? <LoadingSpinner /> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {displayArticles.map(article => <ArticleCard key={article.id} article={article} navigate={navigate} />)}
                  </div>
              )}
          </div>
      </section>

      {/* Founder Summary */}
      <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <SectionTitle>{founderSecTitle}</SectionTitle>
              <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                  <div className="order-2 md:order-1 text-center md:text-start rtl:md:text-right">
                      <h3 className="text-2xl font-bold text-clinical-charcoal font-arabic">{config?.founder[`name_${language}` as keyof typeof config.founder] as string || t(FOUNDER_DATA.name)}</h3>
                      <p className="text-med-tech-blue font-semibold">{config?.founder[`main_title_${language}` as keyof typeof config.founder] as string || t(FOUNDER_DATA.title)}</p>
                      <p className="mt-4 text-gray-700">{founderSecDesc}</p>
                      <button onClick={() => navigate('founder')} className="mt-6 bg-med-tech-blue hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-md transition-colors shadow-md">
                          {t({ ar: 'تعرف أكثر على الدكتور خالد العطوي', en: 'Learn More About Dr. Khaled Al-Atawi' })}
                      </button>
                  </div>
                  <div className="order-1 md:order-2 flex justify-center">
                      <img src={finalFounderImage} alt="Founder" className="w-64 h-64 rounded-full shadow-lg object-cover border-4 border-med-tech-blue"/>
                  </div>
              </div>
          </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-med-tech-blue text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold font-arabic">{ctaTitle}</h2>
              <p className="mt-4 text-lg max-w-2xl mx-auto text-gray-200">{ctaDesc}</p>
              <button onClick={() => navigate('contact')} className="mt-8 bg-med-vital-green hover:bg-white hover:text-med-tech-blue transition-colors text-white font-bold py-3 px-8 rounded-md text-lg shadow-lg">{ctaBtn}</button>
          </div>
      </section>
      <style>{`
        .rich-text-preview ul { list-style-type: disc; padding-inline-start: 1.5rem; margin-bottom: 1rem; }
        .rich-text-preview ol { list-style-type: decimal; padding-inline-start: 1.5rem; margin-bottom: 1rem; }
        .rich-text-preview p { margin-bottom: 0.5rem; }
      `}</style>
    </div>
  );
};

export default HomePage;
