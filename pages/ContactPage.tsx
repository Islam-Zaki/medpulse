
import React, { useState } from 'react';
import type { NavigateFunction, LocalizedString, ConfigContactCard } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { useToast } from '../hooks/useToast';
import { CONTACT_PAGE_CONTENT } from '../constants';
import { api } from '../services/api';
import SEO from '../components/SEO';

interface ContactPageProps {
  navigate: NavigateFunction;
}

const Section: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <section className={`py-16 ${className}`}>{children}</section>
);

const SectionHeader: React.FC<{ icon: string; title: string; }> = ({ icon, title }) => {
    return (
        <div className="text-center mb-12">
            <span className="text-5xl" role="img" aria-label="icon">{icon}</span>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold text-clinical-charcoal font-arabic">{title}</h2>
        </div>
    );
};

const ContactInfoIcon: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex-shrink-0 w-12 h-12 bg-sterile-light-grey text-med-tech-blue rounded-full flex items-center justify-center">{children}</div>
);

const ContactPage: React.FC<ContactPageProps> = ({ navigate }) => {
  const { t, config, language } = useLocalization();
  const { showToast } = useToast();
  const c = CONTACT_PAGE_CONTENT;
  const [loading, setLoading] = useState(false);

  // FIX: Added 'as string' type assertions to resolve TypeScript errors where string properties were confused with array properties in Contact config.
  // CMS Overrides
  const h1 = config?.contact[`h1_${language}` as keyof typeof config.contact] as string || t(c.hero.title);
  const introHtml = config?.contact[`intro_${language}` as keyof typeof config.contact] as string || `<p>${t(c.hero.intro)}</p>`;
  const whyTitle = config?.contact[`why_title_${language}` as keyof typeof config.contact] as string || t(c.whyContact.title);
  
  // Dynamic Why Cards
  const whyCards: ConfigContactCard[] = config?.contact.why_cards || [];

  // FIX: Added 'as string' type assertions to resolve TypeScript errors where string properties were confused with array properties in Contact config.
  const formTitle = config?.contact[`form_title_${language}` as keyof typeof config.contact] as string || t(c.form.title);
  const formIntro = config?.contact[`form_intro_${language}` as keyof typeof config.contact] as string || t(c.form.intro);

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
      {/* Hero Section */}
      <header className="bg-sterile-light-grey py-20 text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold text-clinical-charcoal font-arabic">{h1}</h1>
            <div 
                className="mt-4 text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed prose prose-lg" 
                dangerouslySetInnerHTML={{ __html: introHtml }}
            />
            <p className="mt-2 text-md text-gray-600 max-w-3xl mx-auto">{t(c.hero.subIntro)}</p>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Why Contact Us Section */}
        {whyCards.length > 0 && (
            <Section>
                <SectionHeader icon="💬" title={whyTitle} />
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {whyCards.map((card, i) => (
                        <div key={i} className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-med-tech-blue">
                            <h3 className="text-xl font-bold text-clinical-charcoal mb-3">{language === 'ar' ? card.title_ar : card.title_en}</h3>
                            <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside marker:text-med-tech-blue">
                                {card.points.map((p, j) => (
                                    <li key={j}>{language === 'ar' ? p.text_ar : p.text_en}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </Section>
        )}
        
        {/* Main Contact Form & Details Section */}
        <Section className="bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-5 gap-12">
                {/* Form */}
                <div className="lg:col-span-3 bg-white p-8 rounded-lg shadow-2xl">
                    <h2 className="text-3xl font-bold text-clinical-charcoal mb-2 font-arabic">{formTitle}</h2>
                    <p className="text-gray-600 mb-6">{formIntro}</p>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">{t(c.form.fields.name)}</label>
                                <input type="text" name="full_name" id="full_name" required value={formData.full_name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-med-tech-blue focus:border-med-tech-blue bg-white text-gray-900" />
                            </div>
                            <div>
                                <label htmlFor="organisation" className="block text-sm font-medium text-gray-700">{t(c.form.fields.organization)}</label>
                                <input type="text" name="organisation" id="organisation" value={formData.organisation} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-med-tech-blue focus:border-med-tech-blue bg-white text-gray-900" />
                            </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t(c.form.fields.email)}</label>
                                <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-med-tech-blue focus:border-med-tech-blue bg-white text-gray-900" />
                            </div>
                            <div>
                                <label htmlFor="number" className="block text-sm font-medium text-gray-700">{t(c.form.fields.phone)}</label>
                                <input type="tel" name="number" id="number" value={formData.number} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-med-tech-blue focus:border-med-tech-blue bg-white text-gray-900" />
                            </div>
                        </div>
                        <div>
                             <label htmlFor="asking_type" className="block text-sm font-medium text-gray-700">{t(c.form.fields.inquiryType)}</label>
                             <select name="asking_type" id="asking_type" required value={formData.asking_type} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-med-tech-blue focus:border-med-tech-blue text-gray-900">
                                {c.form.inquiryOptions.map(opt => <option key={opt.key} value={opt.key}>{t(opt.label)}</option>)}
                             </select>
                        </div>
                        <div>
                             <label htmlFor="details" className="block text-sm font-medium text-gray-700">{t(c.form.fields.message)}</label>
                             <textarea name="details" id="details" rows={5} required value={formData.details} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-med-tech-blue focus:border-med-tech-blue bg-white text-gray-900"></textarea>
                        </div>
                        <div>
                            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-med-vital-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-med-vital-green font-bold transition-colors disabled:opacity-70">
                                {loading ? t({ar: 'جاري الإرسال...', en: 'Sending...'}) : t(c.form.submit)}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 text-center">{t(c.form.privacy)}</p>
                    </form>
                </div>
                {/* Details */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                         <h3 className="text-xl font-bold text-clinical-charcoal mb-4">{t(c.contactDetails.title)}</h3>
                         <div className="space-y-4">
                             <div className="flex items-start gap-4">
                                <ContactInfoIcon><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg></ContactInfoIcon>
                                <div>
                                    <h4 className="font-semibold">{t(c.contactDetails.address.title)}</h4>
                                    <p className="text-gray-600">{t(c.contactDetails.address.value)}</p>
                                </div>
                             </div>
                             <div className="flex items-start gap-4">
                                <ContactInfoIcon><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></ContactInfoIcon>
                                <div>
                                    <h4 className="font-semibold">{t(c.contactDetails.phone.title)}</h4>
                                    <p className="text-gray-600">{c.contactDetails.phone.value}</p>
                                </div>
                             </div>
                             {c.contactDetails.emails.map((email, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <ContactInfoIcon><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></ContactInfoIcon>
                                    <div>
                                        <h4 className="font-semibold">{t(email.title)}</h4>
                                        <p className="text-gray-600 break-all">{email.value}</p>
                                    </div>
                                </div>
                             ))}
                         </div>
                    </div>
                     <div className="bg-white p-6 rounded-lg shadow-lg">
                         <h3 className="text-xl font-bold text-clinical-charcoal mb-4">{t(c.socials.title)}</h3>
                         <div className="flex flex-wrap gap-4">
                            {c.socials.links.map(link => (
                                <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-sterile-light-grey text-med-tech-blue font-semibold rounded-full hover:bg-med-tech-blue hover:text-white transition-colors text-sm">{link.name}</a>
                            ))}
                         </div>
                    </div>
                </div>
            </div>
        </Section>
        
        {/* Partners & Join Us */}
        <Section>
            <div className="grid md:grid-cols-2 gap-12">
                <div>
                    <SectionHeader icon="🤝" title={t(c.partners.title)} />
                    <p className="text-center text-gray-600 mb-6">{t(c.partners.intro)}</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {c.partners.list.map((partner, i) => (
                            <span key={i} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">{t(partner)}</span>
                        ))}
                    </div>
                </div>
                 <div>
                    <SectionHeader icon="🩵" title={t(c.joinUs.title)} />
                    <p className="text-center text-gray-600 mb-4">{t(c.joinUs.intro)}</p>
                     <p className="text-center font-semibold text-med-tech-blue bg-sterile-light-grey p-3 rounded-md">{t(c.joinUs.cta)}</p>
                </div>
            </div>
        </Section>

        {/* Policy & Info */}
        <Section className="border-t border-gray-200">
             <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                 <div>
                     <h3 className="text-2xl font-bold text-clinical-charcoal mb-4 font-arabic">{t(c.policy.title)}</h3>
                     <ul className="space-y-3 text-gray-700">
                        {c.policy.points.map((point, i) => <li key={i} className="flex items-start gap-3"><span className="text-med-tech-blue mt-1">✓</span>{t(point)}</li>)}
                     </ul>
                 </div>
                  <div>
                     <h3 className="text-2xl font-bold text-clinical-charcoal mb-4 font-arabic">{t(c.additionalInfo.title)}</h3>
                     <div className="space-y-3 text-gray-700">
                        <p><strong>{t(c.additionalInfo.hours.title)}</strong> {t(c.additionalInfo.hours.value)}</p>
                        <p><strong>{t(c.additionalInfo.weekend.title)}</strong> {t(c.additionalInfo.weekend.value)}</p>
                        <p><strong>{t(c.additionalInfo.support.title)}</strong> {t(c.additionalInfo.support.value)}</p>
                     </div>
                 </div>
             </div>
        </Section>

      </div>
    </div>
  );
};

export default ContactPage;
