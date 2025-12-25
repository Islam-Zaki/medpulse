
import React, { useState, useCallback, useEffect } from 'react';
import { LocalizationProvider } from './hooks/useLocalization';
import { ToastProvider } from './hooks/useToast';
import type { PageState, User } from './types';

import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ConferencesPage from './pages/ConferencesPage';
import ConferenceDetailsPage from './pages/ConferenceDetailsPage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailsPage from './pages/ArticleDetailsPage';
import AboutPage from './pages/AboutPage';
import FounderPage from './pages/FounderPage';
import ContactPage from './pages/ContactPage';
import ConsequencesPage from './pages/ConsequencesPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import DisclaimerPage from './pages/DisclaimerPage';
import ExpertsPage from './pages/ExpertsPage';
import DoctorProfilePage from './pages/DoctorProfilePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import AIChatWidget from './components/AIChatWidget';


const App: React.FC = () => {
  const [page, setPage] = useState<PageState>({ name: 'home', params: {} });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
      // Apply Fonts from Local Storage
      const storedFonts = localStorage.getItem('medpulse_font_settings');
      if (storedFonts) {
          try {
              const fonts = JSON.parse(storedFonts);
              const root = document.documentElement;
              root.style.setProperty('--font-en-body', fonts.en.body);
              root.style.setProperty('--font-en-headings', fonts.en.headings);
              root.style.setProperty('--font-ar-body', fonts.ar.body);
              root.style.setProperty('--font-ar-headings', fonts.ar.headings);
          } catch(e) { console.error("Failed to apply font settings", e); }
      }

      // Check for existing token on load
      const token = localStorage.getItem('auth_token');
      if (token) {
          setIsAuthenticated(true);
          setCurrentUser({ id: 0, name: 'Admin', email: 'admin@medpulse.ae' }); 
      }
  }, []);

  const navigate = useCallback((name: string, params: Record<string, any> = {}) => {
    window.scrollTo(0, 0);
    setPage({ name, params });
  }, []);

  const handleLogin = useCallback((user: User) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('auth_token');
    navigate('home');
  }, [navigate]);

  const renderPage = () => {
    switch (page.name) {
      case 'home':
        return <HomePage navigate={navigate} />;
      case 'conferences':
        return <ConferencesPage navigate={navigate} />;
      case 'conference-details':
        return <ConferenceDetailsPage navigate={navigate} conferenceId={page.params.id} />;
      case 'articles':
        return <ArticlesPage navigate={navigate} />;
      case 'article-details':
        return <ArticleDetailsPage navigate={navigate} articleId={page.params.id} />;
      case 'about':
        return <AboutPage navigate={navigate} />;
      case 'founder':
        return <FounderPage navigate={navigate} />;
      case 'contact':
        return <ContactPage navigate={navigate} />;
      case 'experts':
        return <ExpertsPage navigate={navigate} />;
      case 'expert-profile':
        return <DoctorProfilePage navigate={navigate} expertId={page.params.id} />;
      case 'consequences':
        return <ConsequencesPage navigate={navigate} />;
      case 'privacy':
        return <PrivacyPolicyPage navigate={navigate} />;
      case 'disclaimer':
        return <DisclaimerPage navigate={navigate} />;
      case 'login':
        return <LoginPage navigate={navigate} handleLogin={handleLogin} />;
      case 'signup':
        return <SignUpPage navigate={navigate} handleLogin={handleLogin} />;
      case 'profile':
         return isAuthenticated && currentUser ? <ProfilePage navigate={navigate} user={currentUser} /> : <LoginPage navigate={navigate} handleLogin={handleLogin} />;
      case 'admin':
         return <AdminPage navigate={navigate} />;
      default:
        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <LocalizationProvider>
      <ToastProvider>
        <div className="antialiased bg-gray-50 flex flex-col min-h-screen">
          <Header 
          navigate={navigate} 
          currentPage={page.name}
          isAuthenticated={isAuthenticated}
          handleLogout={handleLogout}
          />
          
          <main className="flex-grow flex flex-col">
              {renderPage()}
          </main>
          
          {page.name !== 'admin' && <Footer navigate={navigate} />}
          
          {page.name !== 'admin' && <AIChatWidget />}
        </div>
      </ToastProvider>
    </LocalizationProvider>
  );
};

export default App;
