
import React, { useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useToast } from '../hooks/useToast';
import { api } from '../services/api';
import type { NavigateFunction, ContactFormSubmission, Role, ApiArticle, Category, ApiAuthor, ApiEvent, ApiExpert, User, LocalizedString } from '../types';

// Import Tab Components
import SettingsTab from '../components/admin/SettingsTab';
import FrontSettingsTab from '../components/admin/FrontSettingsTab';
import ContactTab from '../components/admin/ContactTab';
import EventsTab from '../components/admin/EventsTab';
import ExpertsTab from '../components/admin/ExpertsTab';
import CategoriesTab from '../components/admin/CategoriesTab';
import AuthorsTab from '../components/admin/AuthorsTab';
import ArticlesTab from '../components/admin/ArticlesTab';
import UsersTab from '../components/admin/UsersTab';

interface AdminPageProps {
  navigate: NavigateFunction;
}

type AdminTab = 'settings' | 'contact' | 'articles' | 'categories' | 'authors' | 'experts' | 'events' | 'front_settings' | 'users';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`w-full text-start px-4 py-3 text-sm font-medium rounded-md transition-colors ${
            active ? 'bg-med-tech-blue text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
    >
        {children}
    </button>
);

// Helper to extract array from various API response structures
const getArrayFromResponse = (response: any): any[] => {
    if (!response) return [];
    
    // Handle nested array response [[...]]
    if (Array.isArray(response)) {
        if (response.length > 0 && Array.isArray(response[0])) {
            return response[0];
        }
        return response;
    }

    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.data)) return response.data.data;
    if (response.users && Array.isArray(response.users)) return response.users; 
    return [];
};

const TAB_LABELS: Record<AdminTab, LocalizedString> = {
    settings: { ar: 'الإعدادات العامة', en: 'General Settings' },
    front_settings: { ar: 'إعدادات الواجهة', en: 'Front Settings' },
    contact: { ar: 'طلبات التواصل', en: 'Contact Requests' },
    articles: { ar: 'المقالات', en: 'Articles' },
    categories: { ar: 'التصنيفات', en: 'Categories' },
    authors: { ar: 'المؤلفون', en: 'Authors' },
    experts: { ar: 'الخبراء', en: 'Experts' },
    events: { ar: 'الفعاليات', en: 'Events' },
    users: { ar: 'المستخدمون', en: 'Users' },
};

const ORDERED_TABS: AdminTab[] = ['settings', 'front_settings', 'contact', 'articles', 'categories', 'authors', 'experts', 'events', 'users'];

const AdminPage: React.FC<AdminPageProps> = ({ navigate }) => {
    const { t, dir } = useLocalization();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<AdminTab>('experts');
    const [loading, setLoading] = useState(false);
    
    const [contactForms, setContactForms] = useState<ContactFormSubmission[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [usersList, setUsersList] = useState<User[]>([]);
    const [articles, setArticles] = useState<ApiArticle[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [authors, setAuthors] = useState<ApiAuthor[]>([]);
    const [experts, setExperts] = useState<ApiExpert[]>([]);
    const [events, setEvents] = useState<ApiEvent[]>([]);

    // Pagination State
    const [currentArticlesPage, setCurrentArticlesPage] = useState(1);
    const [lastArticlesPage, setLastArticlesPage] = useState(1);
    const [currentEventsPage, setCurrentEventsPage] = useState(1);
    const [lastEventsPage, setLastEventsPage] = useState(1);
    
    useEffect(() => {
        loadTabData(activeTab);
    }, [activeTab]);

    const loadTabData = async (tab: AdminTab, page: number = 1) => {
        setLoading(true);
        try {
            switch (tab) {
                case 'contact':
                    const contactRes = await api.getContactForms(1); // Fetch page 1 for now
                    setContactForms(getArrayFromResponse(contactRes));
                    break;
                case 'articles':
                    const artRes = await api.getArticles(page);
                    setArticles(getArrayFromResponse(artRes));
                    
                    let totalPages = 1;
                    if (artRes.last_page) totalPages = artRes.last_page;
                    else if (artRes.data && artRes.data.last_page) totalPages = artRes.data.last_page;
                    else if (artRes.meta && artRes.meta.last_page) totalPages = artRes.meta.last_page;
                    
                    setLastArticlesPage(totalPages || 1);
                    setCurrentArticlesPage(page);

                    await Promise.all([
                        api.getCategories().then(res => setCategories(getArrayFromResponse(res))),
                        api.getAuthors().then(res => setAuthors(getArrayFromResponse(res)))
                    ]);
                    break;
                case 'categories':
                    const catRes = await api.getCategories();
                    setCategories(getArrayFromResponse(catRes));
                    break;
                case 'authors':
                    const authRes = await api.getAuthors();
                    setAuthors(getArrayFromResponse(authRes));
                    break;
                case 'experts':
                    const expertsRes = await api.getExperts();
                    setExperts(getArrayFromResponse(expertsRes));
                    break;
                case 'events':
                    const evtRes = await api.getEvents(page);
                    setEvents(getArrayFromResponse(evtRes));
                    
                    let totalEvtPages = 1;
                    if (evtRes.last_page) totalEvtPages = evtRes.last_page;
                    else if (evtRes.data && evtRes.data.last_page) totalEvtPages = evtRes.data.last_page;
                    else if (evtRes.meta && evtRes.meta.last_page) totalEvtPages = evtRes.meta.last_page;

                    setLastEventsPage(totalEvtPages || 1);
                    setCurrentEventsPage(page);
                    
                    // Fetch authors for attachment dropdown
                    const authorsRes = await api.getAuthors();
                    setAuthors(getArrayFromResponse(authorsRes));
                    break;
                case 'users':
                    const rolesRes = await api.getRoles();
                    setRoles(getArrayFromResponse(rolesRes));
                    const usersRes = await api.getUsers();
                    setUsersList(getArrayFromResponse(usersRes));
                    break;
            }
        } catch (error) {
            console.error(error);
            showToast(t({ar: 'فشل تحميل البيانات', en: 'Failed to load data'}), 'error');
            setExperts([]); setArticles([]); setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 flex flex-col md:flex-row font-arabic h-full min-h-screen" dir={dir}>
            <aside className="w-full md:w-64 bg-white shadow-lg z-10 flex-shrink-0">
                <div className="p-6 border-b flex items-center gap-2">
                    <div className="w-8 h-8 bg-med-tech-blue rounded-lg flex items-center justify-center text-white font-bold">M</div>
                    <h2 className="text-xl font-bold text-med-blue">{t({ar: 'لوحة تحكم ميد بلس', en: 'MedPulse Admin'})}</h2>
                </div>
                <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-80px)]">
                    {ORDERED_TABS.map(tab => (
                        <TabButton key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>{t(TAB_LABELS[tab])}</TabButton>
                    ))}
                </nav>
            </aside>
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {loading && activeTab !== 'experts' && activeTab !== 'settings' && activeTab !== 'front_settings' ? 
                        <div className="text-center py-20 text-gray-500">{t({ar: 'جارٍ تحميل البيانات...', en: 'Loading data...'})}</div> 
                    : (
                        <>
                            {activeTab === 'settings' && <SettingsTab />}
                            {activeTab === 'front_settings' && <FrontSettingsTab />}
                            {activeTab === 'contact' && <ContactTab contactForms={contactForms} />}
                            {activeTab === 'articles' && <ArticlesTab 
                                articles={articles} 
                                categories={categories} 
                                authors={authors} 
                                currentPage={currentArticlesPage}
                                lastPage={lastArticlesPage}
                                onPageChange={(p) => loadTabData('articles', p)}
                                onRefresh={() => loadTabData('articles', currentArticlesPage)}
                            />}
                            {activeTab === 'categories' && <CategoriesTab categories={categories} onRefresh={() => loadTabData('categories')} />}
                            {activeTab === 'authors' && <AuthorsTab authors={authors} onRefresh={() => loadTabData('authors')} />}
                            {activeTab === 'experts' && <ExpertsTab experts={experts} onRefresh={() => loadTabData('experts')} />}
                            {activeTab === 'events' && <EventsTab 
                                events={events}
                                authors={authors}
                                currentPage={currentEventsPage}
                                lastPage={lastEventsPage}
                                onPageChange={(p) => loadTabData('events', p)}
                                onRefresh={() => loadTabData('events', currentEventsPage)}
                            />}
                            {activeTab === 'users' && <UsersTab usersList={usersList} />}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminPage;
