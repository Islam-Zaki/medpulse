
import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { useLocalization } from '../../hooks/useLocalization';
import { api, DOMAIN } from '../../services/api';
import InputGroup from './InputGroup';

const FrontSettingsTab: React.FC = () => {
    const { showToast } = useToast();
    const { t, config, updateConfig } = useLocalization();
    const [mode, setMode] = useState<'images' | 'video'>('images');
    const [initialMode, setInitialMode] = useState<'images' | 'video'>('images'); 
    const [videoUrl, setVideoUrl] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Logo State
    const [logoUploading, setLogoUploading] = useState(false);

    // Homepage Limits State
    const [eventsLimit, setEventsLimit] = useState<number>(3);
    const [postsLimit, setPostsLimit] = useState<number>(3);
    const [savingLimits, setSavingLimits] = useState(false);

    // Existing data from API
    const [existingImages, setExistingImages] = useState<any[]>([]);
    const [existingVideo, setExistingVideo] = useState<any>(null);

    const loadSettings = async () => {
        setLoading(true);
        try {
            // 1. Load Front Mode & Media
            const res = await api.getFrontSettings();
            const data = Array.isArray(res.data) ? res.data[0] : res.data;
            if (data) {
                setMode(data.mode || 'images');
                setInitialMode(data.mode || 'images');
                setExistingImages(data.images || []);
                if (data.videos && data.videos.length > 0) {
                    const vid = data.videos[0];
                    setExistingVideo(vid);
                    if (vid.base_url && vid.name) {
                        setVideoUrl(vid.base_url + vid.name);
                    }
                }
            }

            // 2. Load Home Limits
            const limitsRes = await api.getHomeSettings();
            const limits = limitsRes.data || limitsRes;
            if (limits) {
                setEventsLimit(limits.events_number || 3);
                setPostsLimit(limits.posts_number || 3);
            }
        } catch (e) {
            console.error(e);
            showToast(t({ar: 'فشل تحميل الإعدادات', en: 'Failed to load settings'}), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files) as File[];
            if (existingImages.length + selectedFiles.length > 5) {
                showToast(t({ar: 'الحد الأقصى 5 صور إجمالاً', en: 'Maximum 5 images total allowed'}), 'error');
                return;
            }
            for (const file of selectedFiles) {
                if (file.size > 5 * 1024 * 1024) {
                    showToast(t({ar: 'يجب أن يكون حجم الصورة أقل من 5 ميجابايت', en: 'Image size must be less than 5MB'}), 'error');
                    return;
                }
            }
            setFiles(selectedFiles);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !config) return;

        if (file.size > 2 * 1024 * 1024) {
            showToast(t({ar: 'حجم الشعار يجب أن يكون أقل من 2 ميجابايت', en: 'Logo size must be less than 2MB'}), 'error');
            return;
        }

        // FIX: Removed unused and incorrect reference to social_links.logo to resolve property does not exist error.
        // Using a dedicated key 'logo' in home attributes
        const existingLogo = (config.home as any).logo;

        setLogoUploading(true);
        try {
            // 1. Delete old logo if it exists on server
            if (existingLogo && typeof existingLogo === 'object' && existingLogo.id) {
                try {
                    await api.deleteImage(existingLogo.id);
                } catch (delErr) {
                    console.warn("Could not delete previous logo", delErr);
                }
            }

            // 2. Upload new logo
            const res = await api.uploadImage(file, 'logo');
            const imageData = res.data?.[0];

            if (imageData && imageData.url) {
                const fullUrl = imageData.url;
                const relativePath = fullUrl.replace(/^https?:\/\/[^\/]+/, '');
                const newLogoObj = { url: relativePath, id: imageData.id };

                // 3. Update local config
                const updatedConfig = {
                    ...config,
                    home: {
                        ...config.home,
                        logo: newLogoObj
                    }
                };

                // 4. Update Database for the 'home' static page
                await api.updateStaticPage('home', updatedConfig.home);
                
                updateConfig(updatedConfig);
                showToast(t({ar: 'تم تحديث الشعار بنجاح', en: 'Logo updated successfully'}), 'success');
            }
        } catch (error) {
            console.error(error);
            showToast(t({ar: 'فشل تحديث الشعار', en: 'Failed to update logo'}), 'error');
        } finally {
            setLogoUploading(false);
            e.target.value = '';
        }
    };

    const extractYoutubeId = (url: string) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : url; 
    };

    const handleDeleteImage = async (id: number) => {
        try {
            await api.deleteImage(id);
            showToast(t({ar: 'تم حذف الصورة', en: 'Image deleted'}), 'success');
            setExistingImages(prev => prev.filter(img => img.id !== id));
        } catch (e) {
            console.error(e);
            showToast(t({ar: 'فشل حذف الصورة', en: 'Failed to delete image'}), 'error');
        }
    };

    const handleSaveFrontMode = async () => {
        setLoading(true);
        try {
            const settingsId = 1;
            if (files.length > 0) {
                await api.uploadImages(files, 'front_sittings', settingsId, 'front_sittings_id');
            }
            if (mode !== initialMode) {
                const fd = new FormData();
                fd.append('mode', mode);
                await api.updateFrontSettings(fd);
                setInitialMode(mode);
            }
            if (mode === 'video' && videoUrl) {
                const videoId = extractYoutubeId(videoUrl);
                if (!existingVideo || (existingVideo.name !== videoId && existingVideo.name !== videoUrl)) {
                     await api.saveFrontVideo(videoId, settingsId);
                }
            }
            showToast(t({ar: 'تم تحديث وضع الواجهة بنجاح', en: 'Front mode updated successfully'}), 'success');
            setFiles([]); 
            loadSettings(); 
        } catch (e: any) { 
            console.error(e);
            showToast(e.message || t({ar: 'خطأ في التحديث', en: 'Update error'}), 'error'); 
        } finally {
            setLoading(false);
        }
    };

    const handleSaveLimits = async () => {
        setSavingLimits(true);
        try {
            await api.updateHomeSettings(eventsLimit, postsLimit);
            showToast(t({ar: 'تم تحديث حدود العرض بنجاح', en: 'Display limits updated successfully'}), 'success');
        } catch (e: any) {
            console.error(e);
            showToast(t({ar: 'فشل تحديث حدود العرض', en: 'Failed to update display limits'}), 'error');
        } finally {
            setSavingLimits(false);
        }
    };

    const currentLogoUrl = api.resolveImageUrl((config?.home as any)?.logo, "https://storage.googleapis.com/aistudio-v2-dev-0-user-b30432c0-ff27-4f91-a18c-864b4c3e8a5a/4b5b4819-ff16-419b-b0b8-cdd21f66d498.png");

    return (
        <div className="space-y-8 pb-20">
            {/* Logo Management Section */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-black mb-6 text-med-blue flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-med-vital-green rounded-full"></span>
                    {t({ar: 'إدارة شعار الموقع', en: 'Website Logo Management'})}
                </h3>
                <div className="grid md:grid-cols-2 gap-10 items-center">
                    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-2xl border border-gray-100 min-h-[200px]">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{t({ar: 'الشعار الحالي', en: 'Current Logo'})}</p>
                        <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-200 flex items-center justify-center">
                            <img src={currentLogoUrl} alt="MedPulse Logo" className="max-h-24 object-contain" />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <p className="text-gray-500 text-sm leading-relaxed">
                            {t({
                                ar: 'قم برفع شعار الموقع الرسمي هنا. سيتم استبدال الشعار القديم وحذفه تلقائياً من الخادم. يفضل استخدام صيغة PNG بخلفية شفافة وبحجم لا يتجاوز 2 ميجابايت.',
                                en: 'Upload the official website logo here. The old logo will be replaced and automatically deleted from the server. PNG format with transparent background is preferred, max size 2MB.'
                            })}
                        </p>
                        <div className="relative">
                            <button 
                                disabled={logoUploading}
                                className={`w-full bg-med-tech-blue text-white px-8 py-4 rounded-xl font-black hover:bg-blue-700 shadow-lg transition-all flex items-center justify-center gap-3 ${logoUploading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1 active:scale-95'}`}
                            >
                                {logoUploading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        {t({ar: 'جاري رفع الشعار...', en: 'Uploading Logo...'})}
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                                        {t({ar: 'تغيير الشعار', en: 'Change Logo'})}
                                    </>
                                )}
                            </button>
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                onChange={handleLogoUpload}
                                disabled={logoUploading}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mode & Media Section */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-black mb-6 text-med-blue flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-med-tech-blue rounded-full"></span>
                    {t({ar: 'وضع الواجهة والوسائط', en: 'Front Mode & Media'})}
                </h3>
                
                <div className="flex gap-8 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                            type="radio" 
                            name="front_mode"
                            checked={mode === 'video'} 
                            onChange={() => setMode('video')} 
                            className="w-5 h-5 text-med-tech-blue focus:ring-med-tech-blue border-gray-300" 
                        /> 
                        <span className={`font-bold transition-colors ${mode === 'video' ? 'text-med-tech-blue' : 'text-gray-500 group-hover:text-gray-700'}`}>
                            {t({ar: 'وضع الفيديو (YouTube)', en: 'Video Mode (YouTube)'})}
                        </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                            type="radio" 
                            name="front_mode"
                            checked={mode === 'images'} 
                            onChange={() => setMode('images')} 
                            className="w-5 h-5 text-med-tech-blue focus:ring-med-tech-blue border-gray-300" 
                        /> 
                        <span className={`font-bold transition-colors ${mode === 'images' ? 'text-med-tech-blue' : 'text-gray-500 group-hover:text-gray-700'}`}>
                            {t({ar: 'وضع الصور (سلايدر)', en: 'Images Mode (Slider)'})}
                        </span>
                    </label>
                </div>

                {mode === 'video' ? (
                    <div className="space-y-6">
                        <InputGroup label={t({ar: 'رابط فيديو يوتيوب', en: 'YouTube Video URL'})}>
                            <input 
                                className="w-full p-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-med-tech-blue outline-none shadow-sm" 
                                value={videoUrl} 
                                onChange={e => setVideoUrl(e.target.value)} 
                                placeholder="https://www.youtube.com/watch?v=..." 
                            />
                        </InputGroup>
                        {videoUrl && (
                            <div className="aspect-video w-full max-w-lg bg-black rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                                <iframe 
                                    src={`https://www.youtube.com/embed/${extractYoutubeId(videoUrl)}`} 
                                    className="w-full h-full" 
                                    title="Preview" 
                                    allowFullScreen
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-8">
                        {existingImages.length > 0 && (
                            <div>
                                <h5 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                                    <span className="text-lg">🖼️</span> {t({ar: 'الصور الحالية في السلايدر', en: 'Current Slider Images'})}
                                </h5>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                    {existingImages.map(img => (
                                        <div key={img.id} className="relative group aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                            <img 
                                                src={`${DOMAIN}${img.base_url}${img.name}`} 
                                                alt="Front setting" 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button 
                                                    onClick={() => handleDeleteImage(img.id)}
                                                    className="bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 transition-transform hover:scale-110"
                                                    title={t({ar: 'حذف', en: 'Delete'})}
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 border-dashed">
                            <InputGroup label={t({ar: 'رفع صور جديدة (الحد الأقصى 5 صور إجمالاً)', en: 'Upload New Images (Max 5 Total)'})}>
                                <input 
                                    type="file" 
                                    multiple 
                                    accept="image/*"
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-med-tech-blue file:text-white hover:file:bg-blue-700 cursor-pointer bg-white border border-gray-300 rounded-xl p-2" 
                                    onChange={handleFileChange} 
                                />
                            </InputGroup>
                            {files.length > 0 && (
                                <div className="mt-2 text-sm text-med-tech-blue font-black flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-med-tech-blue animate-pulse"></span>
                                    {files.length} {t({ar: 'ملفات جاهزة للرفع', en: 'files ready to upload'})}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                    <button 
                        onClick={handleSaveFrontMode} 
                        disabled={loading}
                        className={`bg-med-tech-blue text-white px-10 py-3.5 rounded-xl font-black hover:bg-blue-700 transition-all shadow-xl flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 active:scale-95'}`}
                    >
                        {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                        {loading ? t({ar: 'جاري الحفظ...', en: 'Saving...'}) : t({ar: 'حفظ إعدادات الوضع', en: 'Save Mode Settings'})}
                    </button>
                </div>
            </div>

            {/* Display Limits Section */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-black mb-6 text-med-blue flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-orange-400 rounded-full"></span>
                    {t({ar: 'حدود العرض في الصفحة الرئيسية', en: 'Homepage Display Limits'})}
                </h3>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                    {t({
                        ar: 'تحكم في عدد العناصر التي تظهر في الأقسام الرئيسية على الصفحة الأولى للموقع لتنظيم المحتوى بشكل أفضل.',
                        en: 'Control the number of items appearing in the main sections of the homepage for better content organization.'
                    })}
                </p>

                <div className="grid md:grid-cols-2 gap-8 bg-gray-50 p-8 rounded-2xl border border-gray-100">
                    <InputGroup label={t({ar: 'عدد المؤتمرات في الصفحة الرئيسية', en: 'Number of Conferences on Home'})}>
                        <div className="flex items-center gap-4">
                            <input 
                                type="number" 
                                min="1" 
                                max="12"
                                className="w-32 p-3 border border-gray-300 rounded-xl bg-white text-gray-900 font-bold focus:ring-2 focus:ring-orange-400 outline-none shadow-sm"
                                value={eventsLimit}
                                onChange={e => setEventsLimit(parseInt(e.target.value) || 0)}
                            />
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t({ar: 'عنصر', en: 'Items'})}</span>
                        </div>
                    </InputGroup>

                    <InputGroup label={t({ar: 'عدد المقالات في الصفحة الرئيسية', en: 'Number of Articles on Home'})}>
                        <div className="flex items-center gap-4">
                            <input 
                                type="number" 
                                min="1" 
                                max="12"
                                className="w-32 p-3 border border-gray-300 rounded-xl bg-white text-gray-900 font-bold focus:ring-2 focus:ring-orange-400 outline-none shadow-sm"
                                value={postsLimit}
                                onChange={e => setPostsLimit(parseInt(e.target.value) || 0)}
                            />
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t({ar: 'مقال', en: 'Articles'})}</span>
                        </div>
                    </InputGroup>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                    <button 
                        onClick={handleSaveLimits} 
                        disabled={savingLimits}
                        className={`bg-orange-500 text-white px-10 py-3.5 rounded-xl font-black hover:bg-orange-600 transition-all shadow-xl flex items-center gap-2 ${savingLimits ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 active:scale-95'}`}
                    >
                        {savingLimits && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                        {savingLimits ? t({ar: 'جاري الحفظ...', en: 'Saving...'}) : t({ar: 'حفظ حدود العرض', en: 'Save Display Limits'})}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FrontSettingsTab;
