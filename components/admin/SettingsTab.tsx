
import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../../hooks/useToast';
import { useLocalization } from '../../hooks/useLocalization';
import { api, DOMAIN } from '../../services/api';
import InputGroup from './InputGroup';
import type { SiteConfig, SEOConfig } from '../../types';
import { FOUNDER_DATA_DETAILED, ABOUT_PAGE_DETAILED_CONTENT } from '../../constants';
import IconEditor from './IconEditor';
import RichTextEditor from './RichTextEditor';

type StaticPage = 'home' | 'about' | 'founder' | 'contact';

// Mapping local keys to DB Titles
const DATABASE_PAGE_MAP: Record<string, string> = {
    home: 'home',
    about: 'about us',
    founder: 'founder',
    contact: 'contact us',
    conferences: 'conferences',
    articles: 'articles',
    experts: 'experts'
};

const EditableH1 = ({ val, onChange, className = "", placeholder }: { val: string; onChange: (v: string) => void; className?: string; placeholder?: string }) => (
    <input 
        className={`bg-transparent border-b border-dashed border-gray-400 hover:border-blue-400 focus:border-blue-600 focus:outline-none w-full text-gray-900 font-inherit ${className}`}
        value={val || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
    />
);

const EditableP = ({ val, onChange, className = "", placeholder }: { val: string; onChange: (v: string) => void; className?: string; placeholder?: string }) => (
    <textarea 
        rows={1}
        className={`bg-transparent border-b border-dashed border-gray-400 hover:border-blue-400 focus:border-blue-600 focus:outline-none w-full resize-none overflow-hidden text-gray-900 font-inherit ${className}`}
        value={val || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onInput={(e: any) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
        }}
    />
);

const VisualEditor: React.FC<{ 
    page: StaticPage; 
    data: SiteConfig; 
    setData: React.Dispatch<React.SetStateAction<SiteConfig | null>>; 
    onClose: () => void; 
    onSave: () => void;
}> = ({ page, data, setData, onClose, onSave }) => {
    const { t, language, setLanguage } = useLocalization();
    const { showToast } = useToast();
    
    const [heroMode, setHeroMode] = useState<'images' | 'video'>('images');
    const [carouselImages, setCarouselImages] = useState<string[]>(['https://picsum.photos/seed/bg/1200/800']);
    const [videoUrl, setVideoUrl] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [uploadingImage, setUploadingImage] = useState(false);

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
                        setCarouselImages(settings.images.map((img: any) => api.resolveImageUrl(`${img.base_url}${img.name}`)));
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
        setData(prev => {
            if (!prev) return prev;
            return { 
                ...prev, 
                [section]: { 
                    ...(prev[section] as any), 
                    [field]: value 
                } 
            };
        });
    };

    const addListItem = (section: string, defaultCard: any) => {
        const targetPage = page === 'home' ? 'home' : (page === 'founder' ? 'founder' : (page === 'contact' ? 'contact' : 'about'));
        setData(prev => {
            if (!prev) return prev;
            const updatedSection = [...((prev[targetPage] as any)[section] || []), defaultCard];
            return {
                ...prev,
                [targetPage]: {
                    ...(prev[targetPage] as any),
                    [section]: updatedSection
                }
            };
        });
    };

    const removeListItem = (section: string, index: number) => {
        const targetPage = page === 'home' ? 'home' : (page === 'founder' ? 'founder' : (page === 'contact' ? 'contact' : 'about'));
        setData(prev => {
            if (!prev) return prev;
            const updatedSection = [...(prev[targetPage] as any)[section]];
            updatedSection.splice(index, 1);
            return {
                ...prev,
                [targetPage]: {
                    ...(prev[targetPage] as any),
                    [section]: updatedSection
                }
            };
        });
    };

    const updateListItemField = (section: string, index: number, field: string, value: any) => {
        const targetPage = page === 'home' ? 'home' : (page === 'founder' ? 'founder' : (page === 'contact' ? 'contact' : 'about'));
        setData(prev => {
            if (!prev) return prev;
            const updatedSection = [...(prev[targetPage] as any)[section]];
            updatedSection[index] = { ...updatedSection[index], [field]: value };
            return {
                ...prev,
                [targetPage]: {
                    ...(prev[targetPage] as any),
                    [section]: updatedSection
                }
            };
        });
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // FIX: Explicitly cast files to File[] to fix type errors on line 154 and 173
        const files = Array.from(e.target.files || []) as File[];
        if (files.length === 0) return;

        // Visual feedback: create local blobs
        const localItems = files.map(file => ({
            url: URL.createObjectURL(file),
            id: -1, // Temporary flag
            uploading: true
        }));

        setData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                founder: {
                    ...prev.founder,
                    gallery: [...(prev.founder.gallery || []), ...localItems]
                }
            };
        });

        setUploadingImage(true);
        try {
            // Upload multiple images
            const res = await api.uploadImages(files, 'profile');
            const uploadedImages = res.data || []; // Expecting array from POST response
            
            setData(prev => {
                if (!prev) return prev;
                const gallery = [...prev.founder.gallery];
                
                // Replace the temporary blobs with permanent server paths and IDs
                let uploadedIdx = 0;
                const finalGallery = gallery.map(item => {
                    if (item.id === -1 && uploadedImages[uploadedIdx]) {
                        const uploaded = uploadedImages[uploadedIdx++];
                        const relativePath = uploaded.url.replace(/^https?:\/\/[^\/]+/, '');
                        return { url: relativePath, id: uploaded.id };
                    }
                    return item;
                });

                return {
                    ...prev,
                    founder: { ...prev.founder, gallery: finalGallery }
                };
            });
            showToast(t({ar: 'تم رفع الصور بنجاح', en: 'Images uploaded successfully'}), 'success');
        } catch (error: any) {
            // Remove failed local previews
            setData(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    founder: {
                        ...prev.founder,
                        gallery: prev.founder.gallery.filter((item: any) => item.id !== -1)
                    }
                };
            });
            showToast(t({ar: 'فشل رفع بعض الصور.', en: 'Failed to upload some images.'}), 'error');
        } finally {
            setUploadingImage(false);
            e.target.value = ''; 
        }
    };

    const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const localPreview = URL.createObjectURL(file);
        const prevImageData = data.founder.main_image;

        setData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                founder: { ...prev.founder, main_image: localPreview }
            };
        });

        setUploadingImage(true);
        try {
            // Delete previous image automatically if we have an ID for it
            if (prevImageData && typeof prevImageData === 'object' && prevImageData.id) {
                try {
                    await api.deleteImage(prevImageData.id);
                } catch (delError) {
                    console.warn("Failed to delete previous founder image during update", delError);
                }
            }

            const res = await api.uploadImage(file, 'profile');
            const imageData = res.data?.[0];
            
            if (imageData && imageData.url) {
                const fullUrl = imageData.url;
                const relativePath = fullUrl.replace(/^https?:\/\/[^\/]+/, '');

                setData(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        founder: { 
                            ...prev.founder, 
                            main_image: { url: relativePath, id: imageData.id } 
                        }
                    };
                });
                showToast(t({ar: 'تم تحديث الصورة الشخصية بنجاح', en: 'Profile picture updated successfully'}), 'success');
            }
        } catch (error: any) {
            showToast(t({ar: 'فشل تحديث الصورة الشخصية.', en: 'Failed to update profile picture.'}), 'error');
            // Revert on failure
            setData(prev => prev ? { ...prev, founder: { ...prev.founder, main_image: prevImageData } } : prev);
        } finally {
            setUploadingImage(false);
            e.target.value = ''; 
        }
    };

    const handleGalleryItemDelete = async (idx: number) => {
        const item = data.founder.gallery[idx];
        if (!item) return;

        // If it's a new object structure with an ID, call the API
        if (typeof item === 'object' && item.id && item.id !== -1) {
            try {
                await api.deleteImage(item.id);
                showToast(t({ar: 'تم حذف الصورة بنجاح', en: 'Image deleted successfully'}), 'success');
            } catch (error) {
                console.error("Failed to delete image from gallery API", error);
                showToast(t({ar: 'فشل حذف الصورة من الخادم', en: 'Failed to delete image from server'}), 'error');
                return;
            }
        }

        // Local deletion
        setData(prev => {
            if (!prev) return prev;
            const gallery = [...prev.founder.gallery];
            gallery.splice(idx, 1);
            return { ...prev, founder: { ...prev.founder, gallery } };
        });
    };

    const renderEditorContent = () => {
        const lang = language;
        const founder = data.founder;
        
        if (page === 'home') {
            const h = data.home;
            const previewFounderImg = api.resolveImageUrl(data.founder?.main_image, FOUNDER_DATA_DETAILED.image);
            
            return (
                <div className="font-arabic space-y-0">
                    <section className="relative h-[400px] text-white flex items-center overflow-hidden bg-clinical-charcoal">
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
                            <EditableH1 className="text-4xl font-bold leading-tight !text-white" onChange={v => updateField('home', `hero_title_${lang}`, v)} val={(h as any)[`hero_title_${lang}`]} />
                            <EditableH1 className="mt-2 text-xl font-light !text-white" onChange={v => updateField('home', `hero_subtitle_${lang}`, v)} val={(h as any)[`hero_subtitle_${lang}`]} />
                            <EditableP className="mt-4 text-lg opacity-90 max-w-3xl !text-white" onChange={v => updateField('home', `hero_desc_${lang}`, v)} val={(h as any)[`hero_desc_${lang}`]} />
                            <div className="mt-6 flex gap-4">
                                <EditableH1 className="bg-med-vital-green px-6 py-2 rounded font-bold !text-white w-auto" onChange={v => updateField('home', `hero_btn1_${lang}`, v)} val={(h as any)[`hero_btn1_${lang}`]} />
                                <EditableH1 className="bg-med-tech-blue px-6 py-2 rounded font-bold !text-white w-auto" onChange={v => updateField('home', `hero_btn2_${lang}`, v)} val={(h as any)[`hero_btn2_${lang}`]} />
                            </div>
                        </div>
                    </section>

                    <section className="py-12 bg-white">
                        <div className="container mx-auto px-12 max-w-4xl text-center">
                            <EditableH1 className="text-2xl font-bold text-gray-900 mb-8 !text-center" onChange={v => updateField('home', `about_title_${lang}`, v)} val={(h as any)[`about_title_${lang}`]} />
                            <EditableP className="text-gray-800 leading-relaxed text-lg mb-12 text-center" onChange={v => updateField('home', `about_desc_${lang}`, v)} val={(h as any)[`about_desc_${lang}`]} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 text-start rtl:text-right">
                                {(h.about_items || []).map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 group relative">
                                        <button onClick={() => removeListItem('about_items', idx)} className="absolute -top-4 -left-4 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">&times;</button>
                                        <IconEditor val={item.icon || '✔'} onChange={v => updateListItemField('about_items', idx, 'icon', v)} size="sm" />
                                        <EditableP className="text-gray-900 font-bold" onChange={v => updateListItemField('about_items', idx, `text_${lang}`, v)} val={(item as any)[`text_${lang}`]} />
                                    </div>
                                ))}
                                <button onClick={() => addListItem('about_items', { icon: '✔', text_ar: '', text_en: '' })} className="text-med-tech-blue font-bold p-2 border-2 border-dashed border-gray-100 rounded-lg hover:bg-blue-50">+ Add Point</button>
                            </div>
                        </div>
                    </section>

                    <section className="py-12 bg-sterile-light-grey">
                        <div className="container mx-auto px-12">
                            <EditableH1 className="text-2xl font-bold text-gray-900 mb-8 !text-center" onChange={v => updateField('home', `mv_title_${lang}`, v)} val={(h as any)[`mv_title_${lang}`]} />
                            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                                <div className="bg-white p-8 rounded-lg shadow-lg text-center border-t-4 border-med-tech-blue flex flex-col">
                                    <div className="mb-4">
                                        <IconEditor val={h.mission_icon || '🎯'} onChange={v => updateField('home', 'mission_icon', v)} size="sm" />
                                    </div>
                                    <EditableH1 className="text-xl font-bold text-clinical-charcoal mb-4 !text-center" onChange={v => updateField('home', `mission_title_${lang}`, v)} val={(h as any)[`mission_title_${lang}`]} />
                                    <RichTextEditor 
                                        height="200px"
                                        className="mt-1 flex-grow"
                                        value={(h as any)[`mission_text_${lang}`] || ''}
                                        onChange={v => updateField('home', `mission_text_${lang}`, v)}
                                        placeholder="Our Mission text (supports bullet points)..."
                                    />
                                    <div className="mt-4 bg-sterile-light-grey p-3 rounded-md">
                                        <EditableP className="!text-med-tech-blue font-bold text-center" placeholder="Mission summary (shaded part)..." onChange={v => updateField('home', `mission_summary_${lang}`, v)} val={(h as any)[`mission_summary_${lang}`]} />
                                    </div>
                                </div>
                                <div className="bg-white p-8 rounded-lg shadow-lg text-center border-t-4 border-med-tech-blue flex flex-col">
                                    <div className="mb-4">
                                        <IconEditor val={h.vision_icon || '👁️'} onChange={v => updateField('home', 'vision_icon', v)} size="sm" />
                                    </div>
                                    <EditableH1 className="text-xl font-bold text-clinical-charcoal mb-4 !text-center" onChange={v => updateField('home', `vision_title_${lang}`, v)} val={(h as any)[`vision_title_${lang}`]} />
                                    <RichTextEditor 
                                        height="200px"
                                        className="mt-1 flex-grow"
                                        value={(h as any)[`vision_text_${lang}`] || ''}
                                        onChange={v => updateField('home', `vision_text_${lang}`, v)}
                                        placeholder="Our Vision text (supports bullet points)..."
                                    />
                                    <div className="mt-4 bg-sterile-light-grey p-3 rounded-md">
                                        <EditableP className="!text-med-tech-blue font-bold text-center" placeholder="Vision summary (shaded part)..." onChange={v => updateField('home', `vision_summary_${lang}`, v)} val={(h as any)[`vision_summary_${lang}`]} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="py-12 bg-white">
                        <div className="container mx-auto px-12">
                            <EditableH1 className="text-2xl font-bold text-gray-900 mb-4 !text-center" onChange={v => updateField('home', `why_title_${lang}`, v)} val={(h as any)[`why_title_${lang}`]} />
                            <EditableP className="text-gray-600 mb-12 text-center max-w-3xl mx-auto" onChange={v => updateField('home', `why_desc_${lang}`, v)} val={(h as any)[`why_desc_${lang}`]} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
                                {(h.why_items || []).map((item, idx) => (
                                    <div key={idx} className="text-center p-6 bg-white rounded-lg shadow-md border border-gray-100 flex flex-col items-center group relative">
                                        <button onClick={() => removeListItem('why_items', idx)} className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">&times;</button>
                                        <IconEditor val={item.icon} onChange={v => updateListItemField('why_items', idx, 'icon', v)} size="sm" />
                                        <EditableH1 className="font-bold text-lg text-gray-900 mt-4 mb-2 !text-center" onChange={v => updateListItemField('why_items', idx, `title_${lang}`, v)} val={(item as any)[`title_${lang}`]} />
                                        <RichTextEditor 
                                            height="120px"
                                            className="w-full mt-2"
                                            value={(item as any)[`desc_${lang}`] || ''}
                                            onChange={v => updateListItemField('why_items', idx, `desc_${lang}`, v)}
                                            placeholder="Card Description..."
                                        />
                                    </div>
                                ))}
                                <button onClick={() => addListItem('why_items', { icon: '✨', title_ar: '', title_en: '', desc_ar: '', desc_en: '' })} className="border-2 border-dashed border-gray-100 rounded-lg p-6 hover:bg-gray-50 text-med-tech-blue font-bold">+ Add Card</button>
                            </div>
                        </div>
                    </section>

                    <section className="py-12 bg-gray-50">
                        <div className="container mx-auto px-12">
                            <EditableH1 className="text-2xl font-bold text-gray-900 mb-4 !text-center" onChange={v => updateField('home', `how_title_${lang}`, v)} val={(h as any)[`how_title_${lang}`]} />
                            <EditableP className="text-gray-600 mb-12 text-center max-w-3xl mx-auto" onChange={v => updateField('home', `how_desc_${lang}`, v)} val={(h as any)[`how_desc_${lang}`]} />
                            
                            <div className="relative max-w-2xl mx-auto py-8">
                                <div className="absolute left-1/2 -translate-x-1/2 h-full w-1 bg-gray-200 rounded-full"></div>
                                {(h.how_steps || []).map((step, idx) => (
                                    <div key={idx} className={`flex items-start mb-8 relative group ${idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                                        <button onClick={() => removeListItem('how_steps', idx)} className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center shadow-lg">&times;</button>
                                        <div className="absolute left-1/2 -translate-x-1/2 mt-1 w-8 h-8 bg-med-tech-blue rounded-full border-4 border-white flex items-center justify-center text-white font-bold shadow-sm z-10">{idx + 1}</div>
                                        <div className={`bg-white p-5 rounded-xl shadow-md w-5/12 border-t-2 border-med-tech-blue transition-transform hover:-translate-y-1`}>
                                            <EditableH1 className="font-bold text-lg text-clinical-charcoal !text-start mb-2" onChange={v => updateListItemField('how_steps', idx, `title_${lang}`, v)} val={(step as any)[`title_${lang}`]} placeholder="Step Title" />
                                            <RichTextEditor 
                                                height="100px"
                                                className="mt-2"
                                                value={(step as any)[`desc_${lang}`] || ''}
                                                onChange={v => updateListItemField('how_steps', idx, `desc_${lang}`, v)}
                                                placeholder="Step Description..."
                                            />
                                        </div>
                                    </div>
                                ))}
                                <div className="flex justify-center mt-10">
                                    <button onClick={() => addListItem('how_steps', { title_ar: '', title_en: '', desc_ar: '', desc_en: '' })} className="bg-white border-2 border-dashed border-gray-300 text-med-tech-blue font-bold px-8 py-3 rounded-xl hover:border-med-tech-blue hover:bg-blue-50 transition-all shadow-sm">+ Add Step to Methodology</button>
                                </div>
                            </div>
                            <div className="mt-8 text-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
                                <RichTextEditor 
                                    height="100px"
                                    className="!text-center"
                                    value={(h as any)[`how_goal_${lang}`] || ''}
                                    onChange={v => updateField('home', `how_goal_${lang}`, v)}
                                    placeholder="Methodology Goal Statement..."
                                />
                            </div>
                        </div>
                    </section>

                    {/* Founder Summary Preview */}
                    <section className="py-12 bg-white">
                        <div className="container mx-auto px-12 max-w-5xl">
                             <div className="grid md:grid-cols-2 gap-12 items-center">
                                 <div>
                                     <EditableH1 className="text-2xl font-bold text-gray-900 mb-2" onChange={v => updateField('founder', `name_${lang}`, v)} val={(data.founder as any)[`name_${lang}`]} />
                                     <EditableH1 className="text-med-tech-blue font-bold mb-4" onChange={v => updateField('founder', `main_title_${lang}`, v)} val={(data.founder as any)[`main_title_${lang}`]} />
                                     <EditableP className="text-gray-700" onChange={v => updateField('home', `founder_sec_desc_${lang}`, v)} val={(h as any)[`founder_sec_desc_${lang}`]} />
                                 </div>
                                 <div className="flex justify-center">
                                     <img src={previewFounderImg} className="w-48 h-48 rounded-full shadow-xl border-4 border-med-tech-blue object-cover" alt="Founder" />
                                 </div>
                             </div>
                        </div>
                    </section>
                    
                    <section className="py-16 bg-med-tech-blue text-white text-center">
                        <div className="container mx-auto px-12">
                            <EditableH1 className="text-3xl md:text-4xl font-bold !text-center !text-white" onChange={v => updateField('home', `cta_title_${lang}`, v)} val={(h as any)[`cta_title_${lang}`]} />
                            <EditableP className="mt-4 text-lg max-w-2xl mx-auto text-gray-200 !text-center !text-white" onChange={v => updateField('home', `cta_desc_${lang}`, v)} val={(h as any)[`cta_desc_${lang}`]} />
                            <div className="mt-8 flex justify-center">
                                <EditableH1 className="bg-med-vital-green px-6 py-2 rounded font-bold !text-white w-auto" onChange={v => updateField('home', `hero_btn1_${lang}`, v)} val={(h as any)[`hero_btn1_${lang}`]} />
                            </div>
                        </div>
                    </section>
                </div>
            );
        }

        if (page === 'about') {
            const a = data.about;
            const renderDynamicSection = (title: string, icon: string, itemsKey: string, defaultItem: any) => (
                <section className="py-12 border-b border-gray-100 last:border-0">
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <IconEditor size="sm" val={(a as any)[icon]} onChange={v => updateField('about', icon, v)} />
                        <h3 className="text-2xl font-bold text-med-blue uppercase tracking-tighter">{title}</h3>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {((a as any)[itemsKey] || []).map((item: any, idx: number) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-50 relative group">
                                <button onClick={() => removeListItem(itemsKey, idx)} className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10">&times;</button>
                                <div className="mb-4">
                                    <IconEditor size="sm" val={item.icon} onChange={v => updateListItemField(itemsKey, idx, 'icon', v)} />
                                </div>
                                <EditableH1 className="text-lg font-black !text-gray-900 mb-2" onChange={v => updateListItemField(itemsKey, idx, `title_${lang}`, v)} val={(item as any)[`title_${lang}`]} placeholder="Title" />
                                <RichTextEditor 
                                    height="120px"
                                    className="w-full mt-2"
                                    value={(item as any)[`desc_${lang}`] || ''}
                                    onChange={v => updateListItemField(itemsKey, idx, `desc_${lang}`, v)}
                                    placeholder="Description..."
                                />
                            </div>
                        ))}
                        <button onClick={() => addListItem(itemsKey, defaultItem)} className="border-4 border-dashed border-gray-100 rounded-2xl p-8 text-med-tech-blue font-black hover:bg-gray-50 transition-all">+ ADD ITEM</button>
                    </div>
                </section>
            );

            return (
                <div className="font-arabic">
                    {/* Header */}
                    <div className="bg-sterile-light-grey py-16 text-center">
                        <div className="container mx-auto px-8">
                            <EditableH1 className="text-4xl font-black text-med-blue !text-center mb-4" onChange={v => updateField('about', `h1_${lang}`, v)} val={(a as any)[`h1_${lang}`]} />
                            <RichTextEditor 
                                height="100px"
                                className="max-w-3xl mx-auto"
                                value={(a as any)[`subtitle_${lang}`] || ''}
                                onChange={v => updateField('about', `subtitle_${lang}`, v)}
                                placeholder="Subtitle / Part below the title..."
                            />
                        </div>
                    </div>

                    <div className="container mx-auto px-8 py-12">
                        {/* Introduction */}
                        <section className="py-12 border-b border-gray-100">
                            <div className="flex flex-col items-center mb-8">
                                <IconEditor size="lg" val={a.intro_icon} onChange={v => updateField('about', 'intro_icon', v)} />
                                <EditableH1 className="text-3xl font-black text-med-blue !text-center mt-4" onChange={v => updateField('about', `intro_title_${lang}`, v)} val={(a as any)[`intro_title_${lang}`]} />
                            </div>
                            <div className="max-w-4xl mx-auto space-y-6">
                                <RichTextEditor 
                                    height="300px"
                                    value={(a as any)[`intro_p1_${lang}`] || ''}
                                    onChange={v => updateField('about', `intro_p1_${lang}`, v)}
                                    placeholder="Introduction Content (Rich Text)..."
                                />
                            </div>
                        </section>

                        <section className="py-12 grid md:grid-cols-2 gap-12 border-b border-gray-100">
                            <div className="bg-white p-8 rounded-3xl shadow-xl border-t-4 border-med-tech-blue flex flex-col">
                                <div className="flex items-center gap-3 mb-4">
                                    <IconEditor size="sm" val={a.mission_icon} onChange={v => updateField('about', 'mission_icon', v)} />
                                    <EditableH1 className="text-2xl font-black text-gray-900" onChange={v => updateField('about', `mission_title_${lang}`, v)} val={(a as any)[`mission_title_${lang}`]} />
                                </div>
                                <RichTextEditor 
                                    height="200px"
                                    className="mt-1 flex-grow"
                                    value={(a as any)[`mission_text_${lang}`] || ''}
                                    onChange={v => updateField('about', `mission_text_${lang}`, v)}
                                    placeholder="Mission body (supports bullet points)..."
                                />
                                <div className="mt-4 bg-sterile-light-grey p-3 rounded-md">
                                    <EditableP className="!text-med-tech-blue font-bold text-center" placeholder="Mission summary (shaded part)..." onChange={v => updateField('about', `mission_summary_${lang}`, v)} val={(a as any)[`mission_summary_${lang}`]} />
                                </div>
                            </div>
                            <div className="bg-white p-8 rounded-3xl shadow-xl border-t-4 border-med-tech-blue flex flex-col">
                                <div className="flex items-center gap-3 mb-4">
                                    <IconEditor size="sm" val={a.vision_icon} onChange={v => updateField('about', 'vision_icon', v)} />
                                    <EditableH1 className="text-2xl font-black text-gray-900" onChange={v => updateField('about', `vision_title_${lang}`, v)} val={(a as any)[`vision_title_${lang}`]} />
                                </div>
                                <RichTextEditor 
                                    height="200px"
                                    className="mt-1 flex-grow"
                                    value={(a as any)[`vision_text_${lang}`] || ''}
                                    onChange={v => updateField('about', `vision_text_${lang}`, v)}
                                    placeholder="Our Vision text (supports bullet points)..."
                                />
                                <div className="mt-4 bg-sterile-light-grey p-3 rounded-md">
                                    <EditableP className="!text-med-tech-blue font-bold text-center" placeholder="Vision summary (shaded part)..." onChange={v => updateField('about', `vision_summary_${lang}`, v)} val={(a as any)[`vision_summary_${lang}`]} />
                                </div>
                            </div>
                        </section>

                        {renderDynamicSection("Goals", "goals_icon", "goals", { icon: '🎯', title_ar: '', title_en: '', desc_ar: '', desc_en: '' })}
                        {renderDynamicSection("Core Values", "values_icon", "values", { icon: '💎', title_ar: '', title_en: '', desc_ar: '', desc_en: '' })}
                        {renderDynamicSection("Services", "services_icon", "services", { icon: '📝', title_ar: '', title_en: '', desc_ar: '', desc_en: '' })}
                        {renderDynamicSection("Team", "team_icon", "team", { icon: '👨‍⚕️', title_ar: '', title_en: '', desc_ar: '', desc_en: '' })}
                        {renderDynamicSection("Differentiators", "diff_icon", "differentiators", { icon: '🧠', title_ar: '', title_en: '', desc_ar: '', desc_en: '' })}

                        <section className="py-12 border-b border-gray-100">
                            <div className="flex flex-col items-center mb-8">
                                <IconEditor size="lg" val={a.future_vision_icon} onChange={v => updateField('about', 'future_vision_icon', v)} />
                                <EditableH1 className="text-3xl font-black text-med-blue !text-center mt-4" onChange={v => updateField('about', `future_vision_title_${lang}`, v)} val={(a as any)[`future_vision_title_${lang}`]} placeholder="Future Vision Title" />
                                <EditableP className="text-xl text-gray-600 !text-center mt-2 max-w-2xl" onChange={v => updateField('about', `future_vision_intro_${lang}`, v)} val={(a as any)[`future_vision_intro_${lang}`]} placeholder="Intro text (e.g. MedPulse aims to...)" />
                            </div>

                            <div className="max-w-4xl mx-auto bg-white p-8 rounded-[40px] shadow-2xl border border-gray-50">
                                <div className="space-y-6 mb-8">
                                    {(a.future_vision || []).map((point, idx) => (
                                        <div key={idx} className="flex items-center gap-4 group relative pr-8">
                                            <button onClick={() => removeListItem('future_vision', idx)} className="absolute -left-6 top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-med-tech-blue flex items-center justify-center">
                                                <svg className="w-3 h-3 text-med-tech-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg>
                                            </div>
                                            <EditableP className="text-lg font-medium text-gray-700" onChange={v => updateListItemField('future_vision', idx, `title_${lang}`, v)} val={(point as any)[`title_${lang}`]} placeholder="Enter Vision Point..." />
                                        </div>
                                    ))}
                                    <button onClick={() => addListItem('future_vision', { title_ar: '', title_en: '' })} className="w-full py-3 border-2 border-dashed border-gray-100 rounded-xl text-med-tech-blue font-bold hover:bg-gray-50">+ Add Vision Point</button>
                                </div>
                                <div className="pt-8 border-t border-gray-100 text-center">
                                    <EditableP className="!text-med-tech-blue font-black text-lg !text-center leading-relaxed" onChange={v => updateField('about', `future_vision_summary_${lang}`, v)} val={(a as any)[`future_vision_summary_${lang}`]} placeholder="Summary Footer Text..." />
                                </div>
                            </div>
                        </section>

                        <section className="mt-16 bg-med-tech-blue p-12 rounded-[40px] text-center text-white">
                            <EditableH1 className="text-3xl font-black !text-white !text-center mb-4" onChange={v => updateField('about', `h1_${lang}`, v)} val={(a as any)[`h1_${lang}`]} />
                            <EditableP className="text-lg opacity-80 !text-white !text-center max-w-2xl mx-auto mb-8" onChange={v => updateField('about', `cta_desc_${lang}`, v)} val={(a as any)[`cta_desc_${lang}`]} />
                            <div className="flex justify-center">
                                <EditableH1 className="bg-med-vital-green px-10 py-3 rounded-2xl font-black !text-white w-auto shadow-xl" onChange={v => updateField('about', `cta_btn_${lang}`, v)} val={(a as any)[`cta_btn_${lang}`]} />
                            </div>
                        </section>
                    </div>
                </div>
            );
        }

        if (page === 'founder') {
            const f = data.founder;
            const previewFounderImg = api.resolveImageUrl(f.main_image, FOUNDER_DATA_DETAILED.image);
            const resolvedGallery = (f.gallery || []).map(item => api.resolveImageUrl(item, ''));

            return (
                <div className="font-arabic">
                     <div className="bg-med-light-blue pt-12 text-center rounded-t-[40px] pb-16">
                         <div className="w-32 h-32 rounded-full bg-white mx-auto mb-4 shadow-xl ring-4 ring-white/50 overflow-hidden group relative">
                             <img src={previewFounderImg} className="w-full h-full object-cover" alt="Founder" />
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                <span className="text-white text-xs font-bold">{t({ar: 'تعديل الصورة', en: 'Edit Photo'})}</span>
                                <input type="file" onChange={handleMainImageUpload} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                             </div>
                         </div>
                         <EditableH1 className="text-3xl font-black text-med-blue !text-center mb-2" onChange={v => updateField('founder', `name_${lang}`, v)} val={(f as any)[`name_${lang}`]} />
                         <EditableH1 className="text-xl text-med-sky font-bold !text-center opacity-80" onChange={v => updateField('founder', `main_title_${lang}`, v)} val={(f as any)[`main_title_${lang}`]} />
                     </div>
                     <div className="container mx-auto px-8 -mt-8">
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                {(f.sections || []).map((sec, idx) => (
                                    <div key={idx} className="bg-white p-6 md:p-8 rounded-[30px] shadow-lg relative border border-gray-100 group">
                                        <button onClick={() => removeListItem('sections', idx)} className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10">&times;</button>
                                        <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-2">
                                            <IconEditor size="sm" val={sec.icon} onChange={v => updateListItemField('sections', idx, 'icon', v)} />
                                            <EditableH1 className="text-2xl font-black !text-gray-900 flex-1" onChange={v => updateListItemField('sections', idx, `title_${lang}`, v)} val={(sec as any)[`title_${lang}`]} placeholder="Section Title" />
                                        </div>
                                        <RichTextEditor 
                                            height="130px"
                                            className="mt-1"
                                            value={(sec as any)[`content_${lang}`] || ''}
                                            onChange={v => updateListItemField('sections', idx, `content_${lang}`, v)}
                                            placeholder="Write content..."
                                        />
                                    </div>
                                ))}
                                <button onClick={() => addListItem('sections', { icon: '📖', title_ar: '', title_en: '', content_ar: '', content_en: '' })} className="w-full py-6 border-4 border-dashed border-gray-200 rounded-[30px] text-med-tech-blue font-black text-lg hover:bg-white transition-all">+ Add Section</button>
                                
                                <div className="bg-white p-6 md:p-8 rounded-[30px] shadow-lg border border-gray-100">
                                    <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
                                        <h3 className="text-2xl font-black text-med-blue uppercase tracking-tighter">{t({ar: 'معرض الصور', en: 'Photo Gallery'})}</h3>
                                        <div className="relative">
                                            <button disabled={uploadingImage} className="bg-med-tech-blue text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md">
                                                {uploadingImage ? t({ar: 'جاري الرفع...', en: 'Uploading...'}) : t({ar: '+ إضافة صور', en: '+ Add Photos'})}
                                            </button>
                                            <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleGalleryUpload} accept="image/*" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {resolvedGallery.map((imgUrl, imgIdx) => imgUrl && (
                                            <div key={imgIdx} className="relative group aspect-square rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                                                <img src={imgUrl} className="w-full h-full object-cover" alt="Gallery item" />
                                                <button onClick={() => handleGalleryItemDelete(imgIdx)} className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">&times;</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white p-6 md:p-8 rounded-[30px] shadow-lg border border-gray-100 mt-8">
                                    <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-2">
                                        <span className="text-2xl">📩</span>
                                        <EditableH1 
                                            className="text-2xl font-black !text-gray-900 flex-1" 
                                            onChange={v => updateField('founder', `contact_title_${lang}`, v)} 
                                            val={(f as any)[`contact_title_${lang}`]} 
                                            placeholder="Contact Section Title" 
                                        />
                                    </div>
                                    <RichTextEditor 
                                        height="150px"
                                        className="mt-1"
                                        value={(f as any)[`contact_content_${lang}`] || ''}
                                        onChange={v => updateField('founder', `contact_content_${lang}`, v)}
                                        placeholder="Contact information / details..."
                                    />
                                </div>
                            </div>

                            <div className="lg:col-span-1 space-y-6">
                                {(f.sidebar_cards || []).map((card, cardIdx) => (
                                    <div key={cardIdx} className="bg-gray-50 p-6 rounded-[30px] shadow-sm border border-gray-200 relative group">
                                        <button onClick={() => removeListItem('sidebar_cards', cardIdx)} className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10">&times;</button>
                                        <EditableH1 className="text-xl font-black text-med-blue mb-4 border-b pb-2 !text-start" onChange={v => updateListItemField('sidebar_cards', cardIdx, `title_${lang}`, v)} val={(card as any)[`title_${lang}`]} placeholder="Card Title" />
                                        <RichTextEditor 
                                            height="200px"
                                            className="mt-1"
                                            value={(card as any)[`content_${lang}`] || ''}
                                            onChange={v => updateListItemField('sidebar_cards', cardIdx, `content_${lang}`, v)}
                                            placeholder="Write list or info using Rich Text..."
                                        />
                                    </div>
                                ))}
                                <button onClick={() => addListItem('sidebar_cards', { title_ar: '', title_en: '', content_ar: '', content_en: '', items: [] })} className="w-full py-6 border-2 border-dashed border-gray-300 rounded-[30px] text-gray-400 font-black hover:bg-white transition-all">+ Add Info Card</button>
                            </div>
                        </div>
                     </div>
                </div>
            );
        }

        if (page === 'contact') {
            const c = data.contact;
            return (
                <div className="font-arabic">
                    <div className="bg-sterile-light-grey py-16 text-center">
                        <div className="container mx-auto px-8">
                            <EditableH1 className="text-4xl font-black text-med-blue !text-center mb-4" onChange={v => updateField('contact', `h1_${lang}`, v)} val={(c as any)[`h1_${lang}`]} />
                            <RichTextEditor 
                                value={(c as any)[`intro_${lang}`] || ''}
                                onChange={v => updateField('contact', `intro_${lang}`, v)}
                                placeholder="Introduction HTML..."
                                height="100px"
                                className="max-w-3xl mx-auto"
                            />
                        </div>
                    </div>
                    <div className="container mx-auto px-8 py-12">
                        <section className="py-12 border-b border-gray-100">
                            <EditableH1 className="text-3xl font-black text-med-blue !text-center mb-8" onChange={v => updateField('contact', `why_title_${lang}`, v)} val={(c as any)[`why_title_${lang}`]} />
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {(c.why_cards || []).map((card, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-med-tech-blue relative group">
                                        <button onClick={() => removeListItem('why_cards', idx)} className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10">&times;</button>
                                        <EditableH1 className="text-xl font-black text-gray-900 mb-4" onChange={v => updateListItemField('why_cards', idx, `title_${lang}`, v)} val={(card as any)[`title_${lang}`]} />
                                        <div className="space-y-4">
                                            {(card.points || []).map((p, pIdx) => (
                                                <div key={pIdx} className="relative group/point">
                                                    <EditableP className="text-sm text-gray-600" onChange={v => {
                                                        const updatedPoints = [...card.points];
                                                        updatedPoints[pIdx] = { ...updatedPoints[pIdx], [`text_${lang}`]: v };
                                                        updateListItemField('why_cards', idx, 'points', updatedPoints);
                                                    }} val={(p as any)[`text_${lang}`]} />
                                                    <button onClick={() => {
                                                        const updatedPoints = [...card.points];
                                                        updatedPoints.splice(pIdx, 1);
                                                        updateListItemField('why_cards', idx, 'points', updatedPoints);
                                                    }} className="absolute -left-4 top-0 text-red-400 opacity-0 group-hover/point:opacity-100">&times;</button>
                                                </div>
                                            ))}
                                            <button onClick={() => {
                                                const updatedPoints = [...(card.points || []), { text_ar: '', text_en: '' }];
                                                updateListItemField('why_cards', idx, 'points', updatedPoints);
                                            }} className="text-xs text-med-tech-blue font-bold">+ ADD POINT</button>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => addListItem('why_cards', { title_ar: '', title_en: '', points: [] })} className="border-4 border-dashed border-gray-100 rounded-2xl p-8 text-med-tech-blue font-black hover:bg-gray-50 transition-all">+ ADD CARD</button>
                            </div>
                        </section>
                    </div>
                </div>
            );
        }
        
        return null;
    };

    return (
        <div className="fixed inset-0 z-[100] bg-gray-900/95 backdrop-blur-xl flex flex-col overflow-hidden">
            <header className="bg-white border-b p-4 flex justify-between items-center shadow-2xl relative z-10">
                <div className="flex items-center gap-6">
                    <button onClick={onClose} className="bg-gray-100 p-2.5 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                    </button>
                    <div>
                        <h2 className="text-xl font-black text-med-blue uppercase tracking-tighter">{t({ar: 'محرر الصفحات المباشر', en: 'Live Page Editor'})}</h2>
                        <p className="text-[10px] text-gray-400 font-black tracking-widest">{page.toUpperCase()}</p>
                    </div>
                    <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200">
                        <button onClick={() => setLanguage('en')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${language === 'en' ? 'bg-white text-med-tech-blue shadow-md' : 'text-gray-400'}`}>ENGLISH</button>
                        <button onClick={() => setLanguage('ar')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${language === 'ar' ? 'bg-white text-med-tech-blue shadow-md' : 'text-gray-400'}`}>العربية</button>
                    </div>
                </div>
                <button onClick={onSave} className="bg-med-vital-green text-white px-8 py-3 rounded-xl font-black hover:bg-green-700 shadow-xl transition-all transform hover:-translate-y-1 text-sm">
                    {t({ar: 'حفظ المسودة', en: 'Save Draft'})}
                </button>
            </header>
            <main className="flex-1 overflow-y-auto p-6 bg-clinical-charcoal/10 custom-scrollbar">
                <div className="max-w-5xl mx-auto shadow-2xl bg-white min-h-[70vh] rounded-[40px] overflow-hidden">
                    <div className="p-0 transition-all duration-500" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {renderEditorContent()}
                    </div>
                </div>
            </main>
        </div>
    );
};

const SettingsTab: React.FC = () => {
    const { showToast } = useToast();
    const { t, config, updateConfig } = useLocalization();
    const [isVisualEditorOpen, setIsVisualEditorOpen] = useState(false);
    const [activePage, setActivePage] = useState<StaticPage>('home');
    const [localConfig, setLocalConfig] = useState<SiteConfig | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);
    
    // SEO Section State
    const [selectedSeoPage, setSelectedSeoPage] = useState<string>('home');

    useEffect(() => {
        if (config) setLocalConfig(JSON.parse(JSON.stringify(config)));
    }, [config]);

    const handleSaveToDatabase = async () => {
        if (!localConfig || isPublishing) return;
        setIsPublishing(true);
        let successCount = 0;
        const pageKeys = Object.keys(DATABASE_PAGE_MAP);

        try {
            for (const key of pageKeys) {
                const dbTitle = DATABASE_PAGE_MAP[key];
                const attributes = (localConfig as any)[key];
                
                try {
                    // 1. Try Update First
                    console.log(`Attempting Update for: ${dbTitle}`);
                    await api.updateStaticPage(dbTitle, attributes);
                    successCount++;
                } catch (updateError: any) {
                    // 2. If update fails (e.g. 500 or Not Found), Try Add
                    console.warn(`Update failed for ${dbTitle}, attempting Add instead.`, updateError);
                    try {
                        await api.addStaticPage(dbTitle, attributes);
                        successCount++;
                    } catch (addError: any) {
                        console.error(`Both Update and Add failed for ${dbTitle}:`, addError);
                    }
                }
            }

            if (successCount === pageKeys.length) {
                updateConfig(localConfig);
                showToast(t({ar: 'تم النشر في قاعدة البيانات بنجاح!', en: 'Published to database successfully!'}), 'success');
            } else if (successCount > 0) {
                showToast(t({ar: 'تم نشر بعض الصفحات بنجاح، وحدث خطأ في أخرى.', en: 'Some pages were published, but others failed.'}), 'info');
            } else {
                showToast(t({ar: 'فشل النشر في قاعدة البيانات. تحقق من الاتصال.', en: 'Failed to publish to database. Check connection.'}), 'error');
            }
        } finally {
            setIsPublishing(false);
        }
    };

    const handleDownloadConfig = () => {
        if (!localConfig) return;
        const blob = new Blob([JSON.stringify(localConfig, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'siteconfig.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const updateSocialLink = (platform: string, value: string) => {
      setLocalConfig(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          home: {
            ...prev.home,
            social_links: {
              ...(prev.home.social_links || {}),
              [platform]: value
            }
          }
        };
      });
    };

    const updateSeoField = (field: keyof SEOConfig, value: string) => {
        setLocalConfig(prev => {
            if (!prev) return prev;
            const updated = { ...prev };
            if (!(updated as any)[selectedSeoPage]) {
                (updated as any)[selectedSeoPage] = {};
            }
            if (!(updated as any)[selectedSeoPage].seo) {
                (updated as any)[selectedSeoPage].seo = {
                    meta_title_ar: '', meta_title_en: '',
                    meta_description_ar: '', meta_description_en: '',
                    keywords_ar: '', keywords_en: ''
                };
            }
            (updated as any)[selectedSeoPage].seo[field] = value;
            return updated;
        });
    };

    if (!localConfig) return null;

    const currentSeo = (localConfig as any)[selectedSeoPage]?.seo || {
        meta_title_ar: '', meta_title_en: '',
        meta_description_ar: '', meta_description_en: '',
        keywords_ar: '', keywords_en: ''
    };

    return (
        <div className="space-y-10 pb-20">
            {isVisualEditorOpen && (
                <VisualEditor 
                    page={activePage} 
                    data={localConfig} 
                    setData={setLocalConfig}
                    onClose={() => setIsVisualEditorOpen(false)}
                    onSave={() => { 
                        if (localConfig) updateConfig(localConfig); 
                        setIsVisualEditorOpen(false); 
                        showToast(t({ar: 'تم حفظ المسودة محلياً!', en: 'Draft saved locally!'}), 'success'); 
                    }}
                />
            )}

            <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
                <h3 className="text-2xl font-black mb-8 text-med-blue flex items-center gap-3">
                    <span className="w-2.5 h-10 bg-med-tech-blue rounded-full"></span>
                    {t({ar: 'إدارة المحتوى والمزامنة', en: 'Content Management & Sync'})}
                </h3>
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            {t({
                                ar: 'يمكنك تعديل محتوى الصفحات الثابتة بصرياً. بعد حفظ المسودة محلياً، اضغط على "نشر في قاعدة البيانات" لتحديث الموقع رسمياً.',
                                en: 'You can edit static page content visually. After saving a draft locally, click "Push to Database" to officially update the live site.'
                            })}
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button 
                                onClick={handleSaveToDatabase} 
                                disabled={isPublishing}
                                className={`bg-med-vital-green text-white px-8 py-4 rounded-2xl font-black hover:bg-green-700 shadow-xl transition-all flex items-center gap-2 ${isPublishing ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isPublishing && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                                {isPublishing ? t({ar: 'جاري النشر...', en: 'Publishing...'}) : t({ar: 'نشر في قاعدة البيانات (Live)', en: 'Push to Database (Live)'})}
                            </button>
                            <button onClick={handleDownloadConfig} className="bg-clinical-charcoal text-white px-8 py-4 rounded-2xl font-black hover:bg-black transition-all">
                                {t({ar: 'تحميل ملف التكوين (Backup)', en: 'Download Config (Backup)'})}
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { id: 'home', label: {ar: 'الرئيسية', en: 'Home'}, icon: '🏠', color: 'bg-blue-50' },
                            { id: 'about', label: {ar: 'عن المنصة', en: 'About'}, icon: '🏢', color: 'bg-green-50' },
                            { id: 'founder', label: {ar: 'المؤسس', en: 'Founder'}, icon: '👨‍⚕️', color: 'bg-indigo-50' },
                            { id: 'contact', label: {ar: 'اتصل بنا', en: 'Contact'}, icon: '📞', color: 'bg-orange-50' },
                        ].map(page => (
                            <button 
                                key={page.id}
                                onClick={() => { setActivePage(page.id as StaticPage); setIsVisualEditorOpen(true); }}
                                className={`flex flex-col items-center justify-center p-6 rounded-[30px] border border-gray-100 hover:shadow-2xl transition-all hover:-translate-y-2 group ${page.color}`}
                            >
                                <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">{page.icon}</span>
                                <span className="font-black text-xs text-gray-900 uppercase">{t(page.label)}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
                <h3 className="text-2xl font-black mb-8 text-med-blue flex items-center gap-3">
                    <span className="w-2.5 h-10 bg-orange-400 rounded-full"></span>
                    {t({ar: 'محركات البحث والأرشفة (SEO)', en: 'Search Engine Optimization (SEO)'})}
                </h3>
                
                <div className="mb-8">
                    <label className="block text-sm font-black text-gray-500 uppercase tracking-widest mb-2">{t({ar: 'اختر الصفحة المراد تهيئتها:', en: 'Select page to configure:'})}</label>
                    <div className="flex flex-wrap gap-2">
                        {Object.keys(DATABASE_PAGE_MAP).map(pageKey => (
                            <button 
                                key={pageKey}
                                onClick={() => setSelectedSeoPage(pageKey)}
                                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${selectedSeoPage === pageKey ? 'bg-med-tech-blue text-white border-med-tech-blue shadow-lg' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-white'}`}
                            >
                                {pageKey.charAt(0).toUpperCase() + pageKey.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-10 bg-gray-50/50 p-8 rounded-[30px] border border-gray-100">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-sm">🇦🇪</span>
                            <h4 className="font-black text-gray-800">{t({ar: 'إعدادات اللغة العربية', en: 'Arabic SEO Settings'})}</h4>
                        </div>
                        <InputGroup label={t({ar: 'عنوان الصفحة (Meta Title)', en: 'Meta Title'})}>
                            <input 
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-med-tech-blue outline-none text-right"
                                dir="rtl"
                                value={currentSeo.meta_title_ar || ''}
                                onChange={e => updateSeoField('meta_title_ar', e.target.value)}
                                placeholder="عنوان جذاب لمحركات البحث..."
                            />
                        </InputGroup>
                        <InputGroup label={t({ar: 'وصف الصفحة (Meta Description)', en: 'Meta Description'})}>
                            <textarea 
                                rows={3}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-med-tech-blue outline-none text-right"
                                dir="rtl"
                                value={currentSeo.meta_description_ar || ''}
                                onChange={e => updateSeoField('meta_description_ar', e.target.value)}
                                placeholder="وصف ملخص يظهر في نتائج البحث..."
                            />
                        </InputGroup>
                        <InputGroup label={t({ar: 'الكلمات المفتاحية (Keywords)', en: 'Keywords'})}>
                            <input 
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-med-tech-blue outline-none text-right"
                                dir="rtl"
                                value={currentSeo.keywords_ar || ''}
                                onChange={e => updateSeoField('keywords_ar', e.target.value)}
                                placeholder="كلمة، كلمة أخرى، موضوع..."
                            />
                        </InputGroup>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-sm">🇺🇸</span>
                            <h4 className="font-black text-gray-800">{t({ar: 'إعدادات اللغة الإنجليزية', en: 'English SEO Settings'})}</h4>
                        </div>
                        <InputGroup label={t({ar: 'Meta Title', en: 'Meta Title'})}>
                            <input 
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-med-tech-blue outline-none"
                                value={currentSeo.meta_title_en || ''}
                                onChange={e => updateSeoField('meta_title_en', e.target.value)}
                                placeholder="SEO friendly page title..."
                            />
                        </InputGroup>
                        <InputGroup label={t({ar: 'Meta Description', en: 'Meta Description'})}>
                            <textarea 
                                rows={3}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-med-tech-blue outline-none"
                                value={currentSeo.meta_description_en || ''}
                                onChange={e => updateSeoField('meta_description_en', e.target.value)}
                                placeholder="Brief summary for search result snippets..."
                            />
                        </InputGroup>
                        <InputGroup label={t({ar: 'Keywords', en: 'Keywords'})}>
                            <input 
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-med-tech-blue outline-none"
                                value={currentSeo.keywords_en || ''}
                                onChange={e => updateSeoField('keywords_en', e.target.value)}
                                placeholder="keyword1, keyword2, topic..."
                            />
                        </InputGroup>
                    </div>
                </div>
                
                <div className="mt-6 flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <span className="text-2xl">💡</span>
                    <p className="text-xs text-blue-700 leading-relaxed">
                        {t({
                            ar: 'نصيحة: عناوين الصفحات يجب أن تكون بين 50-60 حرفاً، والوصف يجب أن يكون أقل من 160 حرفاً لتحقيق أفضل ظهور في Google. لا تنسَ الضغط على "نشر في قاعدة البيانات" لحفظ هذه الإعدادات.',
                            en: 'Tip: Titles should be 50-60 chars and descriptions under 160 chars for best Google ranking. Don\'t forget to click "Push to Database" to save these settings.'
                        })}
                    </p>
                </div>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
                <h3 className="text-2xl font-black mb-8 text-med-blue flex items-center gap-3">
                    <span className="w-2.5 h-10 bg-med-vital-green rounded-full"></span>
                    {t({ar: 'روابط التواصل الاجتماعي', en: 'Social Media Links'})}
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { key: 'facebook', label: 'Facebook', icon: '🔵' },
                      { key: 'instagram', label: 'Instagram', icon: '📸' },
                      { key: 'x', label: 'X (Twitter)', icon: '✖️' },
                      { key: 'tiktok', label: 'TikTok', icon: '🎵' },
                      { key: 'youtube', label: 'YouTube', icon: '🔴' }
                    ].map(platform => (
                      <InputGroup key={platform.key} label={platform.label}>
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{platform.icon}</span>
                          <input 
                            className="w-full p-2.5 border border-gray-300 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-med-tech-blue outline-none"
                            placeholder="https://..."
                            value={(localConfig.home.social_links as any)?.[platform.key] || ''}
                            onChange={(e) => updateSocialLink(platform.key, e.target.value)}
                          />
                        </div>
                      </InputGroup>
                    ))}
                </div>
                <div className="mt-4 text-xs text-gray-500 italic">
                  {t({
                    ar: '* ملاحظة: يتم حفظ هذه الروابط مع بيانات الصفحة الرئيسية. تأكد من الضغط على "نشر في قاعدة البيانات" لتطبيق التغييرات على الموقع.',
                    en: '* Note: These links are saved with the Home page attributes. Ensure you click "Push to Database" to apply changes live.'
                  })}
                </div>
            </div>
        </div>
    );
};

export default SettingsTab;
