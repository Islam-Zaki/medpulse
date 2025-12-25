
import React from 'react';
import type { NavigateFunction } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { FOUNDER_DATA_DETAILED } from '../constants';
import SEO from '../components/SEO';
import { api } from '../services/api';

interface FounderPageProps {
  navigate: NavigateFunction;
}

const SectionWrapper: React.FC<{ title: string; children: React.ReactNode; icon?: string; className?: string }> = ({ title, icon, children, className = '' }) => {
  return (
    <section className={`mb-12 ${className}`}>
      <h2 className="text-2xl md:text-3xl font-bold text-med-blue mb-6 font-arabic flex items-center gap-3 border-b-2 border-gray-100 pb-3">
        {icon && <span className="text-2xl" role="img">{icon}</span>}
        <span>{title}</span>
      </h2>
      <div className="space-y-4 text-gray-700 leading-relaxed max-w-none">
        {children}
      </div>
    </section>
  );
};

const FounderPage: React.FC<FounderPageProps> = ({ navigate }) => {
  const { t, config, language } = useLocalization();
  const f = config?.founder;
  
  const founderName = f?.[`name_${language}` as keyof typeof f] as string || t(FOUNDER_DATA_DETAILED.name);
  const founderTitle = f?.[`main_title_${language}` as keyof typeof f] as string || t(FOUNDER_DATA_DETAILED.mainTitle);
  const founderImage = api.resolveImageUrl(f?.main_image, FOUNDER_DATA_DETAILED.image);
  
  const sections = f?.sections || [];
  const sidebarCards = f?.sidebar_cards || [];
  const gallery = (f?.gallery || []).map(path => api.resolveImageUrl(path, ''));

  const contactTitle = f?.[`contact_title_${language}` as keyof typeof f] as string || t({ar: 'تواصل مع المؤسس', en: 'Contact the Founder'});
  const contactContent = f?.[`contact_content_${language}` as keyof typeof f] as string || '';

  // Helper to render content safely (Handles HTML from Quill)
  const renderSmartContent = (content: string, smallProse: boolean = false) => {
    if (!content) return null;
    
    if (content.trim().startsWith('<')) {
        return (
            <div 
                className={`rich-text-content prose ${smallProse ? 'prose-sm' : 'prose-lg'} max-w-none text-gray-700 leading-relaxed`} 
                dangerouslySetInnerHTML={{ __html: content }} 
            />
        );
    }

    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];

    const flushList = (key: string) => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`ul-${key}`} className="list-disc list-inside space-y-1 mb-6 mt-2 marker:text-med-tech-blue pl-4 rtl:pr-4 rtl:pl-0">
            {currentList}
          </ul>
        );
        currentList = [];
      }
    };

    lines.forEach((line, i) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ') || trimmedLine.startsWith('* ')) {
        const text = trimmedLine.replace(/^[-•*]\s+/, '');
        currentList.push(<li key={`li-${i}`} className="mb-2 last:mb-0">{text}</li>);
      } else {
        flushList(`p-${i}`);
        if (trimmedLine) {
          elements.push(<p key={`p-${i}`} className="mb-4 whitespace-pre-line last:mb-0 leading-relaxed">{trimmedLine}</p>);
        } else {
            elements.push(<div key={`spacer-${i}`} className="h-4"></div>);
        }
      }
    });

    flushList('final');
    return elements;
  };

  return (
    <div className="bg-gray-50 font-arabic">
      <SEO page="founder" />
      <section className="bg-med-light-blue pt-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center pb-12">
              <img src={founderImage} alt={founderName} className="w-48 h-48 rounded-full shadow-xl object-cover mx-auto mb-6 border-4 border-white" />
              <h1 className="text-4xl font-bold text-med-blue font-arabic">{founderName}</h1>
              <p className="text-xl text-med-sky mt-2">{founderTitle}</p>
          </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="lg:grid lg:grid-cols-3 lg:gap-12">
          <main className="lg:col-span-2">
            {sections.map((sec, idx) => (
                <SectionWrapper key={idx} icon={sec.icon} title={language === 'ar' ? sec.title_ar : sec.title_en}>
                    {renderSmartContent(language === 'ar' ? sec.content_ar : sec.content_en)}
                </SectionWrapper>
            ))}
            
            {gallery.length > 0 && (
                <section className="mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold text-med-blue mb-6 font-arabic flex items-center gap-3 border-b-2 border-gray-100 pb-3">
                        <span className="text-2xl" role="img">📷</span>
                        <span>{t({ar: 'معرض الصور', en: 'Photo Gallery'})}</span>
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                        {gallery.map((imgUrl, idx) => imgUrl && (
                            <div key={idx} className="aspect-square rounded-2xl overflow-hidden shadow-md bg-white border border-gray-100 group">
                                <img 
                                    src={imgUrl} 
                                    alt={`Gallery image ${idx + 1}`} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* CONTACT FOUNDER SECTION */}
            {(contactTitle || contactContent) && (
                <section className="mb-12 pt-8 border-t border-gray-200">
                    <h2 className="text-2xl md:text-3xl font-bold text-med-blue mb-6 font-arabic flex items-center gap-3">
                        <span className="text-2xl" role="img">📩</span>
                        <span>{contactTitle}</span>
                    </h2>
                    <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
                        {renderSmartContent(contactContent)}
                        <div className="mt-8">
                            <button 
                                onClick={() => navigate('contact')}
                                className="bg-med-tech-blue hover:bg-blue-800 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md transform hover:-translate-y-1 active:scale-95"
                            >
                                {t({ar: 'اتصل بنا', en: 'Contact Us'})}
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {sections.length === 0 && gallery.length === 0 && !contactTitle && (
                <div className="text-center py-20 text-gray-400 italic">
                    {t({ ar: 'لا توجد أقسام مضافة بعد.', en: 'No sections added yet.' })}
                </div>
            )}
          </main>

          <aside className="lg:col-span-1 space-y-8">
              {sidebarCards.map((card, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 transition-all hover:shadow-xl">
                      <h3 className="text-xl font-bold text-med-blue mb-6 border-b pb-4">{language === 'ar' ? card.title_ar : card.title_en}</h3>
                      <div className="text-start rtl:text-right">
                          {((card as any)[`content_${language}`]) ? (
                               renderSmartContent((card as any)[`content_${language}`], true)
                          ) : (
                              <div className="space-y-5">
                                  {card.items.map((item, i) => (
                                      <div key={i} className="group">
                                        <strong className="text-gray-400 block text-[10px] uppercase tracking-widest mb-1 font-bold group-hover:text-med-tech-blue transition-colors">
                                            {language === 'ar' ? item.label_ar : item.label_en}
                                        </strong>
                                        <p className="text-gray-800 font-semibold text-lg leading-snug">
                                            {language === 'ar' ? item.value_ar : item.value_en}
                                        </p>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  </div>
              ))}
          </aside>
        </div>
      </div>
      <style>{`
        .rich-text-content h2 { font-size: 1.5rem; font-weight: 800; margin-top: 2rem; margin-bottom: 1rem; color: #1463be; }
        .rich-text-content h3 { font-size: 1.25rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.75rem; }
        .rich-text-content ul { list-style-type: none; padding-inline-start: 0.5rem; margin-bottom: 1.5rem; }
        .rich-text-content li { margin-bottom: 0.75rem; position: relative; padding-inline-start: 0.5rem; }
        .rich-text-content a { color: #1463be; text-decoration: underline; }
        [dir="rtl"] .rich-text-content ul { padding-inline-start: 0; padding-inline-end: 0.5rem; }
      `}</style>
    </div>
  );
};

export default FounderPage;
