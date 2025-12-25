
import React, { useState } from 'react';
import { useToast } from '../../hooks/useToast';
import { useLocalization } from '../../hooks/useLocalization';
import { api } from '../../services/api';
import type { ApiArticle, Category, ApiAuthor } from '../../types';
import RichTextEditor from './RichTextEditor';

interface ArticlesTabProps {
    articles: ApiArticle[];
    categories: Category[];
    authors: ApiAuthor[];
    currentPage: number;
    lastPage: number;
    onPageChange: (page: number) => void;
    onRefresh: () => void;
}

const DOMAIN = 'https://medpulse-production.up.railway.app';

const ArticlesTab: React.FC<ArticlesTabProps> = ({ articles, categories, authors, currentPage, lastPage, onPageChange, onRefresh }) => {
    const { showToast } = useToast();
    const { t } = useLocalization();
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [articleData, setArticleData] = useState<ApiArticle>({ 
        title_en: '', 
        title_ar: '', 
        description_en: '', 
        description_ar: '' 
    } as ApiArticle);
    
    // Multi-select states
    const [selectedAuthorIds, setSelectedAuthorIds] = useState<number[]>([]);
    const [articleImages, setArticleImages] = useState<File[]>([]);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // Video
    const [videoUrl, setVideoUrl] = useState('');
    const [existingVideo, setExistingVideo] = useState<any>(null);

    const extractYoutubeId = (url: string) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : url; 
    };

    const handleEdit = async (item: ApiArticle) => {
        try {
            const res = await api.getArticle(item.id);
            const fullArticle: ApiArticle = res.data || res;
            
            setArticleData(fullArticle);
            
            // Pre-select authors
            const currentAuthors = fullArticle.authors?.map(a => a.id) || (fullArticle.author_id ? [fullArticle.author_id] : []);
            setSelectedAuthorIds(currentAuthors);
            
            // Video
            const vid = fullArticle.videos && fullArticle.videos.length > 0 ? fullArticle.videos[0] : null;
            setExistingVideo(vid);
            if (vid && vid.base_url && vid.name) {
                setVideoUrl(vid.base_url + vid.name);
            } else {
                setVideoUrl('');
            }

            setArticleImages([]); // Reset new images
            setIsEditing(true);
            setShowForm(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (e) {
            console.error(e);
            showToast(t({ar: 'فشل تحميل تفاصيل المقال', en: 'Failed to load article details'}), 'error');
        }
    };

    const resetForm = () => {
        setArticleData({ title_en: '', title_ar: '', description_en: '', description_ar: '' } as ApiArticle);
        setSelectedAuthorIds([]);
        setArticleImages([]);
        setVideoUrl('');
        setExistingVideo(null);
        setIsEditing(false);
        setShowForm(false);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files) as File[];
            const validFiles: File[] = [];
            let errorMsg = '';

            if (files.length > 10) {
                errorMsg = t({ar: 'الحد الأقصى 10 صور', en: 'Maximum 10 images allowed.'});
            }

            for (const file of files) {
                if (file.size > 5 * 1024 * 1024) {
                    errorMsg = t({ar: 'يجب أن يكون حجم الصورة أقل من 5 ميجابايت', en: 'Each image must be less than 5MB.'});
                    break;
                }
                validFiles.push(file);
            }

            if (errorMsg) {
                showToast(errorMsg, 'error');
                e.target.value = ''; 
                setArticleImages([]);
            } else {
                setArticleImages(validFiles.slice(0, 10)); 
            }
        }
    };

    const toggleAuthorSelection = (id: number) => {
        setSelectedAuthorIds(prev => 
            prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]
        );
    };

    const handleDeleteImage = async (imageId: number) => {
        try {
            await api.deleteImage(imageId);
            showToast(t({ar: 'تم حذف الصورة', en: 'Image deleted'}), 'success');
            setArticleData(prev => ({
                ...prev,
                images: prev.images?.filter(img => img.id !== imageId)
            }));
        } catch (e) {
            console.error(e);
            showToast(t({ar: 'فشل حذف الصورة', en: 'Failed to delete image'}), 'error');
        }
    };

    const handleSubmit = async () => {
        try {
            const primaryAuthorId = selectedAuthorIds.length > 0 ? selectedAuthorIds[0] : null;

            const payload = { 
                ...articleData, 
                category_id: Number(articleData.category_id), 
                author_id: primaryAuthorId 
            };
            
            let savedArticleId;
            if (isEditing && articleData.id) {
                await api.updateArticle(articleData.id, payload);
                savedArticleId = articleData.id;
            } else {
                const res = await api.createArticle(payload);
                savedArticleId = res.id || res.data?.id;
            }

            if (!savedArticleId) throw new Error("Failed to get Article ID");

            if (articleImages.length > 0) {
                await Promise.all(articleImages.map(file => 
                    api.uploadImage(file, 'article', savedArticleId, 'article_id')
                ));
            }

            // Sync Authors (Diff logic to avoid unique constraint violations)
            const currentAuthorIds = articleData.authors?.map(a => a.id) || [];
            
            // 1. Detach authors that are in current but not in selected
            const authorsToDetach = currentAuthorIds.filter(id => !selectedAuthorIds.includes(id));
            if (authorsToDetach.length > 0) {
                await Promise.all(authorsToDetach.map(authorId => 
                    api.detachAuthorFromArticle(savedArticleId, authorId)
                ));
            }

            // 2. Attach authors that are in selected but not in current
            const authorsToAttach = selectedAuthorIds.filter(id => !currentAuthorIds.includes(id));
            if (authorsToAttach.length > 0) {
                await Promise.all(authorsToAttach.map(authorId => 
                    api.attachAuthorToArticle(savedArticleId, authorId)
                ));
            }

            // Video saving logic
            if (videoUrl) {
                const videoId = extractYoutubeId(videoUrl);
                // Check if we need to save new video
                if (!existingVideo || existingVideo.name !== videoId) {
                     await api.createVideo({
                         name: videoId,
                         type: 'article',
                         article_id: savedArticleId
                     });
                }
            }

            showToast(isEditing ? t({ar: 'تم تحديث المقال بنجاح', en: 'Article updated successfully'}) : t({ar: 'تم إنشاء المقال بنجاح', en: 'Article created successfully'}), 'success');
            onRefresh();
            resetForm();
        } catch (e) {
            console.error(e);
            showToast(t({ar: 'خطأ في حفظ المقال', en: 'Error saving article'}), 'error');
        }
    };

    const inputClass = "w-full p-2.5 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-med-tech-blue focus:border-transparent outline-none transition-shadow";
    const labelClass = "block text-sm font-bold text-gray-700 mb-1.5";

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div>
                    <h3 className="text-xl font-bold text-med-blue">{t({ar: 'إدارة المقالات', en: 'Articles Management'})}</h3>
                    <p className="text-gray-500 text-sm">{t({ar: 'إدارة الأخبار والمقالات', en: 'Manage news and articles'})}</p>
                </div>
                <button onClick={() => { if(showForm) resetForm(); else setShowForm(true); }} className={`px-6 py-2.5 rounded-lg font-bold transition-all shadow-sm ${showForm ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-med-tech-blue text-white hover:bg-blue-700'}`}>
                    {showForm ? t({ar: 'إلغاء وإخفاء النموذج', en: 'Cancel & Hide Form'}) : t({ar: '+ إضافة مقال جديد', en: '+ Add New Article'})}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 animate-fade-in-down">
                     <h4 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">{isEditing ? t({ar: 'تعديل المقال', en: 'Edit Article'}) : t({ar: 'إنشاء مقال جديد', en: 'Create New Article'})}</h4>
                     
                     <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                            <h5 className="font-bold text-med-tech-blue mb-4 uppercase text-xs tracking-wider">{t({ar: 'معلومات المقال', en: 'Article Information'})}</h5>
                            <div className="grid md:grid-cols-2 gap-6 mb-4">
                                <div>
                                    <label className={labelClass}>{t({ar: 'العنوان (إنجليزي)', en: 'Title (English)'})}</label>
                                    <input className={inputClass} value={articleData.title_en || ''} onChange={e => setArticleData(prev => ({...prev, title_en: e.target.value}))} placeholder="Article Title" />
                                </div>
                                <div dir="rtl">
                                    <label className={labelClass}>{t({ar: 'العنوان (عربي)', en: 'Title (Arabic)'})}</label>
                                    <input className={inputClass} value={articleData.title_ar || ''} onChange={e => setArticleData(prev => ({...prev, title_ar: e.target.value}))} placeholder="عنوان المقال" />
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClass}>{t({ar: 'الوصف (إنجليزي)', en: 'Description (English)'})}</label>
                                    <RichTextEditor 
                                        height="250px"
                                        value={articleData.description_en || ''} 
                                        onChange={val => setArticleData(prev => ({...prev, description_en: val}))} 
                                        placeholder="Write English article content..."
                                    />
                                </div>
                                <div dir="rtl">
                                    <label className={labelClass}>{t({ar: 'الوصف (عربي)', en: 'Description (Arabic)'})}</label>
                                    <RichTextEditor 
                                        height="250px"
                                        value={articleData.description_ar || ''} 
                                        onChange={val => setArticleData(prev => ({...prev, description_ar: val}))} 
                                        placeholder="اكتب محتوى المقال بالعربي..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Classification & Attachments */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-4 rounded-md border border-gray-100 h-full">
                                <h5 className="font-bold text-med-tech-blue mb-4 uppercase text-xs tracking-wider">{t({ar: 'التصنيف', en: 'Classification'})}</h5>
                                <div className="mb-4">
                                    <label className={labelClass}>{t({ar: 'الفئة', en: 'Category'})}</label>
                                    <select className={inputClass} value={articleData.category_id || ''} onChange={e => setArticleData(prev => ({...prev, category_id: Number(e.target.value)}))}>
                                        <option value="">{t({ar: 'اختر الفئة', en: 'Select Category'})}</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <h5 className="font-bold text-med-tech-blue mb-2 uppercase text-xs tracking-wider">{t({ar: 'رفع الصور', en: 'Upload Images'})}</h5>
                                    <label className={labelClass}>{t({ar: 'اختر الصور (حد أقصى 10، 5 ميجابايت لكل صورة)', en: 'Select Images (Max 10, Max 5MB each)'})}</label>
                                    <input 
                                        type="file" 
                                        multiple 
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-med-tech-blue file:text-white hover:file:bg-blue-700 cursor-pointer" 
                                    />
                                    {articleImages.length > 0 && (
                                        <div className="mt-2 text-sm text-green-600">
                                            {articleImages.length} {t({ar: 'صور محددة', en: 'images selected'})}.
                                        </div>
                                    )}
                                    {/* Existing Images Display */}
                                    {isEditing && articleData.images && articleData.images.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-xs font-bold text-gray-500 mb-2 uppercase">{t({ar: 'الصور الحالية', en: 'Existing Images'})}</p>
                                            <div className="flex gap-4 overflow-x-auto p-4 border border-gray-100 rounded bg-gray-50/50">
                                                {articleData.images.map(img => (
                                                    <div key={img.id} className="relative group flex-shrink-0">
                                                        <img 
                                                            src={`${DOMAIN}${img.base_url}${img.name}`} 
                                                            alt="Article img" 
                                                            className="w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                                                        />
                                                        <button
                                                            onClick={() => handleDeleteImage(img.id)}
                                                            className="absolute -top-3 -right-3 bg-white text-red-500 rounded-full w-7 h-7 flex items-center justify-center shadow-md border border-gray-200 hover:bg-red-50 hover:scale-110 transition-all z-10"
                                                            type="button"
                                                            title={t({ar: 'حذف الصورة', en: 'Delete Image'})}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Video Input */}
                                    <div className="mt-6 pt-4 border-t border-gray-200">
                                        <label className={labelClass}>{t({ar: 'رابط فيديو (يوتيوب)', en: 'Video URL (YouTube)'})}</label>
                                        <input 
                                            className={inputClass} 
                                            value={videoUrl} 
                                            onChange={e => setVideoUrl(e.target.value)} 
                                            placeholder="https://www.youtube.com/watch?v=..." 
                                        />
                                        {videoUrl && (
                                            <div className="mt-2 text-xs text-blue-600">
                                                {extractYoutubeId(videoUrl) ? t({ar: 'تم التعرف على الفيديو', en: 'Video detected'}) : t({ar: 'رابط غير صالح', en: 'Invalid URL'})}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-md border border-gray-100 h-full">
                                <h5 className="font-bold text-med-tech-blue mb-4 uppercase text-xs tracking-wider">{t({ar: 'إرفاق المؤلفين', en: 'Attach Authors'})}</h5>
                                <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md bg-white p-3 space-y-2">
                                    {authors.map(author => (
                                        <label key={author.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedAuthorIds.includes(author.id)}
                                                onChange={() => toggleAuthorSelection(author.id)}
                                                className="w-4 h-4 rounded text-med-tech-blue focus:ring-med-tech-blue border-gray-300"
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-800">{author.name_en}</span>
                                                <span className="text-xs text-gray-500">{author.name_ar}</span>
                                            </div>
                                        </label>
                                    ))}
                                    {authors.length === 0 && <p className="text-sm text-gray-500 italic">{t({ar: 'لا يوجد مؤلفين', en: 'No authors available.'})}</p>}
                                </div>
                                <div className="mt-2 text-sm text-med-tech-blue font-semibold text-right">
                                    {selectedAuthorIds.length} {t({ar: 'مؤلفين محددين', en: 'Authors Selected'})}
                                </div>
                            </div>
                        </div>

                        <button onClick={handleSubmit} className="w-full bg-med-vital-green text-white font-bold py-3 rounded-lg hover:bg-green-700 shadow-md transition-all text-lg transform hover:-translate-y-0.5">
                            {isEditing ? t({ar: 'تحديث المقال', en: 'Update Article'}) : t({ar: 'حفظ المقال', en: 'Save Article'})}
                        </button>
                     </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider font-bold">
                        <tr>
                            <th className="p-4 border-b text-start">{t({ar: 'العنوان', en: 'Title'})}</th>
                            <th className="p-4 border-b text-start">{t({ar: 'التصنيف', en: 'Category'})}</th>
                            <th className="p-4 border-b text-end">{t({ar: 'الإجراءات', en: 'Actions'})}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {articles.map(a => {
                            const categoryName = a.category?.name_en 
                                || categories.find(c => c.id === Number(a.category_id))?.name_en 
                                || 'N/A';

                            return (
                                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-gray-900">{a.title_en}</div>
                                        <div className="text-xs text-gray-500">{a.title_ar}</div>
                                    </td>
                                    <td className="p-4 text-gray-700">{categoryName}</td>
                                    <td className="p-4 text-right space-x-2">
                                        {deleteId === a.id ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="text-xs text-red-600 font-bold">{t({ar: 'تأكيد الحذف؟', en: 'Confirm?'})}</span>
                                                <button 
                                                    onClick={async () => {
                                                        try {
                                                            await api.deleteArticle(a.id);
                                                            showToast(t({ar: 'تم حذف المقال', en: 'Article deleted'}), 'success');
                                                            onRefresh();
                                                        } catch (err) {
                                                            console.error(err);
                                                            showToast(t({ar: 'فشل الحذف', en: 'Delete failed'}), 'error');
                                                        } finally {
                                                            setDeleteId(null);
                                                        }
                                                    }}
                                                    className="text-white bg-red-600 hover:bg-red-700 font-medium text-xs px-3 py-1 rounded transition-colors"
                                                >
                                                    {t({ar: 'نعم', en: 'Yes'})}
                                                </button>
                                                <button 
                                                    onClick={() => setDeleteId(null)}
                                                    className="text-gray-600 bg-gray-200 hover:bg-gray-300 font-medium text-xs px-3 py-1 rounded transition-colors"
                                                >
                                                    {t({ar: 'لا', en: 'No'})}
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <button onClick={() => handleEdit(a)} className="text-blue-600 hover:text-blue-800 font-medium text-sm border border-blue-200 px-3 py-1 rounded hover:bg-blue-50 transition-colors">{t({ar: 'تعديل', en: 'Edit'})}</button>
                                                <button onClick={() => setDeleteId(a.id)} className="text-red-600 hover:text-red-800 font-medium text-sm border border-red-200 px-3 py-1 rounded hover:bg-red-50 transition-colors">{t({ar: 'حذف', en: 'Delete'})}</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {articles.length === 0 && (
                            <tr><td colSpan={3} className="p-8 text-center text-gray-500">{t({ar: 'لا توجد مقالات. أضف واحداً أعلاه.', en: 'No articles found. Add one above.'})}</td></tr>
                        )}
                    </tbody>
                </table>
                {lastPage > 1 && (
                    <div className="flex justify-between items-center p-6 bg-white border-t border-gray-200 shadow-inner">
                        <button 
                            onClick={() => onPageChange(currentPage - 1)} 
                            disabled={currentPage === 1} 
                            className="px-6 py-2 border-2 border-med-tech-blue text-med-tech-blue rounded-xl font-black hover:bg-med-tech-blue hover:text-white transition-all disabled:opacity-30 disabled:border-gray-200 disabled:text-gray-300 disabled:hover:bg-transparent"
                        >
                            {t({ar: 'السابق', en: 'Previous'})}
                        </button>
                        <div className="flex items-center gap-2 font-black text-gray-500 text-sm uppercase tracking-widest">
                            <span>{t({ar: 'صفحة', en: 'Page'})}</span>
                            <span className="w-8 h-8 flex items-center justify-center bg-med-tech-blue text-white rounded-lg shadow-md">{currentPage}</span>
                            <span>{t({ar: 'من', en: 'of'})} {lastPage}</span>
                        </div>
                        <button 
                            onClick={() => onPageChange(currentPage + 1)} 
                            disabled={currentPage === lastPage} 
                            className="px-6 py-2 border-2 border-med-tech-blue text-med-tech-blue rounded-xl font-black hover:bg-med-tech-blue hover:text-white transition-all disabled:opacity-30 disabled:border-gray-200 disabled:text-gray-300 disabled:hover:bg-transparent"
                        >
                            {t({ar: 'التالي', en: 'Next'})}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArticlesTab;
