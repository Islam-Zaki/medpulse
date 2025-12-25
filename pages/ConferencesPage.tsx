
import React, { useState, useMemo, useEffect } from 'react';
import type { NavigateFunction, Conference, ApiEvent } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { CONFERENCES_PAGE_CONTENT } from '../constants';
import SectionTitle from '../components/SectionTitle';
import ConferenceCard from '../components/ConferenceCard';
import { api } from '../services/api';
import SEO from '../components/SEO';


const MethodologyIcon: React.FC<{icon: string}> = ({icon}) => {
    const icons: {[key: string]: React.ReactNode} = {
        scientificContent: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-med-tech-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
        organization: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-med-tech-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
        speakers: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-med-tech-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
        sponsors: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-med-tech-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
        socialImpact: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-med-tech-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h8a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.707 4.293l.53-.53a1 1 0 011.414 0l.53.53m0 0l-1 1m1-1l.53-.53a1 1 0 011.414 0l.53.53M7.707 4.293l1 1m-1-1l-.53.53a1 1 0 000 1.414l.53.53m0 0l1-1m-1 1l.53.53a1 1 0 001.414 0l.53-.53m-10.468 9.47a1 1 0 011.414 0l.53.53m-1.414 0l.53.53a1 1 0 010 1.414l-.53.53m0 0l1.414-1.414m-1.414 1.414l1.06-1.06m-1.06 1.06l-1.06-1.06a1 1 0 010-1.414l1.06-1.06m0 0l-1.414-1.414m1.414 1.414l.53-.53a1 1 0 011.414 0l.53.53" /></svg>,
    };
    return icons[icon] || null;
}

const AudienceIcon: React.FC<{icon: string; className?: string}> = ({icon, className="h-10 w-10 mb-3 text-med-tech-blue"}) => {
    const icons: {[key: string]: React.ReactNode} = {
        doctor: <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 10-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>,
        organizer: <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" /></svg>,
        company: <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
        student: <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20M1 12v7a2 2 0 002 2h18a2 2 0 002-2v-7" /></svg>,
    };
    return icons[icon] || null;
}

const DOMAIN = 'https://medpulse-production.up.railway.app';

interface ConferencesPageProps {
  navigate: NavigateFunction;
}

const ConferencesPage: React.FC<ConferencesPageProps> = ({ navigate }) => {
  const { t, language } = useLocalization();
  const c = CONFERENCES_PAGE_CONTENT;

  const [conferenceData, setConferenceData] = useState<Conference[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [minScore, setMinScore] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchData = async (page: number = 1) => {
      setLoading(true);
      try {
          // Fetch events for specific page
          const res = await api.getEvents(page);
          
          const eventsList: ApiEvent[] = res.data?.data || res.data || res || [];
          const meta = res.data || res;
          
          setLastPage(meta.last_page || 1);
          setCurrentPage(meta.current_page || page);

          if (eventsList.length >= 0) {
              const mapped: Conference[] = eventsList.map(e => ({
                  id: e.id,
                  title: { ar: e.title_ar, en: e.title_en },
                  organizer: { ar: e.organizer_ar, en: e.organizer_en },
                  location: { ar: e.location_ar || e.location, en: e.location },
                  city: { ar: e.location_ar || e.location, en: e.location },
                  date: { ar: e.date_of_happening, en: e.date_of_happening },
                  image: e.images && e.images.length > 0 ? api.resolveImageUrl(`${e.images[0].base_url}${e.images[0].name}`) : 'https://picsum.photos/seed/conf/400/300',
                  score: Number(e.rate) * 10,
                  stars: e.stars,
                  description: { ar: e.description_ar, en: e.description_en },
                  scoreText: { ar: '', en: '' },
                  evaluation: { 
                      scientificContent: [0, 25],
                      organization: [0, 20],
                      speakers: [0, 15],
                      sponsors: [0, 20],
                      socialImpact: [0, 20]
                  },
                  specialty: { 
                    ar: (e.subjects_ar?.[0] || '').split('|||MT_SEP|||').pop() || '', 
                    en: (e.subjects_en?.[0] || '').split('|||MT_SEP|||').pop() || '' 
                  },
                  year: new Date(e.date_of_happening).getFullYear()
              }));
              setConferenceData(mapped);
          }
      } catch(e) { console.error("Failed to load conferences", e); }
      finally { setLoading(false); }
  };

  useEffect(() => {
      fetchData(1);
  }, []);

  const handlePageChange = (newPage: number) => {
      if (newPage > 0 && newPage <= lastPage) {
          fetchData(newPage);
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };

  const specialties = useMemo(() => ['all', ...new Set(conferenceData.map(c => t(c.specialty)))], [language, t, conferenceData]);
  const cities = useMemo(() => ['all', ...new Set(conferenceData.map(c => t(c.city)))], [language, t, conferenceData]);
  const years = useMemo(() => ['all', ...Array.from(new Set(conferenceData.map(c => c.year.toString())))].sort((a: string, b: string) => b.localeCompare(a)), [conferenceData]);

  const filteredConferences = useMemo(() => {
    return conferenceData.filter(conf => {
      const titleMatch = t(conf.title).toLowerCase().includes(searchTerm.toLowerCase());
      const specialtyMatch = selectedSpecialty === 'all' || t(conf.specialty) === selectedSpecialty;
      const cityMatch = selectedCity === 'all' || t(conf.city) === selectedCity;
      const yearMatch = selectedYear === 'all' || conf.year.toString() === selectedYear;
      const scoreMatch = conf.score >= minScore;
      return titleMatch && specialtyMatch && cityMatch && yearMatch && scoreMatch;
    });
  }, [searchTerm, selectedSpecialty, selectedCity, selectedYear, minScore, language, t, conferenceData]);

  const FilterGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
      <h3 className="text-lg font-semibold text-clinical-charcoal mb-3">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="bg-white font-arabic">
       <SEO page="conferences" />
       <section className="relative py-20 text-white">
            <div className="absolute inset-0 grid grid-cols-2 sm:grid-cols-4 h-full overflow-hidden">
                <div className="h-full bg-cover bg-center" style={{backgroundImage: "url('https://picsum.photos/seed/hero1/600/800')"}}></div>
                <div className="h-full bg-cover bg-center hidden sm:block" style={{backgroundImage: "url('https://picsum.photos/seed/hero2/600/800')"}}></div>
                <div className="h-full bg-cover bg-center hidden sm:block" style={{backgroundImage: "url('https://picsum.photos/seed/hero3/600/800')"}}></div>
                <div className="h-full bg-cover bg-center" style={{backgroundImage: "url('https://picsum.photos/seed/hero4/600/800')"}}></div>
            </div>
            <div className="absolute inset-0 bg-med-tech-blue/80 backdrop-blur-sm"></div>
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                <h1 className="text-4xl md:text-5xl font-bold font-arabic">{t(c.title)}</h1>
                <p className="mt-2 text-lg text-gray-200">{t(c.subtitle)}</p>
            </div>
        </section>
        
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                    <div>
                        <h2 className="text-3xl font-bold text-clinical-charcoal mb-4 font-arabic">{t({ar: "دليلك الشامل للمؤتمرات الطبية", en: "Your Comprehensive Guide to Medical Conferences"})}</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">{t(c.intro)}</p>
                        <p className="text-gray-700 leading-relaxed">{t(c.goal.text)}</p>
                    </div>
                    <div className="bg-sterile-light-grey p-8 rounded-lg">
                       <h3 className="text-xl font-bold text-clinical-charcoal mb-4 font-arabic">{t({ar: "لمن هذه الصفحة؟", en: "Who is this page for?"})}</h3>
                       <ul className="space-y-4">
                           <li className="flex items-start gap-3">
                               <AudienceIcon icon="doctor" className="h-8 w-8 text-med-tech-blue flex-shrink-0 mt-1" />
                               <div>
                                   <h4 className="font-semibold text-gray-800">{t({ar: "الأطباء والباحثون", en: "Doctors & Researchers"})}</h4>
                                   <p className="text-sm text-gray-600">{t({ar: "لبحث عن مؤتمرات تثقيفية فعّالة.", en: "Seeking effective educational conferences."})}</p>
                               </div>
                           </li>
                           <li className="flex items-start gap-3">
                               <AudienceIcon icon="student" className="h-8 w-8 text-med-tech-blue flex-shrink-0 mt-1" />
                               <div>
                                   <h4 className="font-semibold text-gray-800">{t({ar: "طلبة الطب", en: "Medical Students"})}</h4>
                                   <p className="text-sm text-gray-600">{t({ar: "لاختيار الفعاليات المناسبة لتطوير مسارهم.", en: "To choose the right events for their development."})}</p>
                               </div>
                           </li>
                           <li className="flex items-start gap-3">
                               <AudienceIcon icon="organizer" className="h-8 w-8 text-med-tech-blue flex-shrink-0 mt-1" />
                               <div>
                                   <h4 className="font-semibold text-gray-800">{t({ar: "الجهات المنظمة", en: "Organizing Bodies"})}</h4>
                                   <p className="text-sm text-gray-600">{t({ar: "لمقارنة مؤتمراتهم بمعايير الجودة العالمية.", en: "To benchmark their conferences against global quality standards."})}</p>
                               </div>
                           </li>
                       </ul>
                    </div>
                </div>
            </div>
        </section>
        
        <section className="py-20 bg-gray-50">
             <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                 <SectionTitle subtitle={t(c.methodology.text)}>{t(c.methodology.title)}</SectionTitle>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {c.methodology.criteria.map((criterion) => (
                        <div key={criterion.key} className="p-6 bg-white rounded-lg shadow-md text-center flex flex-col items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <MethodologyIcon icon={criterion.key} />
                            <h3 className="text-lg font-bold text-clinical-charcoal mt-2 mb-3">{t(criterion.title)}</h3>
                            <ul className="space-y-1 text-sm text-gray-600">
                                {criterion.points[language].map((point, i) => <li key={i}>{point}</li>)}
                            </ul>
                        </div>
                    ))}
                 </div>
             </div>
        </section>

        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <SectionTitle>{t(c.howToBenefit.title)}</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {c.howToBenefit.audiences.map(audience => (
                        <div key={audience.icon} className="p-6 text-center bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col items-center">
                           <AudienceIcon icon={audience.icon} />
                           <h3 className="font-bold text-xl text-clinical-charcoal">{t(audience.name)}</h3>
                           <p className="text-gray-600 mt-2 text-sm">{t(audience.benefit)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
        
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle>{t({ ar: 'قائمة المؤتمرات', en: 'Conferences List' })}</SectionTitle>
          <div className="grid lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1">
              <div className="sticky top-24 bg-white p-6 rounded-lg shadow-md space-y-6">
                <FilterGroup title={t({ ar: 'بحث وتصفية', en: 'Search & Filter' })}>
                  <input
                    type="text"
                    placeholder={t({ ar: 'ابحث عن مؤتمر...', en: 'Search for a conference...' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-med-tech-blue focus:border-med-tech-blue text-gray-900"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </FilterGroup>

                <FilterGroup title={t({ ar: 'التخصص', en: 'Specialty' })}>
                  <select value={selectedSpecialty} onChange={e => setSelectedSpecialty(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-med-tech-blue focus:border-med-tech-blue bg-white text-gray-900">
                    {specialties.map(s => <option key={s} value={s}>{s === 'all' ? t({ ar: 'الكل', en: 'All' }) : s}</option>)}
                  </select>
                </FilterGroup>

                <FilterGroup title={t({ ar: 'المدينة', en: 'City' })}>
                  <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-med-tech-blue focus:border-med-tech-blue bg-white text-gray-900">
                    {cities.map(c => <option key={c} value={c}>{c === 'all' ? t({ ar: 'الكل', en: 'All' }) : c}</option>)}
                  </select>
                </FilterGroup>

                <FilterGroup title={t({ ar: 'السنة', en: 'Year' })}>
                  <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-med-tech-blue focus:border-med-tech-blue bg-white text-gray-900">
                    {years.map(y => <option key={y} value={y}>{y === 'all' ? t({ ar: 'الكل', en: 'All' }) : y}</option>)}
                  </select>
                </FilterGroup>

                <FilterGroup title={t({ ar: 'التقييم الأدنى', en: 'Minimum Score' })}>
                  <div className="flex items-center gap-4">
                    <input type="range" min="0" max="100" value={minScore} onChange={e => setMinScore(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" style={{accentColor: '#1463be'}} />
                    <span className="font-bold text-med-tech-blue">{minScore}%</span>
                  </div>
                </FilterGroup>
              </div>
            </aside>
            <main className="lg:col-span-3">
              {loading ? (
                  <div className="flex justify-center items-center py-20">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-med-tech-blue"></div>
                  </div>
              ) : (
                <>
                  {filteredConferences.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {filteredConferences.map(conf => (
                        <ConferenceCard key={conf.id} conference={conf} navigate={navigate} stars={conf.stars} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-lg shadow-md">
                      <p className="text-xl text-gray-600">{t({ ar: 'لم يتم العثور على نتائج.', en: 'No results found.' })}</p>
                    </div>
                  )}

                  {/* Public Pagination Controls */}
                  {lastPage > 1 && (
                    <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handlePageChange(currentPage - 1)} 
                                disabled={currentPage === 1}
                                className="px-6 py-2 bg-white border-2 border-med-tech-blue text-med-tech-blue rounded-xl font-bold hover:bg-med-tech-blue hover:text-white transition-all disabled:opacity-30 disabled:border-gray-200 disabled:text-gray-300 disabled:hover:bg-transparent shadow-sm"
                            >
                                {t({ar: 'السابق', en: 'Previous'})}
                            </button>
                            <button 
                                onClick={() => handlePageChange(currentPage + 1)} 
                                disabled={currentPage === lastPage}
                                className="px-6 py-2 bg-white border-2 border-med-tech-blue text-med-tech-blue rounded-xl font-bold hover:bg-med-tech-blue hover:text-white transition-all disabled:opacity-30 disabled:border-gray-200 disabled:text-gray-300 disabled:hover:bg-transparent shadow-sm"
                            >
                                {t({ar: 'التالي', en: 'Next'})}
                            </button>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 font-bold">
                            <span>{t({ar: 'صفحة', en: 'Page'})}</span>
                            <span className="w-10 h-10 flex items-center justify-center bg-med-tech-blue text-white rounded-full font-bold shadow-md">{currentPage}</span>
                            <span>{t({ar: 'من', en: 'of'})} {lastPage}</span>
                        </div>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
       <section className="py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <SectionTitle>{t(c.testimonials.title)}</SectionTitle>
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    {c.testimonials.quotes.map((quote, index) => (
                        <blockquote key={index} className="p-6 bg-white rounded-lg shadow-lg border-l-4 border-med-tech-blue">
                            <p className="text-gray-700 italic">"{t(quote.text)}"</p>
                            <footer className="mt-4 text-gray-600 font-semibold text-end">&mdash; {t(quote.author)}</footer>
                        </blockquote>
                    ))}
                </div>
            </div>
        </section>
        <section className="py-20 bg-med-tech-blue text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl md:text-4xl font-bold font-arabic">{t(c.cta.title)}</h2>
                <p className="mt-4 text-lg max-w-2xl mx-auto text-gray-200">{t(c.cta.text)}</p>
                <button onClick={() => navigate('contact')} className="mt-8 bg-med-vital-green hover:bg-white hover:text-med-tech-blue transition-colors text-white font-bold py-3 px-8 rounded-md text-lg shadow-md">
                    {t(c.cta.button)}
                </button>
            </div>
        </section>
    </div>
  );
};

export default ConferencesPage;
