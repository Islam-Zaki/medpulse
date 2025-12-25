
import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { NAV_LINKS } from '../constants';
import type { NavigateFunction } from '../types';
import LanguageSwitcher from './LanguageSwitcher';
import { api } from '../services/api';

interface HeaderProps {
    navigate: NavigateFunction;
    currentPage: string;
    isAuthenticated: boolean;
    handleLogout: () => void;
}

const DEFAULT_LOGO = "https://storage.googleapis.com/aistudio-v2-dev-0-user-b30432c0-ff27-4f91-a18c-864b4c3e8a5a/4b5b4819-ff16-419b-b0b8-cdd21f66d498.png";

const AdminIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const Header: React.FC<HeaderProps> = ({ navigate, currentPage, isAuthenticated, handleLogout }) => {
    const { t, config } = useLocalization();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const logoUrl = api.resolveImageUrl((config?.home as any)?.logo, DEFAULT_LOGO);

    const AuthNavDesktop = () => (
      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <>
            <button
              onClick={() => navigate('admin')}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-med-tech-blue bg-med-light-blue/20 rounded hover:bg-med-light-blue/40 transition-colors"
              title={t({ ar: 'لوحة التحكم', en: 'Admin Panel' })}
            >
              <AdminIcon />
              <span>{t({ ar: 'الإدارة', en: 'Admin' })}</span>
            </button>
            <button
              onClick={() => navigate('profile')}
              className="px-4 py-2 text-sm font-medium text-clinical-charcoal transition-colors hover:text-med-tech-blue"
            >
              {t({ ar: 'الملف الشخصي', en: 'Profile' })}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              {t({ ar: 'تسجيل الخروج', en: 'Log Out' })}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate('login')}
              className="px-6 py-2 text-sm font-bold text-white bg-med-tech-blue rounded-md hover:bg-blue-700 transition-colors shadow-md"
            >
              {t({ ar: 'تسجيل الدخول', en: 'Log In' })}
            </button>
          </>
        )}
      </div>
    );

     const AuthNavMobile = () => (
      <div className="pt-4 pb-3 border-t border-gray-300">
         {isAuthenticated ? (
          <div className="px-2 space-y-1">
             <button
                onClick={() => { navigate('admin'); setIsMobileMenuOpen(false); }}
                className="flex items-center w-full text-start px-3 py-2 rounded-md text-base font-medium text-med-tech-blue hover:bg-white"
              >
                <AdminIcon />
                <span className="ml-2 rtl:mr-2">{t({ ar: 'لوحة التحكم', en: 'Admin Panel' })}</span>
              </button>
             <button
                onClick={() => { navigate('profile'); setIsMobileMenuOpen(false); }}
                className="block w-full text-start px-3 py-2 rounded-md text-base font-medium text-clinical-charcoal hover:bg-white hover:text-med-tech-blue"
              >
                {t({ ar: 'الملف الشخصي', en: 'Profile' })}
              </button>
             <button
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                className="block w-full text-start px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
              >
                {t({ ar: 'تسجيل الخروج', en: 'Log Out' })}
              </button>
          </div>
        ) : (
           <div className="px-2 space-y-1">
            <button
              onClick={() => { navigate('login'); setIsMobileMenuOpen(false); }}
              className="block w-full text-center px-3 py-3 rounded-md text-base font-bold text-white bg-med-tech-blue hover:bg-blue-700 shadow-sm"
            >
              {t({ ar: 'تسجيل الدخول', en: 'Log In' })}
            </button>
           </div>
        )}
      </div>
    );


    return (
        <header className="bg-sterile-light-grey/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center">
                        <button onClick={() => navigate('home')} className="flex-shrink-0 flex items-center gap-2">
                             <img src={logoUrl} alt="MedPulse Logo" className="h-14" />
                        </button>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        <nav className="flex items-baseline gap-2">
                            {NAV_LINKS.map((link) => (
                                <button
                                    key={link.page}
                                    onClick={() => navigate(link.page)}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                                        currentPage === link.page
                                            ? 'text-med-tech-blue font-bold'
                                            : 'text-clinical-charcoal hover:text-med-tech-blue'
                                    }`}
                                >
                                    {t(link.label)}
                                    {currentPage === link.page && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-med-tech-blue rounded-full"></span>}
                                </button>
                            ))}
                        </nav>
                         <div className="h-6 w-px bg-gray-400"></div>
                         <LanguageSwitcher />
                         <div className="h-6 w-px bg-gray-400"></div>
                         <AuthNavDesktop />
                    </div>
                    <div className="md:hidden flex items-center">
                         <LanguageSwitcher />
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-clinical-charcoal hover:text-white hover:bg-med-tech-blue focus:outline-none"
                        >
                            <span className="sr-only">Open main menu</span>
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-gray-300 bg-sterile-light-grey">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {NAV_LINKS.map((link) => (
                            <button
                                key={link.page}
                                onClick={() => { navigate(link.page); setIsMobileMenuOpen(false); }}
                                className={`block w-full text-start px-3 py-2 rounded-md text-base font-medium transition-colors ${
                                    currentPage === link.page
                                        ? 'bg-white text-med-tech-blue shadow-sm'
                                        : 'text-clinical-charcoal hover:bg-white hover:text-med-tech-blue'
                                }`}
                            >
                                {t(link.label)}
                            </button>
                        ))}
                        <button
                            onClick={() => { navigate('contact'); setIsMobileMenuOpen(false); }}
                             className="block w-full text-start px-3 py-2 rounded-md text-base font-bold text-white bg-med-tech-blue hover:bg-blue-800 mt-2"
                        >
                            {t({ ar: 'اكتب تقييمك', en: 'Write Review' })}
                        </button>
                    </div>
                    <AuthNavMobile />
                </div>
            )}
        </header>
    );
};

export default Header;
