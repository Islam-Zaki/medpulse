import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { NAV_LINKS, FOOTER_POLICY_LINKS, SOCIAL_LINKS } from '../constants';
import type { NavigateFunction } from '../types';

interface FooterProps {
    navigate: NavigateFunction;
}

const Footer: React.FC<FooterProps> = ({ navigate }) => {
    const { t } = useLocalization();

    return (
        <footer className="bg-sterile-light-grey text-clinical-charcoal border-t border-gray-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-2 space-y-4">
                         <button onClick={() => navigate('home')} className="flex items-center gap-2">
                            <img src="https://storage.googleapis.com/aistudio-v2-dev-0-user-b30432c0-ff27-4f91-a18c-864b4c3e8a5a/4b5b4819-ff16-419b-b0b8-cdd21f66d498.png" alt="MedPulse Logo" className="h-14" />
                        </button>
                        <p className="text-sm text-gray-700 max-w-md leading-relaxed">{t({ar: 'منصة علمية-إعلامية متخصصة في تقييم وتحليل المؤتمرات الطبية في الإمارات والشرق الأوسط.', en: 'A media-scientific platform specialized in evaluating and analyzing medical conferences in the UAE and the Middle East.'})}</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-4 text-clinical-charcoal">{t({ar: 'روابط سريعة', en: 'Quick Links'})}</h3>
                        <ul className="space-y-2">
                            {NAV_LINKS.map((link) => (
                                <li key={link.page}>
                                    <button onClick={() => navigate(link.page)} className="text-med-tech-blue hover:text-med-vital-green transition-colors font-medium">
                                        {t(link.label)}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-4 text-clinical-charcoal">{t({ar: 'تواصل معنا', en: 'Follow Us'})}</h3>
                         <div className="flex space-x-4 rtl:space-x-reverse">
                            {SOCIAL_LINKS.map(link => (
                                <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="text-med-tech-blue hover:text-med-vital-green transition-colors" aria-label={link.name}>
                                    {link.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-gray-300/50 border-t border-gray-300">
                 <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
                    <p>© 2025 MedPulse – {t({ar: 'جميع الحقوق محفوظة', en: 'All Rights Reserved'})}</p>
                    <div className="flex space-x-4 rtl:space-x-reverse mt-4 sm:mt-0">
                        {FOOTER_POLICY_LINKS.map(link => (
                             <button key={link.page} onClick={() => navigate(link.page)} className="hover:text-med-tech-blue transition-colors">
                                {t(link.label)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;