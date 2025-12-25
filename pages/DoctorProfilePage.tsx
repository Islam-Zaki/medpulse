
import React, { useState, useEffect } from 'react';
import type { NavigateFunction, LocalizedString, ApiExpert, ApiEvent } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { api } from '../services/api';

interface DoctorProfilePageProps {
  navigate: NavigateFunction;
  expertId: number;
}

const DOMAIN = 'https://medpulse-production.up.railway.app';

const SectionWrapper: React.FC<{ title: LocalizedString; children: React.ReactNode; icon?: string; titleColor?: string }> = ({ title, icon, children, titleColor = 'text-med-blue' }) => {
  const { t } = useLocalization();
  return (
    <section className="py-8">
      <h2 className={`text-2xl md:text-3xl font-bold ${titleColor} mb-6 font-arabic flex items-center gap-3 border-b-2 border-gray-100 pb-3`}>
        {icon && <span className="text-2xl">{icon}</span>}
        <span>{t(title)}</span>
      </h2>
      <div className="space-y-4 text-gray-700 leading-relaxed prose prose-lg max-w-none">
        {children}
      </div>
    </section>
  );
};

const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
    <svg className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const DoctorProfilePage: React.FC<DoctorProfilePageProps> = ({ navigate, expertId }) => {
  const { t, language } = useLocalization();
  const [expert, setExpert] = useState<any | null>(null); 
  const [loading, setLoading] = useState(true);
  const [displayEvents, setDisplayEvents] = useState<ApiEvent[]>([]);

  useEffect(() => {
      const fetchData = async () => {
          setLoading(true);
          try {
              // 1. Fetch Expert
              const expertResponse = await api.getExpert(Number(expertId));
              const foundExpert = expertResponse.data || expertResponse;
              setExpert(foundExpert);

              // 2. Fetch Events for lookup if coveredEventsIds exists
              const coveredIds = (foundExpert.coveredEventsIds || []).map(String);
              if (coveredIds.length > 0) {
                  const eventsResponse = await api.getEvents(1);
                  const allEvents: ApiEvent[] = eventsResponse.data?.data || eventsResponse.data || eventsResponse || [];
                  // Filter to find the events mentioned in coveredEventsIds
                  const filtered = allEvents.filter(e => coveredIds.includes(e.id.toString()));
                  setDisplayEvents(filtered);
              }
          } catch (error) {
              console.error("Failed to load expert profile or events", error);
          } finally {
              setLoading(false);
          }
      };
      fetchData();
  }, [expertId]);
  
  if (loading) {
      return <div className="py-20 text-center text-gray-500">{t({ar: 'جارٍ التحميل...', en: 'Loading...'})}</div>;
  }

  if (!expert) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold">{t({ ar: 'الخبير غير موجود', en: 'Expert not found' })}</h1>
        <button onClick={() => navigate('experts')} className="mt-4 text-med-sky hover:underline">
          {t({ ar: 'العودة إلى فريق الخبراء', en: 'Back to Experts Team' })}
        </button>
      </div>
    );
  }

  // Data helpers
  const name = language === 'ar' ? expert.name_ar : expert.name_en;
  const job = language === 'ar' ? expert.job_ar : expert.job_en;
  const currentJob = language === 'ar' ? expert.current_job_ar : expert.current_job_en;
  const role = language === 'ar' ? expert.medpulse_role_ar : expert.medpulse_role_en;
  const roleDesc = language === 'ar' ? expert.medpulse_role_description_ar : expert.medpulse_role_description_en;
  const description = language === 'ar' ? expert.description_ar : expert.description_en;
  const coverageType = language === 'ar' ? expert.coverage_type_ar : expert.coverage_type_en;
  
  // Specialty Cleaner helper
  const cleanSpec = (s: string) => s.includes('|||MT_SEP|||') ? s.split('|||MT_SEP|||').pop() || '' : s;

  const evaluatedSpecialtiesRaw = language === 'ar' ? expert.evaluated_specialties_ar : expert.evaluated_specialties_en;
  const evaluatedSpecialties = (evaluatedSpecialtiesRaw || []).map(cleanSpec);
  
  const subspecialitiesRaw = language === 'ar' ? expert.subspecialities_ar : expert.subspecialities_en;
  const subspecialities = (subspecialitiesRaw || []).map(cleanSpec);
  
  const membership = language === 'ar' ? expert.membership_ar : expert.membership_en;

  let imageUrl = 'https://picsum.photos/seed/doc-placeholder/400/400';
  if (expert.images && expert.images.length > 0) {
      const latestImg = expert.images.sort((a: any, b: any) => b.id - a.id)[0];
      imageUrl = `${DOMAIN}${latestImg.base_url}${latestImg.name}`;
  }

  return (
    <div className="bg-white font-arabic">
      {/* Header Section */}
      <section className="bg-med-light-blue py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:gap-8">
            <img src={imageUrl} alt={name} className="w-40 h-40 rounded-full shadow-xl object-cover mx-auto md:mx-0 mb-6 md:mb-0 border-4 border-white" />
            <div className="text-center md:text-left rtl:md:text-right">
              <h1 className="text-4xl font-bold text-med-blue font-arabic">{name}</h1>
              <p className="text-xl text-med-sky mt-1 font-bold">{job}</p>
              <p className="text-lg text-gray-700 mt-2">{currentJob}</p>
              <p className="mt-2 text-md font-semibold text-gray-600 bg-white/50 inline-block px-3 py-1 rounded-full border border-gray-200">{role}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content Area */}
          <main className="lg:col-span-2">
            
            {/* 1. Biography */}
            <SectionWrapper icon="📖" title={{ ar: 'نبذة تعريفية', en: 'Biography' }}>
              <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: description || '' }} />
            </SectionWrapper>

            {/* 2. MedPulse Contribution */}
            <SectionWrapper icon="✨" title={{ ar: 'المساهمة في MedPulse', en: 'MedPulse Contribution' }}>
                <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="mb-6 text-start rtl:text-right">
                        <strong className="block text-med-blue mb-1 text-lg">{t({ar: 'الدور:', en: 'Role:'})}</strong> 
                        <p className="text-gray-800">{roleDesc}</p>
                    </div>
                    <div className="mb-6 text-start rtl:text-right">
                        <strong className="block text-med-blue mb-1 text-lg">{t({ar: 'نوعية التغطيات:', en: 'Coverage Type:'})}</strong> 
                        <p className="text-gray-800">{coverageType}</p>
                    </div>
                    {evaluatedSpecialties && evaluatedSpecialties.length > 0 && (
                        <div className="text-start rtl:text-right">
                            <strong className="block text-med-blue mb-2 text-lg">{t({ar: 'التخصصات التي يقيمها:', en: 'Evaluated Specialties:'})}</strong>
                            <div className="flex flex-wrap gap-2">
                                {evaluatedSpecialties.map((spec: string, i: number) => (
                                    <span key={i} className="bg-white border border-med-tech-blue/20 text-med-tech-blue px-3 py-1 rounded-full text-sm font-bold">
                                        {spec}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </SectionWrapper>

            {/* 3. Conferences Covered (NOW POPULATING FROM filtered list) */}
            {displayEvents.length > 0 && (
                <SectionWrapper icon="🗓️" title={{ ar: 'المؤتمرات التي تم تقييمها', en: 'Conferences Covered' }} titleColor="text-med-tech-blue">
                    <div className="space-y-10 mt-4">
                        {displayEvents.map((event) => {
                            const eventTitle = language === 'ar' ? event.title_ar : event.title_en;
                            const eventOrganizer = language === 'ar' ? event.organizer_ar : event.organizer_en;
                            const eventImage = event.images && event.images.length > 0 
                                ? api.resolveImageUrl(`${event.images[0].base_url}${event.images[0].name}`) 
                                : 'https://picsum.photos/seed/conf/1200/600';
                            
                            const score = Number(event.rate) * 10;
                            const stars = event.stars || Math.round(score / 20);
                            const eventLoc = language === 'ar' ? (event.location_ar || event.location) : event.location;

                            return (
                                <div key={event.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all hover:shadow-xl group flex flex-col text-start rtl:text-right">
                                    {/* Card Header: Banner Image */}
                                    <div className="relative h-64 overflow-hidden bg-gray-200">
                                        <img 
                                            src={eventImage} 
                                            alt={eventTitle} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-8">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2 font-arabic leading-snug">
                                            {eventTitle}
                                        </h3>
                                        <p className="text-gray-600 text-base mb-1 font-medium">
                                            {eventOrganizer}
                                        </p>
                                        <p className="text-gray-500 text-sm mb-6">
                                            {eventLoc} - {event.date_of_happening}
                                        </p>
                                        
                                        {/* Rating Row */}
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-1.5">
                                                {Array.from({ length: 5 }, (_, i) => (
                                                    <StarIcon key={i} filled={i < stars} />
                                                ))}
                                            </div>
                                            <div className="text-2xl font-black text-med-tech-blue">
                                                {score.toFixed(0)}%
                                            </div>
                                        </div>

                                        {/* Full Width Action Button */}
                                        <button 
                                            onClick={() => navigate('conference-details', { id: event.id })}
                                            className="w-full bg-med-vital-green hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all shadow-md active:scale-95 text-lg"
                                        >
                                            {t({ ar: 'عرض التقييم الكامل', en: 'View Full Evaluation' })}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            )}

            {/* 4. Media Appearances */}
            {expert.videos && expert.videos.length > 0 ? (
                <SectionWrapper icon="🎥" title={{ ar: 'الظهور الإعلامي', en: 'Video Appearances' }}>
                    <div className="grid sm:grid-cols-2 gap-6 mt-4">
                        {expert.videos.map((video: any, i: number) => {
                            const videoId = video.name || '';
                            if (!videoId) return null;
                            
                            return (
                                <div key={i} className="rounded-2xl overflow-hidden shadow-md aspect-video bg-black relative group border border-gray-200">
                                    <iframe 
                                        src={`https://www.youtube.com/embed/${videoId}`} 
                                        className="w-full h-full" 
                                        title={`Expert Video ${i + 1}`}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            );
                        })}
                    </div>
                </SectionWrapper>
            ) : null}
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              {/* Additional Info */}
              <div className="bg-gray-50 p-8 rounded-[30px] shadow-sm border border-gray-200 text-start rtl:text-right">
                <h3 className="text-xl font-bold text-med-blue mb-6 border-b border-gray-200 pb-3 uppercase tracking-tighter">{t({ar: 'معلومات إضافية', en: 'Additional Info'})}</h3>
                <div className="space-y-6">
                    <div>
                        <strong className="block text-gray-500 text-[10px] uppercase tracking-widest mb-1 font-bold">{t({ar: 'سنوات الخبرة', en: 'Years of Experience'})}</strong> 
                        <span className="text-2xl font-black text-med-tech-blue">{expert.years_of_experience}+</span>
                    </div>
                    {subspecialities && subspecialities.length > 0 && (
                        <div>
                            <strong className="block text-gray-500 text-[10px] uppercase tracking-widest mb-2 font-bold">{t({ar: 'التخصصات الدقيقة', en: 'Subspecialties'})}</strong>
                            <ul className="space-y-2">
                                {subspecialities.map((s: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-gray-800 font-bold">
                                        <span className="text-med-tech-blue">›</span>
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {membership && membership.length > 0 && (
                        <div>
                            <strong className="block text-gray-500 text-[10px] uppercase tracking-widest mb-2 font-bold">{t({ar: 'العضويات', en: 'Memberships'})}</strong>
                            <ul className="space-y-2">
                                {membership.map((m: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-gray-800 font-bold">
                                        <span className="text-med-tech-blue">›</span>
                                        {m}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
              </div>
              
              {/* Contacts */}
              {expert.contacts && expert.contacts.length > 0 && (
                <div className="bg-white p-8 rounded-[30px] shadow-lg border border-gray-100 text-start rtl:text-right">
                    <h3 className="text-xl font-bold text-med-blue mb-6 border-b border-gray-100 pb-3 uppercase tracking-tighter">{t({ar: 'التواصل', en: 'Contact'})}</h3>
                    <div className="flex flex-col space-y-4">
                        {expert.contacts.map((contact: any, idx: number) => (
                            <a 
                                key={idx} 
                                href={contact.link || '#'} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100"
                            >
                                <span className="text-xl group-hover:scale-110 transition-transform">🔗</span>
                                <span className="font-bold text-gray-700">{language === 'ar' ? contact.name_ar : contact.name_en}</span>
                            </a>
                        ))}
                    </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
      <style>{`
        .rich-text-content ul { list-style-type: disc; padding-inline-start: 1.5rem; margin-bottom: 1rem; }
        .rich-text-content ol { list-style-type: decimal; padding-inline-start: 1.5rem; margin-bottom: 1rem; }
        .rich-text-content p { margin-bottom: 0.75rem; }
      `}</style>
    </div>
  );
};

export default DoctorProfilePage;
