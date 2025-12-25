
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
            {subtitle && <div className="mt-3 text-lg text-gray-600 max-w-3xl mx-auto rich-text-preview" dangerouslySetInnerHTML={{ __html: subtitle }} />}
        </div>
    );
};

const AboutPage: React.FC<AboutPageProps> = ({ navigate }) => {
  const { t, config, language } = useLocalization();
  const c = ABOUT_PAGE_DETAILED_CONTENT;

  // Dynamic Content Overrides for CMS support
  const pageTitle = config?.about[`h1_${language}` as keyof typeof config.about] as string || t(c.h1);
  const pageSubtitle = config?.about[`subtitle_${language}` as keyof typeof config.about] as string || t(c.subtitle);
  
  const introIcon = config?.about.intro_icon || c.introduction.icon;
  const introTitle = config?.about[`intro_title_${language}` as keyof typeof config.about] as string || t(c.introduction.title);
  
  // Combine intro_p1 and intro_p2 if needed, but focus on p1 as the master rich text field
  const introContent = config?.about[`intro_p1_${language}` as keyof typeof config.about] as string || t(c.introduction.paragraphs[0]);
  
  const missionIcon = config?.about.mission_icon || c.mission.icon;
  const missionTitle = config?.about[`mission_title_${language}` as keyof typeof config.about] as string || t(c.mission.title);
  const missionText = config?.about[`mission_text_${language}` as keyof typeof config.about] as string || '';
  const missionSummary = config?.about[`mission_summary_${language}` as keyof typeof config.about] as string || t(c.mission.summary);
  
  const visionIcon = config?.about.vision_icon || c.vision.icon;
  const visionTitle = config?.about[`vision_title_${language}` as keyof typeof config.about] as string || t(c.vision.title);
  const visionText = config?.about[`vision_text_${language}` as keyof typeof config.about] as string || t(c.vision.text);
  const visionSummary = config?.about[`vision_summary_${language}` as keyof typeof config.about] as string || t(c.vision.summary);
  
  const goalsIcon = config?.about.goals_icon || c.goals.icon;
  const valuesIcon = config?.about.values_icon || c.coreValues.icon;
  const servicesIcon = config?.about.services_icon || c.services.icon;
  const teamIcon = config?.about.team_icon || c.team.icon;
  const diffIcon = config?.about.diff_icon || c.differentiators.icon;
  
  // Future Vision
  const futureVisionIcon = config?.about.future_vision_icon || c.futureVision.icon;
  const futureVisionTitle = config?.about[`future_vision_title_${language}` as keyof typeof config.about] as string || t(c.futureVision.title);
  const futureVisionIntro = config?.about[`future_vision_intro_${language}` as keyof typeof config.about] as string || t(c.futureVision.intro);
  const futureVisionSummary = config?.about[`future_vision_summary_${language}` as keyof typeof config.about] as string || t(c.futureVision.summary);

  const ctaTitle = config?.about[`cta_title_${language}` as keyof typeof config.about] as string || t(c.contact.title);
  const ctaDesc = config?.about[`cta_desc_${language}` as keyof typeof config.about] as string || t(c.contact.intro);
  const ctaBtn = config?.about[`cta_btn_${language}` as keyof typeof config.about] as string || t(c.contact.cta);

  // Helper to map dynamic config cards to unified structure
  const mapConfigArray = (arr: any[] | undefined, fallback: any[]) => {
    if (arr && arr.length > 0) {
      return arr.map(item => ({
        icon: item.icon || '✨',
        title: language === 'ar' ? item.title_ar : item.title_en,
        description: language === 'ar' ? item.desc_ar : item.desc_en
      }));
    }
    return fallback.map(item => ({
      icon: item.icon || '✨',
      title: t(item.title),
      description: t(item.description)
    }));
  };

  const displayGoals = mapConfigArray(config?.about.goals, c.goals.items);
  const displayValues = mapConfigArray(config?.about.values, c.coreValues.items);
  const displayServices = mapConfigArray(config?.about.services, c.services.items);
  const displayTeam = mapConfigArray(config?.about.team, c.team.roles.map(r => ({ title: r, description: {ar: '', en: ''} })));
  const displayDifferentiators = mapConfigArray(config?.about.differentiators, c.differentiators.items);
  
  // Future vision points mapping (only title used in the list)
  const displayFutureVisionPoints = (config?.about.future_vision && config.about.future_vision.length > 0)
    ? config.about.future_vision.map(p => (language === 'ar' ? p.title_ar : p.title_en))
    : c.futureVision.points.map(p => t(p));

  const coreValuesIntro = config?.about[`core_values_intro_${language}` as keyof typeof config.about] as string || t(c.coreValues.intro);

  return (
    <div className="bg-gray-50 font-arabic">
      <SEO page="about" />
      
      {/* Hero Section */}
      <header className="bg-sterile-light-grey py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-clinical-charcoal font-arabic">{pageTitle}</h1>
          <div className="mt-4 text-lg md:text-xl text-gray-700 max-w-3xl mx-auto rich-text-preview" dangerouslySetInnerHTML={{ __html: pageSubtitle }} />
        </div>
      </header>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 divide-y divide-gray-200">
        
        {/* Introduction */}
        <section className="py-16">
            <SectionHeader icon={introIcon} title={introTitle} />
            <div className="max-w-4xl mx-auto text-lg text-gray-800 leading-relaxed text-center rich-text-preview">
                 <div dangerouslySetInnerHTML={{ __html: introContent }} />
            </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <div className="bg-white p-8 rounded-lg shadow-lg border-l-4 border-med-tech-blue rtl:border-l-0 rtl:border-r-4 flex flex-col">
                    <h3 className="text-2xl font-bold text-clinical-charcoal font-arabic mb-4 flex items-center gap-3"><span className="text-2xl">{missionIcon}</span> {missionTitle}</h3>
                    {missionText ? (
                        <div className="text-gray-700 mb-6 flex-grow rich-text-preview" dangerouslySetInnerHTML={{ __html: missionText }} />
                    ) : (
                        <ul className="space-y-3 list-disc list-inside text-gray-700 marker:text-med-tech-blue flex-grow">
                            {c.mission.points.map((p, i) => <li key={i}>{t(p)}</li>)}
                        </ul>
                    )}
                    <p className="mt-auto font-semibold text-med-tech-blue bg-sterile-light-grey p-3 rounded-md text-center">{missionSummary}</p>
                </div>
                <div className="bg-white p-8 rounded-lg shadow-lg border-l-4 border-med-tech-blue rtl:border-l-0 rtl:border-r-4 flex flex-col">
                    <h3 className="text-2xl font-bold text-clinical-charcoal font-arabic mb-4 flex items-center gap-3"><span className="text-2xl">{visionIcon}</span> {visionTitle}</h3>
                    <div className="text-gray-700 mb-6 flex-grow rich-text-preview" dangerouslySetInnerHTML={{ __html: visionText }} />
                    <p className="mt-auto font-semibold text-med-tech-blue bg-sterile-light-grey p-3 rounded-md text-center">{visionSummary}</p>
                </div>
            </div>
        </section>

        {/* Dynamic Goals */}
        <section className="py-16">
            <SectionHeader icon={goalsIcon} title={t(c.goals.title)} />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {displayGoals.map((item, i) => (
                    <div key={i} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100">
                        <div className="text-2xl mb-2">{item.icon}</div>
                        <h3 className="font-bold text-xl text-clinical-charcoal mb-2">{item.title}</h3>
                        <div className="text-gray-600 text-sm rich-text-preview" dangerouslySetInnerHTML={{ __html: item.description }} />
                    </div>
                ))}
            </div>
        </section>
        
        {/* Dynamic Core Values */}
        <section className="py-16">
            <SectionHeader icon={valuesIcon} title={t(c.coreValues.title)} subtitle={coreValuesIntro} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {displayValues.map((item, i) => (
                    <div key={i} className="bg-white p-6 rounded-lg shadow-md border-t-4 border-med-tech-blue">
                        <h3 className="font-bold text-xl text-clinical-charcoal flex items-center gap-3 mb-3"><span className="text-2xl">{item.icon}</span>{item.title}</h3>
                        <div className="text-sm text-gray-600 leading-relaxed rich-text-preview" dangerouslySetInnerHTML={{ __html: item.description }} />
                    </div>
                ))}
            </div>
        </section>

        {/* Methodology (FIXED - NOT EDITABLE) */}
        <section className="py-16">
            <SectionHeader icon={c.methodology.icon} title={t(c.methodology.title)} subtitle={t(c.methodology.intro)} />
            <div className="overflow-x-auto mt-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
                <table className="w-full text-left rtl:text-right">
                    <thead className="bg-med-tech-blue text-white">
                        <tr>
                            <th className="p-4 font-semibold">{t(c.methodology.table.headers.criterion)}</th>
                            <th className="p-4 font-semibold">{t(c.methodology.table.headers.description)}</th>
                            <th className="p-4 font-semibold text-center">{t(c.methodology.table.headers.maxScore)}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {c.methodology.table.rows.map((row, i) => (
                             <tr key={i} className="border-b border-gray-200 odd:bg-white even:bg-gray-50 hover:bg-blue-50/30 transition-colors">
                                <td className="p-4 font-bold text-gray-800">{t(row.criterion)}</td>
                                <td className="p-4 text-gray-600 text-sm">{t(row.description)}</td>
                                <td className="p-4 text-center font-bold text-lg text-med-tech-blue">{row.score}</td>
                             </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold text-clinical-charcoal">
                        <tr>
                            <td colSpan={3} className="p-4 text-center text-lg">{t(c.methodology.table.total)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
             <p className="mt-6 text-center italic text-gray-600 max-w-4xl mx-auto">{t(c.methodology.summary)}</p>
        </section>

        {/* Dynamic Services */}
         <section className="py-16">
            <SectionHeader icon={servicesIcon} title={t(c.services.title)} />
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
             {displayServices.map((item, i) => (
                <div key={i} className="p-6 bg-white shadow-md rounded-lg flex items-start gap-4 border border-gray-50">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-med-tech-blue text-white flex items-center justify-center font-bold text-lg mt-1">{item.icon}</div>
                    <div>
                        <h3 className="font-bold text-xl text-clinical-charcoal">{item.title}</h3>
                        <div className="text-gray-600 mt-1 text-sm rich-text-preview" dangerouslySetInnerHTML={{ __html: item.description }} />
                    </div>
                </div>
            ))}
            </div>
        </section>

        {/* Dynamic Team */}
        <section className="py-16">
            <SectionHeader icon={teamIcon} title={t(c.team.title)} subtitle={t(c.team.intro)} />
            <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayTeam.map((member, i) => (
                    <div key={i} className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col items-center text-center">
                        <span className="text-4xl mb-3">{member.icon}</span>
                        <h4 className="text-lg font-bold text-gray-900">{member.title}</h4>
                        {member.description && <div className="text-sm text-gray-600 mt-2 rich-text-preview" dangerouslySetInnerHTML={{ __html: member.description }} />}
                    </div>
                ))}
            </div>
        </section>

        {/* Dynamic Differentiators */}
        <section className="py-16">
            <SectionHeader icon={diffIcon} title={t(c.differentiators.title)} />
             <div className="grid sm:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {displayDifferentiators.map((item, i) => (
                    <div key={i} className="bg-sterile-light-grey p-6 rounded-lg flex items-start gap-4 hover:shadow-md transition-shadow">
                        <span className="text-4xl">{item.icon}</span>
                        <div>
                            <h3 className="font-bold text-xl text-clinical-charcoal">{item.title}</h3>
                            <div className="mt-2 text-gray-600 text-sm leading-relaxed rich-text-preview" dangerouslySetInnerHTML={{ __html: item.description }} />
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* Future Vision - REDESIGNED TO SINGLE CARD */}
         <section className="py-16">
            <SectionHeader icon={futureVisionIcon} title={futureVisionTitle} subtitle={futureVisionIntro}/>
            <div className="max-w-4xl mx-auto">
                <div className="bg-white p-10 rounded-[30px] shadow-2xl border border-gray-100 flex flex-col overflow-hidden relative">
                    <ul className="space-y-6 mb-10">
                        {displayFutureVisionPoints.map((point, i) => (
                            <li key={i} className="flex items-start gap-4 group">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-med-tech-blue flex items-center justify-center mt-1 group-hover:bg-med-tech-blue transition-colors">
                                    <svg className="w-3.5 h-3.5 text-med-tech-blue group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-lg text-gray-700 leading-tight font-medium">{point}</span>
                            </li>
                        ))}
                    </ul>
                    
                    <div className="mt-auto pt-8 border-t border-gray-100">
                        <p className="text-center font-bold text-med-tech-blue text-lg leading-relaxed px-4">
                            {futureVisionSummary}
                        </p>
                    </div>
                </div>
            </div>
        </section>
        
        {/* CTA */}
        <section className="py-16">
            <div className="bg-med-tech-blue text-white rounded-lg text-center p-12 max-w-5xl mx-auto shadow-xl">
                <h2 className="text-3xl font-bold font-arabic flex items-center justify-center gap-3"><span className="text-3xl">{c.contact.icon}</span>{ctaTitle}</h2>
                <p className="mt-4 text-lg max-w-2xl mx-auto text-gray-200">{ctaDesc}</p>
                <button onClick={() => navigate('contact')} className="mt-8 bg-med-vital-green hover:bg-white hover:text-med-tech-blue transition-all duration-300 text-white font-bold py-3 px-8 rounded-md text-lg shadow-lg transform hover:-translate-y-1">
                    {ctaBtn}
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

export default AboutPage;
