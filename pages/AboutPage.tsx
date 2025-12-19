import React from 'react';
import type { NavigateFunction, LocalizedString } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { ABOUT_PAGE_DETAILED_CONTENT } from '../constants';
import SEO from '../components/SEO';

interface AboutPageProps {
  navigate: NavigateFunction;
}

const SectionHeader: React.FC<{ icon: string; title: string; subtitle?: string }> = ({ icon, title, subtitle }) => {
    return (
        <div className="text-center mb-12">
            <span className="text-5xl" role="img" aria-label="icon">{icon}</span>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold text-clinical-charcoal font-arabic">{title}</h2>
            {subtitle && <p className="mt-3 text-lg text-gray-600 max-w-3xl mx-auto">{subtitle}</p>}
        </div>
    );
};

const AboutPage: React.FC<AboutPageProps> = ({ navigate }) => {
  const { t, config, language } = useLocalization();
  const c = ABOUT_PAGE_DETAILED_CONTENT;

  // Dynamic Content Mapping
  const pageTitle = config?.about[`h1_${language}` as keyof typeof config.about] || t(c.h1);
  const pageSubtitle = config?.about[`subtitle_${language}` as keyof typeof config.about] || t(c.subtitle);
  const introTitle = config?.about[`intro_title_${language}` as keyof typeof config.about] || t(c.introduction.title);
  const introP1 = config?.about[`intro_p1_${language}` as keyof typeof config.about] || t(c.introduction.paragraphs[0]);
  const introP2 = config?.about[`intro_p2_${language}` as keyof typeof config.about] || t(c.introduction.paragraphs[1]);
  
  const missionTitle = config?.about[`mission_title_${language}` as keyof typeof config.about] || t(c.mission.title);
  const missionSummary = config?.about[`mission_summary_${language}` as keyof typeof config.about] || t(c.mission.summary);
  
  const visionTitle = config?.about[`vision_title_${language}` as keyof typeof config.about] || t(c.vision.title);
  const visionText = config?.about[`vision_text_${language}` as keyof typeof config.about] || t(c.vision.text);
  
  const ctaTitle = config?.about[`cta_title_${language}` as keyof typeof config.about] || t(c.contact.title);
  const ctaDesc = config?.about[`cta_desc_${language}` as keyof typeof config.about] || t(c.contact.intro);
  const ctaBtn = config?.about[`cta_btn_${language}` as keyof typeof config.about] || t(c.contact.cta);

  return (
    <div className="bg-gray-50 font-arabic">
      <SEO page="about" />
      <header className="bg-sterile-light-grey py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-clinical-charcoal font-arabic">{pageTitle}</h1>
          <p className="mt-4 text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">{pageSubtitle}</p>
        </div>
      </header>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 divide-y divide-gray-200">
        <section className="py-16">
            <SectionHeader icon={c.introduction.icon} title={introTitle} />
            <div className="max-w-4xl mx-auto space-y-5 text-lg text-gray-800 leading-relaxed text-center">
                 <p>{introP1}</p>
                 <p>{introP2}</p>
                 {c.introduction.paragraphs.slice(2).map((p, i) => <p key={i}>{t(p)}</p>)}
            </div>
        </section>

        <section className="py-16">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <div className="bg-white p-8 rounded-lg shadow-lg border-l-4 border-med-tech-blue rtl:border-l-0 rtl:border-r-4">
                    <h3 className="text-2xl font-bold text-clinical-charcoal font-arabic mb-4 flex items-center gap-3"><span className="text-2xl">{c.mission.icon}</span> {missionTitle}</h3>
                    <ul className="space-y-3 list-disc list-inside text-gray-700 marker:text-med-tech-blue">
                        {c.mission.points.map((p, i) => <li key={i}>{t(p)}</li>)}
                    </ul>
                    <p className="mt-5 font-semibold text-med-tech-blue bg-sterile-light-grey p-3 rounded-md">{missionSummary}</p>
                </div>
                <div className="bg-white p-8 rounded-lg shadow-lg border-l-4 border-med-tech-blue rtl:border-l-0 rtl:border-r-4">
                    <h3 className="text-2xl font-bold text-clinical-charcoal font-arabic mb-4 flex items-center gap-3"><span className="text-2xl">{c.vision.icon}</span> {visionTitle}</h3>
                    <p className="text-gray-700">{visionText}</p>
                </div>
            </div>
        </section>

        <section className="py-16">
            <div className="bg-med-tech-blue text-white rounded-lg text-center p-12 max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold font-arabic flex items-center justify-center gap-3"><span className="text-3xl">{c.contact.icon}</span>{ctaTitle}</h2>
                <p className="mt-4 text-lg max-w-2xl mx-auto text-gray-200">{ctaDesc}</p>
                <button onClick={() => navigate('contact')} className="mt-8 bg-med-vital-green hover:bg-white hover:text-med-tech-blue transition-colors text-white font-bold py-3 px-8 rounded-md text-lg shadow-md">
                    {ctaBtn}
                </button>
            </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;