import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { useLocalization } from '../../hooks/useLocalization';
import { api } from '../../services/api';
import InputGroup from './InputGroup';
import type { SiteConfig } from '../../types';
import { FOUNDER_DATA_DETAILED } from '../../constants';

type StaticPage = 'home' | 'about' | 'founder' | 'contact';

const ARABIC_FONTS = ['Cairo', 'Tajawal', 'Almarai', 'Noto Kufi Arabic'];
const ENGLISH_FONTS = ['Poppins', 'Montserrat', 'Roboto', 'Open Sans'];
const DOMAIN = 'https://medpulse-production.up.railway.app';

// FIX: Components moved outside to maintain focus during state updates
const EditableH1 = ({ val, onChange, className = "" }: { val: string; onChange: (v: string) => void; className?: string }) => (
    <input 
        className={`bg-transparent border-b border-dashed border-gray-400 hover:border-blue-400 focus:border-blue-600 focus:outline-none w-full text-gray-900 font-inherit ${className}`}
        value={val}
        onChange={e => onChange(e.target.value)}
    />
);

const EditableP = ({ val, onChange, className = "" }: { val: string; onChange: (v: string) => void; className?: string }) => (
    <textarea 
        rows={1}
        className={`bg-transparent border-b border-dashed border-gray-400 hover:border-blue-400 focus:border-blue-600 focus:outline-none w-full resize-none overflow-hidden text-gray-900 font-inherit ${className}`}
        value={val}
        onChange={e => onChange(e.target.value)}
        onInput={(e: any) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
        }}
    />
);

const VisualEditor: React.FC<{ 
    page: StaticPage; 
    data: SiteConfig; 
    setData: (d: SiteConfig) => void; 
    onClose: () => void; 
    onSave: () => void;
}> = ({ page, data, setData, onClose, onSave }) => {
    const { t, language, setLanguage } = useLocalization();
    
    const [heroMode, setHeroMode] = useState<'images' | 'video'>('images');
    const [carouselImages, setCarouselImages] = useState<string[]>(['https://picsum.photos/seed/bg/1200/800']);
    const [videoUrl, setVideoUrl] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const loadFront = async () => {
            try {
                const res = await api.getFrontSettings();
                const settings = Array.isArray(res.data) ? res.data[0] : (res.data || res[0]);
                if (settings) {
                    setHeroMode(settings.mode || 'images');
                    if (settings.mode === 'video' && settings.videos?.length > 0) {
                        setVideoUrl(settings.videos[0].base_url + settings.videos[0].name);
                    } else if (settings.images?.length > 0) {
                        setCarouselImages(settings.images.map((img: any) => `${DOMAIN}${img.base_url}${img.name}`));
                    }
                }
            } catch (e) { console.warn("Editor failed to fetch live hero preview settings"); }
        };
        if (page === 'home') loadFront();
    }, [page]);

    useEffect(() => {
        if (heroMode !== 'images' || carouselImages.length <= 1) return;
        const interval = setInterval(() => { setCurrentSlide(prev => (prev + 1) % carouselImages.length); }, 4000);
        return () => clearInterval(interval);
    }, [carouselImages, heroMode]);

    const updateField = (section: keyof SiteConfig, field: string, value: string) => {
        const newData = { ...data };
        (newData as any)[section][field] = value;
        setData(newData);
    };

    const renderEditorContent = () => {
        const lang = language;
        switch(page) {
            case 'home':
                return (
                    <div className="font-arabic space-y-0">
                        <section className="relative h-[500px] text-white flex items-center overflow-hidden bg-clinical-charcoal">
                            <div className="absolute inset-0 z-0">
                                {heroMode === 'video' && videoUrl ? (
                                    <iframe className="w-full h-full object-cover scale-150 opacity-40" src={videoUrl + "?autoplay=1&mute=1&controls=0&loop=1"} title="Video" />
                                ) : (
                                    carouselImages.map((img, idx) => (
                                        <div key={idx} className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-40' : 'opacity-0'}`} style={{ backgroundImage: `url('${img}')` }} />
                                    ))
                                )}
                            </div>
                            <div className="absolute inset-0 bg-clinical-charcoal/40 z-10"></div>
                            <div className="container mx-auto px-12 z-20 text-start relative">
                                <EditableH1 className="text-5xl font-bold leading-tight !text-white" onChange={v => updateField('home', `hero_title_${lang}`, v)} val={(data.home as any)[`hero_title_${lang}`]} />
                                <EditableH1 className="mt-2 text-2xl font-light !text-white" onChange={v => updateField('home', `hero_subtitle_${lang}`, v)} val={(data.home as any)[`hero_subtitle_${lang}`]} />
                                <EditableP className="mt-4 text-xl opacity-90 max-w-3xl !text-white" onChange={v => updateField('home', `hero_desc_${lang}`, v)} val={(data.home as any)[`hero_desc_${lang}`]} />
                            </div>
                        </section>

                        <section className="py-20 bg-white">
                            <div className="container mx-auto px-12 max-w-4xl text-center">
                                <EditableH1 className="text-3xl font-bold text-gray-900 mb-8 !text-center" onChange={v => updateField('home', `about_title_${lang}`, v)} val={(data.home as any)[`about_title_${lang}`]} />
                                <EditableP className="text-gray-800 leading-relaxed text-lg mb-12 text-center" onChange={v => updateField('home', `about_desc_${lang}`, v)} val={(data.home as any)[`about_desc_${lang}`]} />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 text-start rtl:text-right">
                                    {[1, 2, 3, 4].map(num => (
                                        <div key={num} className="flex items-center gap-3">
                                            <span className="text-med-vital-green text-2xl">✔</span>
                                            <EditableP className="text-gray-900 font-bold" onChange={v => updateField('home', `about_p${num}_${lang}`, v)} val={(data.home as any)[`about_p${num}_${lang}`]} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section className="py-20 bg-sterile-light-grey">
                            <div className="container mx-auto px-12">
                                <EditableH1 className="text-3xl font-bold text-gray-900 mb-16 !text-center" onChange={v => updateField('home', `founder_sec_title_${lang}`, v)} val={(data.home as any)[`founder_sec_title_${lang}`]} />
                                <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                                    <div className="order-2 md:order-1 text-center md:text-start rtl:md:text-right">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{(data.founder as any)[`name_${lang}`]}</h3>
                                        <p className="text-med-tech-blue font-bold mb-6">{(data.founder as any)[`main_title_${lang}`]}</p>
                                        <EditableP className="text-gray-800 leading-relaxed mb-6" onChange={v => updateField('home', `founder_sec_desc_${lang}`, v)} val={(data.home as any)[`founder_sec_desc_${lang}`]} />
                                        <button className="bg-med-tech-blue text-white font-bold py-2.5 px-8 rounded-lg shadow-md cursor-default opacity-80">{t({ar: 'مشاهدة الملف الكامل', en: 'View Full Profile'})}</button>
                                    </div>
                                    <div className="order-1 md:order-2 flex justify-center">
                                        <img src={FOUNDER_DATA_DETAILED.image} alt="Founder" className="w-64 h-64 rounded-full shadow-2xl object-cover border-4 border-white"/>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                );
            case 'about':
                return (
                    <div className="font-arabic">
                        <header className="bg-sterile-light-grey py-20 px-10 text-center rounded-t-[40px]">
                             <EditableH1 className="text-5xl font-bold text-gray-900 !text-center" onChange={v => updateField('about', `h1_${lang}`, v)} val={(data.about as any)[`h1_${lang}`]} />
                             <EditableP className="text-2xl mt-6 text-gray-800 max-w-4xl mx-auto text-center" onChange={v => updateField('about', `subtitle_${lang}`, v)} val={(data.about as any)[`subtitle_${lang}`]} />
                        </header>
                        <div className="container mx-auto px-12 py-16 space-y-24">
                            <section>
                                <div className="text-center mb-12">
                                    <span className="text-5xl">🩺</span>
                                    <EditableH1 className="mt-4 text-3xl font-bold text-gray-900 !text-center" onChange={v => updateField('about', `intro_title_${lang}`, v)} val={(data.about as any)[`intro_title_${lang}`]} />
                                </div>
                                <div className="max-w-4xl mx-auto space-y-8 text-lg text-gray-900 text-center leading-relaxed">
                                    {/* FIX: Removed invalid 'field' prop from EditableP components */}
                                    <EditableP onChange={v => updateField('about', `intro_p1_${lang}`, v)} val={(data.about as any)[`intro_p1_${lang}`]} className="text-center" />
                                    <EditableP onChange={v => updateField('about', `intro_p2_${lang}`, v)} val={(data.about as any)[`intro_p2_${lang}`]} className="text-center" />
                                </div>
                            </section>

                            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                                <div className="bg-white p-10 rounded-xl shadow-lg border-l-8 border-med-tech-blue">
                                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">🎯 <EditableH1 className="text-2xl !text-gray-900" onChange={v => updateField('about', `mission_title_${lang}`, v)} val={(data.about as any)[`mission_title_${lang}`]} /></h3>
                                    <EditableP className="text-med-tech-blue bg-blue-50 p-6 rounded-xl font-bold" onChange={v => updateField('about', `mission_summary_${lang}`, v)} val={(data.about as any)[`mission_summary_${lang}`]} />
                                </div>
                                <div className="bg-white p-10 rounded-xl shadow-lg border-l-8 border-med-tech-blue">
                                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">👁️ <EditableH1 className="text-2xl !text-gray-900" onChange={v => updateField('about', `vision_title_${lang}`, v)} val={(data.about as any)[`vision_title_${lang}`]} /></h3>
                                    <EditableP className="text-gray-800 leading-relaxed" onChange={v => updateField('about', `vision_text_${lang}`, v)} val={(data.about as any)[`vision_text_${lang}`]} />
                                </div>
                            </div>

                            <section className="bg-med-tech-blue text-white rounded-3xl text-center p-16 max-w-5xl mx-auto shadow-2xl">
                                <EditableH1 className="text-4xl font-bold mb-6 !text-center !text-white" onChange={v => updateField('about', `cta_title_${lang}`, v)} val={(data.about as any)[`cta_title_${lang}`]} />
                                <EditableP className="text-xl max-w-2xl mx-auto text-gray-200 text-center mb-10 !text-white" onChange={v => updateField('about', `cta_desc_${lang}`, v)} val={(data.about as any)[`cta_desc_${lang}`]} />
                                <div className="inline-block">
                                    <EditableH1 className="bg-med-vital-green text-white font-black py-4 px-12 rounded-xl text-xl !text-center shadow-lg hover:bg-green-700 transition-all !text-white" onChange={v => updateField('about', `cta_btn_${lang}`, v)} val={(data.about as any)[`cta_btn_${lang}`]} />
                                </div>
                            </section>
                        </div>
                    </div>
                );
            case 'founder':
                return (
                    <div className="font-arabic">
                         <div className="bg-med-light-blue pt-20 text-center rounded-t-[40px] pb-32">
                             <div className="w-48 h-48 rounded-full bg-white mx-auto mb-8 shadow-2xl ring-8 ring-white/50 overflow-hidden">
                                 <img src={FOUNDER_DATA_DETAILED.image} className="w-full h-full object-cover" alt="Founder" />
                             </div>
                             <EditableH1 className="text-5xl font-black text-med-blue !text-center mb-4" onChange={v => updateField('founder', `name_${lang}`, v)} val={(data.founder as any)[`name_${lang}`]} />
                             <EditableH1 className="text-2xl text-med-sky font-bold !text-center opacity-80" onChange={v => updateField('founder', `main_title_${lang}`, v)} val={(data.founder as any)[`main_title_${lang}`]} />
                         </div>
                         <div className="container mx-auto px-12 -mt-20">
                            <div className="grid lg:grid-cols-3 gap-12">
                                <div className="lg:col-span-2">
                                    <div className="bg-white p-12 md:p-20 rounded-[40px] shadow-2xl relative z-10 border border-gray-100 mb-12">
                                        <h4 className="text-3xl font-black text-gray-900 mb-8 border-b-4 border-med-light-blue pb-4 w-fit"><EditableH1 className="!text-gray-900" onChange={v => updateField('founder', `intro_title_${lang}`, v)} val={(data.founder as any)[`intro_title_${lang}`]} /></h4>
                                        <EditableP className="text-2xl leading-relaxed text-gray-900 font-medium mb-12" onChange={v => updateField('founder', `intro_${lang}`, v)} val={(data.founder as any)[`intro_${lang}`]} />
                                        <blockquote className="bg-blue-50 border-r-8 border-med-sky p-10 rounded-2xl italic rtl:border-r-0 rtl:border-l-8">
                                            <EditableP className="text-2xl text-gray-900 leading-relaxed mb-4" onChange={v => updateField('founder', `quote_${lang}`, v)} val={(data.founder as any)[`quote_${lang}`]} />
                                            <cite className="block text-right font-black text-med-blue not-italic text-xl">
                                                {language === 'ar' ? `— ${data.founder.name_ar}` : `— ${data.founder.name_en}`}
                                            </cite>
                                        </blockquote>
                                    </div>
                                    
                                    <div className="space-y-20 pb-20">
                                        <section>
                                            <h2 className="text-3xl font-black text-med-blue mb-10 border-b-2 border-gray-100 pb-4 flex items-center gap-4">
                                                <span className="bg-med-blue text-white w-10 h-10 rounded-lg flex items-center justify-center text-sm">🏥</span>
                                                <EditableH1 className="flex-1 !text-med-blue" onChange={v => updateField('founder', `exp_title_${lang}`, v)} val={(data.founder as any)[`exp_title_${lang}`]} />
                                            </h2>
                                            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200">
                                                <EditableH1 className="text-2xl font-black text-gray-900 mb-6" onChange={v => updateField('founder', `exp_current_title_${lang}`, v)} val={(data.founder as any)[`exp_current_title_${lang}`]} />
                                                <ul className="space-y-4 opacity-50 pointer-events-none">
                                                    <li className="flex gap-3 text-gray-800">🔹 <span>Senior Consultant Neonatologist at Latifa Hospital</span></li>
                                                    <li className="flex gap-3 text-gray-800">🔹 <span>Head of the Continuing Medical Education Committee</span></li>
                                                </ul>
                                            </div>
                                        </section>
                                        <section>
                                            <h2 className="text-3xl font-black text-med-blue mb-10 border-b-2 border-gray-100 pb-4 flex items-center gap-4">
                                                <span className="bg-med-vital-green text-white w-10 h-10 rounded-lg flex items-center justify-center text-sm">🎓</span>
                                                <EditableH1 className="flex-1 !text-med-blue" onChange={v => updateField('founder', `academic_title_${lang}`, v)} val={(data.founder as any)[`academic_title_${lang}`]} />
                                            </h2>
                                            <EditableP className="text-xl text-gray-900 leading-relaxed mb-8 bg-sterile-light-grey/30 p-8 rounded-3xl" onChange={v => updateField('founder', `academic_summary_${lang}`, v)} val={(data.founder as any)[`academic_summary_${lang}`]} />
                                        </section>
                                    </div>
                                </div>
                                <div className="lg:col-span-1">
                                    <div className="bg-gray-50 p-10 rounded-[40px] shadow-sm border border-gray-200 sticky top-24">
                                        <h3 className="text-2xl font-black text-med-blue mb-8 border-b pb-4"><EditableH1 className="!text-med-blue" onChange={v => updateField('founder', `profile_title_${lang}`, v)} val={(data.founder as any)[`profile_title_${lang}`]} /></h3>
                                        <div className="space-y-8">
                                            {[1, 2, 3, 4].map(num => (
                                                <div key={num}>
                                                    <strong className="text-gray-500 block text-xs uppercase tracking-widest mb-2">{(data.founder as any)[`profile_item${num}_label_${lang}`]}</strong>
                                                    <EditableP className="text-gray-900 font-bold text-lg" onChange={v => updateField('founder', `profile_item${num}_val_${lang}`, v)} val={(data.founder as any)[`profile_item${num}_val_${lang}`]} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                         </div>
                    </div>
                );
            case 'contact':
                return (
                    <div className="font-arabic">
                        <header className="bg-sterile-light-grey py-24 px-10 text-center rounded-t-[40px]">
                             <EditableH1 className="text-5xl font-black text-gray-900 !text-center leading-tight mb-6" onChange={v => updateField('contact', `h1_${lang}`, v)} val={(data.contact as any)[`h1_${lang}`]} />
                             <EditableP className="text-xl text-gray-800 max-w-3xl mx-auto text-center leading-relaxed" onChange={v => updateField('contact', `intro_${lang}`, v)} val={(data.contact as any)[`intro_${lang}`]} />
                        </header>
                        <div className="container mx-auto px-12 py-24">
                            <section className="mb-24 text-center">
                                <div className="inline-block p-4 bg-blue-50 rounded-full mb-6">
                                    <span className="text-6xl">💬</span>
                                </div>
                                <h2 className="text-4xl font-black text-gray-900 mb-12"><EditableH1 className="!text-center !text-gray-900" onChange={v => updateField('contact', `why_title_${lang}`, v)} val={(data.contact as any)[`why_title_${lang}`]} /></h2>
                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {[1, 2, 3, 4].map(num => (
                                        <div key={num} className="bg-white p-8 rounded-3xl shadow-lg border-t-8 border-med-tech-blue text-start rtl:text-right">
                                            <EditableH1 className="text-xl font-bold text-gray-900 mb-6" onChange={v => updateField('contact', `why_p${num}_title_${lang}`, v)} val={(data.contact as any)[`why_p${num}_title_${lang}`]} />
                                            <div className="space-y-4">
                                                <div className="flex gap-2">
                                                    <span className="text-med-tech-blue mt-1">🔹</span>
                                                    <EditableP className="text-sm text-gray-700" onChange={v => updateField('contact', `why_p${num}_i1_${lang}`, v)} val={(data.contact as any)[`why_p${num}_i1_${lang}`]} />
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="text-med-tech-blue mt-1">🔹</span>
                                                    <EditableP className="text-sm text-gray-700" onChange={v => updateField('contact', `why_p${num}_i2_${lang}`, v)} val={(data.contact as any)[`why_p${num}_i2_${lang}`]} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                            <section className="bg-gray-50 p-12 md:p-20 rounded-[50px] border border-gray-200 shadow-xl">
                                <h2 className="text-4xl font-black text-gray-900 mb-6"><EditableH1 className="!text-gray-900" onChange={v => updateField('contact', `form_title_${lang}`, v)} val={(data.contact as any)[`form_title_${lang}`]} /></h2>
                                <EditableP className="text-xl text-gray-700 mb-12" onChange={v => updateField('contact', `form_intro_${lang}`, v)} val={(data.contact as any)[`form_intro_${lang}`]} />
                                <div className="grid md:grid-cols-2 gap-10 opacity-30 pointer-events-none">
                                    <div className="h-16 bg-white border-2 border-gray-300 rounded-2xl"></div>
                                    <div className="h-16 bg-white border-2 border-gray-300 rounded-2xl"></div>
                                    <div className="h-16 bg-white border-2 border-gray-300 rounded-2xl md:col-span-2"></div>
                                    <div className="h-40 bg-white border-2 border-gray-300 rounded-2xl md:col-span-2"></div>
                                </div>
                            </section>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-gray-900/95 backdrop-blur-xl flex flex-col overflow-hidden">
            <header className="bg-white border-b p-5 flex justify-between items-center shadow-2xl relative z-10">
                <div className="flex items-center gap-8">
                    <button onClick={onClose} className="bg-gray-100 p-3 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all group">
                        <svg className="w-8 h-8 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-med-blue uppercase tracking-tighter">{t({ar: 'محرر الصفحات المباشر', en: 'Live Page Editor'})}</h2>
                        <div className="flex items-center gap-2">
                             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                             <p className="text-xs text-gray-400 font-black tracking-widest">{page.toUpperCase()} • 100% REPLICA MODE</p>
                        </div>
                    </div>
                    <div className="flex bg-gray-100 rounded-2xl p-1.5 shadow-inner border border-gray-200">
                        <button onClick={() => setLanguage('en')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${language === 'en' ? 'bg-white text-med-tech-blue shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>ENGLISH</button>
                        <button onClick={() => setLanguage('ar')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${language === 'ar' ? 'bg-white text-med-tech-blue shadow-md' : 'text-gray-400'}`}>العربية</button>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right hidden xl:block">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Status</p>
                        <p className="text-xs font-bold text-gray-500">{t({ar: 'تغييرات غير محفوظة', en: 'Unsaved Local Changes'})}</p>
                    </div>
                    <button onClick={onSave} className="bg-med-vital-green text-white px-12 py-3.5 rounded-2xl font-black hover:bg-green-700 shadow-xl transition-all transform hover:-translate-y-1 active:scale-95">
                        {t({ar: 'حفظ المسودة', en: 'Save Draft'})}
                    </button>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-12 bg-clinical-charcoal/10 custom-scrollbar">
                <div className="max-w-6xl mx-auto shadow-[0_50px_100px_rgba(0,0,0,0.3)] bg-white min-h-[90vh] rounded-[60px] overflow-hidden border border-white/40 ring-1 ring-black/5">
                    <div className="p-0 transition-all duration-500" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {renderEditorContent()}
                    </div>
                </div>
            </main>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(20, 99, 190, 0.2); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(20, 99, 190, 0.4); }
            `}</style>
        </div>
    );
};

const SettingsTab: React.FC = () => {
    const { showToast } = useToast();
    const { t, config, updateConfig } = useLocalization();
    
    const [gitToken, setGitToken] = useState(() => localStorage.getItem('git_token') || '');
    const [gitOwner, setGitOwner] = useState(() => localStorage.getItem('git_owner') || '');
    const [gitRepo, setGitRepo] = useState(() => localStorage.getItem('git_repo') || '');

    const [eventsCount, setEventsCount] = useState(5);
    const [articlesCount, setArticlesCount] = useState(5);
    const [savingSettings, setSavingSettings] = useState(false);

    const [isVisualEditorOpen, setIsVisualEditorOpen] = useState(false);
    const [activePage, setActivePage] = useState<StaticPage>('home');
    const [localConfig, setLocalConfig] = useState<SiteConfig | null>(null);

    useEffect(() => {
        if (config) setLocalConfig(JSON.parse(JSON.stringify(config)));
    }, [config]);

    useEffect(() => {
        const loadHomeSettings = async () => {
            try {
                const res = await api.getHomeSettings();
                const data = res.data || res;
                if (data) {
                    setEventsCount(data.events_number || 5);
                    setArticlesCount(data.posts_number || 5);
                }
            } catch (e) { console.warn("Could not load home settings"); }
        };
        loadHomeSettings();
    }, []);

    const handleSaveGitSettings = () => {
        localStorage.setItem('git_token', gitToken);
        localStorage.setItem('git_owner', gitOwner);
        localStorage.setItem('git_repo', gitRepo);
        showToast(t({ar: 'تم حفظ إعدادات المزامنة', en: 'Sync settings saved'}), 'success');
    };

    const handleSaveHomeSettings = async () => {
        setSavingSettings(true);
        try {
            await api.updateHomeSettings(eventsCount, articlesCount);
            showToast(t({ar: 'تم تحديث أعداد العرض', en: 'Display counts updated'}), 'success');
        } catch (e) {
            showToast(t({ar: 'فشل تحديث الإعدادات', en: 'Failed to update settings'}), 'error');
        } finally {
            setSavingSettings(false);
        }
    };

    const handleSaveAllToGit = async () => {
        if (!localConfig) return;
        if (!gitToken || !gitOwner || !gitRepo) {
            showToast(t({ar: 'يرجى إكمال إعدادات GitHub للمزامنة', en: 'Please complete GitHub settings to sync'}), 'error');
            return;
        }

        try {
            await api.updateGitConfig(gitToken, gitOwner, gitRepo, localConfig);
            updateConfig(localConfig);
            showToast(t({ar: 'تم النشر بنجاح!', en: 'Published successfully!'}), 'success');
        } catch (e) {
            showToast(t({ar: 'فشل النشر على GitHub', en: 'Failed to publish to GitHub'}), 'error');
        }
    };

    const inputClass = "w-full p-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:ring-4 focus:ring-blue-500/10 focus:border-med-tech-blue outline-none transition-all shadow-sm";

    if (!localConfig) return null;

    return (
        <div className="space-y-10 pb-20">
            {isVisualEditorOpen && (
                <VisualEditor 
                    page={activePage} 
                    data={localConfig} 
                    setData={setLocalConfig}
                    onClose={() => setIsVisualEditorOpen(false)}
                    onSave={() => { setIsVisualEditorOpen(false); showToast('Draft saved in memory. Push to GitHub to go live.', 'info'); }}
                />
            )}

            {/* SYNC CARD */}
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
                <h3 className="text-2xl font-black mb-8 text-med-blue flex items-center gap-3">
                    <span className="w-2.5 h-10 bg-black rounded-full"></span>
                    {t({ar: 'مزامنة المحتوى (GitHub Sync)', en: 'GitHub Content Sync'})}
                </h3>
                <div className="grid md:grid-cols-3 gap-8 mb-8">
                    <InputGroup label="Personal Access Token">
                        <input type="password" className={inputClass} value={gitToken} onChange={e => setGitToken(e.target.value)} placeholder="ghp_..." />
                    </InputGroup>
                    <InputGroup label="Owner">
                        <input className={inputClass} value={gitOwner} onChange={e => setGitOwner(e.target.value)} placeholder="github_user" />
                    </InputGroup>
                    <InputGroup label="Repository">
                        <input className={inputClass} value={gitRepo} onChange={e => setGitRepo(e.target.value)} placeholder="medpulse-site" />
                    </InputGroup>
                </div>
                <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-50">
                    <button onClick={handleSaveGitSettings} className="bg-clinical-charcoal text-white px-10 py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-95">
                        {t({ar: 'حفظ الإعدادات محلياً', en: 'Save locally'})}
                    </button>
                    <button onClick={handleSaveAllToGit} className="bg-med-vital-green text-white px-12 py-4 rounded-2xl font-black hover:bg-green-700 shadow-xl transition-all transform hover:-translate-y-1 active:scale-95">
                        {t({ar: 'نشر التغييرات فوراً (Push)', en: 'Push to Live Site'})}
                    </button>
                </div>
            </div>

            {/* DISPLAY COUNTS CARD */}
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
                <h3 className="text-2xl font-black mb-8 text-med-blue flex items-center gap-3">
                    <span className="w-2.5 h-10 bg-med-tech-blue rounded-full"></span>
                    {t({ar: 'إعدادات عرض الصفحة الرئيسية', en: 'Home Display Settings'})}
                </h3>
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <InputGroup label={t({ar: 'عدد المؤتمرات', en: 'Events Per Page'})}>
                        <input type="number" className={inputClass} value={eventsCount} onChange={e => setEventsCount(Number(e.target.value))} />
                    </InputGroup>
                    <InputGroup label={t({ar: 'عدد المقالات', en: 'Articles Per Page'})}>
                        <input type="number" className={inputClass} value={articlesCount} onChange={e => setArticlesCount(Number(e.target.value))} />
                    </InputGroup>
                </div>
                <button onClick={handleSaveHomeSettings} disabled={savingSettings} className="bg-med-tech-blue text-white px-12 py-4 rounded-2xl font-black hover:bg-blue-800 transition-all shadow-xl active:scale-95">
                    {savingSettings ? t({ar: 'جاري الحفظ...', en: 'Saving...'}) : t({ar: 'تحديث أعداد العرض', en: 'Update Counts'})}
                </button>
            </div>

            {/* VISUAL EDITOR CARD */}
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
                <h3 className="text-2xl font-black mb-8 text-med-blue flex items-center gap-3">
                    <span className="w-2.5 h-10 bg-med-vital-green rounded-full"></span>
                    {t({ar: 'المحرر البصري للصفحات (100% ريبريكا)', en: 'Full Page Visual Editor'})}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { id: 'home', label: {ar: 'الرئيسية', en: 'Home'}, icon: '🏠', color: 'bg-blue-50' },
                        { id: 'about', label: {ar: 'عن المنصة', en: 'About'}, icon: '🏢', color: 'bg-green-50' },
                        { id: 'founder', label: {ar: 'المؤسس', en: 'Founder'}, icon: '👨‍⚕️', color: 'bg-indigo-50' },
                        { id: 'contact', label: {ar: 'اتصل بنا', en: 'Contact'}, icon: '📞', color: 'bg-orange-50' },
                    ].map(page => (
                        <button 
                            key={page.id}
                            onClick={() => { setActivePage(page.id as StaticPage); setIsVisualEditorOpen(true); }}
                            className={`flex flex-col items-center justify-center p-10 rounded-[40px] border border-gray-100 hover:shadow-2xl transition-all hover:-translate-y-2 group ${page.color}`}
                        >
                            <span className="text-6xl mb-6 group-hover:scale-110 transition-transform">{page.icon}</span>
                            <span className="font-black text-lg text-gray-900">{t(page.label)}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* TYPOGRAPHY CARD */}
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
                <h3 className="text-2xl font-black mb-8 text-med-blue flex items-center gap-3">
                    <span className="w-2.5 h-10 bg-med-tech-blue rounded-full"></span>
                    {t({ar: 'الخطوط العالمية', en: 'Global Typography'})}
                </h3>
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <h4 className="font-black border-b-4 border-gray-50 pb-3 text-gray-400 uppercase tracking-widest text-sm">Arabic Settings</h4>
                        <InputGroup label="Headings Font">
                            <select className={inputClass} value={localConfig.fonts.ar.headings} onChange={e => setLocalConfig({...localConfig, fonts: {...localConfig.fonts, ar: {...localConfig.fonts.ar, headings: e.target.value}}})}>
                                {ARABIC_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </InputGroup>
                        <InputGroup label="Body Font">
                            <select className={inputClass} value={localConfig.fonts.ar.body} onChange={e => setLocalConfig({...localConfig, fonts: {...localConfig.fonts, ar: {...localConfig.fonts.ar, body: e.target.value}}})}>
                                {ARABIC_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </InputGroup>
                    </div>
                    <div className="space-y-6">
                        <h4 className="font-black border-b-4 border-gray-50 pb-3 text-gray-400 uppercase tracking-widest text-sm">English Settings</h4>
                        <InputGroup label="Headings Font">
                            <select className={inputClass} value={localConfig.fonts.en.headings} onChange={e => setLocalConfig({...localConfig, fonts: {...localConfig.fonts, en: {...localConfig.fonts.en, headings: e.target.value}}})}>
                                {ENGLISH_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </InputGroup>
                        <InputGroup label="Body Font">
                            <select className={inputClass} value={localConfig.fonts.en.body} onChange={e => setLocalConfig({...localConfig, fonts: {...localConfig.fonts, en: {...localConfig.fonts.en, body: e.target.value}}})}>
                                {ENGLISH_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </InputGroup>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsTab;