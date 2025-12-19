
import React, { useState } from 'react';
import { useToast } from '../../hooks/useToast';
import { useLocalization } from '../../hooks/useLocalization';
import { api } from '../../services/api';
import type { ApiAuthor } from '../../types';

interface AuthorsTabProps {
    authors: ApiAuthor[];
    onRefresh: () => void;
}

const DOMAIN = 'https://medpulse-production.up.railway.app';

const AuthorsTab: React.FC<AuthorsTabProps> = ({ authors, onRefresh }) => {
    const { showToast } = useToast();
    const { t } = useLocalization();
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [authorData, setAuthorData] = useState<ApiAuthor>({} as ApiAuthor);
    const [authorImage, setAuthorImage] = useState<File | null>(null);

    const handleEdit = (author: ApiAuthor) => {
        setAuthorData(author);
        setIsEditing(true);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setAuthorData({} as ApiAuthor);
        setAuthorImage(null);
        setIsEditing(false);
        setShowForm(false);
    };

    const handleSubmit = async () => {
        try {
            let res;
            if (isEditing && authorData.id) {
                res = await api.updateAuthor(authorData.id, authorData);
            } else {
                res = await api.createAuthor(authorData);
            }

            const authorId = isEditing ? authorData.id : (res.id || res.data?.id);
            if (authorImage && authorId) {
                await api.uploadImage(authorImage, 'author', authorId, 'author_id');
            }

            showToast(isEditing ? t({ar: 'تم تحديث المؤلف بنجاح', en: 'Author updated successfully'}) : t({ar: 'تم إنشاء المؤلف بنجاح', en: 'Author created successfully'}), 'success');
            onRefresh();
            resetForm();
        } catch (e) {
            console.error(e);
            showToast(t({ar: 'خطأ في حفظ المؤلف', en: 'Error saving author'}), 'error');
        }
    };

    const inputClass = "w-full p-2.5 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-med-tech-blue focus:border-transparent outline-none transition-shadow";
    const labelClass = "block text-sm font-bold text-gray-700 mb-1.5";

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div>
                    <h3 className="text-xl font-bold text-med-blue">{t({ar: 'إدارة المؤلفين', en: 'Authors Management'})}</h3>
                    <p className="text-gray-500 text-sm">{t({ar: 'إدارة مؤلفي المقالات والمساهمين', en: 'Manage article authors and contributors'})}</p>
                </div>
                <button onClick={() => { if(showForm) resetForm(); else setShowForm(true); }} className={`px-6 py-2.5 rounded-lg font-bold transition-all shadow-sm ${showForm ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-med-tech-blue text-white hover:bg-blue-700'}`}>
                    {showForm ? t({ar: 'إلغاء وإخفاء النموذج', en: 'Cancel & Hide Form'}) : t({ar: '+ إضافة مؤلف جديد', en: '+ Add New Author'})}
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 animate-fade-in-down">
                     <h4 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">{isEditing ? t({ar: 'تعديل المؤلف', en: 'Edit Author'}) : t({ar: 'إنشاء مؤلف جديد', en: 'Create New Author'})}</h4>
                     
                     <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                            <h5 className="font-bold text-med-tech-blue mb-4 uppercase text-xs tracking-wider">{t({ar: 'المعلومات الأساسية', en: 'Basic Information'})}</h5>
                            <div className="grid md:grid-cols-2 gap-6 mb-4">
                                <div><label className={labelClass}>{t({ar: 'الاسم (إنجليزي)', en: 'Name (English)'})}</label><input className={inputClass} value={authorData.name_en || ''} onChange={e => setAuthorData({...authorData, name_en: e.target.value})} placeholder="e.g. Dr. Sarah Smith" /></div>
                                <div dir="rtl"><label className={labelClass}>{t({ar: 'الاسم (عربي)', en: 'Name (Arabic)'})}</label><input className={inputClass} value={authorData.name_ar || ''} onChange={e => setAuthorData({...authorData, name_ar: e.target.value})} placeholder="د. سارة سميث" /></div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div><label className={labelClass}>{t({ar: 'التخصص (إنجليزي)', en: 'Specialty (English)'})}</label><input className={inputClass} value={authorData.speciality_en || ''} onChange={e => setAuthorData({...authorData, speciality_en: e.target.value})} placeholder="e.g. Medical Researcher" /></div>
                                <div dir="rtl"><label className={labelClass}>{t({ar: 'التخصص (عربي)', en: 'Specialty (Arabic)'})}</label><input className={inputClass} value={authorData.speciality_ar || ''} onChange={e => setAuthorData({...authorData, speciality_ar: e.target.value})} placeholder="باحث طبي" /></div>
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                            <h5 className="font-bold text-med-tech-blue mb-4 uppercase text-xs tracking-wider">{t({ar: 'صورة الملف الشخصي', en: 'Profile Image'})}</h5>
                            <label className={labelClass}>{t({ar: 'رفع صورة', en: 'Upload Image'})}</label>
                            <input type="file" onChange={e => setAuthorImage(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-med-tech-blue file:text-white hover:file:bg-blue-700 cursor-pointer" />
                        </div>

                        <button onClick={handleSubmit} className="w-full bg-med-vital-green text-white font-bold py-3 rounded-lg hover:bg-green-700 shadow-md transition-all text-lg">
                            {isEditing ? t({ar: 'تحديث المؤلف', en: 'Update Author'}) : t({ar: 'حفظ المؤلف', en: 'Save Author'})}
                        </button>
                     </div>
                </div>
            )}

            {/* List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider font-bold">
                        <tr>
                            <th className="p-4 border-b text-start">{t({ar: 'الصورة', en: 'Image'})}</th>
                            <th className="p-4 border-b text-start">{t({ar: 'الاسم', en: 'Name'})}</th>
                            <th className="p-4 border-b text-start">{t({ar: 'التخصص', en: 'Specialty'})}</th>
                            <th className="p-4 border-b text-end">{t({ar: 'الإجراءات', en: 'Actions'})}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {authors.map(a => {
                            const recentImage = a.images && a.images.length > 0 
                                ? [...a.images].sort((x, y) => y.id - x.id)[0] 
                                : null;
                            const imageUrl = recentImage 
                                ? `${DOMAIN}${recentImage.base_url}${recentImage.name}` 
                                : a.image_url;

                            return (
                                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 bg-gray-100">
                                            {imageUrl ? (
                                                <img src={imageUrl} alt={a.name_en} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-gray-900">{a.name_en}</div>
                                        <div className="text-xs text-gray-500">{a.name_ar}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm text-gray-700">{a.speciality_en}</div>
                                        <div className="text-xs text-gray-500">{a.speciality_ar}</div>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button onClick={() => handleEdit(a)} className="text-blue-600 hover:text-blue-800 font-medium text-sm">{t({ar: 'تعديل', en: 'Edit'})}</button>
                                        <button onClick={() => { if(confirm(t({ar: 'حذف المؤلف؟', en: 'Delete author?'}))) api.deleteAuthor(a.id).then(() => onRefresh()); }} className="text-red-600 hover:text-red-800 font-medium text-sm">{t({ar: 'حذف', en: 'Delete'})}</button>
                                    </td>
                                </tr>
                            );
                        })}
                        {authors.length === 0 && (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">{t({ar: 'لا يوجد مؤلفين', en: 'No authors found.'})}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuthorsTab;
