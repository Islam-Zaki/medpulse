import React from 'react';
import type { NavigateFunction, LocalizedString } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { ARTICLES_DATA, FUJAIRAH_CONFERENCE_ARTICLE_CONTENT } from '../constants';
import SectionTitle from '../components/SectionTitle';
import ArticleCard from '../components/ArticleCard';
import ShareButton from '../components/ShareButton';


const ArticleSection: React.FC<{ icon: string; title: LocalizedString; children: React.ReactNode }> = ({ icon, title, children }) => {
    const { t } = useLocalization();
    return (
        <section className="py-8">
            <h2 className="text-3xl font-bold text-med-blue mb-6 font-arabic flex items-center gap-4 border-b-2 border-gray-100 pb-4">
                <span className="text-3xl">{icon}</span>
                <span>{t(title)}</span>
            </h2>
            <div className="prose lg:prose-lg max-w-none text-gray-800 leading-relaxed space-y-4">
                {children}
            </div>
        </section>
    );
}

const ConsequencesPage: React.FC<{ navigate: NavigateFunction }> = ({ navigate }) => {
  const { t } = useLocalization();
  const article = ARTICLES_DATA.find(a => a.id === 4);
  const relatedArticles = ARTICLES_DATA.filter(a => a.id !== 4);
  const content = FUJAIRAH_CONFERENCE_ARTICLE_CONTENT;

  if (!article) return null; // Or show a not found page

  const renderContent = (item: any) => {
    const { type, text, items, title, points } = item;
    switch(type) {
        case 'p':
            return <p>{t(text)}</p>;
        case 'h3':
            return <h3 className="font-bold text-xl text-med-blue !mb-2">{t(text)}</h3>;
        case 'ul':
            return (
                <ul className="list-disc space-y-2 pl-6 rtl:pr-6 marker:text-med-sky">
                    {items.map((li: LocalizedString, i: number) => <li key={i}>{t(li)}</li>)}
                </ul>
            );
        case 'ol':
            return (
                <ol className="space-y-4">
                    {items.map((li: any, i: number) => (
                        <li key={i} className="bg-gray-50 p-4 rounded-lg">
                            <strong className="text-med-blue">{i + 1}. {t(li.title)}</strong>
                             <ul className="list-inside list-['–_'] mt-2 space-y-1 text-gray-700">
                                {li.points.map((p: LocalizedString, pi: number) => <li key={pi} className="pl-2">{t(p)}</li>)}
                            </ul>
                        </li>
                    ))}
                </ol>
            );
        default:
            return null;
    }
  }

  return (
    <div className="font-arabic bg-white">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[350px] bg-gray-800 text-white flex items-end">
          <img src={article.image} alt={t(article.title)} className="absolute w-full h-full object-cover opacity-30"/>
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pb-12 z-10">
               <p className="text-lg font-semibold text-med-sky">{t({ar: 'قراءة تحليلية', en: 'Analytical Review'})}</p>
               <h1 className="text-4xl md:text-5xl font-bold font-arabic drop-shadow-lg max-w-4xl">{t(content.subtitle)}</h1>
               <div className="mt-6">
                    <ShareButton 
                        title={t(content.subtitle)} 
                        text={t(content.intro)} 
                        className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                    />
               </div>
          </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Intro */}
          <p className="text-xl text-gray-700 leading-relaxed border-r-4 border-med-sky pr-6 mb-12 rtl:border-r-0 rtl:border-l-4 rtl:pr-0 rtl:pl-6">{t(content.intro)}</p>

          {/* Article Sections */}
          {content.sections.map((section, index) => (
            <ArticleSection key={index} icon={section.icon} title={section.title}>
                {section.content.map((item, i) => <React.Fragment key={i}>{renderContent(item)}</React.Fragment>)}
            </ArticleSection>
          ))}
        </div>
      </div>
      
       <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <SectionTitle>{t({ar: 'مقالات أخرى قد تهمك', en: 'Other Articles You Might Like'})}</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedArticles.slice(0, 3).map(art => (
                    <ArticleCard key={art.id} article={art} navigate={navigate} />
                ))}
            </div>
        </div>
       </div>
    </div>
  );
};

export default ConsequencesPage;