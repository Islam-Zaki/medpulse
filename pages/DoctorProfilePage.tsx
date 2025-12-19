
import React, { useState, useEffect } from 'react';
import type { NavigateFunction, LocalizedString, ApiExpert } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { api } from '../services/api';

interface DoctorProfilePageProps {
  navigate: NavigateFunction;
  expertId: number;
}

const DOMAIN = 'https://medpulse-production.up.railway.app';

const SectionWrapper: React.FC<{ title: LocalizedString; children: React.ReactNode; icon?: string }> = ({ title, icon, children }) => {
  const { t } = useLocalization();
  return (
    <section className="py-8">
      <h2 className="text-2xl md:text-3xl font-bold text-med-blue mb-6 font-arabic flex items-center gap-3 border-b-2 border-gray-100 pb-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <span>{t(title)}</span>
      </h2>
      <div className="space-y-4 text-gray-700 leading-relaxed prose prose-lg max-w-none">
        {children}
      </div>
    </section>
  );
};

const DoctorProfilePage: React.FC<DoctorProfilePageProps> = ({ navigate, expertId }) => {
  const { t, language } = useLocalization();
  const [expert, setExpert] = useState<any | null>(null); // Using any to handle 'contacts' which might not be in strict ApiExpert type yet
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchExpert = async () => {
          setLoading(true);
          try {
              // Since there isn't a direct getExpert(id) public endpoint shown in previous context that returns detail, 
              // we fetch the list and find the item. If the API supports /experts/{id}, change this to use that.
              const response = await api.getExperts();
              const expertsList = response.data?.data || response.data || [];
              const foundExpert = expertsList.find((e: any) => e.id === Number(expertId));
              setExpert(foundExpert);
          } catch (error) {
              console.error("Failed to load expert profile", error);
          } finally {
              setLoading(false);
          }
      };
      fetchExpert();
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
  
  const evaluatedSpecialties = language === 'ar' ? expert.evaluated_specialties_ar : expert.evaluated_specialties_en;
  const subspecialities = language === 'ar' ? expert.subspecialities_ar : expert.subspecialities_en;
  const membership = language === 'ar' ? expert.membership_ar : expert.membership_en;

  let imageUrl = 'https://picsum.photos/seed/doc-placeholder/400/400';
  if (expert.images && expert.images.length > 0) {
      const latestImg = expert.images.sort((a: any, b: any) => b.id - a.id)[0];
      imageUrl = `${DOMAIN}${latestImg.base_url}${latestImg.name}`;
  }

  return (
    <div className="bg-white font-arabic">
      {/* Hero Section */}
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
          {/* Main Content */}
          <main className="lg:col-span-2">
            <SectionWrapper icon="📖" title={{ ar: 'نبذة تعريفية', en: 'Biography' }}>
              <p className="whitespace-pre-line">{description}</p>
            </SectionWrapper>

            <SectionWrapper icon="✨" title={{ ar: 'المساهمة في MedPulse', en: 'MedPulse Contribution' }}>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <div className="mb-4">
                        <strong className="block text-med-blue mb-1">{t({ar: 'الدور:', en: 'Role:'})}</strong> 
                        <p>{roleDesc}</p>
                    </div>
                    <div className="mb-4">
                        <strong className="block text-med-blue mb-1">{t({ar: 'نوعية التغطيات:', en: 'Coverage Type:'})}</strong> 
                        <p>{coverageType}</p>
                    </div>
                    {evaluatedSpecialties && evaluatedSpecialties.length > 0 && (
                        <div>
                            <strong className="block text-med-blue mb-1">{t({ar: 'التخصصات التي يقيمها:', en: 'Evaluated Specialties:'})}</strong>
                            <ul className="list-disc pl-6 rtl:pr-6 mt-1 marker:text-med-sky">
                                {evaluatedSpecialties.map((spec: string, i: number) => <li key={i}>{spec}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            </SectionWrapper>

            {expert.videos && expert.videos.length > 0 ? (
                <SectionWrapper icon="🎥" title={{ ar: 'الظهور الإعلامي', en: 'Video Appearances' }}>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {expert.videos.map((video: any, i: number) => {
                            const videoUrl = (video.base_url && video.name) ? video.base_url + video.name : video.url;
                            if (!videoUrl) return null;
                            
                            return (
                                <div key={i} className="rounded-lg overflow-hidden shadow-md aspect-video bg-black relative group border border-gray-200">
                                    <iframe 
                                        src={videoUrl} 
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
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-med-blue mb-4 border-b border-gray-300 pb-2">{t({ar: 'معلومات إضافية', en: 'Additional Information'})}</h3>
                <div className="space-y-4">
                    <div>
                        <strong className="block text-gray-900 mb-1">{t({ar: 'سنوات الخبرة:', en: 'Years of Experience:'})}</strong> 
                        <span className="text-xl font-bold text-med-tech-blue">{expert.years_of_experience}</span>
                    </div>
                    {subspecialities && subspecialities.length > 0 && (
                        <div>
                            <strong className="block text-gray-900 mb-1">{t({ar: 'التخصصات الدقيقة:', en: 'Subspecialties:'})}</strong>
                            <ul className="list-disc pl-5 rtl:pr-5 mt-1 text-clinical-charcoal font-medium">
                                {subspecialities.map((s: string, i: number) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                    )}
                    {membership && membership.length > 0 && (
                        <div>
                            <strong className="block text-gray-900 mb-1">{t({ar: 'العضويات:', en: 'Memberships:'})}</strong>
                            <ul className="list-disc pl-5 rtl:pr-5 mt-1 text-clinical-charcoal font-medium">
                                {membership.map((m: string, i: number) => <li key={i}>{m}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
              </div>
              
              {expert.contacts && expert.contacts.length > 0 && (
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-med-blue mb-4 border-b border-gray-300 pb-2">{t({ar: 'التواصل', en: 'Contact'})}</h3>
                    <div className="flex flex-col space-y-3">
                        {expert.contacts.map((contact: any, idx: number) => (
                            <a 
                                key={idx} 
                                href={contact.link || '#'} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center text-med-sky hover:text-med-blue font-medium hover:underline transition-colors group"
                            >
                                <span className="ltr:mr-2 rtl:ml-2 text-lg group-hover:scale-110 transition-transform">🔗</span>
                                <span>{language === 'ar' ? contact.name_ar : contact.name_en}</span>
                            </a>
                        ))}
                    </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfilePage;
