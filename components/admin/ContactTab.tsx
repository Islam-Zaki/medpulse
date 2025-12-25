
import React, { useState } from 'react';
import type { ContactFormSubmission } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import { useToast } from '../../hooks/useToast';
import { api } from '../../services/api';
import RichTextEditor from './RichTextEditor';

interface ContactTabProps {
    contactForms: ContactFormSubmission[];
    onRefresh?: (silent?: boolean) => void;
}

const ContactTab: React.FC<ContactTabProps> = ({ contactForms, onRefresh }) => {
    const { t } = useLocalization();
    const { showToast } = useToast();
    const [selectedForm, setSelectedForm] = useState<ContactFormSubmission | null>(null);
    const [isFetchingDetail, setIsFetchingDetail] = useState(false);
    const [replyingForm, setReplyingForm] = useState<ContactFormSubmission | null>(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleViewMessage = async (id: number) => {
        setIsFetchingDetail(true);
        try {
            const response = await api.getContactForm(id);
            if (response && response.data) {
                setSelectedForm(response.data);
                // Refresh parent list SILENTLY so the status updates without unmounting this modal
                if (onRefresh) onRefresh(true);
            } else {
                throw new Error("Invalid response format");
            }
        } catch (error) {
            console.error("Error fetching contact details:", error);
            showToast(t({ar: 'فشل تحميل تفاصيل الرسالة', en: 'Failed to load message details'}), 'error');
        } finally {
            setIsFetchingDetail(false);
        }
    };

    const handleSendReply = async () => {
        if (!replyingForm || !replyMessage.trim()) return;
        setIsSending(true);
        try {
            await api.replyToContactForm(replyingForm.id, replyMessage);
            showToast(t({ar: 'تم إرسال الرد بنجاح', en: 'Reply sent successfully'}), 'success');
            setReplyingForm(null);
            setReplyMessage('');
            if (onRefresh) onRefresh(true);
        } catch (error) {
            console.error(error);
            showToast(t({ar: 'فشل إرسال الرد', en: 'Failed to send reply'}), 'error');
        } finally {
            setIsSending(false);
        }
    };

    // Helper for status styling
    const getStatusStyle = (status: string) => {
        const s = status?.toLowerCase();
        if (s === 'answered' || s === 'asnwered' || s === 'accepted') return 'bg-green-100 text-green-700 border-green-200';
        if (s === 'new') return 'bg-blue-100 text-blue-700 border-blue-200';
        if (s === 'open' || s === 'read') return 'bg-orange-100 text-orange-700 border-orange-200';
        return 'bg-gray-100 text-gray-700 border-gray-200';
    };

    return (
    <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <h3 className="p-6 text-xl font-bold text-med-blue border-b">{t({ar: 'طلبات التواصل', en: 'Contact Requests'})}</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-[10px] tracking-widest font-black">
                        <tr>
                            <th className="p-4 text-start">{t({ar: 'الاسم', en: 'Name'})}</th>
                            <th className="p-4 text-start">{t({ar: 'الحالة', en: 'Status'})}</th>
                            <th className="p-4 text-start">{t({ar: 'البريد', en: 'Email'})}</th>
                            <th className="p-4 text-start">{t({ar: 'الهاتف', en: 'Phone'})}</th>
                            <th className="p-4 text-start">{t({ar: 'نوع الطلب', en: 'Inquiry Type'})}</th>
                            <th className="p-4 text-start">{t({ar: 'التاريخ', en: 'Date'})}</th>
                            <th className="p-4 text-end">{t({ar: 'الإجراءات', en: 'Actions'})}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {contactForms.map(f => (
                            <tr key={f.id} className="hover:bg-gray-50">
                                <td className="p-4 font-bold text-gray-900">{f.full_name}</td>
                                <td className="p-4">
                                    <span className={`px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-tight ${getStatusStyle(f.status)}`}>
                                        {f.status}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-600">{f.email}</td>
                                <td className="p-4 text-gray-600">{f.number}</td>
                                <td className="p-4 text-med-tech-blue font-semibold">{f.asking_type}</td>
                                <td className="p-4 text-gray-500 text-xs">
                                    {f.created_at ? new Date(f.created_at).toLocaleDateString() : '-'}
                                </td>
                                <td className="p-4 text-end space-x-2 rtl:space-x-reverse">
                                    <button 
                                        onClick={() => handleViewMessage(f.id)}
                                        disabled={isFetchingDetail}
                                        className="text-med-tech-blue hover:underline text-xs font-bold disabled:opacity-50"
                                    >
                                        {isFetchingDetail ? t({ar: 'جاري التحميل...', en: 'Loading...'}) : t({ar: 'عرض الرسالة', en: 'View Message'})}
                                    </button>
                                    <button 
                                        onClick={() => setReplyingForm(f)}
                                        className="bg-med-tech-blue text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-700 transition-colors"
                                    >
                                        {t({ar: 'رد', en: 'Reply'})}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {contactForms.length === 0 && (
                            <tr><td colSpan={7} className="p-8 text-center text-gray-400 italic">{t({ar: 'لا توجد طلبات تواصل حالياً', en: 'No contact requests found'})}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Modal for viewing details */}
        {selectedForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                        <h3 className="text-xl font-black text-med-blue uppercase tracking-tighter">{t({ar: 'تفاصيل الرسالة', en: 'Message Details'})}</h3>
                        <button onClick={() => setSelectedForm(null)} className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none">&times;</button>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-8 text-start rtl:text-right">
                            <div><strong className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">{t({ar: 'الاسم', en: 'Name'})}</strong> <span className="text-gray-900 font-bold text-lg">{selectedForm.full_name}</span></div>
                            <div><strong className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">{t({ar: 'المؤسسة', en: 'Org'})}</strong> <span className="text-gray-900 font-bold text-lg">{selectedForm.organisation || '-'}</span></div>
                            <div><strong className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">{t({ar: 'البريد', en: 'Email'})}</strong> <span className="text-gray-900 font-bold">{selectedForm.email}</span></div>
                            <div><strong className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">{t({ar: 'الهاتف', en: 'Phone'})}</strong> <span className="text-gray-900 font-bold">{selectedForm.number}</span></div>
                            <div><strong className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">{t({ar: 'نوع الطلب', en: 'Type'})}</strong> <span className="text-med-tech-blue font-bold">{selectedForm.asking_type}</span></div>
                            <div>
                                <strong className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">{t({ar: 'الحالة', en: 'Status'})}</strong> 
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase inline-block border ${getStatusStyle(selectedForm.status)}`}>{selectedForm.status}</span>
                            </div>
                            <div className="col-span-2"><strong className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">{t({ar: 'التاريخ', en: 'Date'})}</strong> <span className="text-gray-900">{new Date(selectedForm.created_at).toLocaleString()}</span></div>
                        </div>
                        <div className="pt-6 border-t text-start rtl:text-right">
                            <strong className="block text-[10px] uppercase tracking-widest text-gray-400 mb-3">{t({ar: 'الرسالة', en: 'Message'})}</strong>
                            <div className="bg-gray-50 p-6 rounded-xl text-gray-900 leading-relaxed whitespace-pre-line border border-gray-100 shadow-inner italic">
                                {selectedForm.details}
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 flex justify-end gap-3 rounded-b-lg border-t">
                         <button 
                            onClick={() => {
                                const form = selectedForm;
                                setSelectedForm(null);
                                setReplyingForm(form);
                            }} 
                            className="px-8 py-3 bg-med-tech-blue text-white rounded-xl font-black hover:bg-blue-700 shadow-md transition-all active:scale-95 text-sm"
                        >
                            {t({ar: 'رد الآن', en: 'Reply Now'})}
                        </button>
                        <button 
                            onClick={() => setSelectedForm(null)} 
                            className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-black hover:bg-gray-100 transition-all text-sm"
                        >
                            {t({ar: 'إغلاق', en: 'Close'})}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Modal for Replying */}
        {replyingForm && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl animate-fade-in-up">
                    <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                        <div>
                            <h3 className="text-xl font-bold text-med-blue">{t({ar: 'إرسال رد', en: 'Send Reply'})}</h3>
                            <p className="text-xs text-gray-500 mt-1">{t({ar: 'إلى:', en: 'To:'})} {replyingForm.full_name} ({replyingForm.email})</p>
                        </div>
                        <button onClick={() => setReplyingForm(null)} className="text-gray-400 hover:text-gray-600 text-3xl font-bold leading-none">&times;</button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-start rtl:text-right">
                            <strong className="text-med-tech-blue block mb-1">{t({ar: 'الرسالة الأصلية:', en: 'Original Message:'})}</strong>
                            <p className="text-gray-700 line-clamp-3">{replyingForm.details}</p>
                        </div>
                        <div className="text-start rtl:text-right">
                            <label className="block text-sm font-bold text-gray-700 mb-2">{t({ar: 'محتوى الرد:', en: 'Reply Content:'})}</label>
                            <RichTextEditor 
                                height="250px"
                                value={replyMessage}
                                onChange={setReplyMessage}
                                placeholder={t({ar: 'اكتب ردك هنا...', en: 'Type your reply here...'})}
                            />
                        </div>
                    </div>
                    <div className="p-6 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
                        <button 
                            onClick={() => setReplyingForm(null)}
                            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-all"
                        >
                            {t({ar: 'إلغاء', en: 'Cancel'})}
                        </button>
                        <button 
                            onClick={handleSendReply}
                            disabled={isSending || !replyMessage.trim()}
                            className={`px-8 py-2 bg-med-vital-green text-white rounded-lg font-bold shadow-md hover:bg-green-700 transition-all flex items-center gap-2 ${(isSending || !replyMessage.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                            {isSending ? t({ar: 'جاري الإرسال...', en: 'Sending...'}) : t({ar: 'إرسال الرد', en: 'Send Reply'})}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
    );
};

export default ContactTab;
