import React from 'react';
import type { NavigateFunction, LocalizedString } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { FOUNDER_DATA_DETAILED } from '../constants';
import SEO from '../components/SEO';

interface FounderPageProps {
  navigate: NavigateFunction;
}

const SectionWrapper: React.FC<{ title: string; children: React.ReactNode; icon?: string; className?: string }> = ({ title, icon, children, className = '' }) => {
  return (
    <section className={`mb-12 ${className}`}>
      <h2 className="text-2xl md:text-3xl font-bold text-med-blue mb-6 font-arabic flex items-center gap-3 border-b-2 border-gray-100 pb-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <span>{title}</span>
      </h2>
      <div className="space-y-4 text-gray-700 leading-relaxed prose prose-lg max-w-none">
        {children}
      </div>
    </section>
  );
};

const FounderPage: React.FC<FounderPageProps> = ({ navigate }) => {
  const { t, config, language } = useLocalization();
  const founder = FOUNDER_DATA_DETAILED;

  const founderName = config?.founder[`name_${language}` as keyof typeof config.founder] || t(founder.name);
  const founderTitle = config?.founder[`main_title_${language}` as keyof typeof config.founder] || t(founder.mainTitle);
  const introTitle = config?.founder[`intro_title_${language}` as keyof typeof config.founder] || t(founder.introduction.title);
  const founderIntro = config?.founder[`intro_${language}` as keyof typeof config.founder] || t(founder.introduction.paragraphs[0]);
  const quoteText = config?.founder[`quote_${language}` as keyof typeof config.founder] || t(founder.introduction.quote.text);
  
  const expTitle = config?.founder[`exp_title_${language}` as keyof typeof config.founder] || t(founder.experience.title);
  const expCurrentTitle = config?.founder[`exp_current_title_${language}` as keyof typeof config.founder] || t(founder.experience.current.title);
  const academicTitle = config?.founder[`academic_title_${language}` as keyof typeof config.founder] || t(founder.academicRoles.title);
  const academicSummary = config?.founder[`academic_summary_${language}` as keyof typeof config.founder] || t(founder.academicRoles.summary);

  const profileTitle = config?.founder[`profile_title_${language}` as keyof typeof config.founder] || t(founder.personalProfile.title);
  
  const profileItems = [
      { label: config?.founder[`profile_item1_label_${language}` as keyof typeof config.founder] || t(founder.personalProfile.items[0].label), value: config?.founder[`profile_item1_val_${language}` as keyof typeof config.founder] || t(founder.personalProfile.items[0].value) },
      { label: config?.founder[`profile_item2_label_${language}` as keyof typeof config.founder] || t(founder.personalProfile.items[1].label), value: config?.founder[`profile_item2_val_${language}` as keyof typeof config.founder] || t(founder.personalProfile.items[1].value) },
      { label: config?.founder[`profile_item3_label_${language}` as keyof typeof config.founder] || t(founder.personalProfile.items[2].label), value: config?.founder[`profile_item3_val_${language}` as keyof typeof config.founder] || t(founder.personalProfile.items[2].value) },
      { label: config?.founder[`profile_item4_label_${language}` as keyof typeof config.founder] || t(founder.personalProfile.items[3].label), value: config?.founder[`profile_item4_val_${language}` as keyof typeof config.founder] || t(founder.personalProfile.items[3].value) },
  ];

  return (
    <div className="bg-gray-50 font-arabic">
      <SEO page="founder" />
      <section className="bg-med-light-blue pt-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center pb-12">
              <img src={founder.image} alt={founderName} className="w-48 h-48 rounded-full shadow-xl object-cover mx-auto mb-6 border-4 border-white" />
              <h1 className="text-4xl font-bold text-med-blue font-arabic">{founderName}</h1>
              <p className="text-xl text-med-sky mt-2">{founderTitle}</p>
          </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="lg:grid lg:grid-cols-3 lg:gap-12">
          <main className="lg:col-span-2">
            <SectionWrapper title={introTitle}>
              <p>{founderIntro}</p>
              {founder.introduction.paragraphs.slice(1).map((p, i) => <p key={i}>{t(p)}</p>)}
              <blockquote className="mt-6 border-r-4 border-med-sky pr-6 rtl:border-r-0 rtl:border-l-4 rtl:pr-0 rtl:pl-6">
                <p className="text-xl italic text-gray-800">"{quoteText}"</p>
                <cite className="block text-right mt-2 font-semibold text-med-blue not-italic">{t(founder.introduction.quote.author)}</cite>
              </blockquote>
            </SectionWrapper>
            
            <SectionWrapper icon="🏥" title={expTitle}>
                <h3 className="font-bold text-xl text-gray-800 mb-3">{expCurrentTitle}</h3>
                <ul className="list-disc pl-6 rtl:pr-6 space-y-2">
                    {founder.experience.current.items.map((item, i) => <li key={i}>{t(item)}</li>)}
                </ul>
            </SectionWrapper>

            <SectionWrapper icon="🎓" title={academicTitle}>
                <p>{t(founder.academicRoles.intro)}</p>
                <ul className="list-disc pl-6 rtl:pr-6 space-y-2 mt-4">
                    {founder.academicRoles.courses.map((item, i) => <li key={i}>{t(item)}</li>)}
                </ul>
                <p className="mt-4 font-bold text-med-blue">{academicSummary}</p>
            </SectionWrapper>
          </main>

          <aside className="lg:col-span-1 space-y-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-med-blue mb-6 border-b pb-4">{profileTitle}</h3>
                  <div className="space-y-4 text-start rtl:text-right">
                      {profileItems.map((item, i) => (
                          <div key={i}>
                            <strong className="text-gray-900 block text-sm uppercase">{item.label}</strong>
                            <p className="text-gray-600">{item.value}</p>
                          </div>
                      ))}
                  </div>
              </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default FounderPage;