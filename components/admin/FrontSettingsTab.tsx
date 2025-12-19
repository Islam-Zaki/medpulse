
import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { useLocalization } from '../../hooks/useLocalization';
import { api } from '../../services/api';
import InputGroup from './InputGroup';

const DOMAIN = 'https://medpulse-production.up.railway.app';

const FrontSettingsTab: React.FC = () => {
    const { showToast } = useToast();
    const { t } = useLocalization();
    const [mode, setMode] = useState<'images' | 'video'>('images');
    const [initialMode, setInitialMode] = useState<'images' | 'video'>('images'); // Track initial mode
    const [videoUrl, setVideoUrl] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Existing data from API
    const [existingImages, setExistingImages] = useState<any[]>([]);
    const [existingVideo, setExistingVideo] = useState<any>(null);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const res = await api.getFrontSettings();
            const data = Array.isArray(res.data) ? res.data[0] : res.data;
            if (data) {
                setMode(data.mode || 'images');
                setInitialMode(data.mode || 'images');
                setExistingImages(data.images || []);
                if (data.videos && data.videos.length > 0) {
                    const vid = data.videos[0];
                    setExistingVideo(vid);
                    // Reconstruct URL for display
                    if (vid.base_url && vid.name) {
                        setVideoUrl(vid.base_url + vid.name);
                    }
                }
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
            
            // Check total count constraint including existing ones
            if (existingImages.length + selectedFiles.length > 5) {
                showToast(t({ar: 'الحد الأقصى 5 صور إجمالاً', en: 'Maximum 5 images total allowed'}), 'error');
                return;
            }
            // Check size 5MB
            for (const file of selectedFiles) {
                if (file.size > 5 * 1024 * 1024) {
                    showToast(t({ar: 'يجب أن يكون حجم الصورة أقل من 5 ميجابايت', en: 'Image size must be less than 5MB'}), 'error');
                    return;
                }
            }
            setFiles(selectedFiles);
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
            // Optimistic update
            setExistingImages(prev => prev.filter(img => img.id !== id));
        } catch (e) {
            console.error(e);
            showToast(t({ar: 'فشل حذف الصورة', en: 'Failed to delete image'}), 'error');
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Fixed ID 5 for front settings row
            const settingsId = 5;

            // 1. Upload Images First (if any) using the specific endpoint for images
            if (files.length > 0) {
                // Use the new bulk upload function
                await api.uploadImages(files, 'front_sittings', settingsId, 'front_sittings_id');
            }

            // 2. Update Mode (only if changed, to avoid clearing existing data unnecessarily)
            if (mode !== initialMode) {
                const fd = new FormData();
                fd.append('mode', mode);
                await api.updateFrontSettings(fd);
            }
            
            // 3. If Video mode, save video link/id separately if needed
            if (mode === 'video' && videoUrl) {
                const videoId = extractYoutubeId(videoUrl);
                // Check if we need to update
                if (!existingVideo || (existingVideo.name !== videoId && existingVideo.name !== videoUrl)) {
                     await api.saveFrontVideo(videoId, settingsId);
                }
            }

            showToast(t({ar: 'تم تحديث إعدادات الواجهة بنجاح', en: 'Front settings updated successfully'}), 'success');
            setFiles([]); // Clear selection
            loadSettings(); // Reload to get fresh data
        } catch (e: any) { 
            console.error(e);
            // Use API error message if available
            const msg = e.message || t({ar: 'حدث خطأ أثناء تحديث الإعدادات', en: 'Error updating front settings'});
            showToast(msg, 'error'); 
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold mb-6 text-med-blue border-b pb-2">{t({ar: 'إعدادات الواجهة الأمامية', en: 'Front Page Settings'})}</h3>
            
            <div className="flex gap-6 mb-6">
                <label className="flex items-center gap-2 cursor-pointer text-gray-800 font-medium">
                    <input 
                        type="radio" 
                        name="front_mode"
                        checked={mode === 'video'} 
                        onChange={() => setMode('video')} 
                        className="text-med-tech-blue focus:ring-med-tech-blue" 
                    /> 
                    {t({ar: 'وضع الفيديو', en: 'Video Mode'})}
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-800 font-medium">
                    <input 
                        type="radio" 
                        name="front_mode"
                        checked={mode === 'images'} 
                        onChange={() => setMode('images')} 
                        className="text-med-tech-blue focus:ring-med-tech-blue" 
                    /> 
                    {t({ar: 'وضع الصور (سلايدر)', en: 'Images Mode (Slider)'})}
                </label>
            </div>

            {mode === 'video' ? (
                <div className="space-y-4">
                    <InputGroup label={t({ar: 'رابط الفيديو (يوتيوب)', en: 'Video URL (YouTube)'})}>
                        <input 
                            className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-med-tech-blue outline-none" 
                            value={videoUrl} 
                            onChange={e => setVideoUrl(e.target.value)} 
                            placeholder="https://www.youtube.com/watch?v=..." 
                        />
                    </InputGroup>
                    {videoUrl && (
                        <div className="aspect-video w-full max-w-md bg-black rounded-lg overflow-hidden">
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
                <div className="mb-6 space-y-6">
                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                        <div>
                            <h5 className="font-bold text-gray-700 mb-2">{t({ar: 'الصور الحالية', en: 'Current Images'})}</h5>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {existingImages.map(img => (
                                    <div key={img.id} className="relative group">
                                        <img 
                                            src={`${DOMAIN}${img.base_url}${img.name}`} 
                                            alt="Front setting" 
                                            className="w-full h-24 object-cover rounded-lg border border-gray-300"
                                        />
                                        <button 
                                            onClick={() => handleDeleteImage(img.id)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                                            title={t({ar: 'حذف', en: 'Delete'})}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <InputGroup label={t({ar: 'رفع صور جديدة (حد أقصى 5 صور إجمالاً)', en: 'Upload New Images (Max 5 total)'})}>
                        <input 
                            type="file" 
                            multiple 
                            accept="image/*"
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-med-tech-blue file:text-white hover:file:bg-blue-700 cursor-pointer bg-gray-50 border border-gray-300 rounded-md" 
                            onChange={handleFileChange} 
                        />
                    </InputGroup>
                    {files.length > 0 && (
                        <div className="mt-2 text-sm text-green-600 font-bold">
                            {files.length} {t({ar: 'ملفات محددة', en: 'files selected'})}
                        </div>
                    )}
                </div>
            )}

            <button 
                onClick={handleSave} 
                disabled={loading}
                className={`mt-4 bg-med-tech-blue text-white px-6 py-2.5 rounded-md font-bold hover:bg-blue-700 transition-colors shadow-md ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {loading ? t({ar: 'جاري الحفظ...', en: 'Saving...'}) : t({ar: 'حفظ التغييرات', en: 'Save Changes'})}
            </button>
        </div>
    );
};

export default FrontSettingsTab;
