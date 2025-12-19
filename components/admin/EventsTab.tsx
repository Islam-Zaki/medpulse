
import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { useLocalization } from '../../hooks/useLocalization';
import { api } from '../../services/api';
import type { ApiEvent, EventAnalysis, ApiAuthor } from '../../types';

interface EventsTabProps {
    events: ApiEvent[];
    authors: ApiAuthor[];
    currentPage: number;
    lastPage: number;
    onPageChange: (page: number) => void;
    onRefresh: () => void;
}

interface SubjectEntry {
    title_en: string;
    title_ar: string;
    desc_en: string;
    desc_ar: string;
}

const DOMAIN = 'https://medpulse-production.up.railway.app';

const EventsTab: React.FC<EventsTabProps> = ({ events, authors, currentPage, lastPage, onPageChange, onRefresh }) => {
    const { showToast } = useToast();
    const { t } = useLocalization();
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    // Main Event Data
    const [eventData, setEventData] = useState<ApiEvent>({} as ApiEvent);
    
    // Analysis Data
    const [analysisData, setAnalysisData] = useState<EventAnalysis>({} as EventAnalysis);
    
    // Subjects Data
    const [subjectEntries, setSubjectEntries] = useState<SubjectEntry[]>([]);

    // Attachments
    const [selectedAuthorIds, setSelectedAuthorIds] = useState<number[]>([]);
    const [eventImages, setEventImages] = useState<File[]>([]);
    
    // Video
    const [videoUrl, setVideoUrl] = useState('');
    const [existingVideo, setExistingVideo] = useState<any>(null);

    const [viewEvent, setViewEvent] = useState<ApiEvent | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // Auto-calculate Rate and Stars when Analysis Data changes
    useEffect(() => {
        const c = Number(analysisData.content_rate) || 0;
        const o = Number(analysisData.organisation_rate) || 0;
        const s = Number(analysisData.speaker_rate) || 0;
        const sp = Number(analysisData.sponsering_rate) || 0;
        const si = Number(analysisData.scientific_impact_rate) || 0;

        // Weighted Sum (Max 100)
        // Content: 25, Org: 20, Speaker: 15, Sponsor: 20, Impact: 20
        const totalScore = 
            (c / 10) * 25 + 
            (o / 10) * 20 + 
            (s / 10) * 15 + 
            (sp / 10) * 20 + 
            (si / 10) * 20;
        
        // Stars (Max 5) -> Score / 20
        const stars = totalScore / 20;

        const roundedRate = parseFloat(totalScore.toFixed(1));
        const roundedStars = parseFloat(stars.toFixed(1));

        setEventData(prev => {
            // Only update if values actually changed to prevent loops/unnecessary renders
            if (prev.rate === roundedRate && prev.stars === roundedStars) return prev;
            return {
                ...prev,
                rate: roundedRate,
                stars: roundedStars
            };
        });

    }, [
        analysisData.content_rate,
        analysisData.organisation_rate,
        analysisData.speaker_rate,
        analysisData.sponsering_rate,
        analysisData.scientific_impact_rate
    ]);

    const extractYoutubeId = (url: string) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : url; 
    };

    const handleView = async (id: number) => {
        try {
            const res = await api.getEvent(id);
            const evt = res.data || res;
            // Ensure we try to find analysis in either field
            if (!evt.analysis && evt.event_analysis) {
                evt.analysis = evt.event_analysis;
            }
            setViewEvent(evt);
        } catch(e) {
            console.error(e);
            showToast(t({ar: 'فشل تحميل تفاصيل الفعالية', en: 'Failed to load event details'}), 'error');
        }
    };

    const handleEdit = async (item: ApiEvent) => {
        try {
            const res = await api.getEvent(item.id);
            const fullEvent: ApiEvent = res.data || res;
            
            setEventData(fullEvent);
            
            // Populate Subjects
            const sEn = fullEvent.subjects_en || fullEvent.subjects || [];
            const sAr = fullEvent.subjects_ar || [];
            const dEn = fullEvent.subjects_description_en || [];
            const dAr = fullEvent.subjects_description_ar || [];
            
            const maxLen = Math.max(sEn.length, sAr.length, dEn.length, dAr.length);
            const entries: SubjectEntry[] = [];
            for (let i = 0; i < maxLen; i++) {
                entries.push({
                    title_en: sEn[i] || '',
                    title_ar: sAr[i] || '',
                    desc_en: dEn[i] || '',
                    desc_ar: dAr[i] || ''
                });
            }
            setSubjectEntries(entries);
            
            const analysis = fullEvent.analysis || fullEvent.event_analysis;
            if (analysis) {
                setAnalysisData(analysis);
            } else {
                setAnalysisData({} as EventAnalysis);
            }

            // Populate Authors
            if (fullEvent.authors && Array.isArray(fullEvent.authors)) {
                setSelectedAuthorIds(fullEvent.authors.map(a => a.id));
            } else {
                setSelectedAuthorIds([]);
            }
            
            // Video
            const vid = fullEvent.videos && fullEvent.videos.length > 0 ? fullEvent.videos[0] : null;
            setExistingVideo(vid);
            if (vid && vid.base_url && vid.name) {
                setVideoUrl(vid.base_url + vid.name);
            } else {
                setVideoUrl('');
            }
            
            setEventImages([]);

            setIsEditing(true);
            setShowForm(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (e) {
            console.error(e);
            showToast(t({ar: 'فشل تحميل الفعالية للتعديل', en: 'Failed to load event for editing'}), 'error');
        }
    };

    const resetForm = () => {
        setEventData({} as ApiEvent);
        setAnalysisData({} as EventAnalysis);
        setSubjectEntries([]);
        setSelectedAuthorIds([]);
        setEventImages([]);
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
                setEventImages([]);
            } else {
                setEventImages(validFiles.slice(0, 10));
            }
        }
    };

    const toggleAuthorSelection = (id: number) => {
        setSelectedAuthorIds(prev => 
            prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]
        );
    };

    const addSubject = () => {
        setSubjectEntries([...subjectEntries, { title_en: '', title_ar: '', desc_en: '', desc_ar: '' }]);
    };

    const removeSubject = (index: number) => {
        setSubjectEntries(subjectEntries.filter((_, i) => i !== index));
    };

    const updateSubject = (index: number, field: keyof SubjectEntry, value: string) => {
        const newEntries = [...subjectEntries];
        newEntries[index][field] = value;
        setSubjectEntries(newEntries);
    };

    const handleSubmit = async () => {
        try {
            const eventPayload = {
                ...eventData,
                subjects_en: subjectEntries.map(s => s.title_en),
                subjects_ar: subjectEntries.map(s => s.title_ar),
                subjects_description_en: subjectEntries.map(s => s.desc_en),
                subjects_description_ar: subjectEntries.map(s => s.desc_ar),
                subjects: subjectEntries.map(s => s.title_en),
                rate: Number(eventData.rate),
                stars: Number(eventData.stars),
                authors: selectedAuthorIds // Send authors array directly
            };

            let savedEventId = eventData.id;

            if (isEditing && eventData.id) {
                await api.updateEvent(eventData.id, eventPayload);
            } else {
                const res = await api.createEvent(eventPayload);
                savedEventId = res.id || res.data?.id;
            }

            if (!savedEventId) throw new Error("Failed to get Event ID");

            const hasAnalysisData = 
                analysisData.description_en || 
                analysisData.content_rate || 
                analysisData.organisation_rate ||
                analysisData.speaker_rate ||
                analysisData.sponsering_rate ||
                analysisData.scientific_impact_rate;

            if (hasAnalysisData) {
                const analysisPayload: any = {
                    ...analysisData,
                    content_rate: Number(analysisData.content_rate || 0),
                    organisation_rate: Number(analysisData.organisation_rate || 0),
                    speaker_rate: Number(analysisData.speaker_rate || 0),
                    sponsering_rate: Number(analysisData.sponsering_rate || 0),
                    scientific_impact_rate: Number(analysisData.scientific_impact_rate || 0),
                };

                if (analysisData.id) {
                    // IMPORTANT: Delete event_id from payload during update to bypass backend unique validation bug
                    delete analysisPayload.event_id;
                    await api.updateEventAnalysis(analysisData.id, analysisPayload);
                } else {
                    analysisPayload.event_id = savedEventId;
                    await api.createEventAnalysis(analysisPayload);
                }
            }

            if (eventImages.length > 0) {
                await Promise.all(eventImages.map(file => 
                    api.uploadImage(file, 'event', savedEventId, 'event_id')
                ));
            }

            // Video saving logic
            if (videoUrl) {
                const videoId = extractYoutubeId(videoUrl);
                // Check if we need to save new video
                if (!existingVideo || existingVideo.name !== videoId) {
                     await api.createVideo({
                         name: videoId,
                         type: 'event',
                         event_id: savedEventId
                     });
                }
            }
            
            showToast(isEditing ? t({ar: 'تم تحديث الفعالية بنجاح', en: 'Event updated successfully'}) : t({ar: 'تم إنشاء الفعالية بنجاح', en: 'Event created successfully'}), 'success');
            onRefresh();
            resetForm();
        } catch (e) {
            console.error(e);
            showToast(t({ar: 'خطأ في حفظ الفعالية', en: 'Error saving event details'}), 'error');
        }
    };

    const inputClass = "w-full p-2.5 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-med-tech-blue focus:border-transparent outline-none transition-shadow";
    const labelClass = "block text-sm font-bold text-gray-700 mb-1.5";

    const renderRatingInputs = (label: string, rateKey: keyof EventAnalysis, descEnKey: keyof EventAnalysis, descArKey: keyof EventAnalysis) => (
        <div className="bg-white p-3 rounded border border-gray-200 hover:border-med-tech-blue/50 transition-colors">
            <h6 className="font-bold text-sm text-med-tech-blue mb-2">{label}</h6>
            <div className="grid md:grid-cols-6 gap-3">
                <div className="md:col-span-1">
                    <label className="text-xs text-gray-500 block mb-1">Score</label>
                    <input type="number" step="0.1" className={inputClass} value={analysisData[rateKey] as number || ''} onChange={e => setAnalysisData({...analysisData, [rateKey]: e.target.value})} placeholder="0-10" />
                </div>
                <div className="md:col-span-5 grid md:grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Description (EN)</label>
                        <input className={inputClass} value={analysisData[descEnKey] as string || ''} onChange={e => setAnalysisData({...analysisData, [descEnKey]: e.target.value})} placeholder="Feedback..." />
                    </div>
                    <div dir="rtl">
                        <label className="text-xs text-gray-500 block mb-1">الوصف (عربي)</label>
                        <input className={inputClass} value={analysisData[descArKey] as string || ''} onChange={e => setAnalysisData({...analysisData, [descArKey]: e.target.value})} placeholder="التعليق..." />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 relative">
            {viewEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-fade-in-down">
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="text-2xl font-bold text-med-blue">{t({ar: 'تفاصيل الفعالية', en: 'Event Details'})}</h3>
                            <button onClick={() => setViewEvent(null)} className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none">&times;</button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-2">{t({ar: 'العنوان (إنجليزي)', en: 'Title (English)'})}</h4>
                                    <p className="text-xl font-bold text-gray-900">{viewEvent.title_en}</p>
                                </div>
                                <div dir="rtl">
                                    <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-2">{t({ar: 'العنوان (عربي)', en: 'Title (Arabic)'})}</h4>
                                    <p className="text-xl font-bold text-gray-900">{viewEvent.title_ar}</p>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-8 border-t pt-6">
                                <div>
                                    <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-2">{t({ar: 'الموقع', en: 'Location'})}</h4>
                                    <p className="text-gray-900">{viewEvent.location}</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-2">{t({ar: 'التاريخ', en: 'Date'})}</h4>
                                    <p className="text-gray-900">{viewEvent.date_of_happening}</p>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-8 border-t pt-6">
                                <div>
                                    <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-2">{t({ar: 'المنظم', en: 'Organizer'})}</h4>
                                    <p className="text-gray-900">{viewEvent.organizer_en} / {viewEvent.organizer_ar}</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-2">{t({ar: 'التقييم', en: 'Rating'})}</h4>
                                    <p className="text-gray-900 font-bold">{viewEvent.rate}/100 <span className="text-gray-400 mx-2">|</span> {viewEvent.stars} Stars</p>
                                </div>
                            </div>
                            <div className="border-t pt-6">
                                <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-2">{t({ar: 'الوصف', en: 'Description'})}</h4>
                                <p className="text-gray-700 text-sm">{viewEvent.description_en}</p>
                                <p className="text-gray-700 text-sm mt-2 text-right" dir="rtl">{viewEvent.description_ar}</p>
                            </div>
                            
                            {/* Analysis View */}
                            {viewEvent.analysis && (
                                <div className="border-t pt-6 bg-gray-50 -mx-8 px-8 pb-6 mt-4">
                                    <h4 className="font-bold text-lg text-med-tech-blue uppercase tracking-wider mb-4 pt-6">{t({ar: 'التحليل التفصيلي', en: 'Detailed Analysis'})}</h4>
                                    
                                    {(viewEvent.analysis.description_en || viewEvent.analysis.description_ar) && (
                                        <div className="mb-6 p-4 bg-white rounded border border-gray-200">
                                            <h5 className="font-bold text-sm text-gray-700 mb-2">{t({ar: 'ملخص التحليل', en: 'Analysis Summary'})}</h5>
                                            <p className="text-sm text-gray-600 mb-2">{viewEvent.analysis.description_en}</p>
                                            <p className="text-sm text-gray-600 text-right" dir="rtl">{viewEvent.analysis.description_ar}</p>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        {[
                                            { key: 'content_rate', label: {ar: 'المحتوى', en: 'Content'} },
                                            { key: 'organisation_rate', label: {ar: 'التنظيم', en: 'Organization'} },
                                            { key: 'speaker_rate', label: {ar: 'المتحدثون', en: 'Speakers'} },
                                            { key: 'sponsering_rate', label: {ar: 'الرعاية', en: 'Sponsoring'} },
                                            { key: 'scientific_impact_rate', label: {ar: 'الأثر العلمي', en: 'Scientific Impact'} },
                                        ].map((item: any) => {
                                            const score = viewEvent.analysis?.[item.key as keyof EventAnalysis] as number;
                                            const descEn = viewEvent.analysis?.[`${item.key}_description_en` as keyof EventAnalysis] as string;
                                            const descAr = viewEvent.analysis?.[`${item.key}_description_ar` as keyof EventAnalysis] as string;
                                            return (
                                                <div key={item.key} className="grid md:grid-cols-4 gap-4 items-start border-b border-gray-200 last:border-0 pb-4">
                                                    <div className="md:col-span-1">
                                                        <span className="font-bold text-gray-800 block">{t(item.label)}</span>
                                                        <span className="text-2xl font-bold text-med-tech-blue">{score}</span><span className="text-xs text-gray-500">/10</span>
                                                    </div>
                                                    <div className="md:col-span-3 space-y-1">
                                                        <p className="text-sm text-gray-700">{descEn}</p>
                                                        <p className="text-sm text-gray-700 text-right" dir="rtl">{descAr}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {viewEvent.subjects_en && viewEvent.subjects_en.length > 0 && (
                                <div className="border-t pt-6">
                                    <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-2">{t({ar: 'المواضيع والمحاور', en: 'Subjects & Topics'})}</h4>
                                    <ul className="list-disc pl-5 rtl:pr-5 space-y-2">
                                        {viewEvent.subjects_en.map((subj, idx) => (
                                            <li key={idx}>
                                                <strong>{subj}</strong> / {viewEvent.subjects_ar?.[idx]}
                                                {viewEvent.subjects_description_en?.[idx] && (
                                                    <p className="text-sm text-gray-600 mt-1">{viewEvent.subjects_description_en[idx]} / {viewEvent.subjects_description_ar?.[idx]}</p>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {viewEvent.authors && viewEvent.authors.length > 0 && (
                                <div className="border-t pt-6">
                                    <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-2">{t({ar: 'المؤلفون والمشاركون', en: 'Authors & Contributors'})}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {viewEvent.authors.map(author => (
                                            <span key={author.id} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-900">{author.name_en}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t bg-gray-50 flex justify-end">
                            <button onClick={() => setViewEvent(null)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-bold transition-colors">{t({ar: 'إغلاق', en: 'Close'})}</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div>
                    <h3 className="text-xl font-bold text-med-blue">{t({ar: 'إدارة الفعاليات', en: 'Events Management'})}</h3>
                    <p className="text-gray-500 text-sm">{t({ar: 'إدارة المؤتمرات والفعاليات الطبية', en: 'Manage medical conferences and events'})}</p>
                </div>
                <button onClick={() => { if(showForm) resetForm(); else setShowForm(true); }} className={`px-6 py-2.5 rounded-lg font-bold transition-all shadow-sm ${showForm ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-med-tech-blue text-white hover:bg-blue-700'}`}>
                    {showForm ? t({ar: 'إلغاء وإخفاء النموذج', en: 'Cancel & Hide Form'}) : t({ar: '+ إضافة فعالية جديدة', en: '+ Add New Event'})}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 animate-fade-in-down">
                    <h4 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">{isEditing ? t({ar: 'تعديل الفعالية', en: 'Edit Event'}) : t({ar: 'إنشاء فعالية جديدة', en: 'Create New Event'})}</h4>
                    
                    <div className="space-y-8">
                        <div className="space-y-6">
                            <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                                <h5 className="font-bold text-med-tech-blue mb-4 uppercase text-xs tracking-wider">{t({ar: 'المعلومات الأساسية', en: 'Basic Information'})}</h5>
                                <div className="grid md:grid-cols-2 gap-6 mb-4">
                                    <div><label className={labelClass}>{t({ar: 'العنوان (إنجليزي)', en: 'Title (English)'})}</label><input className={inputClass} value={eventData.title_en || ''} onChange={e => setEventData({...eventData, title_en: e.target.value})} placeholder="Event Title EN" /></div>
                                    <div dir="rtl"><label className={labelClass}>{t({ar: 'العنوان (عربي)', en: 'Title (Arabic)'})}</label><input className={inputClass} value={eventData.title_ar || ''} onChange={e => setEventData({...eventData, title_ar: e.target.value})} placeholder="عنوان الحدث" /></div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div><label className={labelClass}>{t({ar: 'المنظم (إنجليزي)', en: 'Organizer (English)'})}</label><input className={inputClass} value={eventData.organizer_en || ''} onChange={e => setEventData({...eventData, organizer_en: e.target.value})} /></div>
                                    <div dir="rtl"><label className={labelClass}>{t({ar: 'المنظم (عربي)', en: 'Organizer (Arabic)'})}</label><input className={inputClass} value={eventData.organizer_ar || ''} onChange={e => setEventData({...eventData, organizer_ar: e.target.value})} /></div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                                <h5 className="font-bold text-med-tech-blue mb-4 uppercase text-xs tracking-wider">{t({ar: 'اللوجستيات والتقييم', en: 'Logistics & Rating'})}</h5>
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div><label className={labelClass}>{t({ar: 'الموقع', en: 'Location'})}</label><input className={inputClass} value={eventData.location || ''} onChange={e => setEventData({...eventData, location: e.target.value})} /></div>
                                    <div><label className={labelClass}>{t({ar: 'التاريخ', en: 'Date'})}</label><input type="date" className={inputClass} value={eventData.date_of_happening || ''} onChange={e => setEventData({...eventData, date_of_happening: e.target.value})} /></div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><label className={labelClass}>{t({ar: 'النجوم (1-5)', en: 'Stars (1-5)'})}</label><input type="number" step="0.5" className={inputClass} value={eventData.stars || ''} onChange={e => setEventData({...eventData, stars: Number(e.target.value)})} readOnly title="Auto-calculated" /></div>
                                        <div><label className={labelClass}>{t({ar: 'التقييم (0-100)', en: 'Rate (0-100)'})}</label><input type="number" step="0.1" className={inputClass} value={eventData.rate || ''} onChange={e => setEventData({...eventData, rate: Number(e.target.value)})} readOnly title="Auto-calculated" /></div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                                <h5 className="font-bold text-med-tech-blue mb-4 uppercase text-xs tracking-wider">{t({ar: 'الأوصاف والتعليقات', en: 'Descriptions & Comments'})}</h5>
                                <div className="grid md:grid-cols-2 gap-6 mb-4">
                                    <div><label className={labelClass}>{t({ar: 'الوصف (إنجليزي)', en: 'Description (English)'})}</label><textarea rows={4} className={inputClass} value={eventData.description_en || ''} onChange={e => setEventData({...eventData, description_en: e.target.value})} /></div>
                                    <div dir="rtl"><label className={labelClass}>{t({ar: 'الوصف (عربي)', en: 'Description (Arabic)'})}</label><textarea rows={4} className={inputClass} value={eventData.description_ar || ''} onChange={e => setEventData({...eventData, description_ar: e.target.value})} /></div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6 mb-4">
                                    <div><label className={labelClass}>{t({ar: 'وصف المؤلفين (إنجليزي)', en: 'Authors Desc (English)'})}</label><input className={inputClass} value={eventData.authors_description_en || ''} onChange={e => setEventData({...eventData, authors_description_en: e.target.value})} /></div>
                                    <div dir="rtl"><label className={labelClass}>{t({ar: 'وصف المؤلفين (عربي)', en: 'Authors Desc (Arabic)'})}</label><input className={inputClass} value={eventData.authors_description_ar || ''} onChange={e => setEventData({...eventData, authors_description_ar: e.target.value})} /></div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div><label className={labelClass}>{t({ar: 'تعليقات ميد بلس (إنجليزي)', en: 'MedPulse Comments (English)'})}</label><input className={inputClass} value={eventData.comments_for_medpulse_en || ''} onChange={e => setEventData({...eventData, comments_for_medpulse_en: e.target.value})} /></div>
                                    <div dir="rtl"><label className={labelClass}>{t({ar: 'تعليقات ميد بلس (عربي)', en: 'MedPulse Comments (Arabic)'})}</label><input className={inputClass} value={eventData.comments_for_medpulse_ar || ''} onChange={e => setEventData({...eventData, comments_for_medpulse_ar: e.target.value})} /></div>
                                </div>
                            </div>

                            {/* Detailed Analysis Section */}
                            <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                                <h5 className="font-bold text-med-tech-blue mb-4 uppercase text-xs tracking-wider">{t({ar: 'تحليل الفعالية المفصل', en: 'Detailed Event Analysis'})}</h5>
                                <div className="space-y-4">
                                    {renderRatingInputs('Content', 'content_rate', 'content_rate_description_en', 'content_rate_description_ar')}
                                    {renderRatingInputs('Organization', 'organisation_rate', 'organisation_rate_description_en', 'organisation_rate_description_ar')}
                                    {renderRatingInputs('Speakers', 'speaker_rate', 'speaker_rate_description_en', 'speaker_rate_description_ar')}
                                    {renderRatingInputs('Sponsoring', 'sponsering_rate', 'sponsering_rate_description_en', 'sponsering_rate_description_ar')}
                                    {renderRatingInputs('Scientific Impact', 'scientific_impact_rate', 'scientific_impact_rate_description_en', 'scientific_impact_rate_description_ar')}
                                    
                                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                                        <div><label className={labelClass}>{t({ar: 'ملخص التحليل (إنجليزي)', en: 'Analysis Summary (English)'})}</label><textarea rows={3} className={inputClass} value={analysisData.description_en || ''} onChange={e => setAnalysisData({...analysisData, description_en: e.target.value})} /></div>
                                        <div dir="rtl"><label className={labelClass}>{t({ar: 'ملخص التحليل (عربي)', en: 'Analysis Summary (Arabic)'})}</label><textarea rows={3} className={inputClass} value={analysisData.description_ar || ''} onChange={e => setAnalysisData({...analysisData, description_ar: e.target.value})} /></div>
                                    </div>
                                </div>
                            </div>

                            {/* Subjects / Topics */}
                            <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h5 className="font-bold text-med-tech-blue uppercase text-xs tracking-wider">{t({ar: 'المواضيع والمحاور', en: 'Subjects & Topics'})}</h5>
                                    <button onClick={addSubject} className="text-med-tech-blue text-sm font-bold hover:underline">{t({ar: '+ إضافة موضوع', en: '+ Add Subject'})}</button>
                                </div>
                                <div className="space-y-4">
                                    {subjectEntries.map((subj, idx) => (
                                        <div key={idx} className="p-3 bg-white rounded border border-gray-200 relative">
                                            <button onClick={() => removeSubject(idx)} className="absolute top-2 right-2 text-red-500 font-bold hover:text-red-700">&times;</button>
                                            <div className="grid md:grid-cols-2 gap-4 mb-2">
                                                <input className={inputClass} value={subj.title_en} onChange={e => updateSubject(idx, 'title_en', e.target.value)} placeholder="Topic (EN)" />
                                                <input className={inputClass} value={subj.title_ar} onChange={e => updateSubject(idx, 'title_ar', e.target.value)} placeholder="الموضوع (AR)" dir="rtl" />
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <input className={inputClass} value={subj.desc_en} onChange={e => updateSubject(idx, 'desc_en', e.target.value)} placeholder="Description (EN)" />
                                                <input className={inputClass} value={subj.desc_ar} onChange={e => updateSubject(idx, 'desc_ar', e.target.value)} placeholder="الوصف (AR)" dir="rtl" />
                                            </div>
                                        </div>
                                    ))}
                                    {subjectEntries.length === 0 && <p className="text-sm text-gray-500 italic text-center">{t({ar: 'لا توجد مواضيع مضافة', en: 'No subjects added'})}</p>}
                                </div>
                            </div>

                            {/* Authors & Media */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-md border border-gray-100 h-full">
                                    <h5 className="font-bold text-med-tech-blue mb-4 uppercase text-xs tracking-wider">{t({ar: 'المتحدثون والمشاركون', en: 'Speakers & Authors'})}</h5>
                                    <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md bg-white p-3 space-y-2">
                                        {authors.map(author => (
                                            <label key={author.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedAuthorIds.includes(author.id)}
                                                    onChange={() => toggleAuthorSelection(author.id)}
                                                    className="w-4 h-4 rounded text-med-tech-blue focus:ring-med-tech-blue border-gray-300"
                                                />
                                                <div className="flex flex-col ml-3 rtl:mr-3">
                                                    <span className="text-sm font-medium text-gray-800">{author.name_en}</span>
                                                    <span className="text-xs text-gray-500">{author.name_ar}</span>
                                                </div>
                                            </label>
                                        ))}
                                        {authors.length === 0 && <p className="text-sm text-gray-500 italic">{t({ar: 'لا يوجد مؤلفين', en: 'No authors available.'})}</p>}
                                    </div>
                                    <div className="mt-2 text-sm text-med-tech-blue font-semibold text-right">
                                        {selectedAuthorIds.length} {t({ar: 'مؤلفين محددين', en: 'Selected'})}
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-md border border-gray-100 h-full">
                                    <h5 className="font-bold text-med-tech-blue mb-4 uppercase text-xs tracking-wider">{t({ar: 'الوسائط (صور وفيديو)', en: 'Media (Images & Video)'})}</h5>
                                    
                                    <div className="mb-4">
                                        <label className={labelClass}>{t({ar: 'رفع صور (حد أقصى 10)', en: 'Upload Images (Max 10)'})}</label>
                                        <input 
                                            type="file" 
                                            multiple 
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-med-tech-blue file:text-white hover:file:bg-blue-700 cursor-pointer" 
                                        />
                                        {eventImages.length > 0 && <div className="mt-2 text-sm text-green-600">{eventImages.length} selected.</div>}
                                    </div>

                                    <div className="border-t border-gray-200 pt-4">
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
                        </div>

                        <button onClick={handleSubmit} className="w-full bg-med-vital-green text-white font-bold py-3 rounded-lg hover:bg-green-700 shadow-md transition-all text-lg">
                            {isEditing ? t({ar: 'تحديث الفعالية', en: 'Update Event'}) : t({ar: 'حفظ الفعالية', en: 'Save Event'})}
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider font-bold">
                        <tr>
                            <th className="p-4 border-b text-start">{t({ar: 'العنوان', en: 'Title'})}</th>
                            <th className="p-4 border-b text-start">{t({ar: 'التاريخ', en: 'Date'})}</th>
                            <th className="p-4 border-b text-start">{t({ar: 'الموقع', en: 'Location'})}</th>
                            <th className="p-4 border-b text-end">{t({ar: 'الإجراءات', en: 'Actions'})}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {events.map(e => (
                            <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                    <div className="font-bold text-gray-900">{e.title_en}</div>
                                    <div className="text-xs text-gray-500">{e.title_ar}</div>
                                </td>
                                <td className="p-4 text-gray-700">{e.date_of_happening}</td>
                                <td className="p-4 text-gray-700">{e.location}</td>
                                <td className="p-4 text-right space-x-2">
                                    <button onClick={() => handleView(e.id)} className="text-gray-600 hover:text-gray-800 font-medium text-sm border border-gray-200 px-3 py-1 rounded hover:bg-gray-50 transition-colors">{t({ar: 'عرض', en: 'View'})}</button>
                                    <button onClick={() => handleEdit(e)} className="text-blue-600 hover:text-blue-800 font-medium text-sm border border-blue-200 px-3 py-1 rounded hover:bg-blue-50 transition-colors">{t({ar: 'تعديل', en: 'Edit'})}</button>
                                    {deleteId === e.id ? (
                                        <div className="inline-flex items-center gap-1">
                                            <button onClick={() => { api.deleteEvent(e.id).then(() => { showToast('Deleted', 'success'); onRefresh(); setDeleteId(null); }); }} className="text-white bg-red-600 hover:bg-red-700 font-medium text-xs px-2 py-1 rounded">{t({ar: 'نعم', en: 'Yes'})}</button>
                                            <button onClick={() => setDeleteId(null)} className="text-gray-600 bg-gray-200 hover:bg-gray-300 font-medium text-xs px-2 py-1 rounded">{t({ar: 'لا', en: 'No'})}</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setDeleteId(e.id)} className="text-red-600 hover:text-red-800 font-medium text-sm border border-red-200 px-3 py-1 rounded hover:bg-red-50 transition-colors">{t({ar: 'حذف', en: 'Delete'})}</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {events.length === 0 && (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">{t({ar: 'لا توجد فعاليات', en: 'No events found.'})}</td></tr>
                        )}
                    </tbody>
                </table>
                {lastPage > 1 && (
                    <div className="flex justify-between items-center p-4 bg-gray-50 border-t border-gray-200">
                        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 border rounded bg-white disabled:opacity-50">{t({ar: 'السابق', en: 'Prev'})}</button>
                        <span>{t({ar: 'صفحة', en: 'Page'})} {currentPage} {t({ar: 'من', en: 'of'})} {lastPage}</span>
                        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === lastPage} className="px-4 py-2 border rounded bg-white disabled:opacity-50">{t({ar: 'التالي', en: 'Next'})}</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventsTab;
