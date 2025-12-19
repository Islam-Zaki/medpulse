
import React, { useState } from 'react';
import { useToast } from '../../hooks/useToast';
import { useLocalization } from '../../hooks/useLocalization';
import { api } from '../../services/api';
import type { ApiExpert, ExpertContact } from '../../types';

interface ExpertsTabProps {
    experts: ApiExpert[];
    onRefresh: () => void;
}

const DOMAIN = 'https://medpulse-production.up.railway.app';

const ExpertsTab: React.FC<ExpertsTabProps> = ({ experts, onRefresh }) => {
    const { showToast } = useToast();
    const { t } = useLocalization();
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [expertData, setExpertData] = useState<ApiExpert>({} as ApiExpert);
    const [expertImage, setExpertImage] = useState<File | null>(null);
    
    // Arrays state
    const [evalSpecsEn, setEvalSpecsEn] = useState('');
    const [evalSpecsAr, setEvalSpecsAr] = useState('');
    const [subSpecsEn, setSubSpecsEn] = useState('');
    const [subSpecsAr, setSubSpecsAr] = useState('');
    const [membershipsEn, setMembershipsEn] = useState('');
    const [membershipsAr, setMembershipsAr] = useState('');

    // Contact state
    const [newContact, setNewContact] = useState({ name_en: '', name_ar: '', link: '' });

    // Video
    const [videoUrl, setVideoUrl] = useState('');
    const [existingVideo, setExistingVideo] = useState<any>(null);

    const extractYoutubeId = (url: string) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : url; 
    };

    const handleEdit = (expert: ApiExpert) => {
        setExpertData(expert);
        setEvalSpecsEn(expert.evaluated_specialties_en?.join(', ') || '');
        setEvalSpecsAr(expert.evaluated_specialties_ar?.join(', ') || '');
        setSubSpecsEn(expert.subspecialities_en?.join(', ') || '');
        setSubSpecsAr(expert.subspecialities_ar?.join(', ') || '');
        setMembershipsEn(expert.membership_en?.join(', ') || '');
        setMembershipsAr(expert.membership_ar?.join(', ') || '');
        
        // Video
        const vid = expert.videos && expert.videos.length > 0 ? expert.videos[0] : null;
        setExistingVideo(vid);
        if (vid && vid.base_url && vid.name) {
            setVideoUrl(vid.base_url + vid.name);
        } else {
            setVideoUrl('');
        }

        setIsEditing(true);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setExpertData({} as ApiExpert);
        setEvalSpecsEn(''); setEvalSpecsAr('');
        setSubSpecsEn(''); setSubSpecsAr('');
        setMembershipsEn(''); setMembershipsAr('');
        setExpertImage(null);
        setNewContact({ name_en: '', name_ar: '', link: '' });
        setVideoUrl('');
        setExistingVideo(null);
        setIsEditing(false);
        setShowForm(false);
    };

    const handleSubmit = async () => {
        try {
            const processArr = (s: string) => s.split(',').map(v => v.trim()).filter(Boolean);
            const payload = {
                ...expertData,
                evaluated_specialties_en: processArr(evalSpecsEn),
                evaluated_specialties_ar: processArr(evalSpecsAr),
                subspecialities_en: processArr(subSpecsEn),
                subspecialities_ar: processArr(subSpecsAr),
                membership_en: processArr(membershipsEn),
                membership_ar: processArr(membershipsAr),
                number_of_events: Number(expertData.number_of_events || 0),
                years_of_experience: Number(expertData.years_of_experience || 0),
            };

            let res;
            if (isEditing && expertData.id) {
                res = await api.updateExpert(expertData.id, payload);
            } else {
                res = await api.createExpert(payload);
            }

            // Check if response indicates success or has ID
            const expertId = res.id || res.data?.id || (isEditing ? expertData.id : null);

            if (expertImage && expertId) {
                await api.uploadImage(expertImage as File, 'expert', expertId, 'expert_id');
            }

            // Video saving logic
            if (videoUrl && expertId) {
                const videoId = extractYoutubeId(videoUrl);
                // Check if we need to save new video
                if (!existingVideo || existingVideo.name !== videoId) {
                     await api.createVideo({
                         name: videoId,
                         type: 'expert',
                         expert_id: expertId
                     });
                }
            }
            
            showToast(isEditing ? t({ar: 'تم تحديث الخبير بنجاح', en: 'Expert updated successfully'}) : t({ar: 'تم إنشاء الخبير بنجاح', en: 'Expert created successfully'}), 'success');
            onRefresh();
            if (!isEditing) resetForm(); // Keep form open if editing to allow adding contacts
        } catch (e) { 
            console.error(e);
            showToast(t({ar: 'فشل حفظ الخبير. تأكد من صحة البيانات.', en: 'Failed to save expert. Check data validity.'}), 'error'); 
        }
    };

    const handleAddContact = async () => {
        if (!expertData.id) {
            showToast(t({ar: 'يجب حفظ الخبير أولاً لإضافة جهات اتصال', en: 'Must save expert first to add contacts'}), 'error');
            return;
        }
        if (!newContact.name_en || !newContact.link) {
            showToast(t({ar: 'يرجى إدخال الاسم (EN) والرابط', en: 'Please enter Name (EN) and Link'}), 'error');
            return;
        }

        try {
            const payload = {
                ...newContact,
                expert_id: expertData.id
            };
            const res = await api.createExpertContact(payload);
            showToast(t({ar: 'تم إضافة جهة الاتصال', en: 'Contact added'}), 'success');
            
            // Optimistically update local state
            const createdContact = res.data || res; // Handle if API returns wrapped data
            // Assuming response contains the created contact with ID
            const newContactEntry: ExpertContact = {
                id: createdContact.id || Date.now(),
                expert_id: expertData.id,
                name_en: newContact.name_en,
                name_ar: newContact.name_ar,
                link: newContact.link
            };

            setExpertData(prev => ({
                ...prev,
                contacts: [...(prev.contacts || []), newContactEntry]
            }));
            
            setNewContact({ name_en: '', name_ar: '', link: '' });
            onRefresh(); // Refresh parent list to sync
        } catch (e) {
            console.error(e);
            showToast(t({ar: 'فشل إضافة جهة الاتصال', en: 'Failed to add contact'}), 'error');
        }
    };

    const handleDeleteContact = async (contactId: number) => {
        if (!window.confirm(t({ar: 'هل أنت متأكد من حذف جهة الاتصال هذه؟', en: 'Are you sure you want to delete this contact?'}))) return;
        
        try {
            await api.deleteExpertContact(contactId);
            showToast(t({ar: 'تم حذف جهة الاتصال', en: 'Contact deleted'}), 'success');
            setExpertData(prev => ({
                ...prev,
                contacts: prev.contacts?.filter(c => c.id !== contactId)
            }));
            onRefresh();
        } catch (e) {
            console.error(e);
            showToast(t({ar: 'فشل حذف جهة الاتصال', en: 'Failed to delete contact'}), 'error');
        }
    };

    const inputClass = "w-full p-2.5 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-med-tech-blue focus:border-transparent outline-none transition-shadow";
    const labelClass = "block text-sm font-bold text-gray-700 mb-1.5";

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div>
                    <h3 className="text-xl font-bold text-med-blue">{t({ar: 'إدارة الخبراء', en: 'Experts Management'})}</h3>
                    <p className="text-gray-500 text-sm">{t({ar: 'إدارة ملفات الأطباء والمقيمين', en: 'Manage doctor profiles and evaluators'})}</p>
                </div>
                <button 
                    onClick={() => { if(showForm) resetForm(); else setShowForm(true); }} 
                    className={`px-6 py-2.5 rounded-lg font-bold transition-all shadow-sm ${showForm ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-med-tech-blue text-white hover:bg-blue-700'}`}
                >
                    {showForm ? t({ar: 'إلغاء وإخفاء النموذج', en: 'Cancel & Hide Form'}) : t({ar: '+ إضافة خبير جديد', en: '+ Add New Expert'})}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 animate-fade-in-down">
                    <h4 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">{isEditing ? t({ar: 'تعديل الخبير', en: 'Edit Expert'}) : t({ar: 'إنشاء خبير جديد', en: 'Create New Expert'})}</h4>
                    
                    <div className="space-y-6">
                        {/* Personal Info */}
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                            <h5 className="font-bold text-med-tech-blue mb-4 uppercase text-xs tracking-wider">{t({ar: 'المعلومات الشخصية', en: 'Personal Information'})}</h5>
                            <div className="grid md:grid-cols-2 gap-6 mb-4">
                                <div><label className={labelClass}>{t({ar: 'الاسم (إنجليزي)', en: 'Name (English)'})}</label><input className={inputClass} value={expertData.name_en || ''} onChange={e => setExpertData({...expertData, name_en: e.target.value})} placeholder="e.g. Dr. John Doe" /></div>
                                <div dir="rtl"><label className={labelClass}>{t({ar: 'الاسم (عربي)', en: 'Name (Arabic)'})}</label><input className={inputClass} value={expertData.name_ar || ''} onChange={e => setExpertData({...expertData, name_ar: e.target.value})} placeholder="د. فلان الفلاني" /></div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6 mb-4">
                                <div><label className={labelClass}>{t({ar: 'المسمى الوظيفي (إنجليزي)', en: 'Job Title (English)'})}</label><input className={inputClass} value={expertData.job_en || ''} onChange={e => setExpertData({...expertData, job_en: e.target.value})} placeholder="e.g. Dermatologist" /></div>
                                <div dir="rtl"><label className={labelClass}>{t({ar: 'المسمى الوظيفي (عربي)', en: 'Job Title (Arabic)'})}</label><input className={inputClass} value={expertData.job_ar || ''} onChange={e => setExpertData({...expertData, job_ar: e.target.value})} placeholder="طبيب جلدية" /></div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6 mb-4">
                                <div><label className={labelClass}>{t({ar: 'الوظيفة الحالية (إنجليزي)', en: 'Current Job (English)'})}</label><input className={inputClass} value={expertData.current_job_en || ''} onChange={e => setExpertData({...expertData, current_job_en: e.target.value})} /></div>
                                <div dir="rtl"><label className={labelClass}>{t({ar: 'الوظيفة الحالية (عربي)', en: 'Current Job (Arabic)'})}</label><input className={inputClass} value={expertData.current_job_ar || ''} onChange={e => setExpertData({...expertData, current_job_ar: e.target.value})} /></div>
                            </div>
                        </div>

                        {/* MedPulse Role */}
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                            <h5 className="font-bold text-med-tech-blue mb-4 uppercase text-xs tracking-wider">{t({ar: 'دور في ميد بلس', en: 'MedPulse Role'})}</h5>
                            <div className="grid md:grid-cols-2 gap-6 mb-4">
                                <div><label className={labelClass}>{t({ar: 'الدور (إنجليزي)', en: 'Role (English)'})}</label><input className={inputClass} value={expertData.medpulse_role_en || ''} onChange={e => setExpertData({...expertData, medpulse_role_en: e.target.value})} /></div>
                                <div dir="rtl"><label className={labelClass}>{t({ar: 'الدور (عربي)', en: 'Role (Arabic)'})}</label><input className={inputClass} value={expertData.medpulse_role_ar || ''} onChange={e => setExpertData({...expertData, medpulse_role_ar: e.target.value})} /></div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6 mb-4">
                                <div><label className={labelClass}>{t({ar: 'وصف الدور (إنجليزي)', en: 'Role Description (English)'})}</label><textarea rows={2} className={inputClass} value={expertData.medpulse_role_description_en || ''} onChange={e => setExpertData({...expertData, medpulse_role_description_en: e.target.value})} /></div>
                                <div dir="rtl"><label className={labelClass}>{t({ar: 'وصف الدور (عربي)', en: 'Role Description (Arabic)'})}</label><textarea rows={2} className={inputClass} value={expertData.medpulse_role_description_ar || ''} onChange={e => setExpertData({...expertData, medpulse_role_description_ar: e.target.value})} /></div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6 mb-4">
                                <div><label className={labelClass}>{t({ar: 'نوع التغطية (إنجليزي)', en: 'Coverage Type (English)'})}</label><input className={inputClass} value={expertData.coverage_type_en || ''} onChange={e => setExpertData({...expertData, coverage_type_en: e.target.value})} /></div>
                                <div dir="rtl"><label className={labelClass}>{t({ar: 'نوع التغطية (عربي)', en: 'Coverage Type (Arabic)'})}</label><input className={inputClass} value={expertData.coverage_type_ar || ''} onChange={e => setExpertData({...expertData, coverage_type_ar: e.target.value})} /></div>
                            </div>
                        </div>

                        {/* Stats & Description */}
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                            <h5 className="font-bold text-med-tech-blue mb-4 uppercase text-xs tracking-wider">{t({ar: 'التفاصيل والإحصائيات', en: 'Details & Statistics'})}</h5>
                            <div className="grid md:grid-cols-2 gap-6 mb-4">
                                <div><label className={labelClass}>{t({ar: 'سنوات الخبرة', en: 'Years of Experience'})}</label><input type="number" className={inputClass} value={expertData.years_of_experience || ''} onChange={e => setExpertData({...expertData, years_of_experience: Number(e.target.value)})} /></div>
                                <div><label className={labelClass}>{t({ar: 'عدد المؤتمرات التي قيمها', en: 'Number of Events Evaluated'})}</label><input type="number" className={inputClass} value={expertData.number_of_events || ''} onChange={e => setExpertData({...expertData, number_of_events: Number(e.target.value)})} /></div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div><label className={labelClass}>{t({ar: 'نبذة (إنجليزي)', en: 'Bio (English)'})}</label><textarea rows={3} className={inputClass} value={expertData.description_en || ''} onChange={e => setExpertData({...expertData, description_en: e.target.value})} /></div>
                                <div dir="rtl"><label className={labelClass}>{t({ar: 'نبذة (عربي)', en: 'Bio (Arabic)'})}</label><textarea rows={3} className={inputClass} value={expertData.description_ar || ''} onChange={e => setExpertData({...expertData, description_ar: e.target.value})} /></div>
                            </div>
                        </div>

                        {/* Lists */}
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                            <h5 className="font-bold text-med-tech-blue mb-4 uppercase text-xs tracking-wider">{t({ar: 'القوائم (مفصولة بفاصلة)', en: 'Lists (Comma Separated)'})}</h5>
                            <div className="grid md:grid-cols-2 gap-6 mb-4">
                                <div><label className={labelClass}>{t({ar: 'التخصصات التي يقيمها (إنجليزي)', en: 'Evaluated Specialties (EN)'})}</label><input className={inputClass} value={evalSpecsEn} onChange={e => setEvalSpecsEn(e.target.value)} /></div>
                                <div dir="rtl"><label className={labelClass}>{t({ar: 'التخصصات التي يقيمها (عربي)', en: 'Evaluated Specialties (AR)'})}</label><input className={inputClass} value={evalSpecsAr} onChange={e => setEvalSpecsAr(e.target.value)} /></div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6 mb-4">
                                <div><label className={labelClass}>{t({ar: 'التخصصات الدقيقة (إنجليزي)', en: 'Subspecialties (EN)'})}</label><input className={inputClass} value={subSpecsEn} onChange={e => setSubSpecsEn(e.target.value)} /></div>
                                <div dir="rtl"><label className={labelClass}>{t({ar: 'التخصصات الدقيقة (عربي)', en: 'Subspecialties (AR)'})}</label><input className={inputClass} value={subSpecsAr} onChange={e => setSubSpecsAr(e.target.value)} /></div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div><label className={labelClass}>{t({ar: 'العضويات (إنجليزي)', en: 'Memberships (EN)'})}</label><input className={inputClass} value={membershipsEn} onChange={e => setMembershipsEn(e.target.value)} /></div>
                                <div dir="rtl"><label className={labelClass}>{t({ar: 'العضويات (عربي)', en: 'Memberships (AR)'})}</label><input className={inputClass} value={membershipsAr} onChange={e => setMembershipsAr(e.target.value)} /></div>
                            </div>
                        </div>

                        {/* Contacts Section */}
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                            <h5 className="font-bold text-med-tech-blue mb-4 uppercase text-xs tracking-wider">{t({ar: 'معلومات التواصل', en: 'Contact Information'})}</h5>
                            
                            {/* Existing Contacts List */}
                            {expertData.contacts && expertData.contacts.length > 0 ? (
                                <div className="space-y-3 mb-6">
                                    {expertData.contacts.map(contact => (
                                        <div key={contact.id} className="flex justify-between items-center bg-white p-3 rounded border border-gray-200">
                                            <div className="flex gap-4">
                                                <span className="font-bold text-gray-800">{contact.name_en}</span>
                                                <span className="text-gray-600">/ {contact.name_ar}</span>
                                                <a href={contact.link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate max-w-xs">{contact.link}</a>
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteContact(contact.id)}
                                                className="text-red-500 hover:text-red-700 text-sm font-bold"
                                            >
                                                {t({ar: 'حذف', en: 'Delete'})}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 mb-6 italic text-center">{t({ar: 'لا توجد جهات اتصال', en: 'No contacts found'})}</p>
                            )}

                            {/* Add New Contact Form */}
                            {expertData.id ? (
                                <div className="bg-white p-4 rounded border border-gray-200">
                                    <h6 className="font-bold text-sm text-gray-700 mb-3">{t({ar: 'إضافة جهة اتصال جديدة', en: 'Add New Contact'})}</h6>
                                    <div className="grid md:grid-cols-3 gap-4 mb-3">
                                        <div><input className={inputClass} value={newContact.name_en} onChange={e => setNewContact({...newContact, name_en: e.target.value})} placeholder={t({ar: 'المنصة (EN)', en: 'Platform (EN)'})} /></div>
                                        <div dir="rtl"><input className={inputClass} value={newContact.name_ar} onChange={e => setNewContact({...newContact, name_ar: e.target.value})} placeholder={t({ar: 'المنصة (AR)', en: 'Platform (AR)'})} /></div>
                                        <div><input className={inputClass} value={newContact.link} onChange={e => setNewContact({...newContact, link: e.target.value})} placeholder="https://..." /></div>
                                    </div>
                                    <button onClick={handleAddContact} className="w-full bg-med-tech-blue text-white font-bold py-2 rounded hover:bg-blue-700 text-sm">
                                        {t({ar: 'إضافة', en: 'Add Contact'})}
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center p-3 bg-yellow-50 text-yellow-800 rounded text-sm">
                                    {t({ar: 'يرجى حفظ الخبير أولاً لإضافة جهات الاتصال', en: 'Please save expert first to add contacts'})}
                                </div>
                            )}
                        </div>

                        {/* Image */}
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                            <h5 className="font-bold text-med-tech-blue mb-4 uppercase text-xs tracking-wider">{t({ar: 'صورة الملف الشخصي', en: 'Profile Image'})}</h5>
                            <label className={labelClass}>{t({ar: 'رفع صورة', en: 'Upload Image'})}</label>
                            <input type="file" onChange={e => setExpertImage(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-med-tech-blue file:text-white hover:file:bg-blue-700 cursor-pointer" />
                            
                            {/* Video Input */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
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

                        <button onClick={handleSubmit} className="w-full bg-med-vital-green text-white font-bold py-3 rounded-lg hover:bg-green-700 shadow-md transition-all text-lg">
                            {isEditing ? t({ar: 'تحديث الخبير', en: 'Update Expert'}) : t({ar: 'حفظ الخبير', en: 'Save Expert'})}
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider font-bold">
                        <tr>
                            <th className="p-4 border-b text-start">{t({ar: 'الصورة', en: 'Image'})}</th>
                            <th className="p-4 border-b text-start">{t({ar: 'الاسم', en: 'Name'})}</th>
                            <th className="p-4 border-b text-start">{t({ar: 'المسمى الوظيفي', en: 'Job Title'})}</th>
                            <th className="p-4 border-b text-start">{t({ar: 'الدور', en: 'Role'})}</th>
                            <th className="p-4 border-b text-end">{t({ar: 'الإجراءات', en: 'Actions'})}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {experts.map(e => {
                            const recentImage = e.images && e.images.length > 0 
                                ? [...e.images].sort((a, b) => b.id - a.id)[0] 
                                : null;
                            const imageUrl = recentImage 
                                ? `${DOMAIN}${recentImage.base_url}${recentImage.name}` 
                                : e.image_url;

                            return (
                            <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 bg-gray-100">
                                        {imageUrl ? (
                                            <img src={imageUrl} alt={e.name_en} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="font-bold text-gray-900">{e.name_en}</div>
                                    <div className="text-xs text-gray-500">{e.name_ar}</div>
                                </td>
                                <td className="p-4 text-sm text-gray-700">{e.job_en}</td>
                                <td className="p-4 text-sm text-med-tech-blue font-semibold">{e.medpulse_role_en}</td>
                                <td className="p-4 text-right space-x-2">
                                    <button onClick={() => handleEdit(e)} className="text-blue-600 hover:text-blue-800 font-medium text-sm">{t({ar: 'تعديل', en: 'Edit'})}</button>
                                    <button onClick={() => { if(window.confirm(t({ar: 'هل أنت متأكد؟', en: 'Are you sure?'}))) { api.deleteExpert(e.id!).then(() => onRefresh()); } }} className="text-red-600 hover:text-red-800 font-medium text-sm">{t({ar: 'حذف', en: 'Delete'})}</button>
                                </td>
                            </tr>
                        )})}
                        {experts.length === 0 && (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">{t({ar: 'لا يوجد خبراء', en: 'No experts found.'})}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExpertsTab;