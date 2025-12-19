import React, { useState } from 'react';
import type { NavigateFunction, LocalizedString } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { useToast } from '../hooks/useToast';
import { CONTACT_PAGE_CONTENT } from '../constants';
import { api } from '../services/api';
import SEO from '../components/SEO';

interface ContactPageProps {
  navigate: NavigateFunction;
}

const ContactPage: React.FC<ContactPageProps> = ({ navigate }) => {
  const { t, config, language } = useLocalization();
  const { showToast } = useToast();
  const c = CONTACT_PAGE_CONTENT;
  const [loading, setLoading] = useState(false);

  const h1 = config?.contact[`h1_${language}` as keyof typeof config.contact] || t(c.hero.title);
  const intro = config?.contact[`intro_${language}` as keyof typeof config.contact] || t(c.hero.intro);
  const whyTitle = config?.contact[`why_title_${language}` as keyof typeof config.contact] || t(c.whyContact.title);
  const formTitle = config?.contact[`form_title_${language}` as keyof typeof config.contact] || t(c.form.title);
  const formIntro = config?.contact[`form_intro_${language}` as keyof typeof config.contact] || t(c.form.intro);

  const whyCards = [
      { title: config?.contact[`why_p1_title_${language}` as keyof typeof config.contact] || t(c.whyContact.points[0].title), items: [config?.contact[`why_p1_i1_${language}` as keyof typeof config.contact] || t(c.whyContact.points[0].items[0]), config?.contact[`why_p1_i2_${language}` as keyof typeof config.contact] || t(c.whyContact.points[0].items[1])] },
      { title: config?.contact[`why_p2_title_${language}` as keyof typeof config.contact] || t(c.whyContact.points[1].title), items: [config?.contact[`why_p2_i1_${language}` as keyof typeof config.contact] || t(c.whyContact.points[1].items[0]), config?.contact[`why_p2_i2_${language}` as keyof typeof config.contact] || t(c.whyContact.points[1].items[1])] },
      { title: config?.contact[`why_p3_title_${language}` as keyof typeof config.contact] || t(c.whyContact.points[2].title), items: [config?.contact[`why_p3_i1_${language}` as keyof typeof config.contact] || t(c.whyContact.points[2].items[0]), config?.contact[`why_p3_i2_${language}` as keyof typeof config.contact] || t(c.whyContact.points[2].items[1])] },
      { title: config?.contact[`why_p4_title_${language}` as keyof typeof config.contact] || t(c.whyContact.points[3].title), items: [config?.contact[`why_p4_i1_${language}` as keyof typeof config.contact] || t(c.whyContact.points[3].items[0]), config?.contact[`why_p4_i2_${language}` as keyof typeof config.contact] || t(c.whyContact.points[3].items[1])] },
  ];

  const [formData, setFormData] = useState({
      full_name: '',
      organisation: '',
      email: '',
      number: '',
      asking_type: 'General Inquiry',
      details: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
        await api.submitContactForm({ ...formData, status: 'new' });
        showToast(t({ar: 'تم إرسال رسالتك بنجاح!', en: 'Your message has been sent successfully!'}), 'success');
        setFormData({ full_name: '', organisation: '', email: '', number: '', asking_type: 'General Inquiry', details: '' });
    } catch (error) {
        showToast(t({ar: 'حدث خطأ أثناء الإرسال.', en: 'Error sending message.'}), 'error');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="bg-white font-arabic">
      <SEO page="contact" />
      <header className="bg-sterile-light-grey py-20 text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold text-clinical-charcoal font-arabic">{h1}</h1>
            <p className="mt-4 text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">{intro}</p>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <section className="mb-20">
            <div className="text-center mb-12">
                <span className="text-5xl" role="img" aria-label="icon">💬</span>
                <h2 className="mt-4 text-3xl md:text-4xl font-bold text-clinical-charcoal font-arabic">{whyTitle}</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {whyCards.map((card, i) => (
                    <div key={i} className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-med-tech-blue flex flex-col">
                        <h3 className="text-xl font-bold text-clinical-charcoal mb-3">{card.title}</h3>
                        <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside marker:text-med-tech-blue flex-1">
                            {card.items.map((item, j) => <li key={j}>{item}</li>)}
                        </ul>
                    </div>
                ))}
            </div>
        </section>

        <section className="bg-gray-50 p-8 md:p-16 rounded-[40px] border border-gray-200 shadow-sm">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-clinical-charcoal mb-4">{formTitle}</h2>
                <p className="text-gray-600 mb-10">{formIntro}</p>
                
                <form onSubmit={handleFormSubmit} className="grid md:grid-cols-2 gap-6">
                    <input name="full_name" required className="p-3 border rounded-lg bg-white text-gray-900" placeholder={t(c.form.fields.name)} value={formData.full_name} onChange={handleChange} />
                    <input name="organisation" className="p-3 border rounded-lg bg-white text-gray-900" placeholder={t(c.form.fields.organization)} value={formData.organisation} onChange={handleChange} />
                    <input name="email" type="email" required className="p-3 border rounded-lg bg-white text-gray-900" placeholder={t(c.form.fields.email)} value={formData.email} onChange={handleChange} />
                    <input name="number" className="p-3 border rounded-lg bg-white text-gray-900" placeholder={t(c.form.fields.phone)} value={formData.number} onChange={handleChange} />
                    <div className="md:col-span-2">
                        <select name="asking_type" className="w-full p-3 border rounded-lg bg-white text-gray-900" value={formData.asking_type} onChange={handleChange}>
                            {c.form.inquiryOptions.map(opt => <option key={opt.key} value={opt.key}>{t(opt.label)}</option>)}
                        </select>
                    </div>
                    <textarea name="details" required className="md:col-span-2 p-3 border rounded-lg h-32 bg-white text-gray-900" placeholder={t(c.form.fields.message)} value={formData.details} onChange={handleChange}></textarea>
                    <button disabled={loading} className="md:col-span-2 bg-med-tech-blue text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-md">
                        {loading ? t({ar: 'جاري الإرسال...', en: 'Sending...'}) : t(c.form.submit)}
                    </button>
                </form>
            </div>
        </section>
      </div>
    </div>
  );
};

export default ContactPage;