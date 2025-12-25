
import React, { useState, useEffect } from 'react';
import type { NavigateFunction, LocalizedString, ApiEvent, ApiAuthor } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { EVALUATION_CRITERIA } from '../constants';
import SectionTitle from '../components/SectionTitle';
import { api } from '../services/api';
import SEO from '../components/SEO';

interface ConferenceDetailsPageProps {
  navigate: NavigateFunction;
  conferenceId: number;
}

const DOMAIN = 'https://medpulse-production.up.railway.app';
const COMMENT_SEP = '|||MP_SEP|||';
const TOPIC_SEP = '|||MT_SEP|||';

// Helper Components for the new design
const DetailSection: React.FC<{ title: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <section className={`py-12 ${className}`}>
        <h2 className="text-3xl font-bold text-clinical-charcoal mb-8 font-arabic border-b-2 border-med-tech-blue/20 pb-4">{title}</h2>
        <div className="prose-lg max-w-none text-gray-800 leading-relaxed space-y-4">
            {children}
        </div>
    </section>
);

const IconHeading: React.FC<{ icon: string; children: React.ReactNode; }> = ({ icon, children }) => (
    <h3 className="text-2xl font-bold text-clinical-charcoal mb-4 font-arabic flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <span>{children}</span>
    </h3>
);

const QuoteBlock: React.FC<{ author: string; children: React.ReactNode; }> = ({ author, children }) => (
    <div className="border-r-4 border-med-tech-blue bg-sterile-light-grey p-8 rounded-r-lg my-6 rtl:border-r-0 rtl:border-l-4 rtl:rounded-r-none rtl:rounded-l-lg shadow-sm">
        <div className="text-lg italic text-gray-800 rich-text-preview" dangerouslySetInnerHTML={{ __html: children as string }} />
        <footer className="mt-4 text-md font-semibold text-med-tech-blue text-start rtl:text-right">&mdash; {author}</footer>
    </div>
);

const CircularProgress: React.FC<{ score: number }> = ({ score }) => {
    return (
        <div className="relative w-40 h-40 rounded-full flex items-center justify-center" style={{ background: `conic-gradient(#1463be ${score}%, #dfdfdf 0)` }}>
            <div className="w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center text-clinical-charcoal">
                <span className="text-4xl font-bold text-med-tech-blue">{score.toFixed(1)}%</span>
            </div>
        </div>
    );
};

// SVG Icons for new sections
const CalendarIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const LocationIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const OrganizerIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;

const ConferenceDetailsPage: React.FC<ConferenceDetailsPageProps> = ({ navigate, conferenceId }) => {
  const { t, language } = useLocalization();
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchEvent = async () => {
          try {
              const res = await api.getEvent(conferenceId);
              let evt = res.data || res;
              // Normalize analysis
              if (!evt.analysis && evt.event_analysis) {
                  evt.analysis = evt.event_analysis;
              }
              setEvent(evt);
          } catch(e) { console.error("Failed to fetch event", e); }
          finally { setLoading(false); }
      };
      fetchEvent();
  }, [conferenceId]);

  if (loading) {
      return <div className="py-20 text-center text-gray-500">{t({ar: 'جارٍ التحميل...', en: 'Loading...'})}</div>;
  }

  if (!event) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold">{t({ ar: 'المؤتمر غير موجود', en: 'Conference not found' })}</h1>
        <button onClick={() => navigate('conferences')} className="mt-4 text-med-tech-blue hover:underline">
          {t({ ar: 'العودة إلى المؤتمرات', en: 'Back to conferences' })}
        </button>
      </div>
    );
  }

  const analysis = event.analysis || event.event_analysis;
  
  // Calculate UI Score (0-100) from server rate (0-10)
  const calculatedScore = Number(event.rate) * 10;

  const evaluationKeys = ['scientificContent', 'organization', 'speakers', 'sponsors', 'socialImpact'];
  const analysisMapping: any = {
      scientificContent: { key: 'content_rate', icon: '🔬', max: 25 },
      organization: { key: 'organisation_rate', icon: '🏗️', max: 20 },
      speakers: { key: 'speaker_rate', icon: '🎤', max: 15 },
      sponsors: { key: 'sponsering_rate', icon: '🧬', max: 20 },
      socialImpact: { key: 'scientific_impact_rate', icon: '🌍', max: 20 },
  };

  const image = event.images && event.images.length > 0 ? `${DOMAIN}${event.images[0].base_url}${event.images[0].name}` : 'https://picsum.photos/seed/conf/1200/400';
  const galleryImages = event.images && event.images.length > 0 
        ? event.images.map(img => `${DOMAIN}${img.base_url}${img.name}`)
        : [];
  
  const videos = event.videos || [];

  const title = language === 'ar' ? event.title_ar : event.title_en;
  const organizer = language === 'ar' ? event.organizer_ar : event.organizer_en;
  const description = language === 'ar' ? event.description_ar : event.description_en;
  const date = event.date_of_happening;
  const location = language === 'ar' ? (event.location_ar || event.location) : event.location;

  // Handles both legacy (string array) and new (separate fields) structures
  const subjectsRaw = language === 'ar' 
      ? (event.subjects_ar || (event.subjects ? event.subjects : [])) 
      : (event.subjects_en || (event.subjects ? event.subjects : []));
      
  const subjects = subjectsRaw.map(s => {
      if (s.includes(TOPIC_SEP)) {
          const parts = s.split(TOPIC_SEP);
          return { icon: parts[0], title: parts[1] };
      }
      return { icon: '🧬', title: s };
  });

  const subjectsDesc = language === 'ar' ? event.subjects_description_ar : event.subjects_description_en;
  const authorsDesc = language === 'ar' ? event.authors_description_ar : event.authors_description_en;

  // Multi-Comments Parsing
  const commentsRaw = language === 'ar' ? event.comments_for_medpulse_ar : event.comments_for_medpulse_en;
  const commentsList = commentsRaw ? commentsRaw.split(COMMENT_SEP).filter(Boolean) : [];

  // Get current analysis summary
  const analysisSummaryText = language === 'ar' ? analysis?.description_ar : analysis?.description_en;

  return (
      <div className="font-arabic bg-white">
        <SEO page="conferences" dynamicTitle={title} dynamicDescription={description.substring(0, 160)} />
        <section className="relative h-[60vh] min-h-[400px] bg-clinical-charcoal text-white flex items-end">
            <img src={image} alt={title} className="absolute w-full h-full object-cover opacity-30"/>
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pb-8 z-10">
                 <h1 className="text-4xl md:text-5xl font-bold font-arabic drop-shadow-lg max-w-4xl">{title}</h1>
                 <p className="text-xl mt-2 drop-shadow-md">{t({ar: "تحليل وتقييم شامل من MedPulse – نبض الطب", en: "Comprehensive Analysis and Evaluation by MedPulse"})}</p>
                 <div className="mt-6 flex flex-wrap gap-4">
                     <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                        <CalendarIcon /> <span>{date}</span>
                     </div>
                     <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                        <LocationIcon /> <span>{location}</span>
                     </div>
                      <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                        <OrganizerIcon /> <span>{organizer}</span>
                     </div>
                 </div>
            </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-5xl">

            <DetailSection title={t({ar: "مقدمة عامة", en: "General Introduction"})}>
                <p className="whitespace-pre-line">{description}</p>
            </DetailSection>

            {subjects && subjects.length > 0 && (
            <DetailSection title={t({ar: "محاور المؤتمر العلمي", en: "Scientific Topics"})}>
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 !-mx-4">
                     {subjects.map((subj, index) => (
                         <div key={index} className="bg-sterile-light-grey p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <span className="text-4xl">{subj.icon}</span>
                            <h3 className="font-bold text-xl text-clinical-charcoal mt-3 mb-2">{subj.title}</h3>
                            {subjectsDesc && subjectsDesc[index] && <p className="text-sm text-gray-600">{subjectsDesc[index]}</p>}
                         </div>
                     ))}
                 </div>
            </DetailSection>
            )}

            <DetailSection title={t({ar: "المتحدثون والمشاركون", en: "Speakers & Participants"})}>
                {authorsDesc && <p className="mb-6">{authorsDesc}</p>}
                
                {event.authors && event.authors.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
                        {event.authors.map((author: ApiAuthor, index) => {
                            const authImg = author.images && author.images.length > 0 ? `${DOMAIN}${author.images[0].base_url}${author.images[0].name}` : author.image_url || 'https://picsum.photos/seed/auth/200/200';
                            return (
                                <div key={index} className="flex flex-col items-center">
                                    <img src={authImg} alt={language === 'ar' ? author.name_ar : author.name_en} className="w-24 h-24 rounded-full shadow-lg mb-3 object-cover" />
                                    <h4 className="font-bold text-clinical-charcoal">{language === 'ar' ? author.name_ar : author.name_en}</h4>
                                    <p className="text-xs text-gray-600">{language === 'ar' ? author.speciality_ar : author.speciality_en}</p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </DetailSection>

            {analysis ? (
            <DetailSection title={t({ar: "تحليل MedPulse للمؤتمر", en: "MedPulse Analysis"})}>
                <div className="space-y-8 mt-6">
                   {evaluationKeys.map((key) => {
                       const criterion = EVALUATION_CRITERIA.find(c => c.key === key);
                       if (!criterion) return null;
                       const map = analysisMapping[key];
                       
                       // server score is 0-10, scale it to criterion max weight
                       const rawRate = Number(analysis[map.key as keyof typeof analysis]) || 0;
                       const weightedScore = (rawRate / 10) * map.max;
                       const percentage = (rawRate / 10) * 100;
                       
                       const desc = language === 'ar' 
                            ? analysis[`${map.key}_description_ar` as keyof typeof analysis] 
                            : analysis[`${map.key}_description_en` as keyof typeof analysis];

                       return (
                           <div key={key} className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-med-tech-blue rtl:border-l-0 rtl:border-r-4">
                               <IconHeading icon={map.icon}>{t(criterion.title)}</IconHeading>
                               <div className="flex justify-between items-center mb-2">
                                   <span className="font-semibold text-gray-700">{t({ar: "الدرجة", en: "Score"})}: {weightedScore.toFixed(1)} / {map.max}</span>
                                   <span className="font-bold text-lg text-med-tech-blue">{percentage.toFixed(0)}%</span>
                               </div>
                               <div className="w-full bg-sterile-light-grey rounded-full h-4"><div className="bg-med-tech-blue h-4 rounded-full" style={{ width: `${percentage}%` }}></div></div>
                               <div className="mt-4 bg-sterile-light-grey p-3 rounded-md">
                                  <p className="text-sm font-semibold text-gray-800">🔹 {t({ar: "تعليق MedPulse", en: "MedPulse Comment"})}: <span className="font-normal">{desc}</span></p>
                               </div>
                           </div>
                       );
                   })}
                </div>
            </DetailSection>
            ) : null}

            <DetailSection title={t({ar: "التقييم الإجمالي للمؤتمر", en: "Overall Evaluation"})} className="bg-sterile-light-grey rounded-lg p-8">
                <div className="grid md:grid-cols-3 gap-8 items-center">
                    <div className="md:col-span-2 overflow-x-auto">
                        <table className="w-full text-sm bg-white rounded-lg overflow-hidden shadow-sm">
                            <thead className="bg-med-tech-blue text-white">
                                <tr>
                                    <th className="p-3 font-semibold text-start rtl:text-right">{t({ar: "المحور", en: "Criterion"})}</th>
                                    <th className="p-3 font-semibold text-center">{t({ar: "الدرجة", en: "Score"})}</th>
                                    <th className="p-3 font-semibold text-center">{t({ar: "النسبة", en: "Percentage"})}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {evaluationKeys.map(key => {
                                    const criterion = EVALUATION_CRITERIA.find(c => c.key === key);
                                    if (!criterion) return null;
                                    const map = analysisMapping[key];
                                    const rawRate = analysis ? (Number(analysis[map.key as keyof typeof analysis]) || 0) : 0;
                                    const weightedScore = (rawRate / 10) * map.max;
                                    const percentage = (rawRate / 10) * 100;
                                    return (
                                        <tr key={key} className="border-b">
                                            <td className="p-3 text-start rtl:text-right font-medium text-clinical-charcoal">{t(criterion.title)}</td>
                                            <td className="p-3 text-center text-clinical-charcoal">{weightedScore.toFixed(1)} / {map.max}</td>
                                            <td className="p-3 font-bold text-center text-med-tech-blue">{percentage.toFixed(0)}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-bold text-clinical-charcoal mb-4">{t({ar: "النتيجة النهائية", en: "Final Result"})}</h3>
                        <CircularProgress score={calculatedScore} />
                    </div>
                </div>
                 {analysisSummaryText && (
                    <div className="mt-6 text-center bg-white/50 p-4 rounded-lg border border-gray-200">
                        <p className="whitespace-pre-line text-gray-800">{analysisSummaryText}</p>
                    </div>
                 )}
            </DetailSection>

            {/* Statements Section - Supporting Multiple Comments for MedPulse */}
            {commentsList.length > 0 && (
                <DetailSection title={t({ar: "تصريحات خاصة لـ MedPulse", en: "Comments for MedPulse"})}>
                    <div className="space-y-2">
                        {commentsList.map((comment, idx) => (
                            <QuoteBlock key={idx} author={t({ar: "فريق MedPulse", en: "MedPulse Team"})}>
                                {comment}
                            </QuoteBlock>
                        ))}
                    </div>
                </DetailSection>
            )}

            {(galleryImages.length > 0 || videos.length > 0) && (
                <DetailSection title={t({ar: "تغطية مصورة من المؤتمر", en: "Photo & Video Coverage"})}>
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Videos First */}
                        {videos.map((vid: any, index: number) => {
                             const videoUrl = (vid.base_url && vid.name) ? vid.base_url + vid.name : '';
                             if (!videoUrl) return null;
                             
                             return (
                                <div key={`vid-${index}`} className="rounded-lg overflow-hidden shadow-md aspect-video bg-black relative group border border-gray-200">
                                    <iframe 
                                        src={videoUrl} 
                                        className="w-full h-full" 
                                        title={`Event Video ${index + 1}`}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                             );
                        })}

                        {/* Images Next */}
                        {galleryImages.map((img, index) => (
                            <div key={`img-${index}`} className="rounded-lg overflow-hidden shadow-md aspect-video relative group">
                                <img src={img} alt={`Gallery image ${index + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                            </div>
                        ))}
                    </div>
                </DetailSection>
            )}
            
            <section className="py-16 mt-8 bg-med-tech-blue text-white rounded-lg">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold font-arabic">{t({ar: "كن جزءًا من تقييم المؤتمرات القادمة", en: "Be Part of Evaluating Future Conferences"})}</h2>
                    <p className="mt-4 text-lg max-w-2xl mx-auto text-gray-200">{t({ar: "هل ترغب في أن يغطي فريق MedPulse مؤتمرك الطبي القادم؟ نوفّر تقارير علمية وتحليلية احترافية تساهم في رفع جودة الحدث وتعزيز مصداقيته أمام المجتمع الطبي.", en: "Want MedPulse to cover your next medical conference? We provide professional scientific and analytical reports that help enhance your event's quality and credibility within the medical community."})}</p>
                    <button onClick={() => navigate('contact')} className="mt-8 bg-med-vital-green hover:bg-green-600 transition-colors text-white font-bold py-3 px-8 rounded-md text-lg shadow-md">
                        {t({ar: "اطلب تقييمًا لمؤتمرك", en: "Request an Evaluation for Your Conference"})}
                    </button>
                </div>
            </section>
        </div>
        <style>{`
            .rich-text-preview ul { list-style-type: disc; padding-inline-start: 1.5rem; margin-bottom: 1rem; }
            .rich-text-preview ol { list-style-type: decimal; padding-inline-start: 1.5rem; margin-bottom: 1rem; }
            .rich-text-preview p { margin-bottom: 0.5rem; }
        `}</style>
      </div>
    );
};

export default ConferenceDetailsPage;
