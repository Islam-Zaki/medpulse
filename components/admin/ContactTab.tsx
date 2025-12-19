
import React, { useState } from 'react';
import type { ContactFormSubmission } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';

interface ContactTabProps {
    contactForms: ContactFormSubmission[];
}

const ContactTab: React.FC<ContactTabProps> = ({ contactForms }) => {
    const { t } = useLocalization();
    const [selectedForm, setSelectedForm] = useState<ContactFormSubmission | null>(null);

    return (
    <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <h3 className="p-6 text-xl font-bold text-med-blue border-b">{t({ar: 'طلبات التواصل', en: 'Contact Requests'})}</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="p-4 text-start">{t({ar: 'الاسم', en: 'Name'})}</th>
                            <th className="p-4 text-start">{t({ar: 'المؤسسة', en: 'Organization'})}</th>
                            <th className="p-4 text-start">{t({ar: 'البريد', en: 'Email'})}</th>
                            <th className="p-4 text-start">{t({ar: 'الهاتف', en: 'Phone'})}</th>
                            <th className="p-4 text-start">{t({ar: 'نوع الطلب', en: 'Inquiry Type'})}</th>
                            <th className="p-4 text-start">{t({ar: 'التاريخ', en: 'Date'})}</th>
                            <th className="p-4 text-start">{t({ar: 'التفاصيل', en: 'Details'})}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {contactForms.map(f => (
                            <tr key={f.id} className="hover:bg-gray-50">
                                <td className="p-4 font-medium text-gray-900">{f.full_name}</td>
                                <td className="p-4 text-gray-600">{f.organisation}</td>
                                <td className="p-4 text-gray-600">{f.email}</td>
                                <td className="p-4 text-gray-600">{f.number}</td>
                                <td className="p-4 text-med-tech-blue font-semibold">{f.asking_type}</td>
                                <td className="p-4 text-gray-500 text-xs">
                                    {f.created_at ? new Date(f.created_at).toLocaleDateString() : '-'}
                                </td>
                                <td className="p-4">
                                    <button 
                                        onClick={() => setSelectedForm(f)}
                                        className="text-med-tech-blue hover:underline text-xs"
                                    >
                                        {t({ar: 'عرض الرسالة', en: 'View Message'})}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Modal for viewing details */}
        {selectedForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b flex justify-between items-center">
                        <h3 className="text-xl font-bold text-med-blue">{t({ar: 'تفاصيل الرسالة', en: 'Message Details'})}</h3>
                        <button onClick={() => setSelectedForm(null)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><strong className="block text-sm text-gray-500">{t({ar: 'الاسم', en: 'Name'})}</strong> {selectedForm.full_name}</div>
                            <div><strong className="block text-sm text-gray-500">{t({ar: 'المؤسسة', en: 'Org'})}</strong> {selectedForm.organisation}</div>
                            <div><strong className="block text-sm text-gray-500">{t({ar: 'البريد', en: 'Email'})}</strong> {selectedForm.email}</div>
                            <div><strong className="block text-sm text-gray-500">{t({ar: 'الهاتف', en: 'Phone'})}</strong> {selectedForm.number}</div>
                            <div><strong className="block text-sm text-gray-500">{t({ar: 'نوع الطلب', en: 'Type'})}</strong> {selectedForm.asking_type}</div>
                            <div><strong className="block text-sm text-gray-500">{t({ar: 'التاريخ', en: 'Date'})}</strong> {new Date(selectedForm.created_at).toLocaleString()}</div>
                        </div>
                        <div className="pt-4 border-t">
                            <strong className="block text-sm text-gray-500 mb-2">{t({ar: 'الرسالة', en: 'Message'})}</strong>
                            <p className="bg-gray-50 p-4 rounded text-gray-800 whitespace-pre-line border border-gray-200">{selectedForm.details}</p>
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 text-right rounded-b-lg">
                        <button 
                            onClick={() => setSelectedForm(null)} 
                            className="px-4 py-2 bg-med-tech-blue text-white rounded hover:bg-blue-700 transition-colors"
                        >
                            {t({ar: 'إغلاق', en: 'Close'})}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
    );
};

export default ContactTab;
