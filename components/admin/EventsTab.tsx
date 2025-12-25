
import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { useLocalization } from '../../hooks/useLocalization';
import { api } from '../../services/api';
import type { ApiEvent, EventAnalysis, ApiAuthor } from '../../types';
import IconEditor from './IconEditor';
import RichTextEditor from './RichTextEditor';

interface EventsTabProps {
    events: ApiEvent[];
    authors: ApiAuthor[];
    currentPage: number;
    lastPage: number;
    onPageChange: (page: number) => void;
    onRefresh: () => void;
}

interface SubjectEntry {
    emoji: string;
    title_en: string;
    title_ar: string;
    desc_en: string;
    desc_ar: string;
}

interface CommentEntry {
    content_en: string;
    content_ar: string;
}

const DOMAIN = 'https://medpulse-production.up.railway.app';
const COMMENT_SEP = '|||MP_SEP|||';
const TOPIC_SEP = '|||MT_SEP|||'; // Using a internal separator for Emoji|Title if needed

const EventsTab: React.FC<EventsTabProps> = ({ events, authors, currentPage, lastPage, onPageChange, onRefresh }) => {
    const { showToast } = useToast();
    const { t } = useLocalization();
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    // Main Event Data
    const [eventData, setEventData] = useState<ApiEvent>({
        title_en: '',
        title_ar: '',
        location: '',
        location_ar: '',
        date_of_happening: '',
        organizer_en: '',
        organizer_ar: '',
        description_en: '',
        description_ar: '',
        authors_description_en: '',
        authors_description_ar: '',
        rate: 0,
        stars: 0
    } as ApiEvent);
    
    // Analysis Data (UI values: out of weights)
    const [analysisData, setAnalysisData] = useState<EventAnalysis>({} as EventAnalysis);
    
    // Subjects Data
    const [subjectEntries, setSubjectEntries] = useState<SubjectEntry[]>([]);
    
    // Multi-Comments Data
    const [commentEntries, setCommentEntries] = useState<CommentEntry[]>([]);

    // Attachments
    const [selectedAuthorIds, setSelectedAuthorIds] = useState<number[]>([]);
    const [eventImages, setEventImages] = useState<File[]>([]);
    
    // Video
    const [videoUrl, setVideoUrl] = useState('');
    const [existingVideo, setExistingVideo] = useState<any>(null);

    const [viewEvent, setViewEvent] = useState<ApiEvent | null>(null);

    // Score Weights Configuration (Guidelines)
    const SCORING_WEIGHTS = {
        content_rate: 25,
        organisation_rate: 20,
        speaker_rate: 15,
        sponsering_rate: 20,
        scientific_impact_rate: 20
    };

    // Auto-calculate Rate (out of 10 for server) and Stars (1-5 integer) when Analysis Data changes
    useEffect(() => {
        const c = Number(analysisData.content_rate) || 0;
        const o = Number(analysisData.organisation_rate) || 0;
        const s = Number(analysisData.speaker_rate) || 0;
        const sp = Number(analysisData.sponsering_rate) || 0;
        const si = Number(analysisData.scientific_impact_rate) || 0;

        const totalScore = c + o + s + sp + si;
        const serverRate = totalScore / 10;
        const stars = Math.round(totalScore / 20);

        setEventData(prev => {
            const roundedRate = parseFloat(serverRate.toFixed(1));
            const roundedStars = Math.min(Math.max(stars, 0), 5);
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
            if (!evt.analysis && evt.event_analysis) {
                evt.analysis = evt.event_analysis;
            }
            if (evt.analysis) {
                evt.analysis = {
                    ...evt.analysis,
                    content_rate: (evt.analysis.content_rate / 10) * SCORING_WEIGHTS.content_rate,
                    organisation_rate: (evt.analysis.organisation_rate / 10) * SCORING_WEIGHTS.organisation_rate,
                    speaker_rate: (evt.analysis.speaker_rate / 10) * SCORING_WEIGHTS.speaker_rate,
                    sponsering_rate: (evt.analysis.sponsering_rate / 10) * SCORING_WEIGHTS.sponsering_rate,
                    scientific_impact_rate: (evt.analysis.scientific_impact_rate / 10) * SCORING_WEIGHTS.scientific_impact_rate,
                };
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
            
            // Subjects Parsing
            const sEn = fullEvent.subjects_en || fullEvent.subjects || [];
            const sAr = fullEvent.subjects_ar || [];
            const dEn = fullEvent.subjects_description_en || [];
            const dAr = fullEvent.subjects_description_ar || [];
            
            const maxLen = Math.max(sEn.length, sAr.length, dEn.length, dAr.length);
            const entries: SubjectEntry[] = [];
            for (let i = 0; i < maxLen; i++) {
                const title_en_raw = sEn[i] || '';
                const title_ar_raw = sAr[i] || '';
                
                // Extract Emoji from embedded format "EMOJI|TITLE"
                let emoji = '🧬';
                let title_en = title_en_raw;
                let title_ar = title_ar_raw;

                if (title_en_raw.includes(TOPIC_SEP)) {
                    const parts = title_en_raw.split(TOPIC_SEP);
                    emoji = parts[0];
                    title_en = parts[1];
                }
                if (title_ar_raw.includes(TOPIC_SEP)) {
                    title_ar = title_ar_raw.split(TOPIC_SEP)[1];
                }

                entries.push({
                    emoji,
                    title_en,
                    title_ar,
                    desc_en: dEn[i] || '',
                    desc_ar: dAr[i] || ''
                });
            }
            setSubjectEntries(entries);
            
            // Comments Parsing
            const cEnRaw = fullEvent.comments_for_medpulse_en || '';
            const cArRaw = fullEvent.comments_for_medpulse_ar || '';
            const cEnList = cEnRaw ? cEnRaw.split(COMMENT_SEP) : [];
            const cArList = cArRaw ? cArRaw.split(COMMENT_SEP) : [];
            const cMaxLen = Math.max(cEnList.length, cArList.length);
            const cEntries: CommentEntry[] = [];
            for (let i = 0; i < cMaxLen; i++) {
                cEntries.push({ content_en: cEnList[i] || '', content_ar: cArList[i] || '' });
            }
            setCommentEntries(cEntries);
            
            const analysis = fullEvent.analysis || fullEvent.event_analysis;
            if (analysis) {
                setAnalysisData({
                    ...analysis,
                    content_rate: (analysis.content_rate / 10) * SCORING_WEIGHTS.content_rate,
                    organisation_rate: (analysis.organisation_rate / 10) * SCORING_WEIGHTS.organisation_rate,
                    speaker_rate: (analysis.speaker_rate / 10) * SCORING_WEIGHTS.speaker_rate,
                    sponsering_rate: (analysis.sponsering_rate / 10) * SCORING_WEIGHTS.sponsering_rate,
                    scientific_impact_rate: (analysis.scientific_impact_rate / 10) * SCORING_WEIGHTS.scientific_impact_rate,
                });
            } else {
                setAnalysisData({} as EventAnalysis);
            }

            if (fullEvent.authors && Array.isArray(fullEvent.authors)) {
                setSelectedAuthorIds(fullEvent.authors.map(a => a.id));
            } else {
                setSelectedAuthorIds([]);
            }
            
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
        setEventData({
            title_en: '',
            title_ar: '',
            location: '',
            location_ar: '',
            date_of_happening: '',
            organizer_en: '',
            organizer_ar: '',
            description_en: '',
            description_ar: '',
            authors_description_en: '',
            authors_description_ar: '',
            rate: 0,
            stars: 0
        } as ApiEvent);
        setAnalysisData({} as EventAnalysis);
        setSubjectEntries([]);
        setCommentEntries([]);
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
        setSubjectEntries([...subjectEntries, { emoji: '🧬', title_en: '', title_ar: '', desc_en: '', desc_ar: '' }]);
    };

    const removeSubject = (index: number) => {
        setSubjectEntries(subjectEntries.filter((_, i) => i !== index));
    };

    const updateSubject = (index: number, field: keyof SubjectEntry, value: string) => {
        const newEntries = [...subjectEntries];
        (newEntries[index] as any)[field] = value;
        setSubjectEntries(newEntries);
    };

    const addComment = () => {
        setCommentEntries([...commentEntries, { content_en: '', content_ar: '' }]);
    };

    const removeComment = (index: number) => {
        setCommentEntries(commentEntries.filter((_, i) => i !== index));
    };

    const updateComment = (index: number, field: keyof CommentEntry, value: string) => {
        const newEntries = [...commentEntries];
        newEntries[index][field] = value;
        setCommentEntries(newEntries);
    };

    const handleSubmit = async () => {
        try {
            if (!eventData.description_en || !eventData.description_ar) {
                showToast(t({ar: 'المقدمة العامة مطلوبة للفعالية', en: 'General introduction is required'}), 'error');
                return;
            }

            // Serialize Topics with Emoji embedding
            const subjects_en = subjectEntries.map(s => `${s.emoji}${TOPIC_SEP}${s.title_en}`);
            const subjects_ar = subjectEntries.map(s => `${s.emoji}${TOPIC_SEP}${s.title_ar}`);
            const subjects_description_en = subjectEntries.map(s => s.desc_en);
            const subjects_description_ar = subjectEntries.map(s => s.desc_ar);

            // Serialize Multi-Comments with separator
            const comments_en = commentEntries.map(c => c.content_en).join(COMMENT_SEP);
            const comments_ar = commentEntries.map(c => c.content_ar).join(COMMENT_SEP);

            const eventPayload = {
                ...eventData,
                subjects_en,
                subjects_ar,
                subjects_description_en,
                subjects_description_ar,
                subjects: subjects_en, // Legacy support
                comments_for_medpulse_en: comments_en,
                comments_for_medpulse_ar: comments_ar,
                rate: Number(eventData.rate),
                stars: Math.floor(Number(eventData.stars)),
            };

            let savedEventId;

            if (isEditing && eventData.id) {
                await api.updateEvent(eventData.id, eventPayload);
                savedEventId = eventData.id;
            } else {
                const res = await api.createEvent(eventPayload);
                savedEventId = res.id || res.data?.id;
            }

            if (!savedEventId) throw new Error("Failed to get Event ID");

            // Sync Authors
            let currentAuthorIds: number[] = [];
            if (isEditing && eventData.authors) {
                currentAuthorIds = eventData.authors.map(a => a.id);
            }
            const toAttach = selectedAuthorIds.filter(id => !currentAuthorIds.includes(id));
            const toDetach = currentAuthorIds.filter(id => !selectedAuthorIds.includes(id));
            if (toAttach.length > 0) await Promise.all(toAttach.map(id => api.attachAuthorToEvent(savedEventId, id)));
            if (toDetach.length > 0) await Promise.all(toDetach.map(id => api.detachAuthorFromEvent(savedEventId, id)));

            // Analysis Sync
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
                    content_rate: Number(((analysisData.content_rate || 0) / SCORING_WEIGHTS.content_rate) * 10),
                    organisation_rate: Number(((analysisData.organisation_rate || 0) / SCORING_WEIGHTS.organisation_rate) * 10),
                    speaker_rate: Number(((analysisData.speaker_rate || 0) / SCORING_WEIGHTS.speaker_rate) * 10),
                    sponsering_rate: Number(((analysisData.sponsering_rate || 0) / SCORING_WEIGHTS.sponsering_rate) * 10),
                    scientific_impact_rate: Number(((analysisData.scientific_impact_rate || 0) / SCORING_WEIGHTS.scientific_impact_rate) * 10),
                };

                if (analysisData.id) {
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

            if (videoUrl) {
                const videoId = extractYoutubeId(videoUrl);
                if (!existingVideo || existingVideo.name !== videoId) {
                     await api.createVideo({
                         name: videoId,
                         type: 'event',
                         event_id: savedEventId
                     });
                }
            }
            
            showToast(isEditing ? t({ar: 'تم تحديث المؤتمر بنجاح', en: 'Conference updated successfully'}) : t({ar: 'تم إنشاء المؤتمر بنجاح', en: 'Conference created successfully'}), 'success');
            onRefresh();
            resetForm();
        } catch (e: any) {
            console.error(e);
            showToast(e.message || t({ar: 'خطأ في حفظ المؤتمر', en: 'Error saving conference details'}), 'error');
        }
    };

    const handleDeleteEvent = async (id: number) => {
        if (!window.confirm(t({ar: 'هل أنت متأكد من رغبتك في حذف هذا المؤتمر؟ لا يمكن التراجع عن هذا الإجراء.', en: 'Are you sure you want to delete this conference? This action cannot be undone.'}))) {
            return;
        }

        try {
            await api.deleteEvent(id);
            showToast(t({ar: 'تم حذف المؤتمر بنجاح', en: 'Conference deleted successfully'}), 'success');
            onRefresh();
        } catch (e: any) {
            console.error(e);
            showToast(t({ar: 'فشل حذف المؤتمر', en: 'Failed to delete conference'}), 'error');
        }
    };

    const inputClass = "w-full p-2.5 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-med-tech-blue focus:border-transparent outline-none transition-shadow";
    const labelClass = "block text-sm font-bold text-gray-700 mb-1.5";

    const renderRatingInputs = (label: string, rateKey: keyof EventAnalysis, descEnKey: keyof EventAnalysis, descArKey: keyof EventAnalysis, maxScore: number) => (
        <div className="bg-white p-3 rounded border border-gray-200 hover:border-med-tech-blue/50 transition-colors">
            <h6 className="font-bold text-sm text-med-tech-blue mb-2">{label} <span className="text-gray-400 font-normal">(Target: {maxScore})</span></h6>
            <div className="grid md:grid-cols-6 gap-3">
                <div className="md:col-span-1">
                    <label className="text-xs text-gray-500 block mb-1">Score</label>
                    <input 
                        type="number" 
                        step="0.5" 
                        className={inputClass} 
                        value={analysisData[rateKey] as number || ''} 
                        onChange={e => setAnalysisData(prev => ({...prev, [rateKey]: e.target.value}))} 
                        placeholder={`${maxScore}`} 
                    />
                </div>
                <div className="md:col-span-5 grid md:grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Description (EN)</label>
                        <input className={inputClass} value={analysisData[descEnKey] as string || ''} onChange={e => setAnalysisData(prev => ({...prev, [descEnKey]: e.target.value}))} placeholder="Feedback..." />
                    </div>
                    <div dir="rtl">
                        <label className="text-xs text-gray-500 block mb-1">الوصف (عربي)</label>
                        <input className={inputClass} value={analysisData[descArKey] as string || ''} onChange={e => setAnalysisData(prev => ({...prev, [descArKey]: e.target.value}))} placeholder="التعليق..." />
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
                            <h3 className="text-2xl font-bold text-med-blue">{t({ar: 'تفاصيل المؤتمر', en: 'Conference Details'})}</h3>
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
                                    <p className="text-gray-600 text-sm mt-1" dir="rtl">{viewEvent.location_ar}</p>
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
                                    <p className="text-gray-900 font-bold">{(Number(viewEvent.rate) * 10).toFixed(1)}/100 <span className="text-gray-400 mx-2">|</span> {viewEvent.stars} Stars</p>
                                </div>
                            </div>
                            
                            {viewEvent.analysis && (
                                <div className="border-t pt-6 bg-gray-50 -mx-8 px-8 pb-6 mt-4">
                                    <h4 className="font-bold text-lg text-med-tech-blue uppercase tracking-wider mb-4 pt-6">{t({ar: 'التحليل التفصيلي', en: 'Detailed Analysis'})}</h4>
                                    <div className="space-y-4">
                                        {[
                                            { key: 'content_rate', label: {ar: 'المحتوى العلمي', en: 'Scientific Content'}, max: 25 },
                                            { key: 'organisation_rate', label: {ar: 'التنظيم والإدارة', en: 'Organization and Management'}, max: 20 },
                                            { key: 'speaker_rate', label: {ar: 'جودة المتحدثين والتفاعل', en: 'Speaker Quality and Interaction'}, max: 15 },
                                            { key: 'sponsering_rate', label: {ar: 'المعرض والشركات المشاركة', en: 'Exhibition and Participating Companies'}, max: 20 },
                                            { key: 'scientific_impact_rate', label: {ar: 'الأثر العلمي والمجتمعي', en: 'Scientific and Community Impact'}, max: 20 },
                                        ].map((item: any) => {
                                            const score = viewEvent.analysis?.[item.key as keyof EventAnalysis] as number;
                                            const descEn = viewEvent.analysis?.[`${item.key}_description_en` as keyof EventAnalysis] as string;
                                            const descAr = viewEvent.analysis?.[`${item.key}_description_ar` as keyof EventAnalysis] as string;
                                            return (
                                                <div key={item.key} className="grid md:grid-cols-4 gap-4 items-start border-b border-gray-200 last:border-0 pb-4">
                                                    <div className="md:col-span-1">
                                                        <span className="font-bold text-gray-800 block text-xs">{t(item.label)}</span>
                                                        <span className="text-2xl font-bold text-med-tech-blue">{score}</span><span className="text-xs text-gray-500">/{item.max}</span>
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
                        </div>
                        <div className="p-6 border-t bg-gray-50 flex justify-end">
                            <button onClick={() => setViewEvent(null)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-bold transition-colors">{t({ar: 'إغلاق', en: 'Close'})}</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div>
                    <h3 className="text-xl font-bold text-med-blue">{t({ar: 'إدارة المؤتمرات', en: 'Conferences Management'})}</h3>
                    <p className="text-gray-500 text-sm">{t({ar: 'إدارة المؤتمرات والفعاليات الطبية', en: 'Manage medical conferences and events'})}</p>
                </div>
                <button onClick={() => { if(showForm) resetForm(); else setShowForm(true); }} className={`px-6 py-2.5 rounded-lg font-bold transition-all shadow-sm ${showForm ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-med-tech-blue text-white hover:bg-blue-700'}`}>
                    {showForm ? t({ar: 'إلغاء وإخفاء النموذج', en: 'Cancel & Hide Form'}) : t({ar: '+ إضافة مؤتمر جديد', en: '+ Add New Conference'})}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 animate-fade-in-down">
                    <h4 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">{isEditing ? t({ar: 'تعديل المؤتمر', en: 'Edit Conference'}) : t({ar: 'إنشاء مؤتمر جديد', en: 'Create New Conference'})}</h4>
                    
                    <div className="space-y-8">
                        <div className="space-y-6">
                            {/* 1. Basic Info */}
                            <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                                <h5 className="font-bold text-med-tech-blue mb-4 uppercase text-xs tracking-wider">{t({ar: 'المعلومات الأساسية', en: 'Basic Information'})}</h5>
                                <div className="grid md:grid-cols-2 gap-6 mb-4">
                                    <div><label className={labelClass}>{t({ar: 'العنوان (إنجليزي)', en: 'Title (English)'})}</label><input className={inputClass} value={eventData.title_en || ''} onChange={e => setEventData(prev => ({...prev, title_en: e.target.value}))} placeholder="Event Title EN" /></div>
                                    <div dir="rtl"><label className={labelClass}>{t({ar: 'العنوان (عربي)', en: 'Title (Arabic)'})}</label><input className={inputClass} value={eventData.title_ar || ''} onChange={e => setEventData(prev => ({...prev, title_ar: e.target.value}))} placeholder="عنوان الحدث" /></div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div><label className={labelClass}>{t({ar: 'المنظم (إنجليزي)', en: 'Organizer (English)'})}</label><input className={inputClass} value={eventData.organizer_en || ''} onChange={e => setEventData(prev => ({...prev, organizer_en: e.target.value}))} /></div>
                                    <div dir="rtl"><label className={labelClass}>{t({ar: 'المنظم (عربي)', en: 'Organizer (Arabic)'})}</label><input className={inputClass} value={eventData.organizer_ar || ''} onChange={e => setEventData(prev => ({...prev, organizer_ar: e.target.value}))} /></div>
                                </div>
                            </div>

                            {/* 2. Logistics & Overall Rating */}
                            <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                                <h5 className="font-bold text-med-tech-blue mb-4 uppercase text-xs tracking-wider">{t({ar: 'اللوجستيات والتقييم الإجمالي', en: 'Logistics & Overall Rating'})}</h5>
                                <div className="grid md:grid-cols-2 gap-6 mb-6">
                                    <div><label className={labelClass}>{t({ar: 'الموقع (إنجليزي)', en: 'Location (English)'})}</label><input className={inputClass} value={eventData.location || ''} onChange={e => setEventData(prev => ({...prev, location: e.target.value}))} /></div>
                                    <div dir="rtl"><label className={labelClass}>{t({ar: 'الموقع (عربي)', en: 'Location (Arabic)'})}</label><input className={inputClass} value={eventData.location_ar || ''} onChange={e => setEventData(prev => ({...prev, location_ar: e.target.value}))} placeholder="دبي - الامارات" /></div>
                                </div>
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div><label className={labelClass}>{t({ar: 'التاريخ', en: 'Date'})}</label><input type="date" className={inputClass} value={eventData.date_of_happening || ''} onChange={e => setEventData(prev => ({...prev, date_of_happening: e.target.value}))} /></div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className={labelClass}>{t({ar: 'النجوم (1-5)', en: 'Stars (1-5)'})}</label>
                                            <input type="text" className={`${inputClass} bg-blue-50 font-bold`} value={eventData.stars || '0'} readOnly />
                                        </div>
                                        <div>
                                            <label className={labelClass}>{t({ar: 'التقييم (0-10)', en: 'Rate (0-10)'})}</label>
                                            <input type="text" className={`${inputClass} bg-blue-50 font-bold`} value={eventData.rate || '0'} readOnly />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 3. General Introduction */}
                            <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                                <h5 className="font-bold text-med-tech-blue mb-4 uppercase text-xs tracking-wider">{t({ar: 'المقدمة العامة', en: 'General Introduction'})}</h5>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClass}>{t({ar: 'المقدمة (إنجليزي)', en: 'Introduction (English)'})}</label>
                                        <textarea rows={3} className={inputClass} value={eventData.description_en || ''} onChange={e => setEventData(prev => ({...prev, description_en: e.target.value}))} placeholder="Full event summary..." />
                                    </div>
                                    <div dir="rtl">
                                        <label className={labelClass}>{t({ar: 'المقدمة (عربي)', en: 'Introduction (Arabic)'})}</label>
                                        <textarea rows={3} className={inputClass} value={eventData.description_ar || ''} onChange={e => setEventData(prev => ({...prev, description_ar: e.target.value}))} placeholder="وصف كامل للحدث..." />
                                    </div>
                                </div>
                            </div>

                            {/* 4. Scientific Topics */}
                            <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h5 className="font-bold text-med-tech-blue uppercase text-xs tracking-wider">{t({ar: 'محاور المؤتمر العلمي', en: 'Scientific Topics'})}</h5>
                                    <button onClick={addSubject} className="text-med-tech-blue text-sm font-bold hover:underline">{t({ar: '+ إضافة محور', en: '+ Add Topic'})}</button>
                                </div>
                                <div className="space-y-4">
                                    {subjectEntries.map((subj, idx) => (
                                        <div key={idx} className="p-4 bg-white rounded border border-gray-200 relative group">
                                            <button onClick={() => removeSubject(idx)} className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg">&times;</button>
                                            <div className="flex items-start gap-4">
                                                <div className="flex-shrink-0">
                                                    <label className="text-xs text-gray-400 block mb-1 text-center">Icon</label>
                                                    <IconEditor val={subj.emoji} onChange={v => updateSubject(idx, 'emoji', v)} />
                                                </div>
                                                <div className="flex-grow space-y-4">
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <div><input className={inputClass} value={subj.title_en} onChange={e => updateSubject(idx, 'title_en', e.target.value)} placeholder="Topic (EN)" /></div>
                                                        <div><input className={inputClass} value={subj.title_ar} onChange={e => updateSubject(idx, 'title_ar', e.target.value)} placeholder="الموضوع (AR)" dir="rtl" /></div>
                                                    </div>
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <div><input className={inputClass} value={subj.desc_en} onChange={e => updateSubject(idx, 'desc_en', e.target.value)} placeholder="Description (EN)" /></div>
                                                        <div><input className={inputClass} value={subj.desc_ar} onChange={e => updateSubject(idx, 'desc_ar', e.target.value)} placeholder="الوصف (AR)" dir="rtl" /></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {subjectEntries.length === 0 && <p className="text-center text-gray-400 text-sm italic">{t({ar: 'لا توجد محاور مضافة بعد', en: 'No scientific topics added yet'})}</p>}
                                </div>
                            </div>

                            {/* 5. Speakers & Participants */}
                            <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                                <h5 className="font-bold text-med-tech-blue mb-4 uppercase text-xs tracking-wider">{t({ar: 'المتحدثون والمشاركون', en: 'Speakers & Participants'})}</h5>
                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className={labelClass}>{t({ar: 'نص التقديم (EN)', en: 'Intro Text (EN)'})}</label>
                                        <input className={inputClass} value={eventData.authors_description_en || ''} onChange={e => setEventData(prev => ({...prev, authors_description_en: e.target.value}))} placeholder="Speakers intro..." />
                                    </div>
                                    <div dir="rtl">
                                        <label className={labelClass}>{t({ar: 'نص التقديم (AR)', en: 'Intro Text (AR)'})}</label>
                                        <input className={inputClass} value={eventData.authors_description_ar || ''} onChange={e => setEventData(prev => ({...prev, authors_description_ar: e.target.value}))} placeholder="مقدمة المتحدثين..." />
                                    </div>
                                </div>
                                <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md bg-white p-3 space-y-2">
                                    {authors.map(author => (
                                        <label key={author.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors">
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
                                </div>
                            </div>

                            {/* 6. Evaluation Pillars */}
                            <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                                <h5 className="font-bold text-med-tech-blue mb-4 uppercase text-xs tracking-wider">{t({ar: 'محاور التقييم الخمسة (MedPulse Analysis)', en: 'Five Evaluation Pillars (MedPulse Analysis)'})}</h5>
                                <div className="space-y-4">
                                    {renderRatingInputs('Scientific Content', 'content_rate', 'content_rate_description_en', 'content_rate_description_ar', SCORING_WEIGHTS.content_rate)}
                                    {renderRatingInputs('Organization and Management', 'organisation_rate', 'organisation_rate_description_en', 'organisation_rate_description_ar', SCORING_WEIGHTS.organisation_rate)}
                                    {renderRatingInputs('Speaker Quality and Interaction', 'speaker_rate', 'speaker_rate_description_en', 'speaker_rate_description_ar', SCORING_WEIGHTS.speaker_rate)}
                                    {renderRatingInputs('Exhibition and Participating Companies', 'sponsering_rate', 'sponsering_rate_description_en', 'sponsering_rate_description_ar', SCORING_WEIGHTS.sponsering_rate)}
                                    {renderRatingInputs('Scientific and Community Impact', 'scientific_impact_rate', 'scientific_impact_rate_description_en', 'scientific_impact_rate_description_ar', SCORING_WEIGHTS.scientific_impact_rate)}
                                    
                                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                                        <div><label className={labelClass}>{t({ar: 'ملخص التحليل (إنجليزي)', en: 'Analysis Summary (English)'})}</label><textarea rows={3} className={inputClass} value={analysisData.description_en || ''} onChange={e => setAnalysisData(prev => ({...prev, description_en: e.target.value}))} /></div>
                                        <div dir="rtl"><label className={labelClass}>{t({ar: 'ملخص التحليل (عربي)', en: 'Analysis Summary (Arabic)'})}</label><textarea rows={3} className={inputClass} value={analysisData.description_ar || ''} onChange={e => setAnalysisData(prev => ({...prev, description_ar: e.target.value}))} /></div>
                                    </div>
                                </div>
                            </div>

                            {/* 7. Comments for MedPulse */}
                            <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h5 className="font-bold text-med-tech-blue uppercase text-xs tracking-wider">{t({ar: 'تصريحات خاصة لـ MedPulse', en: 'Comments for MedPulse'})}</h5>
                                    <button onClick={addComment} className="text-med-tech-blue text-sm font-bold hover:underline">{t({ar: '+ إضافة تصريح', en: '+ Add Comment'})}</button>
                                </div>
                                <div className="space-y-6">
                                    {commentEntries.map((comment, idx) => (
                                        <div key={idx} className="p-4 bg-white rounded border border-gray-200 relative group shadow-sm">
                                            <button onClick={() => removeComment(idx)} className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg z-10">&times;</button>
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="text-xs text-gray-400 block mb-2">Comment (English)</label>
                                                    <RichTextEditor 
                                                        height="150px"
                                                        value={comment.content_en} 
                                                        onChange={v => updateComment(idx, 'content_en', v)} 
                                                        placeholder="Write English comment..."
                                                    />
                                                </div>
                                                <div dir="rtl">
                                                    <label className="text-xs text-gray-400 block mb-2">التعليق (عربي)</label>
                                                    <RichTextEditor 
                                                        height="150px"
                                                        value={comment.content_ar} 
                                                        onChange={v => updateComment(idx, 'content_ar', v)} 
                                                        placeholder="اكتب التعليق بالعربي..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {commentEntries.length === 0 && <p className="text-center text-gray-400 text-sm italic">{t({ar: 'لا توجد تصريحات مضافة بعد', en: 'No comments added yet'})}</p>}
                                </div>
                            </div>

                            {/* 8. Media */}
                            <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                                <h5 className="font-bold text-med-tech-blue mb-4 uppercase text-xs tracking-wider">{t({ar: 'الوسائط (صور وفيديو)', en: 'Media (Images & Video)'})}</h5>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClass}>{t({ar: 'رفع صور (حد أقصى 10)', en: 'Upload Images (Max 10)'})}</label>
                                        <input type="file" multiple accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-med-tech-blue file:text-white hover:file:bg-blue-700 cursor-pointer" />
                                        {eventImages.length > 0 && <p className="mt-1 text-xs text-green-600 font-bold">{eventImages.length} images selected</p>}
                                    </div>
                                    <div>
                                        <label className={labelClass}>{t({ar: 'رابط فيديو (يوتيوب)', en: 'Video URL (YouTube)'})}</label>
                                        <input className={inputClass} value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button onClick={handleSubmit} className="w-full bg-med-vital-green text-white font-bold py-3 rounded-lg hover:bg-green-700 shadow-md transition-all text-lg">
                            {isEditing ? t({ar: 'تحديث المؤتمر', en: 'Update Conference'}) : t({ar: 'حفظ المؤتمر', en: 'Save Conference'})}
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
                                <td className="p-4 text-gray-700">
                                    <div className="text-sm">{e.location}</div>
                                    <div className="text-xs text-gray-400" dir="rtl">{e.location_ar}</div>
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <button onClick={() => handleView(e.id)} className="text-gray-600 hover:text-gray-800 font-medium text-sm border border-gray-200 px-3 py-1 rounded hover:bg-gray-50 transition-colors">{t({ar: 'عرض', en: 'View'})}</button>
                                    <button onClick={() => handleEdit(e)} className="text-blue-600 hover:text-blue-800 font-medium text-sm border border-blue-200 px-3 py-1 rounded hover:bg-blue-50 transition-colors">{t({ar: 'تعديل', en: 'Edit'})}</button>
                                    <button 
                                        onClick={() => handleDeleteEvent(e.id)} 
                                        className="text-red-600 hover:text-red-800 font-medium text-sm border border-red-200 px-3 py-1 rounded hover:bg-red-50 transition-colors"
                                    >
                                        {t({ar: 'حذف', en: 'Delete'})}
                                    </button>
                                </td>
                            </tr>
                        ))}
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

export default EventsTab;
