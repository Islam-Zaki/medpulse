import React from 'react';
import type { NavigateFunction, LocalizedString } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { PRIVACY_POLICY_CONTENT } from '../constants';

interface PrivacyPolicyPageProps {
  navigate: NavigateFunction;
}

const PolicySection: React.FC<{ icon: string; title: LocalizedString; children: React.ReactNode }> = ({ icon, title, children }) => {
    const { t } = useLocalization();
    return (
        <section className="py-8 border-b border-gray-200 last:border-b-0">
            <h2 className="text-2xl md:text-3xl font-bold text-med-blue mb-6 font-arabic flex items-center gap-4">
                <span className="text-3xl">{icon}</span>
                <span>{t(title)}</span>
            </h2>
            <div className="prose lg:prose-lg max-w-none text-gray-800 leading-relaxed space-y-4">
                {children}
            </div>
        </section>
    );
}

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ navigate }) => {
  const { t } = useLocalization();
  const c = PRIVACY_POLICY_CONTENT;

  return (
    <div className="bg-white font-arabic">
      {/* Hero Section */}
      <header className="bg-med-light-blue py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-med-blue font-arabic">{t(c.hero.title)}</h1>
          <p className="mt-4 text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">{t(c.hero.intro)}</p>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-4xl">
        {c.sections.map((section, index) => (
            <PolicySection key={index} icon={section.icon} title={section.title}>
                {section.content.map((p, i) => <p key={i} dangerouslySetInnerHTML={{ __html: t(p).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>)}
            </PolicySection>
        ))}
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
