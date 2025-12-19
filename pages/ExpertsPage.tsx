
import React, { useState, useEffect } from 'react';
import type { NavigateFunction, Expert, ApiExpert } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { EXPERTS_PAGE_CONTENT } from '../constants';
import SectionTitle from '../components/SectionTitle';
import { api } from '../services/api';
import SEO from '../components/SEO';

interface ExpertsPageProps {
  navigate: NavigateFunction;
}

const DOMAIN = 'https://medpulse-production.up.railway.app';

const ExpertCard: React.FC<{ expert: Expert; navigate: NavigateFunction }> = ({ expert, navigate }) => {
    const { t } = useLocalization();
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden group transform hover:scale-105 transition-transform duration-300">
            <div className="relative h-64 overflow-hidden">
                <img src={expert.image} alt={t(expert.name)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 rtl:left-auto rtl:right-0 rtl:text-right">
                     <h3 className="text-xl font-bold text-white font-arabic drop-shadow-md">{t(expert.name)}</h3>
                     <p className="text-med-sky text-sm font-semibold">{t(expert.specialty)}</p>
                </div>
            </div>
            <div className="p-6">
                 <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">{t({ar: "الدور في MedPulse", en: "Role in MedPulse"})}</p>
                 <p className="text-gray-800 font-medium mb-4">{t(expert.role)}</p>

                 <div className="flex justify-between items-center text-sm border-t pt-4">
                    <span className="font-bold text-med-blue bg-med-light-blue px-3 py-1 rounded-full">{expert.conferencesEvaluated} {t({ar: 'مؤتمر', en: 'Conferences'})}</span>
                     <button onClick={() => navigate('expert-profile', { id: expert.id })} className="font-semibold text-med-sky hover:text-med-blue transition-colors">
                        {t({ ar: 'عرض البروفايل', en: 'View Profile' })} &rarr;
                    </button>
                 </div>
            </div>
        </div>
    );
};

const ExpertsPage: React.FC<ExpertsPageProps> = ({ navigate }) => {
  const { t } = useLocalization();
  const c = EXPERTS_PAGE_CONTENT;
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchExperts = async () => {
          try {
              const response = await api.getExperts();
              // Handle response structure: { data: { data: [...] } } or just [...]
              const apiData: ApiExpert[] = response.data?.data || response.data || [];
              
              const mappedExperts: Expert[] = apiData.map((e: any) => {
                  // Get latest image or fallback
                  let imageUrl = 'https://picsum.photos/seed/doc-placeholder/400/400';
                  if (e.images && e.images.length > 0) {
                      // Sort by ID desc to get latest
                      const latestImg = e.images.sort((a: any, b: any) => b.id - a.id)[0];
                      imageUrl = `${DOMAIN}${latestImg.base_url}${latestImg.name}`;
                  }

                  return {
                      id: e.id,
                      name: { ar: e.name_ar, en: e.name_en },
                      specialty: { ar: e.job_ar, en: e.job_en }, // Using Job as Specialty on card
                      role: { ar: e.medpulse_role_ar, en: e.medpulse_role_en },
                      image: imageUrl,
                      conferencesEvaluated: e.number_of_events || 0
                  };
              });
              setExperts(mappedExperts);
          } catch (error) {
              console.error("Failed to load experts", error);
          } finally {
              setLoading(false);
          }
      };

      fetchExperts();
  }, []);

  return (
    <div className="bg-gray-50 font-arabic">
      <SEO page="experts" />
      {/* Hero Section */}
      <section className="relative py-24 text-white">
        <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: "url('https://picsum.photos/seed/experts-bg/1920/1080')"}}></div>
        <div className="absolute inset-0 bg-med-blue/80 backdrop-blur-sm"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
            <h1 className="text-4xl md:text-5xl font-bold font-arabic">{t(c.hero.title)}</h1>
            <p className="mt-4 text-lg md:text-xl text-gray-200 max-w-3xl mx-auto">{t(c.hero.subtitle)}</p>
        </div>
      </section>

      {/* Doctors Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle>
                {t({ar: "تعرف على فريقنا", en: "Meet Our Team"})}
            </SectionTitle>
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-med-tech-blue"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {experts.map(expert => (
                        <ExpertCard key={expert.id} expert={expert} navigate={navigate} />
                    ))}
                </div>
            )}
        </div>
      </section>
    </div>
  );
};

export default ExpertsPage;
