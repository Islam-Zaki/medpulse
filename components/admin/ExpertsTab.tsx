
import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { useLocalization } from '../../hooks/useLocalization';
import { api } from '../../services/api';
import type { ApiExpert, ExpertContact, ApiEvent } from '../../types';
import RichTextEditor from './RichTextEditor';

interface ExpertsTabProps {
    experts: ApiExpert[];
    events: ApiEvent[];
    currentPage: number;
    lastPage: number;
    onPageChange: (page: number) => void;
    onRefresh: () => void;
}

const DOMAIN = 'https://medpulse-production.up.railway.app';

const DynamicListEditor: React.FC<{ 
    label: string; 
    items: string[]; 
    onChange: (items: string[]) => void; 
    placeholder: string;
    isRtl?: boolean;
}> = ({ label, items, onChange, placeholder, isRtl }) => {
    const { t } = useLocalization();
    
    const addItem = () => onChange([...items, '']);
    const removeItem = (idx: number) => onChange(items.filter((_, i) => i !== idx));
    const updateItem = (idx: number, val: string) => {
        const newItems = [...items];
        newItems[idx] = val;
        onChange(newItems);
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">{label}</label>
            <div className="space-y-2">
                {items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center group">
                        <div className="flex-grow relative">
                             <input 
                                className={`w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-med-tech-blue outline-none ${isRtl ? 'text-right' : ''}`}
                                value={item}
                                onChange={e => updateItem(idx, e.target.value)}
                                placeholder={placeholder}
                                dir={isRtl ? 'rtl' : 'ltr'}
                            />
                            <div className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-med-tech-blue/30 ${isRtl ? '-right-3' : '-left-3'}`}></div>
                        </div>
                        <button 
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="text-red-400 hover:text-red-600 transition-colors p-1"
                            title={t({ar: 'حذف', en: 'Remove'})}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                ))}
            </div>
            <button 
                type="button"
                onClick={addItem}
                className="text-xs font-bold text-med-tech-blue hover:text-blue-700 flex items-center gap-1 mt-1"
            >
                <span className="text-base">+</span> {t({ar: 'إضافة عنصر', en: 'Add Item'})}
            </button>
        </div>
    );
};

const ExpertsTab: React.FC<ExpertsTabProps> = ({ experts, events, currentPage, lastPage, onPageChange, onRefresh }) => {
    const { showToast } = useToast();
    const { t } = useLocalization();
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [expertData, setExpertData] = useState<ApiExpert>({
        number_of_events: 0,
        years_of_experience: 0
    } as ApiExpert);
    const [expertImage, setExpertImage] = useState<File | null>(null);
    
    // Arrays state
    const [evalSpecsEn, setEvalSpecsEn] = useState<string[]>([]);
    const [evalSpecsAr, setEvalSpecsAr] = useState<string[]>([]);
    const [subSpecsEn, setSubSpecsEn] = useState<string[]>([]);
    const [subSpecsAr, setSubSpecsAr] = useState<string[]>([]);
    const [membershipsEn, setMembershipsEn] = useState<string[]>([]);
    const [membershipsAr, setMembershipsAr] = useState<string[]>([]);
    
    // New array for coveredEventsIds
    const [coveredEventsIds, setCoveredEventsIds] = useState<string[]>([]);

    // Contact state
    const [newContact, setNewContact] = useState({ name_en: '', name_ar: '', link: '' });

    // Video
    const [videoUrl, setVideoUrl] = useState('');
    const [existingVideo, setExistingVideo] = useState<any>(null);

    // Effect to auto-update number of events when IDs change
    useEffect(() => {
        setExpertData(prev => ({
            ...prev,
            number_of_events: coveredEventsIds.length
        }));
    }, [coveredEventsIds]);

    const extractYoutubeId = (url: string) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : url; 
    };

    const handleEdit = (expert: ApiExpert) => {
        setExpertData(expert);
        setEvalSpecsEn(expert.evaluated_specialties_en || []);
        setEvalSpecsAr(expert.evaluated_specialties_ar || []);
        setSubSpecsEn(expert.subspecialities_en || []);
        setSubSpecsAr(expert.subspecialities_ar || []);
        setMembershipsEn(expert.membership_en || []);
        setMembershipsAr(expert.membership_ar || []);
        
        // Extract coveredEventsIds from the expert object
        const ids = (expert as any).coveredEventsIds || [];
        setCoveredEventsIds(ids.map(String));

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
        setExpertData({ number_of_events: 0, years_of_experience: 0 } as ApiExpert);
        setEvalSpecsEn([]); setEvalSpecsAr([]);
        setSubSpecsEn([]); setSubSpecsAr([]);
        setMembershipsEn([]); setMembershipsAr([]);
        setCoveredEventsIds([]);
        setExpertImage(null);
        setNewContact({ name_en: '', name_ar: '', link: '' });
        setVideoUrl('');
        setExistingVideo(null);
        setIsEditing(false);
        setShowForm(false);
    };

    const toggleEventSelection = (id: string) => {
        setCoveredEventsIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSubmit = async () => {
        try {
            const clean = (arr: string[]) => arr.filter(s => s.trim() !== '');
            const payload = {
                ...expertData,
                evaluated_specialties_en: clean(evalSpecsEn),
                evaluated_specialties_ar: clean(evalSpecsAr),
                subspecialities_en: clean(subSpecsEn),
                subspecialities_ar: clean(subSpecsAr),
                membership_en: clean(membershipsEn),
                membership_ar: clean(membershipsAr),
                coveredEventsIds: coveredEventsIds, // Array of strings as required
                number_of_events: coveredEventsIds.length,
                years_of_experience: Number(expertData.years_of_experience || 0),
            };

            let res;
            if (isEditing && expertData.id) {
                res = await api.updateExpert(expertData.id, payload);
            } else {
                res = await api.createExpert(payload);
            }

            const expertId = res.id || res.data?.id || (isEditing ? expertData.id : null);

            if (expertImage && expertId) {
                await api.uploadImage(expertImage as File, 'expert', expertId, 'expert_id');
            }

            if (videoUrl && expertId) {
                const videoId = extractYoutubeId(videoUrl);
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
            if (!isEditing) resetForm(); 
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
            const payload = { ...newContact, expert_id: expertData.id };
            const res = await api.createExpertContact(payload);
            showToast(t({ar: 'تم إضافة جهة الاتصال', en: 'Contact added'}), 'success');
            const createdContact = res.data || res;
            const newContactEntry: ExpertContact = {
                id: createdContact.id || Date.now(),
                expert_id: expertData.id,
                name_en: newContact.name_en,
                name_ar: newContact.name_ar,
                link: newContact.link
            };
            setExpertData(prev => ({ ...prev, contacts: [...(prev.contacts || []), newContactEntry] }));
            setNewContact({ name_en: '', name_ar: '', link: '' });
            onRefresh(); 
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
            setExpertData(prev => ({ ...prev, contacts: prev.contacts?.filter(c => c.id !== contactId) }));
            onRefresh();
        } catch (e) {
            console.error(e);
            showToast(t({ar: 'فشل حذف جهة الاتصال', en: 'Failed to delete contact'}), 'error');
        }
    };

    const inputClass = "w-full p-2.5 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-med-tech-blue focus:border-transparent outline-none transition-shadow";
    const labelClass = "block text-sm font-bold text-gray-700 mb-1.5";

    const getExpertImageUrl = (e: ApiExpert) => {
        const recentImage = e.images && e.images.length > 0 ? [...e.images].sort((a, b) => b.id - a.id)[0] : null;
        return recentImage ? `${DOMAIN}${recentImage.base_url}${recentImage.name}` : e.image_url;
    };

    return (
        <div className="space-y-8 pb-20">
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
                    
                    <div className="space-y-10">
                        {/* 1. Personal Info */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <h5 className="font-bold text-med-tech-blue mb-4 uppercase text-xs tracking-wider">{t({ar: 'المعلومات الشخصية', en: 'Personal Information'})}</h5>
                            <div className="grid md:grid-cols-2 gap-6 mb-4">
                                <div><label className={labelClass}>{t({ar: 'الاسم (إنجليزي)', en: 'Name (English)'})}</label><input className={inputClass} value={expertData.name_en || ''} onChange={e => setExpertData(prev => ({...prev, name_en: e.target.value}))} placeholder="e.g. Dr. John Doe" /></div>
                                <div dir="rtl"><label className={labelClass}>{t({ar: 'الاسم (عربي)', en: 'Name (Arabic)'})}</label><input className={inputClass} value={expertData.name_ar || ''} onChange={e => setExpertData(prev => ({...prev, name_ar: e.target.value}))} placeholder="د. فلان الفلاني" /></div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6 mb-4">
                                <div><label className={labelClass}>{t({ar: 'المسمى الوظيفي (إنجليزي)', en: 'Job Title (English)'})}</label><input className={inputClass} value={expertData.job_en || ''} onChange={e => setExpertData(prev => ({...prev, job_en: e.target.value}))} placeholder="e.g. Dermatologist" /></div>
                                <div dir="rtl"><label className={labelClass}>{t({ar: 'المسمى الوظيفي (عربي)', en: 'Job Title (Arabic)'})}</label><input className={inputClass} value={expertData.job_ar || ''} onChange={e => setExpertData(prev => ({...prev, job_ar: e.target.value}))} placeholder="طبيب جلدية" /></div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div><label className={labelClass}>{t({ar: 'الوظيفة الحالية (إنجليزي)', en: 'Current Job (English)'})}</label><input className={inputClass} value={expertData.current_job_en || ''} onChange={e => setExpertData(prev => ({...prev, current_job_en: e.target.value}))} /></div>
                                <div dir="rtl"><label className={labelClass}>{t({ar: 'الوظيفة الحالية (عربي)', en: 'Current Job (Arabic)'})}</label><input className={inputClass} value={expertData.current_job_ar || ''} onChange={e => setExpertData(prev => ({...prev, current_job_ar: e.target.value}))} /></div>
                            </div>
                        </div>

                        {/* 2. Bio Section */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <h5 className="font-bold text-med-tech-blue mb-4 uppercase text-xs tracking-wider">{t({ar: 'النبذة التعريفية (Bio)', en: 'Biography (Bio)'})}</h5>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClass}>{t({ar: 'نبذة (إنجليزي)', en: 'Bio (English)'})}</label>
                                    <RichTextEditor height="250px" value={expertData.description_en || ''} onChange={v => setExpertData(prev => ({...prev, description_en: v}))} placeholder="Write English bio..." />
                                </div>
                                <div dir="rtl">
                                    <label className={labelClass}>{t({ar: 'نبذة (عربي)', en: 'Bio (Arabic)'})}</label>
                                    <RichTextEditor height="250px" value={expertData.description_ar || ''} onChange={v => setExpertData(prev => ({...prev, description_ar: v}))} placeholder="اكتب النبذة بالعربي..." />
                                </div>
                            </div>
                        </div>

                        {/* 3. Stats Section */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <h5 className="font-bold text-med-tech-blue mb-4 uppercase text-xs tracking-wider">{t({ar: 'الإحصائيات والخبرة', en: 'Stats & Experience'})}</h5>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <label className={labelClass}>{t({ar: 'سنوات الخبرة', en: 'Years of Experience'})}</label>
                                    <input type="number" className={inputClass} value={expertData.years_of_experience || ''} onChange={e => setExpertData(prev => ({...prev, years_of_experience: Number(e.target.value)}))} />
                                </div>
                                <div>
                                    <label className={labelClass}>{t({ar: 'عدد المؤتمرات التي قيمها (تلقائي)', en: 'Number of Events Evaluated (Auto)'})}</label>
                                    <input type="text" className={`${inputClass} bg-blue-50 font-bold`} value={coveredEventsIds.length} readOnly />
                                </div>
                            </div>
                        </div>

                        {/* 4. MedPulse Role */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <h5 className="font-bold text-med-tech-blue mb-4 uppercase text-xs tracking-wider">{t({ar: 'دور في ميد بلس', en: 'MedPulse Role'})}</h5>
                            <div className="grid md:grid-cols-2 gap-6 mb-4">
                                <div><label className={labelClass}>{t({ar: 'الدور (إنجليزي)', en: 'Role (English)'})}</label><input className={inputClass} value={expertData.medpulse_role_en || ''} onChange={e => setExpertData(prev => ({...prev, medpulse_role_en: e.target.value}))} /></div>
                                <div dir="rtl"><label className={labelClass}>{t({ar: 'الدور (عربي)', en: 'Role (Arabic)'})}</label><input className={inputClass} value={expertData.medpulse_role_ar || ''} onChange={e => setExpertData(prev => ({...prev, medpulse_role_ar: e.target.value}))} /></div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6 mb-4">
                                <div><label className={labelClass}>{t({ar: 'وصف الدور (إنجليزي)', en: 'Role Description (English)'})}</label><textarea rows={2} className={inputClass} value={expertData.medpulse_role_description_en || ''} onChange={e => setExpertData(prev => ({...prev, medpulse_role_description_en: e.target.value}))} /></div>
                                <div dir="rtl"><label className={labelClass}>{t({ar: 'وصف الدور (عربي)', en: 'Role Description (Arabic)'})}</label><textarea rows={2} className={inputClass} value={expertData.medpulse_role_description_ar || ''} onChange={e => setExpertData(prev => ({...prev, medpulse_role_description_ar: e.target.value}))} /></div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div><label className={labelClass}>{t({ar: 'نوع التغطية (إنجليزي)', en: 'Coverage Type (English)'})}</label><input className={inputClass} value={expertData.coverage_type_en || ''} onChange={e => setExpertData(prev => ({...prev, coverage_type_en: e.target.value}))} /></div>
                                <div dir="rtl"><label className={labelClass}>{t({ar: 'نوع التغطية (عربي)', en: 'Coverage Type (Arabic)'})}</label><input className={inputClass} value={expertData.coverage_type_ar || ''} onChange={e => setExpertData(prev => ({...prev, coverage_type_ar: e.target.value}))} /></div>
                            </div>
                        </div>

                        {/* 5. Bullet Point Lists */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <h5 className="font-bold text-med-tech-blue mb-6 uppercase text-xs tracking-wider border-b pb-2">{t({ar: 'القوائم والنقاط', en: 'Bullet Point Lists'})}</h5>
                            <div className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <DynamicListEditor label={t({ar: 'التخصصات التي يقيمها (إنجليزي)', en: 'Evaluated Specialties (EN)'})} items={evalSpecsEn} onChange={setEvalSpecsEn} placeholder="Cardiology..." />
                                    <DynamicListEditor label={t({ar: 'التخصصات التي يقيمها (عربي)', en: 'Evaluated Specialties (AR)'})} items={evalSpecsAr} onChange={setEvalSpecsAr} placeholder="أمراض القلب..." isRtl />
                                </div>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <DynamicListEditor label={t({ar: 'التخصصات الدقيقة (إنجليزي)', en: 'Subspecialties (EN)'})} items={subSpecsEn} onChange={setSubSpecsEn} placeholder="Interventional Cardiology..." />
                                    <DynamicListEditor label={t({ar: 'التخصصات الدقيقة (عربي)', en: 'Subspecialties (AR)'})} items={subSpecsAr} onChange={setSubSpecsAr} placeholder="أمراض القلب التداخلية..." isRtl />
                                </div>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <DynamicListEditor label={t({ar: 'العضويات (إنجليزي)', en: 'Memberships (EN)'})} items={membershipsEn} onChange={setMembershipsEn} placeholder="European Society of Cardiology..." />
                                    <DynamicListEditor label={t({ar: 'العضويات (عربي)', en: 'Memberships (AR)'})} items={membershipsAr} onChange={setMembershipsAr} placeholder="جمعية القلب الأوروبية..." isRtl />
                                </div>
                            </div>
                        </div>

                        {/* 6. Contacts */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <h5 className="font-bold text-med-tech-blue mb-4 uppercase text-xs tracking-wider">{t({ar: 'معلومات التواصل', en: 'Contact Information'})}</h5>
                            {expertData.contacts && expertData.contacts.length > 0 ? (
                                <div className="space-y-3 mb-6">
                                    {expertData.contacts.map(contact => (
                                        <div key={contact.id} className="flex justify-between items-center bg-white p-3 rounded border border-gray-200">
                                            <div className="flex gap-4">
                                                <span className="font-bold text-gray-800">{contact.name_en}</span>
                                                <span className="text-gray-600">/ {contact.name_ar}</span>
                                                <a href={contact.link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate max-w-xs">{contact.link}</a>
                                            </div>
                                            <button type="button" onClick={() => handleDeleteContact(contact.id)} className="text-red-500 hover:text-red-700 text-sm font-bold">{t({ar: 'حذف', en: 'Delete'})}</button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 mb-6 italic text-center">{t({ar: 'لا توجد جهات اتصال', en: 'No contacts found'})}</p>
                            )}

                            {expertData.id ? (
                                <div className="bg-white p-4 rounded border border-gray-200">
                                    <h6 className="font-bold text-sm text-gray-700 mb-3">{t({ar: 'إضافة جهة اتصال جديدة', en: 'Add New Contact'})}</h6>
                                    <div className="grid md:grid-cols-3 gap-4 mb-3">
                                        <input className={inputClass} value={newContact.name_en} onChange={e => setNewContact(prev => ({...prev, name_en: e.target.value}))} placeholder={t({ar: 'المنصة (EN)', en: 'Platform (EN)'})} />
                                        <div dir="rtl"><input className={inputClass} value={newContact.name_ar} onChange={e => setNewContact(prev => ({...prev, name_ar: e.target.value}))} placeholder={t({ar: 'المنصة (AR)', en: 'Platform (AR)'})} /></div>
                                        <input className={inputClass} value={newContact.link} onChange={e => setNewContact(prev => ({...prev, link: e.target.value}))} placeholder="https://..." />
                                    </div>
                                    <button type="button" onClick={handleAddContact} className="w-full bg-med-tech-blue text-white font-bold py-2 rounded hover:bg-blue-700 text-sm">{t({ar: 'إضافة', en: 'Add Contact'})}</button>
                                </div>
                            ) : (
                                <div className="text-center p-3 bg-yellow-50 text-yellow-800 rounded text-sm">{t({ar: 'يرجى حفظ الخبير أولاً لإضافة جهات الاتصال', en: 'Please save expert first to add contacts'})}</div>
                            )}
                        </div>

                        {/* 7. Evaluated Conferences (NEW SECTION POSITION) */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <h5 className="font-bold text-med-tech-blue mb-4 uppercase text-xs tracking-wider">{t({ar: 'المؤتمرات التي تم تقييمها', en: 'Evaluated Conferences'})}</h5>
                            <div className="mt-2">
                                <label className={labelClass}>{t({ar: 'اختر المؤتمرات التي قيمها هذا الخبير', en: 'Select conferences evaluated by this expert'})}</label>
                                <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md bg-white p-3 space-y-2">
                                    {events.map(event => (
                                        <label key={event.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors">
                                            <input 
                                                type="checkbox" 
                                                checked={coveredEventsIds.includes(event.id.toString())}
                                                onChange={() => toggleEventSelection(event.id.toString())}
                                                className="w-4 h-4 rounded text-med-tech-blue focus:ring-med-tech-blue border-gray-300"
                                            />
                                            <div className="flex flex-col ml-3 rtl:mr-3">
                                                <span className="text-sm font-medium text-gray-800">{event.title_en}</span>
                                                <span className="text-xs text-gray-500">{event.title_ar}</span>
                                            </div>
                                        </label>
                                    ))}
                                    {events.length === 0 && <p className="text-sm text-gray-400 italic p-2">{t({ar: 'لا توجد مؤتمرات متاحة', en: 'No conferences available'})}</p>}
                                </div>
                            </div>
                        </div>

                        {/* 8. Media */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <h5 className="font-bold text-med-tech-blue mb-4 uppercase text-xs tracking-wider">{t({ar: 'الصور والفيديو', en: 'Photos & Video'})}</h5>
                            {isEditing && (
                                <div className="mb-4 flex items-center gap-4 bg-white p-3 rounded border border-gray-200 w-fit">
                                    <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-300 bg-gray-100">
                                        <img src={getExpertImageUrl(expertData)} alt="Current" className="w-full h-full object-cover" onError={(e: any) => e.target.src = 'https://picsum.photos/seed/doc-placeholder/400/400'} />
                                    </div>
                                    <span className="text-xs font-bold text-gray-500 uppercase">{t({ar: 'الصورة الحالية', en: 'Current Image'})}</span>
                                </div>
                            )}
                            <label className={labelClass}>{t({ar: 'رفع صورة جديدة', en: 'Upload New Image'})}</label>
                            <input type="file" accept="image/*" onChange={e => setExpertImage(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-med-tech-blue file:text-white hover:file:bg-blue-700 cursor-pointer" />
                            
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <label className={labelClass}>{t({ar: 'رابط فيديو (يوتيوب)', en: 'Video URL (YouTube)'})}</label>
                                <input className={inputClass} value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
                                {videoUrl && (
                                    <div className="mt-2 text-xs text-blue-600">
                                        {extractYoutubeId(videoUrl) ? t({ar: 'تم التعرف على الفيديو', en: 'Video detected'}) : t({ar: 'رابط غير صالح', en: 'Invalid URL'})}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button onClick={handleSubmit} className="w-full bg-med-vital-green text-white font-bold py-4 rounded-xl hover:bg-green-700 shadow-xl transition-all text-lg transform hover:-translate-y-1">
                            {isEditing ? t({ar: 'تحديث الخبير', en: 'Update Expert'}) : t({ar: 'حفظ الخبير', en: 'Save Expert'})}
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
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
                            const imageUrl = getExpertImageUrl(e);
                            return (
                            <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 bg-gray-100">
                                        {imageUrl ? <img src={imageUrl} alt={e.name_en} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>}
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
                        {experts.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-500">{t({ar: 'لا يوجد خبراء', en: 'No experts found.'})}</td></tr>}
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

export default ExpertsTab;
