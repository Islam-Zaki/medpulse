
import React, { useState } from 'react';
import { useToast } from '../../hooks/useToast';
import { useLocalization } from '../../hooks/useLocalization';
import { api } from '../../services/api';
import type { Category } from '../../types';

interface CategoriesTabProps {
    categories: Category[];
    onRefresh: () => void;
}

const CategoriesTab: React.FC<CategoriesTabProps> = ({ categories, onRefresh }) => {
    const { showToast } = useToast();
    const { t } = useLocalization();
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [categoryData, setCategoryData] = useState<Category>({} as Category);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleEdit = (cat: Category) => {
        setCategoryData(cat);
        setIsEditing(true);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setCategoryData({} as Category);
        setIsEditing(false);
        setShowForm(false);
    };

    const handleSubmit = async () => {
        try {
            if (isEditing && categoryData.id) {
                await api.updateCategory(categoryData.id, categoryData);
            } else {
                await api.createCategory(categoryData);
            }
            showToast(isEditing ? t({ar: 'تم تحديث التصنيف بنجاح', en: 'Category updated successfully'}) : t({ar: 'تم إنشاء التصنيف بنجاح', en: 'Category created successfully'}), 'success');
            onRefresh();
            resetForm();
        } catch (e) {
            console.error(e);
            showToast(t({ar: 'خطأ في حفظ التصنيف', en: 'Error saving category'}), 'error');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.deleteCategory(id);
            showToast(t({ar: 'تم حذف التصنيف', en: 'Category deleted'}), 'success');
            onRefresh();
        } catch (e) {
            console.error(e);
            showToast(t({ar: 'فشل حذف التصنيف', en: 'Failed to delete category'}), 'error');
        } finally {
            setDeleteId(null);
        }
    };

    const inputClass = "w-full p-2.5 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-med-tech-blue focus:border-transparent outline-none transition-shadow";
    const labelClass = "block text-sm font-bold text-gray-700 mb-1.5";

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div>
                    <h3 className="text-xl font-bold text-med-blue">{t({ar: 'إدارة التصنيفات', en: 'Categories Management'})}</h3>
                    <p className="text-gray-500 text-sm">{t({ar: 'إدارة تصنيفات المقالات', en: 'Manage article categories'})}</p>
                </div>
                <button onClick={() => { if(showForm) resetForm(); else setShowForm(true); }} className={`px-6 py-2.5 rounded-lg font-bold transition-all shadow-sm ${showForm ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-med-tech-blue text-white hover:bg-blue-700'}`}>
                    {showForm ? t({ar: 'إلغاء وإخفاء النموذج', en: 'Cancel & Hide Form'}) : t({ar: '+ إضافة تصنيف جديد', en: '+ Add New Category'})}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 animate-fade-in-down">
                     <h4 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">{isEditing ? t({ar: 'تعديل التصنيف', en: 'Edit Category'}) : t({ar: 'إنشاء تصنيف جديد', en: 'Create New Category'})}</h4>
                     
                     <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                            <h5 className="font-bold text-med-tech-blue mb-4 uppercase text-xs tracking-wider">{t({ar: 'تفاصيل التصنيف', en: 'Category Details'})}</h5>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div><label className={labelClass}>{t({ar: 'الاسم (إنجليزي)', en: 'Name (English)'})}</label><input className={inputClass} value={categoryData.name_en || ''} onChange={e => setCategoryData({...categoryData, name_en: e.target.value})} placeholder="e.g. Technology" /></div>
                                <div dir="rtl"><label className={labelClass}>{t({ar: 'الاسم (عربي)', en: 'Name (Arabic)'})}</label><input className={inputClass} value={categoryData.name_ar || ''} onChange={e => setCategoryData({...categoryData, name_ar: e.target.value})} placeholder="تكنولوجيا" /></div>
                            </div>
                        </div>

                        <button onClick={handleSubmit} className="w-full bg-med-vital-green text-white font-bold py-3 rounded-lg hover:bg-green-700 shadow-md transition-all text-lg">
                            {isEditing ? t({ar: 'تحديث التصنيف', en: 'Update Category'}) : t({ar: 'حفظ التصنيف', en: 'Save Category'})}
                        </button>
                     </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider font-bold">
                        <tr>
                            <th className="p-4 border-b text-start">{t({ar: 'الاسم (إنجليزي)', en: 'Name (EN)'})}</th>
                            <th className="p-4 border-b text-start">{t({ar: 'الاسم (عربي)', en: 'Name (AR)'})}</th>
                            <th className="p-4 border-b text-end">{t({ar: 'الإجراءات', en: 'Actions'})}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {categories.map(c => (
                            <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-gray-900 font-medium">{c.name_en}</td>
                                <td className="p-4 text-gray-600">{c.name_ar}</td>
                                <td className="p-4 text-right space-x-2">
                                    <button onClick={() => handleEdit(c)} className="text-blue-600 hover:text-blue-800 font-medium text-sm border border-blue-200 px-3 py-1 rounded hover:bg-blue-50 transition-colors">{t({ar: 'تعديل', en: 'Edit'})}</button>
                                    
                                    {deleteId === c.id ? (
                                        <div className="inline-flex items-center gap-1">
                                            <span className="text-xs text-red-600 font-bold mx-1">{t({ar: 'تأكيد؟', en: 'Sure?'})}</span>
                                            <button onClick={() => handleDelete(c.id)} className="text-white bg-red-600 hover:bg-red-700 font-medium text-xs px-2 py-1 rounded">{t({ar: 'نعم', en: 'Yes'})}</button>
                                            <button onClick={() => setDeleteId(null)} className="text-gray-600 bg-gray-200 hover:bg-gray-300 font-medium text-xs px-2 py-1 rounded">{t({ar: 'لا', en: 'No'})}</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setDeleteId(c.id)} className="text-red-600 hover:text-red-800 font-medium text-sm border border-red-200 px-3 py-1 rounded hover:bg-red-50 transition-colors">{t({ar: 'حذف', en: 'Delete'})}</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && (
                            <tr><td colSpan={3} className="p-8 text-center text-gray-500">{t({ar: 'لا توجد تصنيفات', en: 'No categories found.'})}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CategoriesTab;
