import React from 'react';
import type { NavLink, Conference, Article, Founder, EvaluationCriterion, LocalizedString, ContactInquiryType, SocialLink, Expert, DoctorProfile } from './types';

// Social Media Icons
// FIX: Rewrote icon components using React.createElement to fix JSX parsing errors in a .ts file.
const FacebookIcon = () => React.createElement('svg', { className: "w-6 h-6", fill: "currentColor", viewBox: "0 0 24 24", "aria-hidden": "true" }, React.createElement('path', { fillRule: "evenodd", d: "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z", clipRule: "evenodd" }));
const InstagramIcon = () => React.createElement('svg', { className: "w-6 h-6", fill: "currentColor", viewBox: "0 0 24 24", "aria-hidden": "true" }, React.createElement('path', { fillRule: "evenodd", d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4-12H8c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2zm-4 6c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3.5-5.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z", clipRule: "evenodd" }));
const XIcon = () => React.createElement('svg', { className: "w-6 h-6", fill: "currentColor", viewBox: "0 0 24 24", "aria-hidden": "true" }, React.createElement('path', { d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" }));
const TiktokIcon = () => React.createElement('svg', { className: "w-6 h-6", fill: "currentColor", viewBox: "0 0 24 24", "aria-hidden": "true" }, React.createElement('path', { d: "M12.53.02C13.84 0 15.14.01 16.44 0a.08.08 0 01.09.08v11.5a.08.08 0 01-.09.08h-2.9a.08.08 0 01-.09-.08V5.32a.08.08 0 00-.09-.08h-2.9a.08.08 0 00-.09.08v6.2a.08.08 0 01-.09.08H7.5a.08.08 0 01-.09-.08V.08a.08.08 0 01.09-.08h2.9a.08.08 0 00.09.08v2.96a.08.08 0 00.09.08h2.94a.08.08 0 00.08-.09V.02zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" }));
const YoutubeIcon = () => React.createElement('svg', { className: "w-6 h-6", fill: "currentColor", viewBox: "0 0 24 24", "aria-hidden": "true" }, React.createElement('path', { fillRule: "evenodd", d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm6.5 11.5l-8 4.5V7.5l8 4.5z", clipRule: "evenodd" }));

// FIX: Changed icon component instantiation from JSX to React.createElement to fix parsing errors.
export const SOCIAL_LINKS: SocialLink[] = [
    { name: 'Facebook', url: 'https://www.facebook.com/MedPulseUAE/', icon: React.createElement(FacebookIcon) },
    { name: 'Instagram', url: 'https://www.instagram.com/medpulseuae/', icon: React.createElement(InstagramIcon) },
    { name: 'X', url: 'https://x.com/medpulseuae', icon: React.createElement(XIcon) },
    { name: 'TikTok', url: 'https://www.tiktok.com/@medpulseuae', icon: React.createElement(TiktokIcon) },
    { name: 'YouTube', url: 'https://www.youtube.com/@medpulse-u3z', icon: React.createElement(YoutubeIcon) },
];

export const NAV_LINKS: NavLink[] = [
  { page: 'home', label: { ar: 'الرئيسية', en: 'Home' } },
  { page: 'conferences', label: { ar: 'المؤتمرات', en: 'Conferences' } },
  { page: 'articles', label: { ar: 'المقالات', en: 'Articles' } },
  { page: 'about', label: { ar: 'عن MedPulse', en: 'About' } },
  { page: 'experts', label: { ar: 'فريق الخبراء', en: 'Experts Team' } },
  { page: 'founder', label: { ar: 'المؤسس', en: 'Founder' } },
  { page: 'contact', label: { ar: 'تواصل معنا', en: 'Contact Us' } },
];

export const FOOTER_POLICY_LINKS: NavLink[] = [
    { page: 'privacy', label: { ar: 'سياسة الخصوصية', en: 'Privacy Policy' } },
    { page: 'disclaimer', label: { ar: 'إخلاء المسؤولية', en: 'Disclaimer' } },
];

export const EVALUATION_CRITERIA: EvaluationCriterion[] = [
    { key: 'scientificContent', title: { ar: "المحتوى العلمي", en: "Scientific Content" }, weight: 25 },
    { key: 'organization', title: { ar: "التنظيم والإدارة اللوجستية", en: "Organization & Logistics" }, weight: 20 },
    { key: 'speakers', title: { ar: "جودة المتحدثين وتفاعل الحضور", en: "Speaker Quality & Audience Interaction" }, weight: 15 },
    { key: 'sponsors', title: { ar: "المعرض والشركات المشاركة", en: "Exhibition & Sponsoring Companies" }, weight: 20 },
    { key: 'socialImpact', title: { ar: "الأثر العلمي والمجتمعي", en: "Scientific & Community Impact" }, weight: 20 },
];

export const EXPERTS_PAGE_CONTENT = {
  hero: {
    title: { ar: 'فريق MedPulse من الخبراء والمحترفين', en: 'Meet the MedPulse Experts' },
    subtitle: { ar: 'الأطباء المتخصصون في تقييم وتحليل المؤتمرات الطبية', en: 'Our professional medical team behind every scientific evaluation' }
  }
};

export const EXPERTS_DATA: Expert[] = [
  {
    id: 1,
    name: { ar: 'د. أحمد المصري', en: 'Dr. Ahmed Al-Masri' },
    specialty: { ar: 'استشاري أمراض القلب', en: 'Cardiology Consultant' },
    role: { ar: 'محلل علمي أول', en: 'Senior Scientific Analyst' },
    image: 'https://picsum.photos/seed/doc1/400/400',
    conferencesEvaluated: 25,
  },
  {
    id: 2,
    name: { ar: 'د. فاطمة الزهراء', en: 'Dr. Fatima Al-Zahra' },
    specialty: { ar: 'أخصائية طب الأطفال', en: 'Pediatrics Specialist' },
    role: { ar: 'مُقَيِّم ميداني', en: 'Field Evaluator' },
    image: 'https://picsum.photos/seed/doc2/400/400',
    conferencesEvaluated: 18,
  },
  {
    id: 3,
    name: { ar: 'د. يوسف شاهين', en: 'Dr. Yousef Shaheen' },
    specialty: { ar: 'استشاري جراحة الأعصاب', en: 'Neurosurgery Consultant' },
    role: { ar: 'عضو اللجنة العلمية', en: 'Scientific Committee Member' },
    image: 'https://picsum.photos/seed/doc3/400/400',
    conferencesEvaluated: 12,
  },
  {
    id: 4,
    name: { ar: 'د. علياء المنصوري', en: 'Dr. Alia Al-Mansoori' },
    specialty: { ar: 'أخصائية أمراض جلدية', en: 'Dermatology Specialist' },
    role: { ar: 'محررة محتوى طبي', en: 'Medical Content Editor' },
    image: 'https://picsum.photos/seed/doc4/400/400',
    conferencesEvaluated: 22,
  },
   {
    id: 5,
    name: { ar: 'د. مروان حداد', en: 'Dr. Marwan Haddad' },
    specialty: { ar: 'استشاري الطب الباطني', en: 'Internal Medicine Consultant' },
    role: { ar: 'محلل بيانات علمية', en: 'Scientific Data Analyst' },
    image: 'https://picsum.photos/seed/doc5/400/400',
    conferencesEvaluated: 31,
  },
  {
    id: 6,
    name: { ar: 'د. سارة عبد الرحمن', en: 'Dr. Sara Abdulrahman' },
    specialty: { ar: 'أخصائية تغذية علاجية', en: 'Clinical Nutritionist' },
    role: { ar: 'مُقَيِّم ميداني', en: 'Field Evaluator' },
    image: 'https://picsum.photos/seed/doc6/400/400',
    conferencesEvaluated: 15,
  },
];

export const DOCTOR_PROFILES_DATA: DoctorProfile[] = [
    {
        id: 1,
        jobTitle: { ar: 'استشاري أول أمراض القلب التداخلية', en: 'Senior Interventional Cardiology Consultant' },
        bio: {
            summary: {
                ar: 'دكتور أحمد المصري هو استشاري متمرس في أمراض القلب يتمتع بخبرة تزيد عن 20 عامًا في تشخيص وعلاج أمراض القلب والأوعية الدموية. يشتهر بخبرته في الإجراءات التداخلية المعقدة.',
                en: 'Dr. Ahmed Al-Masri is a seasoned Cardiology Consultant with over 20 years of experience in diagnosing and treating cardiovascular diseases. He is renowned for his expertise in complex interventional procedures.'
            },
            background: {
                ar: 'تخرج من كلية الطب بجامعة القاهرة وحصل على زمالة من الكلية الملكية للأطباء في لندن. أكمل تدريbe التخصصي في مستشفيات مرموقة في المملكة المتحدة وألمانيا.',
                en: 'Graduated from Cairo University Faculty of Medicine and holds a fellowship from the Royal College of Physicians in London. He completed his specialized training in prestigious hospitals in the UK and Germany.'
            },
            experienceYears: 20,
            specialties: [
                { ar: 'القسطرة القلبية', en: 'Cardiac Catheterization' },
                { ar: 'تصوير الأوعية التاجية', en: 'Coronary Angiography' },
                { ar: 'تركيب الدعامات', en: 'Stent Placement' },
                { ar: 'علاج أمراض صمامات القلب', en: 'Valvular Heart Disease Treatment' },
            ],
            memberships: [
                { ar: 'جمعية القلب الأوروبية', en: 'European Society of Cardiology (ESC)' },
                { ar: 'الكلية الأمريكية لأمراض القلب', en: 'American College of Cardiology (ACC)' },
                { ar: 'جمعية الإمارات لأمراض القلب', en: 'Emirates Cardiac Society' },
            ],
        },
        medpulseContribution: {
            role: {
                ar: 'يقود د. المصري فريق التحليل العلمي في MedPulse، حيث يضمن الدقة والموضوعية في تقييم المحتوى الطبي للمؤتمرات المتعلقة بأمراض القلب.',
                en: 'Dr. Al-Masri leads the scientific analysis team at MedPulse, ensuring accuracy and objectivity in evaluating the medical content of cardiology-related conferences.'
            },
            coverageType: { ar: 'تحليل علمي وتقارير معمقة', en: 'Scientific Analysis & In-depth Reports' },
            specialtiesEvaluated: [
                { ar: 'أمراض القلب', en: 'Cardiology' },
                { ar: 'جراحة القلب', en: 'Cardiac Surgery' },
                { ar: 'الأوعية الدموية', en: 'Vascular Diseases' },
            ],
        },
        coveredConferenceIds: [3],
        videos: [
            { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', title: { ar: 'مناقشة أحدث علاجات القلب', en: 'Discussing the Latest Heart Treatments' } },
        ],
        contactLinks: {
            linkedin: 'https://www.linkedin.com/in/drahmed/',
            email: 'ahmed.almasri@medpulse.ae',
        },
    }
];

export const ABOUT_PAGE_DETAILED_CONTENT = {
    h1: { ar: "عن MedPulse – نبض الطب", en: "About MedPulse" },
    subtitle: { ar: "المنصة العلمية–الإعلامية الأولى لتقييم وتحليل المؤتمرات الطبية في الإمارات", en: "The First Scientific-Media Platform for Evaluating and Analyzing Medical Conferences in the UAE" },
    introduction: {
        title: { ar: "مقدمة تعريفية", en: "Introduction" },
        icon: '🩺',
        paragraphs: [
            { ar: "في ظل الطفرة الكبيرة التي تشهدها دولة الإمارات في تنظيم المؤتمرات والفعاليات الطبية والعلمية، برزت الحاجة إلى وجود منصة مستقلة وموثوقة تُقيّم هذه المؤتمرات بشكل علمي واحترافي، وتعرض محتواها بشفافية بعيدًا عن الترويج التقليدي.", en: "In light of the significant boom the UAE is witnessing in organizing medical and scientific conferences and events, the need has emerged for an independent and reliable platform that evaluates these conferences scientifically and professionally, and presents their content transparently, away from traditional promotion." },
            { ar: "من هنا وُلدت فكرة MedPulse – نبض الطب، كأول مشروع يجمع بين العلم والإعلام في منظومة تقييم متكاملة، هدفها رفع مستوى جودة المؤتمرات الطبية في الدولة، ودعم التطوير العلمي المستمر عبر محتوى تحليلي وموثوق.", en: "From here, the idea of MedPulse was born, as the first project that combines science and media in an integrated evaluation system, aiming to raise the quality of medical conferences in the country and support continuous scientific development through analytical and reliable content." },
            { ar: "\"نبض الطب\" ليست منصة عادية، بل مرجع علمي–إعلامي يمنح كل مؤتمر طبي مرآة حقيقية تعكس مستواه التنظيمي والعلمي والتأثيري.", en: "MedPulse is not an ordinary platform, but a scientific-media reference that gives each medical conference a true mirror reflecting its organizational, scientific, and impactful level." }
        ]
    },
    mission: {
        title: { ar: "الرسالة (Mission)", en: "Mission" },
        icon: '🎯',
        points: [
            { ar: "تقديم تقييمات مهنية دقيقة لكل مؤتمر طبي في الإمارات.", en: "Providing accurate professional evaluations for every medical conference in the UAE." },
            { ar: "توثيق تجربة الحضور والمنظمين والمتحدثين بشكل شامل وموضوعي.", en: "Documenting the experience of attendees, organizers, and speakers comprehensively and objectively." },
            { ar: "دعم التطوير المستمر للجودة العلمية والتنظيمية في القطاع الطبي.", en: "Supporting the continuous development of scientific and organizational quality in the medical sector." },
            { ar: "خلق منصة تجمع بين الإعلاميين والأطباء في إطار واحد من المصداقية والاحترافية.", en: "Creating a platform that brings together media professionals and doctors within a single framework of credibility and professionalism." }
        ],
        summary: { ar: "رسالتنا باختصار: رفع مستوى الوعي الطبي والإعلامي داخل منظومة المؤتمرات والفعاليات العلمية.", en: "Our mission in short: To raise the level of medical and media awareness within the system of conferences and scientific events." }
    },
    vision: {
        title: { ar: "الرؤية (Vision)", en: "Vision" },
        icon: '👁️',
        text: { ar: "أن تكون MedPulse – نبض الطب المرجع الأول لتقييم وتحليل المؤتمرات الطبية في الإمارات والشرق الأوسط، وأن تُحدث تحولًا حقيقيًا في طريقة تنظيم وإدارة الفعاليات العلمية، بما يسهم في بناء قطاع طبي أكثر جودة واحترافية وتأثيرًا.", en: "For MedPulse to be the leading reference for evaluating and analyzing medical conferences in the UAE and the Middle East, and to bring about a real transformation in the way scientific events are organized and managed, contributing to building a more qualitative, professional, and impactful medical sector." },
        summary: { ar: "رؤيتنا تنطلق من قناعة أن التقييم الموضوعي هو الخطوة الأولى نحو التطوير.", en: "Our vision stems from the conviction that objective evaluation is the first step towards development." }
    },
    goals: {
        title: { ar: "أهداف MedPulse", en: "MedPulse Goals" },
        icon: '⚖️',
        items: [
            { title: { ar: "1. الارتقاء بجودة المؤتمرات الطبية", en: "1. Enhancing the Quality of Medical Conferences" }, description: { ar: "من خلال تطبيق نظام تقييم احترافي يساعد الجهات المنظمة على معرفة نقاط القوة وفرص التحسين.", en: "By applying a professional evaluation system that helps organizing bodies identify strengths and opportunities for improvement." } },
            { title: { ar: "2. تمكين الأطباء والطلبة", en: "2. Empowering Doctors and Students" }, description: { ar: "بتزويدهم بمعلومات دقيقة تساعدهم على اختيار الفعاليات العلمية الأكثر فائدة من الناحية الأكاديمية والمهنية.", en: "By providing them with accurate information that helps them choose the most beneficial scientific events from an academic and professional perspective." } },
            { title: { ar: "3. دعم الشركات الطبية والرعاة", en: "3. Supporting Medical Companies and Sponsors" }, description: { ar: "عبر تسليط الضوء على مشاركاتهم في المعارض المصاحبة، وتقديم تغطية إعلامية احترافية تبرز دورهم في دعم البحث والابتكار الطبي.", en: "By highlighting their participation in accompanying exhibitions and providing professional media coverage that showcases their role in supporting medical research and innovation." } },
            { title: { ar: "4. بناء أرشيف رقمي موثوق", en: "4. Building a Reliable Digital Archive" }, description: { ar: "لتوثيق جميع الفعاليات والتقارير والتحليلات، ليصبح مرجعًا يعود إليه الباحثون والمهتمون بالقطاع الطبي مستقبلاً.", en: "To document all events, reports, and analyses, becoming a reference for researchers and those interested in the medical sector in the future." } },
            { title: { ar: "5. تشجيع المنافسة في الجودة والتميز", en: "5. Encouraging Competition in Quality and Excellence" }, description: { ar: "من خلال نشر التقييمات علنًا وبشفافية، ما يحفّز المنظمين على التطوير والابتكار في النسخ القادمة من مؤتمراتهم.", en: "By publishing evaluations publicly and transparently, which motivates organizers to develop and innovate in future editions of their conferences." } }
        ]
    },
    coreValues: {
        title: { ar: "قيمنا الأساسية (Core Values)", en: "Core Values" },
        icon: '🧠',
        intro: { ar: "تُعدّ قيم MedPulse الأساس الذي ترتكز عليه كل تغطية وتقييم، وهي ما يميز المنصة عن أي مبادرة إعلامية أو طبية أخرى:", en: "MedPulse's values are the foundation upon which every coverage and evaluation is based, and they are what distinguish the platform from any other media or medical initiative:" },
        items: [
            { icon: '💎', title: { ar: "1. الشفافية", en: "1. Transparency" }, description: { ar: "نؤمن بأن المصداقية تبدأ من الحياد الكامل في تحليل وتقييم كل فعالية، دون أي اعتبارات تجارية أو إعلانية.", en: "We believe that credibility begins with complete neutrality in analyzing and evaluating each event, without any commercial or advertising considerations." } },
            { icon: '🎓', title: { ar: "2. المهنية", en: "2. Professionalism" }, description: { ar: "نلتزم بأعلى المعايير المهنية في التغطية، من إعداد التقارير، إلى المقابلات، إلى التحليل العلمي الموضوعي.", en: "We adhere to the highest professional standards in coverage, from report preparation, to interviews, to objective scientific analysis." } },
            { icon: '📚', title: { ar: "3. المصداقية", en: "3. Credibility" }, description: { ar: "كل تقييم صادر عن MedPulse يعتمد على معايير علمية دقيقة، ويُراجع من قبل مختصين وأعضاء أكاديميين لضمان دقة النتائج.", en: "Every evaluation issued by MedPulse is based on precise scientific criteria and is reviewed by specialists and academic members to ensure the accuracy of the results." } },
            { icon: '🧩', title: { ar: "4. التطوير المستمر", en: "4. Continuous Development" }, description: { ar: "نعتبر أن التقييم ليس غاية بل وسيلة للتقدم، ونعمل على تحديث معاييرنا بشكل دوري لتواكب أحدث اتجاهات التعليم الطبي والمؤتمرات العالمية.", en: "We consider evaluation not as an end but as a means for progress, and we periodically update our criteria to keep pace with the latest trends in medical education and international conferences." } },
            { icon: '🤝', title: { ar: "5. احترام العلم والمعرفة", en: "5. Respect for Science and Knowledge" }, description: { ar: "نُقدّر كل جهد علمي، ونُبرز قيمة البحث والممارسة الأكاديمية، إيمانًا بأن كل فعالية تُسهم في رفع وعي المجتمع الطبي هي إضافة تستحق التقدير.", en: "We value every scientific effort and highlight the value of research and academic practice, believing that every event that contributes to raising the awareness of the medical community is a worthy addition." } }
        ]
    },
    methodology: {
        title: { ar: "منهجية التقييم العلمي والإعلامي", en: "Scientific and Media Evaluation Methodology" },
        icon: '📊',
        intro: { ar: "تعتمد MedPulse على إطار عمل تحليلي شامل يوازن بين الجانب العلمي والتجربة الميدانية، وفق خمسة محاور رئيسية تشكل منظومة التقييم الرسمية المعتمدة لدينا:", en: "MedPulse relies on a comprehensive analytical framework that balances the scientific aspect with field experience, according to five main pillars that form our official approved evaluation system:" },
        table: {
            headers: {
                criterion: { ar: "المحور", en: "Criterion" },
                description: { ar: "الوصف", en: "Description" },
                maxScore: { ar: "الدرجة القصوى", en: "Max Score" }
            },
            rows: [
                { criterion: { ar: "المحتوى العلمي", en: "Scientific Content" }, description: { ar: "جودة الأبحاث وحداثة المواضيع والتوصيات العلمية", en: "Quality of research, modernity of topics, and scientific recommendations" }, score: "25" },
                { criterion: { ar: "التنظيم والإدارة", en: "Organization and Management" }, description: { ar: "كفاءة الإعداد، إدارة الوقت، الخدمات اللوجستية", en: "Efficiency of preparation, time management, logistics" }, score: "20" },
                { criterion: { ar: "جودة المتحدثين والتفاعل", en: "Speaker Quality and Interaction" }, description: { ar: "أداء المحاضرين وتفاعل الجمهور", en: "Performance of lecturers and audience interaction" }, score: "15" },
                { criterion: { ar: "المعرض والشركات المشاركة", en: "Exhibition and Participating Companies" }, description: { ar: "تنوع الشركات وقيمة الابتكارات المعروضة", en: "Diversity of companies and value of innovations displayed" }, score: "20" },
                { criterion: { ar: "الأثر العلمي والمجتمعي", en: "Scientific and Community Impact" }, description: { ar: "مخرجات المؤتمر وتأثيره على التعليم والممارسة", en: "Conference outcomes and its impact on education and practice" }, score: "20" }
            ],
            total: { ar: "المجموع الكلي: 100 درجة", en: "Total Score: 100 points" }
        },
        summary: { ar: "وتُعرض النتائج في تقارير تحليلية شاملة على موقع MedPulse بعد كل فعالية.", en: "The results are presented in comprehensive analytical reports on the MedPulse website after each event." }
    },
    services: {
        title: { ar: "خدمات المنصة", en: "Platform Services" },
        icon: '🏥',
        items: [
            { title: { ar: "1. تقييم شامل للمؤتمرات الطبية", en: "1. Comprehensive Evaluation of Medical Conferences" }, description: { ar: "نقوم بتغطية ميدانية متكاملة لكل فعالية داخل الإمارات، مع إعداد تقرير تقييم رسمي يتضمن الدرجات العلمية والتحليل الإعلامي لكل محور.", en: "We provide integrated on-site coverage for every event within the UAE, preparing an official evaluation report that includes scientific scores and media analysis for each pillar." } },
            { title: { ar: "2. تقارير احترافية مدفوعة للمنظمين", en: "2. Professional Paid Reports for Organizers" }, description: { ar: "توفر MedPulse تقارير خاصة للجهات المنظمة تحتوي على: تحليل نقاط القوة والضعف, مقترحات للتحسين, مقارنة مع فعاليات مماثلة, خطة تطوير للنسخ المستقبلية", en: "MedPulse provides special reports for organizing bodies containing: analysis of strengths and weaknesses, suggestions for improvement, comparison with similar events, a development plan for future editions." } },
            { title: { ar: "3. محتوى إعلامي رقمي (مرئي ومكتوب)", en: "3. Digital Media Content (Visual and Written)" }, description: { ar: "فريقنا الإعلامي يُنتج فيديوهات احترافية، ومقالات تحليلية ومقابلات مع أبرز المتحدثين والخبراء.", en: "Our media team produces professional videos, analytical articles, and interviews with prominent speakers and experts." } },
            { title: { ar: "4. تغطيات ميدانية ووراء الكواليس", en: "4. On-site and Behind-the-Scenes Coverage" }, description: { ar: "نوثق تجربة المؤتمر لحظة بلحظة، من التسجيل وحتى الجلسات الختامية، لتقديم رؤية واقعية وموثوقة لكل ما جرى داخل الحدث.", en: "We document the conference experience moment by moment, from registration to the closing sessions, to provide a realistic and reliable view of everything that happened during the event." } },
            { title: { ar: "5. نظام تصنيف ونقاط رسمي", en: "5. Official Rating and Points System" }, description: { ar: "نمنح كل مؤتمر تقييمًا عدديًا ونسبة مئوية، تُستخدم كمعيار موثوق لمقارنة الأداء العلمي والتنظيمي بين الفعاليات المختلفة.", en: "We give each conference a numerical rating and a percentage, used as a reliable standard for comparing scientific and organizational performance among different events." } }
        ]
    },
    team: {
        title: { ar: "فريق العمل", en: "Our Team" },
        icon: '🧩',
        intro: { ar: "يتألف فريق MedPulse من مجموعة من الخبراء في الإعلام الطبي والأطباء الاستشاريين، يعملون جنبًا إلى جنب لتقييم المؤتمرات بطريقة علمية ومرئية. الفريق يشمل:", en: "The MedPulse team consists of a group of experts in medical media and consultant physicians, working side by side to evaluate conferences in a scientific and visual manner. The team includes:" },
        roles: [
            { ar: "أطباء واستشاريين متخصصين في مختلف الفروع الطبية", en: "Specialized doctors and consultants in various medical branches" },
            { ar: "محللين علميين للبيانات", en: "Scientific data analysts" },
            { ar: "صحفيين علميين ومصورين محترفين", en: "Scientific journalists and professional photographers" },
            { ar: "مخرجين ومنتجين متخصصين في التغطية الميدانية للمؤتمرات", en: "Directors and producers specialized in on-site conference coverage" }
        ],
        summary: { ar: "يجمع الفريق بين الخبرة الأكاديمية والدقة الصحفية لتقديم محتوى متوازن وموثوق.", en: "The team combines academic expertise and journalistic precision to deliver balanced and reliable content." }
    },
    differentiators: {
        title: { ar: "ما الذي يميز MedPulse عن غيرها؟", en: "What Differentiates MedPulse?" },
        icon: '🧾',
        items: [
            { icon: '🧠', title: { ar: "أول منصة متخصصة في المنطقة", en: "First Specialized Platform in the Region" }, description: { ar: "تُعدّ MedPulse الأولى من نوعها في الشرق الأوسط التي تجمع بين التقييم العلمي والإعلامي المتخصص للمؤتمرات الطبية.", en: "MedPulse is the first of its kind in the Middle East to combine specialized scientific and media evaluation of medical conferences." } },
            { icon: '📈', title: { ar: "نظام تقييم قائم على الأدلة", en: "Evidence-Based Evaluation System" }, description: { ar: "يستند تقييمنا إلى معايير علمية موثقة تم إعدادها بالتعاون مع أكاديميين واستشاريين معتمدين.", en: "Our evaluation is based on documented scientific criteria prepared in collaboration with certified academics and consultants." } },
            { icon: '🎥', title: { ar: "مزيج من التحليل والتوثيق المرئي", en: "Mix of Analysis and Visual Documentation" }, description: { ar: "نقدم تجربة إعلامية شاملة تتضمن تقارير مكتوبة وفيديوهات من أرض الحدث، ليتمكن القارئ والمشاهد من الاطلاع على الصورة الكاملة.", en: "We offer a comprehensive media experience that includes written reports and videos from the event, allowing the reader and viewer to see the full picture." } },
            { icon: '🤍', title: { ar: "استقلالية كاملة", en: "Complete Independence" }, description: { ar: "نلتزم بالحياد وعدم التبعية لأي جهة تنظيمية أو تجارية. كل تقييم يُنشر بناءً على الحقائق والمشاهدات الميدانية فقط.", en: "We are committed to neutrality and are not affiliated with any organizational or commercial entity. Every evaluation is published based solely on facts and on-site observations." } }
        ]
    },
    futureVision: {
        title: { ar: "رؤيتنا المستقبلية", en: "Our Future Vision" },
        icon: '🌍',
        intro: { ar: "تسعى MedPulse إلى التوسع في المستقبل لتشمل:", en: "MedPulse aims to expand in the future to include:" },
        points: [
            { ar: "تغطية المؤتمرات الطبية في الخليج والعالم العربي", en: "Covering medical conferences in the Gulf and the Arab world" },
            { ar: "تطوير نظام رقمي ذكي لتقييم المؤتمرات إلكترونيًا (AI-Driven Evaluation)", en: "Developing a smart digital system for evaluating conferences electronically (AI-Driven Evaluation)" },
            { ar: "إطلاق أرشيف علمي رقمي يحتوي على تقارير تحليلية قابلة للبحث والاستشهاد الأكاديمي", en: "Launching a digital scientific archive containing analytical reports that are searchable and citable for academic purposes" },
            { ar: "بناء شبكة تعاون مع الجامعات والمستشفيات لدعم التعليم الطبي المستمر", en: "Building a collaboration network with universities and hospitals to support continuing medical education" }
        ],
        summary: { ar: "هدفنا أن نصبح المرجع العربي الأول في تقييم الفعاليات العلمية والطبية، وأن نخلق جيلًا جديدًا من المؤتمرات التي تُقاس بجودتها لا بعدد جلساتها.", en: "Our goal is to become the leading Arab reference for evaluating scientific and medical events, and to create a new generation of conferences measured by their quality, not the number of their sessions." }
    },
    contact: {
        title: { ar: "تواصل معنا", en: "Contact Us" },
        icon: '📩',
        intro: { ar: "إذا كنت منظّمًا لمؤتمر طبي أو شركة راعية أو جهة أكاديمية، يمكنك التعاون مع MedPulse لتوثيق وتقييم فعاليتك القادمة.", en: "If you are a medical conference organizer, a sponsoring company, or an academic institution, you can collaborate with MedPulse to document and evaluate your upcoming event." },
        cta: { ar: "تواصل معنا الآن", en: "Contact Us Now" }
    }
};


export const CONFERENCES_DATA: Conference[] = [
  {
    id: 1,
    title: { ar: 'المؤتمر الدولي الثاني لطب الأطفال – الفجيرة 2025', en: '2nd International Pediatrics Conference - Fujairah 2025' },
    organizer: { ar: 'مؤسسة الإمارات للخدمات الصحية', en: 'Emirates Health Services' },
    city: { ar: 'الفجيرة', en: 'Fujairah' },
    location: { ar: 'فندق دبل تري باي هيلتون – الفجيرة', en: 'DoubleTree by Hilton Hotel - Fujairah' },
    date: { ar: '25–26 أكتوبر 2025', en: 'October 25-26, 2025' },
    image: 'https://picsum.photos/seed/conf1/400/300',
    score: 92,
    scoreText: { ar: 'ممتاز جدًا', en: 'Excellent' },
    description: {
        ar: 'تم تغطية هذا المؤتمر ميدانيًا من قبل فريق MedPulse، حيث جمع أكثر من 500 طبيب وخبير في تخصصات الأطفال والعناية المركزة وحديثي الولادة. ناقش المؤتمر أحدث التطورات العلمية، وأظهر مستوى متميزًا من التنظيم والتفاعل، مما جعله نموذجًا ناجحًا للمؤتمرات الطبية المتكاملة في الإمارات.',
        en: 'This conference was covered on-site by the MedPulse team, bringing together over 500 doctors and experts in pediatrics, intensive care, and neonatology. The conference discussed the latest scientific developments and demonstrated a distinguished level of organization and interaction, making it a successful model for integrated medical conferences in the UAE.'
    },
    evaluation: {
      scientificContent: [23.5, 25],
      organization: [18.8, 20],
      speakers: [13.8, 15],
      sponsors: [18, 20],
      socialImpact: [18, 20],
    },
    specialty: { ar: 'طب الأطفال', en: 'Pediatrics' },
    year: 2025,
  },
  {
    id: 2,
    title: { ar: 'مؤتمر دبي للعلوم العصبية 2025', en: 'Dubai Neurology Conference 2025' },
    organizer: { ar: 'هيئة الصحة بدبي', en: 'Dubai Health Authority' },
    city: { ar: 'دبي', en: 'Dubai' },
    location: {ar: 'مركز دبي التجاري العالمي', en: 'Dubai World Trade Centre'},
    date: { ar: '14–16 مارس 2025', en: 'March 14-16, 2025' },
    image: 'https://picsum.photos/seed/conf2/400/300',
    score: 88,
    scoreText: { ar: 'ممتاز', en: 'Very Good' },
    description: {
        ar: 'تناول المؤتمر آخر الأبحاث في مجالات الأعصاب والدماغ والنفسية، بمشاركة أكثر من 40 متحدثًا دوليًا. أشاد الحضور بالتنظيم وسهولة الوصول، فيما أشار فريق MedPulse إلى إمكانية تحسين وقت الجلسات التفاعلية.',
        en: 'The conference covered the latest research in neurology, psychiatry, and neuroscience, with over 40 international speakers. Attendees praised the organization and accessibility, while the MedPulse team noted potential for improving interactive session timing.'
    },
    evaluation: {
      scientificContent: [22, 25],
      organization: [18, 20],
      speakers: [13, 15],
      sponsors: [17, 20],
      socialImpact: [18, 20],
    },
    specialty: { ar: 'الأعصاب', en: 'Neurology' },
    year: 2025,
  },
  {
    id: 3,
    title: { ar: 'مؤتمر الإمارات للأمراض القلبية – أبوظبي 2025', en: 'Emirates Cardiology Conference - Abu Dhabi 2025' },
    organizer: { ar: 'جمعية الإمارات لأمراض القلب', en: 'Emirates Cardiac Society' },
    city: { ar: 'أبوظبي', en: 'Abu Dhabi' },
    location: {ar: 'مركز المؤتمرات الوطني – أبوظبي', en: 'Abu Dhabi National Exhibition Centre (ADNEC)'},
    date: { ar: '20–22 يناير 2025', en: 'January 20-22, 2025' },
    image: 'https://picsum.photos/seed/conf3/400/300',
    score: 91,
    scoreText: { ar: 'متميز', en: 'Outstanding' },
    description: {
        ar: 'ركز المؤتمر على أحدث البروتوكولات العلاجية، وعُرضت أبحاث تطبيقية حديثة في مجال الذكاء الاصطناعي في تشخيص أمراض القلب. منح فريق MedPulse تقييمًا عاليًا للتنظيم، مع إشادة خاصة بجودة المتحدثين الدوليين.',
        en: 'The conference focused on the latest treatment protocols and presented modern applied research in the field of artificial intelligence for diagnosing heart diseases. The MedPulse team gave a high rating for organization, with special praise for the quality of international speakers.'
    },
    evaluation: {
      scientificContent: [23, 25],
      organization: [18.5, 20],
      speakers: [14, 15],
      sponsors: [17.5, 20],
      socialImpact: [18, 20],
    },
    specialty: { ar: 'القلب', en: 'Cardiology' },
    year: 2025,
  },
    {
    id: 4,
    title: { ar: 'مؤتمر الطب التكاملي – دبي 2024', en: 'Integrative Medicine Conference - Dubai 2024' },
    organizer: { ar: 'الجمعية الإماراتية للطب التكاملي', en: 'Emirates Society of Integrative Medicine' },
    city: { ar: 'دبي', en: 'Dubai' },
    location: { ar: 'فندق الريتز كارلتون – جميرا', en: 'The Ritz-Carlton, Jumeirah' },
    date: { ar: '12–13 نوفمبر 2024', en: 'November 12-13, 2024' },
    image: 'https://picsum.photos/seed/conf4/400/300',
    score: 86,
    scoreText: { ar: 'جيد جدًا', en: 'Good' },
    description: {
        ar: 'مؤتمر جمع بين الطب التقليدي والعلاجات الحديثة، وتميز بعرض تقنيات مبتكرة في العلاج الطبيعي والعلاج بالأعشاب الطبية.',
        en: 'A conference that combined traditional medicine with modern therapies, distinguished by showcasing innovative techniques in physical therapy and herbal treatments.'
    },
    evaluation: {
      scientificContent: [21, 25],
      organization: [17.5, 20],
      speakers: [13, 15],
      sponsors: [17, 20],
      socialImpact: [17.5, 20],
    },
    specialty: { ar: 'الطب التكاملي', en: 'Integrative Medicine' },
    year: 2024,
  },
];

export const ARTICLES_DATA: Article[] = [
  {
    id: 1,
    title: { ar: 'الذكاء الاصطناعي في تشخيص الأمراض', en: 'AI in Disease Diagnosis' },
    category: { ar: 'تكنولوجيا طبية', en: 'Medical Technology' },
    intro: { ar: 'كيف يغير الذكاء الاصطناعي مستقبل الرعاية الصحية من خلال تحسين دقة التشخيص.', en: 'How AI is changing the future of healthcare by improving diagnostic accuracy.' },
    author: { ar: 'فريق MedPulse', en: 'MedPulse Team' },
    image: 'https://picsum.photos/seed/art1/400/300',
  },
  {
    id: 2,
    title: { ar: 'أهمية التواصل الفعال في المؤتمرات الطبية', en: 'The Importance of Effective Communication in Medical Conferences' },
    category: { ar: 'تطوير مهني', en: 'Professional Development' },
    intro: { ar: 'استراتيجيات لبناء شبكة علاقات قوية وتحقيق أقصى استفادة من الفعاليات العلمية.', en: 'Strategies for building a strong network and getting the most out of scientific events.' },
    author: { ar: 'فريق MedPulse', en: 'MedPulse Team' },
    image: 'https://picsum.photos/seed/art2/400/300',
  },
  {
    id: 3,
    title: { ar: 'الاتجاهات الحديثة في جراحة القلب', en: 'Modern Trends in Cardiac Surgery' },
    category: { ar: 'أبحاث طبية', en: 'Medical Research' },
    intro: { ar: 'نظرة على أحدث التقنيات والابتكارات التي تشكل مستقبل جراحة القلب.', en: 'A look at the latest technologies and innovations shaping the future of cardiac surgery.' },
    author: { ar: 'فريق MedPulse', en: 'MedPulse Team' },
    image: 'https://picsum.photos/seed/art3/400/300',
  },
  {
    id: 4,
    title: { ar: 'مؤتمر الفجيرة للأطفال 2025 – رؤية جديدة لصحة الأجيال القادمة', en: 'Fujairah Pediatrics Conference 2025 - A New Vision for Future Generations\' Health' },
    category: { ar: 'تحليل المؤتمرات', en: 'Conference Analysis' },
    intro: { ar: 'مقال تحليلي شامل حول مؤتمر الفجيرة الدولي للأطفال، الذي جمع نخبة من الأطباء والاستشاريين لمناقشة أحدث المستجدات في طب الأطفال.', en: 'A comprehensive analytical article on the Fujairah International Pediatrics Conference, which brought together a selection of doctors and consultants to discuss the latest developments in pediatrics.' },
    author: { ar: 'فريق MedPulse', en: 'MedPulse Team' },
    image: 'https://picsum.photos/seed/conf1/400/300',
  },
  {
    id: 5,
    title: { ar: 'مؤتمر الإمارات للطب الباطني 2025 – المعرفة في خدمة الإنسان', en: 'Emirates Internal Medicine Conference 2025 - Knowledge in Service of Humanity' },
    category: { ar: 'تغطيات ميدانية', en: 'Field Coverage' },
    intro: { ar: 'تحليل لأحد أبرز المؤتمرات العلمية التي شهدتها الدولة، تناول أحدث الأبحاث في الأمراض المزمنة والطب الوقائي.', en: 'An analysis of one of the most prominent scientific conferences in the country, covering the latest research in chronic diseases and preventive medicine.' },
    author: { ar: 'فريق MedPulse', en: 'MedPulse Team' },
    image: 'https://picsum.photos/seed/art5/400/300',
  },
  {
    id: 6,
    title: { ar: 'التعليم الطبي المستمر – بين النظرية والتطبيق', en: 'Continuing Medical Education - Between Theory and Practice' },
    category: { ar: 'مقالات تعليمية', en: 'Educational Articles' },
    intro: { ar: 'مقال رأي متخصص يسلّط الضوء على تطور مفهوم التعليم الطبي في الإمارات، وكيف أصبحت المؤتمرات العلمية محورًا رئيسيًا لتأهيل الأطباء.', en: 'A specialized opinion piece highlighting the evolution of medical education in the UAE and how scientific conferences have become central to physician training.' },
    author: { ar: 'د. خالد العطوي', en: 'Dr. Khaled Al-Atawi' },
    image: 'https://picsum.photos/seed/art6/400/300',
  },
];

export const FOUNDER_DATA: Founder = {
    name: { ar: 'د. خالد العطوي', en: 'Dr. Khaled Al-Atawi' },
    title: { ar: 'المؤسس والرئيس التنفيذي', en: 'Founder & CEO' },
    image: 'https://picsum.photos/seed/founder/400/400',
    summary: { 
        ar: 'خبير في الإعلام الطبي وإدارة الفعاليات العلمية، بخبرة تتجاوز 15 عامًا في تحليل وتقييم المؤتمرات الطبية في منطقة الشرق الأوسط. شغوف بتطوير التعليم الطبي المستمر ورفع معايير الجودة في القطاع الصحي.', 
        en: 'An expert in medical media and scientific event management, with over 15 years of experience analyzing and evaluating medical conferences in the Middle East. Passionate about developing continuing medical education and raising quality standards in the healthcare sector.'
    },
    experience: [
        {
            title: { ar: 'الخبرة الإعلامية', en: 'Media Experience' },
            items: [
                { ar: 'إعداد وتقديم برامج طبية تلفزيونية وإذاعية.', en: 'Preparing and presenting medical TV and radio programs.' },
                { ar: 'إدارة التغطية الإعلامية لأكثر من 50 مؤتمرًا طبيًا دوليًا.', en: 'Managed media coverage for over 50 international medical conferences.' },
                { ar: 'كتابة مقالات وتحليلات للعديد من المنصات الصحية المرموقة.', en: 'Authored articles and analyses for numerous prestigious health platforms.' },
            ]
        },
        {
            title: { ar: 'الخبرة الأكاديمية والطبية', en: 'Academic & Medical Experience' },
            items: [
                { ar: 'دكتوراه في إدارة الصحة العامة.', en: 'PhD in Public Health Administration.' },
                { ar: 'عضو في العديد من الجمعيات الطبية الإقليمية والدولية.', en: 'Member of several regional and international medical societies.' },
                { ar: 'محاضر زائر في جامعات مرموقة حول سياسات الصحة.', en: 'Visiting lecturer at prestigious universities on health policies.' },
            ]
        }
    ]
};

export const FOUNDER_DATA_DETAILED = {
  name: { ar: 'د. خالد عبد المجيد العطوي', en: 'Dr. Khaled Abdulmajeed Al-Atawi' },
  mainTitle: { ar: 'استشاري طب حديثي الولادة | رائد التعليم الطبي في الإمارات', en: 'Consultant Neonatologist | Pioneer of Medical Education in the UAE' },
  image: 'https://picsum.photos/seed/founder-main/400/400',
  introduction: {
    title: { ar: "مقدمة تعريفية", en: "Introduction" },
    paragraphs: [
      { ar: 'من الإيمان بأن الطب لا يتطور بالمعلومات فقط، بل بالشفافية والتقييم العلمي المسؤول، انطلقت رؤية الدكتور خالد العطوي، الطبيب الأكاديمي والاستشاري المعروف في دولة الإمارات، ليؤسس MedPulse – نبض الطب كمنصة تجمع بين العلم والإعلام، وتعيد تعريف مفهوم تقييم المؤتمرات الطبية في المنطقة.', en: 'Stemming from the belief that medicine evolves not just through information, but through transparency and responsible scientific evaluation, the vision of Dr. Khaled Al-Atawi, a renowned academic physician and consultant in the UAE, was born to establish MedPulse – a platform that merges science and media, redefining the concept of medical conference evaluation in the region.' },
      { ar: 'بخبرة تتجاوز ثلاثة عقود في التعليم الطبي والتطوير المهني للأطباء، يُعدّ د. خالد العطوي من الشخصيات البارزة التي ساهمت في رفع جودة التدريب الطبي السريري، وتنظيم العديد من المؤتمرات الطبية المتخصصة في الدولة والمنطقة العربية.', en: 'With over three decades of experience in medical education and professional development for physicians, Dr. Khaled Al-Atawi is a prominent figure who has contributed to elevating the quality of clinical medical training and organizing numerous specialized medical conferences in the UAE and the Arab region.' }
    ],
    quote: {
      text: { ar: 'هدفي أن نخلق بيئة علمية شفافة تُقيم الفعاليات الطبية بمعايير موضوعية، وتُحفز المنظمين والمتحدثين على التطور المستمر.', en: 'My goal is to create a transparent scientific environment that evaluates medical events with objective standards, and motivates organizers and speakers towards continuous improvement.' },
      author: { ar: '— د. خالد العطوي', en: '— Dr. Khaled Al-Atawi' }
    }
  },
  personalProfile: {
    title: { ar: 'نبذة شخصية', en: 'Personal Profile' },
    items: [
      { label: { ar: 'الاسم الكامل', en: 'Full Name' }, value: { ar: 'الدكتور خالد عبد المجيد العطوي', en: 'Dr. Khaled Abdulmajeed Al-Atawi' } },
      { label: { ar: 'الوظيفة الحالية', en: 'Current Position' }, value: { ar: 'استشاري طب حديثي الولادة – مستشفى لطيفة للنساء والأطفال، هيئة الصحة بدبي', en: 'Consultant Neonatologist – Latifa Women and Children Hospital, Dubai Health Authority' } },
      { label: { ar: 'اللقب الأكاديمي', en: 'Academic Title' }, value: { ar: 'مؤسس ومدير منصة MedPulse – نبض الطب', en: 'Founder & Director of MedPulse Platform' } },
      { label: { ar: 'الخبرة المهنية', en: 'Professional Experience' }, value: { ar: 'أكثر من 30 عامًا في التخصصات الدقيقة لطب الأطفال والعناية المركزة لحديثي الولادة', en: 'Over 30 years in the subspecialties of pediatrics and neonatal intensive care' } },
    ],
    summary: { ar: 'يُعرف الدكتور خالد بأسلوبه العلمي المتوازن الذي يجمع بين العمق الأكاديمي والرؤية الإعلامية الهادفة، حيث ساهم في تأسيس جيل من الأطباء الشباب عبر إشرافه على البرامج التدريبية في مستشفيات الدولة.', en: 'Dr. Khaled is known for his balanced scientific approach that combines academic depth with a purposeful media vision, having contributed to establishing a generation of young doctors through his supervision of training programs in the nation\'s hospitals.' }
  },
  qualifications: {
    title: { ar: 'المؤهلات الأكاديمية', en: 'Academic Qualifications' },
    intro: { ar: 'يعكس المسار الأكاديمي للدكتور العطوي التزامًا طويل الأمد بالتعلم والتميز، حيث حصل على العديد من الدرجات المتقدمة في مجالات الطب والإدارة الصحية.', en: 'Dr. Al-Atawi\'s academic path reflects a long-term commitment to learning and excellence, having obtained numerous advanced degrees in medicine and health management.' },
    degrees: [
      { text: { ar: 'بكالوريوس الطب والجراحة – جامعة عين شمس – مصر – 1989', en: 'MBBCh – Ain Shams University – Egypt – 1989' }},
      { text: { ar: 'ماجستير في طب الأطفال – جامعة عين شمس – 1994', en: 'M.Sc. in Pediatrics – Ain Shams University – 1994' }},
      { text: { ar: 'دكتوراه في طب الأطفال – جامعة عين شمس – 2014', en: 'PhD in Pediatrics – Ain Shams University – 2014' }},
      { text: { ar: 'زمالة الكلية الملكية البريطانية لطب الأطفال وصحة الطفل (FRCPCH) – المملكة المتحدة – 2017', en: 'Fellowship of the Royal College of Paediatrics and Child Health (FRCPCH) – UK – 2017' }},
      { text: { ar: 'ماجستير في إدارة الرعاية الصحية (MHCM) – الكلية الملكية للجراحين في أيرلندا – 2009', en: 'Master of Healthcare Management (MHCM) – Royal College of Surgeons in Ireland – 2009' }},
      { text: { ar: 'دبلومة إدارة المستشفيات – 2019', en: 'Diploma in Hospital Management – 2019' }},
    ]
  },
  experience: {
    title: { ar: 'المناصب والخبرات العملية', en: 'Positions & Practical Experience' },
    current: {
      title: { ar: 'المناصب الحالية', en: 'Current Positions' },
      items: [
        { ar: 'استشاري طب حديثي الولادة – مستشفى لطيفة للنساء والأطفال – هيئة الصحة بدبي', en: 'Consultant Neonatologist – Latifa Women and Children Hospital – DHA' },
        { ar: 'رئيس وحدة العناية المركزة لحديثي الولادة (NICU) – مستشفى لطيفة', en: 'Head of Neonatal Intensive Care Unit (NICU) – Latifa Hospital' },
        { ar: 'عضو لجنة تطوير التعليم الطبي المستمر – هيئة الصحة بدبي', en: 'Member of the Continuing Medical Education Development Committee – DHA' },
        { ar: 'مؤسس ومدير منصة MedPulse – نبض الطب', en: 'Founder & Director of MedPulse Platform' },
      ]
    },
    past: {
      title: { ar: 'المناصب السابقة', en: 'Previous Positions' },
      items: [
        { ar: 'أستاذ زائر – جامعة محمد بن راشد للطب والعلوم الصحية', en: 'Visiting Professor – Mohammed Bin Rashid University of Medicine and Health Sciences' },
        { ar: 'رئيس لجنة التعليم السريري – قسم طب الأطفال – مستشفى لطيفة', en: 'Head of Clinical Education Committee – Pediatrics Dept. – Latifa Hospital' },
        { ar: 'منسق برامج التدريب للأطباء المقيمين في العناية المركزة لحديثي الولادة', en: 'Training Programs Coordinator for NICU Residents' },
        { ar: 'عضو اللجنة العلمية لمؤتمرات طب الأطفال والحديثي الولادة في الإمارات والسعودية', en: 'Scientific Committee Member for Pediatrics & Neonatology Conferences in UAE & KSA' },
      ]
    }
  },
  academicRoles: {
    title: { ar: 'الأدوار الأكاديمية والتعليمية', en: 'Academic & Educational Roles' },
    intro: { ar: 'إلى جانب عمله الإكلينيكي، لعب الدكتور خالد العطوي دورًا محوريًا في تطوير البرامج الأكاديمية والتعليم الطبي المستمر. وقد أشرف على العديد من الدورات التدريبية وورش العمل في:', en: 'Besides his clinical work, Dr. Khaled Al-Atawi has played a pivotal role in developing academic programs and continuing medical education. He has supervised numerous training courses and workshops in:' },
    courses: [
        { ar: 'مهارات الإنعاش القلبي والرئوي لحديثي الولادة', en: 'Neonatal Resuscitation Program (NRP) skills' },
        { ar: 'بروتوكولات العناية المركزة', en: 'Intensive Care Protocols' },
        { ar: 'جودة الرعاية الطبية لحديثي الولادة', en: 'Quality of Neonatal Medical Care' },
        { ar: 'التقييم السريري والأخلاقي في الممارسة الطبية', en: 'Clinical and Ethical Assessment in Medical Practice' },
    ],
    summary: { ar: 'يؤمن الدكتور خالد أن التعليم الطبي ليس مجرد نقل معرفة، بل بناء ثقافة مهنية قائمة على الشفافية، والمسؤولية، والتحسين المستمر.', en: 'Dr. Khaled believes that medical education is not just about transferring knowledge, but about building a professional culture based on transparency, responsibility, and continuous improvement.' }
  },
  research: {
    title: { ar: 'الإسهامات البحثية والعلمية', en: 'Research & Scientific Contributions' },
    intro: { ar: 'قدّم الدكتور خالد العديد من الأبحاث العلمية المنشورة في مجلات طبية محكمة دوليًا, تناولت مواضيع دقيقة في تخصصه، أبرزها:', en: 'Dr. Khaled has presented numerous scientific papers published in internationally peer-reviewed medical journals, addressing specific topics in his specialty, most notably:' },
    topics: [
      { ar: 'تقييم أجهزة التنفس الصناعي في وحدات العناية المركزة للأطفال', en: 'Evaluation of mechanical ventilators in pediatric intensive care units' },
      { ar: 'تأثير التغذية الوريدية على النمو المبكر لحديثي الولادة', en: 'The effect of parenteral nutrition on the early growth of newborns' },
      { ar: 'استخدام تقنيات الموجات فوق الصوتية في تقييم وظائف القلب للأطفال الخدّج', en: 'Use of ultrasound techniques in assessing cardiac function in preterm infants' },
      { ar: 'دراسات حول الذكاء الاصطناعي في مراقبة المؤشرات الحيوية', en: 'Studies on artificial intelligence in monitoring vital signs' },
    ]
  },
  awards: {
    title: { ar: 'الجوائز والتكريمات', en: 'Awards & Honors' },
    intro: { ar: 'حصل الدكتور خالد العطوي على العديد من الجوائز والتكريمات المحلية والدولية، تقديرًا لإسهاماته العلمية وجهوده في تطوير التعليم والرعاية الطبية:', en: 'Dr. Khaled Al-Atawi has received numerous local and international awards and honors in recognition of his scientific contributions and efforts in developing medical education and care:' },
    list: [
      { text: { ar: 'جائزة الشيخ حمدان بن راشد للتميز الطبي – 2012', en: 'Sheikh Hamdan Bin Rashid Award for Medical Sciences – 2012' }},
      { text: { ar: 'جائزة أفضل طبيب في فئة التخصصات الدقيقة – هيئة الصحة بدبي – 2015', en: 'Best Physician Award in Subspecialty Category – Dubai Health Authority – 2015' }},
      { text: { ar: 'جائزة التميز في التعليم الطبي المستمر – 2019', en: 'Excellence in Continuing Medical Education Award – 2019' }},
      { text: { ar: 'تكريم من جامعة محمد بن راشد للطب – 2022', en: 'Honored by Mohammed Bin Rashid University of Medicine – 2022' }},
      { text: { ar: 'جوائز بحثية من مؤتمرات طبية في أوروبا وآسيا', en: 'Research awards from medical conferences in Europe and Asia' }},
    ]
  },
  mediaActivity: {
    title: { ar: 'النشاط العلمي والإعلامي', en: 'Scientific & Media Activity' },
    text: { ar: 'من خلال منصة MedPulse – نبض الطب، أسس الدكتور خالد نموذجًا جديدًا لربط العلم بالإعلام، حيث تُقدَّم المؤتمرات الطبية بلغة مفهومة وشفافة تجمع بين التحليل الأكاديمي والتغطية الإعلامية الراقية.', en: 'Through the MedPulse platform, Dr. Khaled has established a new model for linking science with media, where medical conferences are presented in an understandable and transparent language that combines academic analysis with high-end media coverage.' }
  },
  philosophy: {
    title: { ar: 'الفلسفة والرؤية', en: 'Philosophy & Vision' },
    quote: {
      text: { ar: 'الطب لا يُقاس بعدد المؤتمرات، بل بجودة محتواها وتأثيرها في تحسين حياة الناس.', en: 'Medicine is not measured by the number of conferences, but by the quality of their content and their impact on improving people\'s lives.' },
      author: { ar: '— د. خالد العطوي', en: '— Dr. Khaled Al-Atawi' }
    },
    text: { ar: 'يرى الدكتور خالد أن الشفافية والتقييم العلمي هما الأساس لتطوير القطاع الصحي في العالم العربي. من هنا، أسس مشروع MedPulse ليكون أداة تقييم موضوعية، تساعد الأطباء والمنظمين على التحسين المستمر وبناء جيل من المؤتمرات الطبية الموثوقة.', en: 'Dr. Khaled believes that transparency and scientific evaluation are the foundation for developing the health sector in the Arab world. Hence, he founded the MedPulse project to be an objective evaluation tool that helps doctors and organizers to continuously improve and build a generation of trusted medical conferences.' }
  },
  gallery: {
    title: { ar: 'معرض الصور', en: 'Photo Gallery' },
    images: [
        { src: 'https://picsum.photos/seed/founder-gallery1/600/400', alt: { ar: 'صورة من مؤتمر علمي في دبي', en: 'Photo from a scientific conference in Dubai' } },
        { src: 'https://picsum.photos/seed/founder-gallery2/600/400', alt: { ar: 'صورة من جلسة تعليمية', en: 'Photo from an educational session' } },
        { src: 'https://picsum.photos/seed/founder-gallery3/600/400', alt: { ar: 'صورة من ورشة عمل تدريبية', en: 'Photo from a training workshop' } },
        { src: 'https://picsum.photos/seed/founder-gallery4/600/400', alt: { ar: 'صورة بورتريه احترافية', en: 'Professional portrait photo' } },
    ]
  },
  contact: {
    title: { ar: 'تواصل مع المؤسس', en: 'Contact the Founder' },
    intro: { ar: 'هل ترغب بالتعاون أو الاستفسار عن مبادرة MedPulse؟', en: 'Would you like to collaborate or inquire about the MedPulse initiative?' },
    email: 'info@medpulseuae.com',
    website: 'www.medpulseuae.com'
  }
};


export const HOME_PAGE_CONTENT = {
    hero: {
        title: { ar: "تقييمات علمية لمستقبل الطب", en: "Scientific Evaluations for the Future of Medicine" },
        subtitle: { ar: "تحليل دقيق، رؤية محايدة", en: "Accurate Analysis, Unbiased Vision" },
        description: { ar: "MedPulse هو منصتك الموثوقة لتقييم المؤتمرات والفعاليات الطبية في الشرق الأوسط، بناءً على منهجية علمية صارمة لضمان أعلى معايير الجودة والشفافية.", en: "MedPulse is your trusted platform for evaluating medical conferences and events in the Middle East, based on a rigorous scientific methodology to ensure the highest standards of quality and transparency." },
        button1: { ar: "استكشف التقييمات", en: "Explore Evaluations" },
        button2: { ar: "اعرف المزيد عنا", en: "Learn More About Us" }
    },
    services: {
        title: { ar: "خدمات MedPulse", en: "MedPulse Services" },
        description: { ar: "نقدم مجموعة متكاملة من الخدمات لدعم المجتمع الطبي", en: "We offer a comprehensive suite of services to support the medical community" },
        items: [
            {
                title: { ar: "التقييم العلمي", en: "Scientific Evaluation" },
                description: { ar: "قياس جودة المؤتمرات وفق معايير دقيقة.", en: "Measuring conference quality against strict standards." },
                icon: "evaluation"
            },
            {
                title: { ar: "التغطية الإعلامية", en: "Media Coverage" },
                description: { ar: "توثيق مرئي ومكتوب احترافي للفعاليات.", en: "Professional visual and written documentation of events." },
                icon: "media"
            },
            {
                title: { ar: "تقارير التطوير", en: "Development Reports" },
                description: { ar: "تحليلات خاصة للمنظمين لتحسين الأداء.", en: "Specialized analyses for organizers to improve performance." },
                icon: "report"
            },
            {
                title: { ar: "نشر المعرفة", en: "Knowledge Dissemination" },
                description: { ar: "مقالات وأبحاث تثري المحتوى الطبي العربي.", en: "Articles and research enriching Arabic medical content." },
                icon: "knowledge"
            }
        ]
    },
    about: {
        title: { ar: "ما هو MedPulse؟", en: "What is MedPulse?" },
        description: { ar: "MedPulse هو مشروع إعلامي–علمي يهدف إلى تقديم تقييمات دقيقة ومحايدة للمؤتمرات الطبية، استنادًا إلى منهجية علمية واضحة، وتحليل احترافي يسلّط الضوء على جودة المحتوى العلمي، التنظيم، المتحدثين، الشركات المشاركة، والأثر المجتمعي.", en: "MedPulse is a media-scientific project aimed at providing accurate and unbiased evaluations of medical conferences, based on a clear scientific methodology and professional analysis that highlights the quality of scientific content, organization, speakers, participating companies, and social impact." },
        points: [
            { ar: "تقييمات محايدة ومبنية على البيانات", en: "Unbiased, data-driven evaluations" },
            { ar: "منهجية علمية شفافة", en: "Transparent scientific methodology" },
            { ar: "تغطية إعلامية متكاملة", en: "Comprehensive media coverage" },
            { ar: "خبراء في القطاع الطبي والإعلامي", en: "Experts in the medical and media sectors" }
        ],
        footer: { ar: "هدفنا هو تمكين المتخصصين في الرعاية الصحية من اتخاذ قرارات مستنيرة.", en: "Our goal is to empower healthcare professionals to make informed decisions." }
    },
    missionVision: {
        title: { ar: "رسالتنا ورؤيتنا", en: "Our Mission & Vision" },
        mission: {
            title: { ar: "مهمتنا", en: "Our Mission" },
            text: { ar: "نقدّم تقييمات مهنية وحيادية للمؤتمرات العلمية بهدف تطوير مستوى التعليم الطبي المستمر.", en: "We provide professional and unbiased evaluations of scientific conferences to develop the level of continuous medical education." }
        },
        vision: {
            title: { ar: "رؤيتنا", en: "Our Vision" },
            text: { ar: "أن نكون المرجع الأهم لتقييم الفعاليات الطبية في الشرق الأوسط.", en: "To be the most important reference for evaluating medical events in the Middle East." }
        }
    },
    whyMedPulse: {
        title: { ar: "لماذا MedPulse؟", en: "Why MedPulse?" },
        description: { ar: "نحن نجمع بين الخبرة العلمية والقدرة الإعلامية لتقديم قيمة فريدة.", en: "We combine scientific expertise and media capability to deliver unique value." },
        points: [
            { title: {ar: "التخصص العلمي الحقيقي", en: "True Scientific Specialization"}, description: { ar: "يضم فريقنا أطباء واستشاريين متخصصين يراجعون المحتوى العلمي بدقة.", en: "Our team includes specialized doctors and consultants who meticulously review scientific content." } },
            { title: {ar: "الحياد والشفافية", en: "Neutrality and Transparency"}, description: { ar: "نلتزم بالموضوعية المطلقة في جميع التقييمات، دون انحياز لأي جهة.", en: "We are committed to absolute objectivity in all evaluations, without bias towards any party." } },
            { title: {ar: "نظام تقييم دقيق", en: "Precise Evaluation System"}, description: { ar: "نطبق آلية تقييم مبنية على خمس محاور علمية تضمن تقييماً شاملاً.", en: "We apply an evaluation mechanism based on five scientific pillars to ensure a comprehensive assessment." } },
            { title: {ar: "محتوى متنوع ومصداقية", en: "Diverse and Credible Content"}, description: { ar: "نوفر تقارير ومقالات ومقابلات مصورة لتوثيق الحدث من جميع الزوايا.", en: "We provide reports, articles, and video interviews to document the event from all angles." } },
            { title: {ar: "تأثير إعلامي واسع", en: "Broad Media Impact"}, description: { ar: "تصل تغطياتنا إلى آلاف المتخصصين، مما يجعلنا أداة مؤثرة في القطاع.", en: "Our coverage reaches thousands of specialists, making us an influential tool in the sector." } }
        ]
    },
    howWeEvaluate: {
        title: { ar: "كيف نقوم بالتقييم؟", en: "How We Evaluate?" },
        description: { ar: "منهجيتنا تضمن الدقة والموضوعية في كل خطوة.", en: "Our methodology ensures accuracy and objectivity at every step." },
        steps: [
            { title: { ar: "الرصد الميداني", en: "Field Observation" }, description: { ar: "حضور فعلي لفعاليات المؤتمر وجلساته العلمية.", en: "Actual attendance at conference events and scientific sessions." } },
            { title: { ar: "التوثيق", en: "Documentation" }, description: { ar: "تصوير احترافي يشمل لقطات من القاعات والمعارض والمقابلات.", en: "Professional photography and videography covering halls, exhibitions, and interviews." } },
            { title: { ar: "التحليل", en: "Analysis" }, description: { ar: "مراجعة المحتوى العلمي والمناقشات والأبحاث المقدمة.", en: "Review of scientific content, discussions, and presented research." } },
            { title: { ar: "التقييم", en: "Evaluation" }, description: { ar: "احتساب الدرجات بناءً على محاور التقييم الخمسة.", en: "Calculating scores based on the five evaluation pillars." } },
            { title: { ar: "النشر", en: "Publication" }, description: { ar: "عرض النتيجة في تقرير شامل على الموقع والمنصات الإعلامية.", en: "Presenting the results in a comprehensive report on the website and media platforms." } }
        ],
        goal: { ar: "هدفنا ليس النقد، بل التطوير المستمر للقطاع الطبي في الإمارات.", en: "Our goal is not criticism, but the continuous development of the medical sector in the UAE." }
    },
    latestConferences: {
        title: { ar: "أحدث تقييمات المؤتمرات", en: "Latest Conference Evaluations" }
    },
    latestArticles: {
        title: { ar: "أحدث المقالات والتحليلات", en: "Latest Articles & Analyses" }
    },
    founder: {
        title: { ar: "مؤسس MedPulse", en: "Founder of MedPulse" },
        description: { ar: 'بإيمانه العميق بأن التقييم العلمي الشفاف هو أساس التقدم، أطلق الدكتور خالد العطوي فكرة MedPulse لتكون منصة حقيقية تواكب نمو القطاع الطبي في الإمارات وتدعمه بالمعرفة والتطوير.', en: 'With a deep belief that transparent scientific evaluation is the foundation of progress, Dr. Khaled Al-Atawi launched MedPulse to be a genuine platform that keeps pace with the growth of the medical sector in the UAE, supporting it with knowledge and development.' }
    },
    cta: {
        title: { ar: "كن جزءًا من نبض الطب", en: "Be a Part of the Pulse" },
        description: { ar: "هل أنت منظم مؤتمر طبي؟ أو متحدث؟ أو باحث يسعى إلى إيصال علمه للعالم؟ انضم إلى مجتمع MedPulse وكن جزءًا من رحلة تطوير المشهد الطبي في الإمارات.", en: "Are you a medical conference organizer, a speaker, or a researcher looking to share your knowledge with the world? Join the MedPulse community and be part of the journey to advance the medical landscape in the UAE." },
        button: { ar: "تواصل معنا الآن", en: "Contact Us Now" }
    }
};

export const CONFERENCES_PAGE_CONTENT = {
    title: { ar: "المؤتمرات الطبية في الإمارات", en: "Medical Conferences in the UAE" },
    subtitle: { ar: "تقييمات MedPulse العلمية والإعلامية", en: "Scientific and Media Evaluations by MedPulse" },
    intro: {
        ar: "في السنوات الأخيرة، أصبحت دولة الإمارات العربية المتحدة مركزًا إقليميًا لصناعة المؤتمرات والفعاليات الطبية المتخصصة. ومع هذا التوسع الكبير، ظهرت الحاجة إلى مرجع علمي موثوق يتيح للأطباء والمنظمين فهم القيمة الحقيقية لكل مؤتمر من حيث المحتوى، التنظيم، والتأثير العلمي. من هنا جاءت صفحة 'المؤتمرات' على منصة MedPulse، لتكون قاعدة بيانات حيّة وموثوقة.",
        en: "In recent years, the UAE is witnessing in organizing medical and scientific conferences and events, the need has emerged for an independent and reliable platform that evaluates these conferences scientifically and professionally, and presents their content transparently, away from traditional promotion."
    },
    goal: {
        title: { ar: "هدف الصفحة", en: "Page Goal" },
        text: { 
            ar: "تم إنشاء هذه الصفحة لتكون دليلًا متكاملًا لكل من يبحث عن المؤتمرات الطبية الأفضل في الإمارات من حيث القيمة العلمية، التنظيم الاحترافي، جودة المتحدثين، وتجربة الحضور. سواء كنت طبيبًا، طالب طب، أو جهة منظمة، فهنا ستجد التقييم الشامل والشفاف لكل حدث طبي.",
            en: "This page was created to be a comprehensive guide for anyone looking for the best medical conferences in the UAE in terms of scientific value, professional organization, speaker quality, and attendee experience. Whether you are a doctor, a medical student, or an organizing body, here you will find a comprehensive and transparent evaluation for every medical event."
        }
    },
    methodology: {
        title: { ar: "منهجية MedPulse في تقييم المؤتمرات الطبية", en: "MedPulse Methodology for Evaluating Medical Conferences" },
        text: {
            ar: "تعتمد المنصة على نظام تقييم متكامل يستند إلى خمسة محاور أساسية، وضعها نخبة من الأطباء والاستشاريين والخبراء في التعليم الطبي. هذه المحاور تضمن عدالة التقييم وموضوعيته.",
            en: "The platform relies on a comprehensive evaluation system based on five key pillars, developed by a selection of doctors, consultants, and experts in medical education. These pillars ensure the fairness and objectivity of the evaluation."
        },
        criteria: [
            { ...EVALUATION_CRITERIA[0], points: { ar: ["حداثة الطرح العلمي", "تنوع الجلسات وعمق النقاشات", "جودة الأبحاث المنشورة"], en: ["Modernity of Scientific Topics", "Diversity and Depth of Sessions", "Quality of Published Research"] } },
            { ...EVALUATION_CRITERIA[1], points: { ar: ["دقة جدول الجلسات", "سهولة التسجيل", "تجهيز القاعات والخدمات"], en: ["Session Schedule Accuracy", "Ease of Registration", "Venue and Service Quality"] } },
            { ...EVALUATION_CRITERIA[2], points: { ar: ["كفاءة المتحدثين وأسلوب العرض", "تفاعل الحضور مع الجلسات العلمية"], en: ["Speaker Competence and Presentation Style", "Audience Interaction with Scientific Sessions"] } },
            { ...EVALUATION_CRITERIA[3], points: { ar: ["جودة المعرض العلمي المصاحب", "تنوع الشركات وارتباطها بالمحتوى"], en: ["Quality of the accompanying scientific exhibition", "Diversity of companies and relevance to content"] } },
            { ...EVALUATION_CRITERIA[4], points: { ar: ["نشر المعرفة الطبية", "دعم الممارسة السريرية", "خلق شراكات بحثية جديدة"], en: ["Dissemination of medical knowledge", "Support for clinical practice", "Creation of new research partnerships"] } }
        ]
    },
    howToBenefit: {
        title: { ar: "كيف تستفيد من صفحة المؤتمرات؟", en: "How to Benefit from the Conferences Page?" },
        audiences: [
            { name: {ar: "للأطباء", en: "For Doctors"}, benefit: {ar: "اختيار الفعاليات العلمية الأكثر ثراءً من حيث القيمة والمحتوى.", en: "Select the most enriching scientific events in terms of value and content."}, icon: 'doctor' },
            { name: {ar: "للمنظمين", en: "For Organizers"}, benefit: {ar: "الاستفادة من تقييمات MedPulse لتطوير جودة مؤتمراتهم القادمة.", en: "Utilize MedPulse evaluations to improve the quality of future conferences."}, icon: 'organizer' },
            { name: {ar: "للشركات الطبية", en: "For Medical Companies"}, benefit: {ar: "التعرف على المؤتمرات الأنسب لعرض منتجاتهم وحلولهم الطبية.", en: "Identify the most suitable conferences to showcase their products and solutions."}, icon: 'company' },
            { name: {ar: "لطلبة الطب", en: "For Medical Students"}, benefit: {ar: "تحديد الفعاليات التي تتيح لهم أكبر فرصة للتعلم والاحتكاك بالخبراء.", en: "Pinpoint events that offer the best opportunities for learning and networking with experts."}, icon: 'student' }
        ]
    },
    testimonials: {
        title: {ar: "انطباعات وآراء من الميدان", en: "Impressions and Opinions from the Field"},
        quotes: [
            {
                text: {ar: "وجود منصة مثل MedPulse يجعلنا كمنظمين أكثر وعيًا بمعايير الجودة في المؤتمرات.", en: "Having a platform like MedPulse makes us, as organizers, more aware of the quality standards in conferences."},
                author: {ar: "د. ناصر الشحي، منظم مؤتمر طب الطوارئ الإماراتي", en: "Dr. Nasser Al-Shehhi, Organizer of the Emirates Emergency Medicine Conference"}
            },
            {
                text: {ar: "التقييم الذي نشرته MedPulse عن مؤتمر الفجيرة للأطفال ساعدنا في تطوير الجلسات العلمية للنسخة القادمة.", en: "The evaluation published by MedPulse on the Fujairah Pediatrics Conference helped us improve the scientific sessions for the next edition."},
                author: {ar: "د. ألفت الزعابي، رئيسة المؤتمر الدولي لطب الأطفال بالفجيرة", en: "Dr. Olfat Al-Zaabi, President of the International Fujairah Pediatrics Conference"}
            }
        ]
    },
    cta: {
        title: {ar: "تواصل معنا لتقييم مؤتمرك", en: "Contact Us to Evaluate Your Conference"},
        text: {ar: "هل ترغب في أن يتم تقييم مؤتمرك القادم من قِبل MedPulse؟ فريقنا جاهز للتعاون معك لتقديم تقييم علمي احترافي، وتحليل إعلامي يرفع من قيمة مؤتمرك أمام الجمهور الطبي.", en: "Would you like your upcoming conference to be evaluated by MedPulse? Our team is ready to collaborate with you to provide a professional scientific evaluation and media analysis that will enhance the value of your conference to the medical community."},
        button: {ar: "اطلب تقريرًا تحليليًا", en: "Request an Analytical Report"}
    }
};

export const ARTICLES_PAGE_CONTENT = {
    hero: {
        title: { ar: "مقالات MedPulse – منصة المعرفة والتحليل الطبي", en: "MedPulse Articles – The Platform for Medical Knowledge and Analysis" },
        subtitle: { ar: "اكتشف التحليلات العلمية والتقارير الميدانية التي ترسم نبض القطاع الطبي في الإمارات", en: "Discover scientific analyses and field reports that capture the pulse of the medical sector in the UAE" },
        intro: { ar: "تُعدّ صفحة المقالات في MedPulse – نبض الطب القلب النابض للمحتوى العلمي والتحليلي في المنصة، حيث نُقدّم من خلالها مقالات معمّقة وتقارير تحليلية ومراجعات ميدانية تغطي أحدث المؤتمرات الطبية، والفعاليات العلمية، والموضوعات التي تشغل اهتمام المجتمع الطبي في الإمارات والمنطقة العربية.", en: "The Articles page on MedPulse is the beating heart of the platform's scientific and analytical content. Here, we present in-depth articles, analytical reports, and on-site reviews covering the latest medical conferences, scientific events, and topics of interest to the medical community in the UAE and the Arab region." }
    },
    mission: {
        title: { ar: "رسالة قسم المقالات", en: "Mission of the Articles Section" },
        text: { ar: "يعمل فريق MedPulse على تحويل كل فعالية طبية إلى قصة علمية ملهمة، تجمع بين التحليل الأكاديمي والرؤية الإعلامية، لتُقدّم مقالات تفاعلية تُثري الوعي وتُبرز جهود الباحثين والأطباء والمنظمين. المقال عندنا ليس مجرد 'خبر'، بل تجربة فكرية موثقة تنقل للقارئ رؤية علمية متكاملة.", en: "The MedPulse team works to transform every medical event into an inspiring scientific story that combines academic analysis with a media vision. We deliver interactive articles that enrich awareness and highlight the efforts of researchers, doctors, and organizers. For us, an article is not just 'news,' but a documented intellectual experience that conveys a comprehensive scientific vision to the reader." }
    },
    types: {
        title: { ar: "أنواع المقالات المنشورة في MedPulse", en: "Types of Articles Published on MedPulse" },
        headers: {
            category: { ar: "التصنيف", en: "Category" },
            description: { ar: "الوصف", en: "Description" },
            audience: { ar: "الفئة المستهدفة", en: "Target Audience" },
        },
        rows: [
            { category: { ar: "🧬 تحليل المؤتمرات", en: "🧬 Conference Analysis" }, description: { ar: "مراجعات تفصيلية للمؤتمرات والملتقيات الطبية، تشمل تقييم الأداء التنظيمي والعلمي.", en: "Detailed reviews of medical conferences and forums, including evaluation of organizational and scientific performance." }, audience: { ar: "الأطباء والمنظمون", en: "Doctors and Organizers" } },
            { category: { ar: "🎓 مقالات تعليمية", en: "🎓 Educational Articles" }, description: { ar: "مقالات تشرح الاتجاهات الحديثة في التعليم الطبي المستمر والبحث العلمي.", en: "Articles explaining modern trends in continuing medical education and scientific research." }, audience: { ar: "الطلبة والأكاديميون", en: "Students and Academics" } },
            { category: { ar: "💊 ملفات الشركات الطبية", en: "💊 Medical Company Profiles" }, description: { ar: "تسليط الضوء على ابتكارات الشركات الراعية ودورها في دعم المؤتمرات.", en: "Highlighting the innovations of sponsoring companies and their role in supporting conferences." }, audience: { ar: "شركات التجهيز الطبي", en: "Medical Supply Companies" } },
            { category: { ar: "🧾 تغطيات ميدانية", en: "🧾 Field Coverage" }, description: { ar: "تقارير من أرض الحدث، توثق التجربة الكاملة للمؤتمرات والمعارض.", en: "Reports from the event floor, documenting the complete experience of conferences and exhibitions." }, audience: { ar: "الجمهور الطبي العام", en: "General Medical Public" } },
            { category: { ar: "🌍 تحليلات علمية دولية", en: "🌍 International Scientific Analyses" }, description: { ar: "نظرة على الفعاليات الطبية العالمية وتأثيرها على المنطقة.", en: "A look at global medical events and their impact on the region." }, audience: { ar: "الباحثون والممارسون", en: "Researchers and Practitioners" } },
        ]
    },
    process: {
        title: { ar: "آلية إعداد المقالات في MedPulse", en: "Our Article Creation Process" },
        steps: [
            { title: { ar: "الرصد الميداني", en: "Field Observation" }, description: { ar: "حضور المؤتمر، جمع البيانات، ومقابلة المشاركين.", en: "Attending the event, gathering data, and interviewing participants." } },
            { title: { ar: "التحليل العلمي", en: "Scientific Analysis" }, description: { ar: "مراجعة الأبحاث، تقييم الجودة العلمية، ومقارنة النتائج.", en: "Reviewing research, assessing scientific quality, and comparing results." } },
            { title: { ar: "الإخراج الإعلامي والتحريري", en: "Media and Editorial Production" }, description: { ar: "كتابة المقال، تدقيقه لغويًا وعلميًا، وتصميم العناصر البصرية.", en: "Writing the article, proofreading it linguistically and scientifically, and designing visual elements." } },
        ]
    },
    goals: {
        title: { ar: "أهداف قسم المقالات", en: "Goals of the Articles Section" },
        items: [
            { ar: "تعزيز المحتوى العلمي العربي في المجال الطبي.", en: "Enhancing Arabic scientific content in the medical field." },
            { ar: "دعم البحث الأكاديمي عبر توثيق وتحليل الفعاليات الطبية.", en: "Supporting academic research by documenting and analyzing medical events." },
            { ar: "توجيه القارئ نحو المؤتمرات والمواضيع ذات القيمة الأعلى.", en: "Guiding readers towards the most valuable conferences and topics." },
            { ar: "بناء مكتبة رقمية متكاملة للمقالات الطبية والإعلامية.", en: "Building an integrated digital library of medical and media articles." },
            { ar: "ربط المنظومة العلمية بالإعلام المهني المتخصص.", en: "Connecting the scientific community with specialized professional media." },
        ]
    },
    cta: {
        title: { ar: "دعوة للمشاركة", en: "An Invitation to Contribute" },
        text: { ar: "تفتح MedPulse المجال للأطباء والباحثين للمساهمة بمقالاتهم العلمية أو آرائهم التحليلية. يمكنك إرسال مقالك إلى البريد التالي: articles@medpulseuae.com", en: "MedPulse invites doctors and researchers to contribute their scientific articles or analytical opinions. You can send your article to the following email: articles@medpulseuae.com" },
        note: { ar: "بعد مراجعته من اللجنة العلمية والتحريرية، سيتم نشره ضمن تصنيفاته المناسبة مع حفظ الحقوق العلمية للكاتب.", en: "After review by our scientific and editorial committee, it will be published in the appropriate category, with full scientific credit to the author." }
    }
};

export const FUJAIRAH_CONFERENCE_ARTICLE_CONTENT = {
    h1: { ar: 'قراءة تحليلية لمؤتمر الفجيرة الدولي لطب الأطفال 2025', en: 'An Analytical Reading of the Fujairah International Pediatrics Conference 2025' },
    subtitle: { ar: 'مؤتمر الفجيرة للأطفال 2025 – نحو جيل أكثر صحة ووعيًا', en: 'Fujairah Pediatrics Conference 2025 – Towards a Healthier and More Aware Generation' },
    intro: {
        ar: 'في مدينة الفجيرة الهادئة التي تجمع بين الجمال الطبيعي والروح العلمية، انعقد مؤتمر الفجيرة الدولي لطب الأطفال 2025 ليُعيد رسم ملامح مستقبل صحة الأطفال في الإمارات والمنطقة. الحدث لم يكن مجرد ملتقى علمي تقليدي، بل منصة فكرية جمعت بين الطب، والتعليم، والإعلام، والمجتمع في تجربة استثنائية قدّمت نموذجًا جديدًا للمؤتمرات الطبية في العالم العربي.',
        en: 'In the serene city of Fujairah, which blends natural beauty with a scientific spirit, the Fujairah International Pediatrics Conference 2025 was held to redraw the future of child health in the UAE and the region. The event was not just a traditional scientific gathering, but an intellectual platform that brought together medicine, education, media, and the community in an exceptional experience that presented a new model for medical conferences in the Arab world.'
    },
    sections: [
        {
            icon: '🎯',
            title: { ar: 'فكرة المؤتمر وأهدافه', en: 'Conference Idea and Objectives' },
            content: [
                { type: 'p', text: { ar: 'يهدف المؤتمر إلى تسليط الضوء على أحدث المستجدات في طب الأطفال وصحة المراهقين، مع التركيز على الوقاية، التشخيص المبكر، ودور التوعية الأسرية والتعليمية في بناء أجيال أكثر صحة.', en: 'The conference aims to highlight the latest developments in pediatrics and adolescent health, with a focus on prevention, early diagnosis, and the role of family and educational awareness in building healthier generations.' }},
                { type: 'p', text: { ar: 'لم يكن المؤتمر مجرد تجمع للأطباء، بل كان رسالة متكاملة تحمل رؤية الإمارات في الاستثمار في الإنسان منذ طفولته.', en: 'The conference was not just a gathering of doctors, but an integrated message carrying the UAE\'s vision of investing in human beings from childhood.' }},
                { type: 'p', text: { ar: 'المؤتمر ضم نخبة من الأطباء والاستشاريين المحليين والدوليين، ونُظّم بمستوى احترافي من حيث التنظيم، والإدارة، والمحتوى العلمي، ليصبح أحد أبرز المؤتمرات التي تتابعها منصة MedPulse – نبض الطب ضمن تقاريرها العلمية والإعلامية.', en: 'The conference included a selection of local and international doctors and consultants, and was organized with a professional level of organization, management, and scientific content, making it one of the most prominent conferences followed by the MedPulse platform in its scientific and media reports.' }}
            ]
        },
        {
            icon: '🧬',
            title: { ar: 'الجلسة الافتتاحية – بداية من القلب', en: 'Opening Session – A Start from the Heart' },
            content: [
                 { type: 'p', text: { ar: 'بدأ اليوم الأول بحفل افتتاح شهد حضور عدد من كبار المسؤولين في القطاع الصحي، حيث تناولت الكلمات الافتتاحية أهمية التكامل بين التخصصات في دعم صحة الطفل، ومواكبة التطورات العلمية في مجالات النمو، والتغذية، والأمراض الوراثية.', en: 'The first day began with an opening ceremony attended by several senior officials from the health sector. The opening speeches addressed the importance of integration between specialties in supporting child health and keeping pace with scientific developments in the fields of growth, nutrition, and genetic diseases.' }},
                 { type: 'p', text: { ar: 'تحدثت اللجنة العلمية عن الرؤية العامة للمؤتمر التي ترتكز على:', en: 'The scientific committee spoke about the general vision of the conference, which is based on:' }},
                 { type: 'ul', items: [
                    { ar: 'تعزيز الوعي الصحي للأسر.', en: 'Enhancing health awareness for families.' },
                    { ar: 'دعم التعليم الطبي المستمر للأطباء.', en: 'Supporting continuing medical education for doctors.' },
                    { ar: 'تطوير الممارسات السريرية في طب الأطفال.', en: 'Developing clinical practices in pediatrics.' }
                 ]},
                 { type: 'p', text: { ar: 'كما أُعلن خلال الجلسة عن مبادرة "طفل الغد"، التي تهدف إلى ربط البحث العلمي بالمجتمع عبر برامج توعوية وتثقيفية للأسر والمدارس.', en: 'During the session, the "Child of Tomorrow" initiative was also announced, which aims to link scientific research with the community through awareness and educational programs for families and schools.' }}
            ]
        },
        {
            icon: '🧠',
            title: { ar: 'الجلسات العلمية – حيث يلتقي العلم بالتطبيق', en: 'Scientific Sessions – Where Science Meets Application' },
            content: [
                 { type: 'p', text: { ar: 'امتدت الجلسات العلمية على مدار يومين متتاليين، وشهدت نقاشات ثرية حول طيف واسع من المواضيع الحيوية في طب الأطفال.', en: 'The scientific sessions extended over two consecutive days and featured rich discussions on a wide range of vital topics in pediatrics.' }},
                 { type: 'h3', text: { ar: 'طب الطوارئ والعناية المركزة للأطفال', en: 'Pediatric Emergency Medicine and Intensive Care' }},
                 { type: 'p', text: { ar: 'قدّم عدد من الخبراء من داخل وخارج الإمارات أوراقًا بحثية تناولت أحدث التقنيات في تشخيص وعلاج الحالات الحرجة، مع التركيز على إدارة الأزمات داخل أقسام الطوارئ للأطفال.', en: 'A number of experts from inside and outside the UAE presented research papers on the latest techniques in diagnosing and treating critical cases, with a focus on crisis management within pediatric emergency departments.' }},
                 { type: 'h3', text: { ar: 'أمراض الجهاز التنفسي والمناعة', en: 'Respiratory and Immune System Diseases' }},
                 { type: 'p', text: { ar: 'ناقشت الجلسة التحديات الحديثة في التعامل مع أمراض الحساسية والربو، إلى جانب التطورات في علاجات نقص المناعة الوراثي، وأهمية الكشف المبكر.', en: 'The session discussed modern challenges in dealing with allergies and asthma, in addition to developments in treatments for hereditary immunodeficiency and the importance of early detection.' }},
                 { type: 'h3', text: { ar: 'التغذية والنمو عند الأطفال', en: 'Nutrition and Growth in Children' }},
                 { type: 'p', text: { ar: 'استعرض الخبراء أحدث التوصيات في مجال التغذية العلاجية، ودور النمط الغذائي المتوازن في الوقاية من السمنة ونقص الفيتامينات. كما قدمت مجموعة من الورش العملية نماذج تفاعلية بين الأطباء وأولياء الأمور.', en: 'Experts reviewed the latest recommendations in the field of therapeutic nutrition and the role of a balanced diet in preventing obesity and vitamin deficiencies. A series of practical workshops also presented interactive models between doctors and parents.' }}
            ]
        },
        {
            icon: '🧩',
            title: { ar: 'ورش العمل – التجربة التعليمية في الميدان', en: 'Workshops – The Educational Experience in the Field' },
            content: [
                 { type: 'p', text: { ar: 'تميز المؤتمر بتنظيم ورش تدريبية تطبيقية موجهة للأطباء المقيمين وطلبة الطب، حيث تم تنفيذ جلسات تدريبية حول مهارات الفحص السريري للأطفال، وتقنيات التواصل مع الأهل في الحالات النفسية والسلوكية.', en: 'The conference was distinguished by organizing practical training workshops aimed at resident doctors and medical students, where training sessions were held on pediatric clinical examination skills and communication techniques with parents in psychological and behavioral cases.' }},
                 { type: 'p', text: { ar: 'كانت ورش العمل نقطة التقاء بين التعليم الأكاديمي والممارسة الواقعية، ما جعلها إحدى أبرز نقاط القوة التي رصدتها منصة MedPulse في هذا الحدث.', en: 'The workshops were a meeting point between academic education and real-world practice, making them one of the most prominent strengths observed by the MedPulse platform at this event.' }}
            ]
        },
        {
            icon: '🎥',
            title: { ar: 'التغطية الإعلامية والتفاعل الجماهيري', en: 'Media Coverage and Public Interaction' },
            content: [
                 { type: 'p', text: { ar: 'شهد المؤتمر حضورًا واسعًا من وسائل الإعلام المحلية والعربية، التي سلطت الضوء على فعالياته عبر تقارير وبرامج متخصصة.', en: 'The conference witnessed extensive attendance from local and Arab media, which highlighted its activities through specialized reports and programs.' }},
                 { type: 'p', text: { ar: 'كما حظيت التغطية الرقمية التي أطلقتها MedPulse بتفاعل كبير من الجمهور الطبي والمهتمين، حيث قدم فريق المنصة مقابلات حصرية مع عدد من المتحدثين البارزين، مثل الأطباء المتخصصين في أمراض القلب عند الأطفال والتغذية السريرية.', en: 'The digital coverage launched by MedPulse also received significant interaction from the medical public and interested parties, as the platform\'s team presented exclusive interviews with a number of prominent speakers, such as specialists in pediatric cardiology and clinical nutrition.' }},
                 { type: 'p', text: { ar: 'وُصف المؤتمر في تقرير MedPulse بأنه "مزيج متوازن بين العلمية والإنسانية"، إذ نجح في نقل العلم من القاعة إلى المجتمع عبر لغة قريبة من الناس.', en: 'The conference was described in the MedPulse report as a "balanced mix of science and humanity," as it succeeded in transferring science from the lecture hall to the community in a language accessible to the people.' }}
            ]
        },
        {
            icon: '🩺',
            title: { ar: 'محاور النقاش الرئيسية', en: 'Main Discussion Topics' },
            content: [
                { type: 'ol', items: [
                    { title: { ar: 'صحة الطفل النفسية والسلوكية', en: 'Child Mental and Behavioral Health' }, points: [{ ar: 'مناقشة آثار التكنولوجيا على النمو النفسي للأطفال.', en: 'Discussing the effects of technology on children\'s psychological development.' }, { ar: 'دور الأسرة والمدرسة في الوقاية من الاضطرابات السلوكية.', en: 'The role of family and school in preventing behavioral disorders.' }] },
                    { title: { ar: 'الأمراض الوراثية والتمثيل الغذائي', en: 'Genetic and Metabolic Diseases' }, points: [{ ar: 'أحدث الأبحاث في التشخيص المبكر والعلاجات الجينية الحديثة.', en: 'The latest research in early diagnosis and modern gene therapies.' }] },
                    { title: { ar: 'أمراض القلب عند الأطفال', en: 'Pediatric Heart Diseases' }, points: [{ ar: 'جلسات تفاعلية حول التطورات الجراحية وأجهزة المراقبة الحيوية.', en: 'Interactive sessions on surgical developments and vital monitoring devices.' }] },
                    { title: { ar: 'الوقاية المجتمعية والتوعية الصحية', en: 'Community Prevention and Health Awareness' }, points: [{ ar: 'مبادرات التوعية في المدارس والمراكز الصحية لتعزيز ثقافة الفحص المبكر.', en: 'Awareness initiatives in schools and health centers to promote a culture of early screening.' }] }
                ]}
            ]
        },
        {
            icon: '👩‍⚕️',
            title: { ar: 'مشاركة الخبراء والمتحدثين', en: 'Expert and Speaker Participation' },
            content: [
                 { type: 'p', text: { ar: 'شارك في المؤتمر أكثر من 50 متحدثًا متخصصًا من الإمارات والسعودية والأردن ومصر وأوروبا، قدّموا خلاصة أبحاثهم وتجاربهم في التعامل مع أمراض الأطفال المزمنة والمستجدة.', en: 'More than 50 specialized speakers from the UAE, Saudi Arabia, Jordan, Egypt, and Europe participated in the conference, presenting the summary of their research and experiences in dealing with chronic and emerging childhood diseases.' }},
                 { type: 'p', text: { ar: 'تنوّعت المحاضرات بين الجلسات العلمية القصيرة والعروض التفاعلية، وكان الحضور من الأطباء والطلبة يعكس تعطشًا كبيرًا للمعرفة والممارسة الحديثة.', en: 'The lectures varied between short scientific sessions and interactive presentations, and the attendance of doctors and students reflected a great thirst for knowledge and modern practice.' }}
            ]
        },
        {
            icon: '🌍',
            title: { ar: 'البعد المجتمعي والتوعوي للمؤتمر', en: 'Community and Awareness Dimension of the Conference' },
            content: [
                 { type: 'p', text: { ar: 'لم يقتصر المؤتمر على الجانب الأكاديمي فقط، بل خصص مساحة مهمة للتواصل مع المجتمع من خلال ركن توعوي للأسر والأطفال ضم أنشطة تعليمية وتثقيفية مبسطة.', en: 'The conference was not limited to the academic aspect alone, but also dedicated significant space for community outreach through an awareness corner for families and children, which included simplified educational and cultural activities.' }},
                 { type: 'p', text: { ar: 'تم عرض مجموعة من المواد المرئية من إنتاج MedPulse قدمت نصائح للأهل حول التغذية السليمة والتعامل مع مشكلات النوم والسلوك. وهكذا أصبح المؤتمر نموذجًا يُحتذى به في الدمج بين العلم والمجتمع والإعلام.', en: 'A collection of visual materials produced by MedPulse was displayed, offering advice to parents on proper nutrition and dealing with sleep and behavioral problems. Thus, the conference became a model to be emulated in integrating science, community, and media.' }}
            ]
        },
        {
            icon: '💬',
            title: { ar: 'انطباعات الحضور', en: 'Attendee Impressions' },
            content: [
                { type: 'p', text: { ar: 'رصد فريق MedPulse آراء عشرات الأطباء والطلبة والمشاركين، وجاءت أغلب التعليقات إيجابية، أشادت بـ:', en: 'The MedPulse team monitored the opinions of dozens of doctors, students, and participants, and most of the comments were positive, praising:' }},
                { type: 'ul', items: [
                    { ar: 'مستوى التنظيم الدقيق.', en: 'The meticulous level of organization.' },
                    { ar: 'تنوع الجلسات العلمية.', en: 'The diversity of scientific sessions.' },
                    { ar: 'جودة الورش التطبيقية.', en: 'The quality of the practical workshops.' },
                    { ar: 'القيمة التعليمية العالية للمؤتمر.', en: 'The high educational value of the conference.' }
                ]},
                { type: 'p', text: { ar: 'كما أبدى عدد من الأطباء إعجابهم بتغطية MedPulse التي نقلت الحدث بمهنية وحياد، مما زاد من مصداقية التقارير المنشورة بعد المؤتمر.', en: 'A number of doctors also expressed their admiration for MedPulse\'s coverage, which reported the event professionally and impartially, thereby increasing the credibility of the reports published after the conference.' }}
            ]
        },
        {
            icon: '🧾',
            title: { ar: 'الخاتمة – مؤتمر يُعزّز ثقة المستقبل', en: 'Conclusion – A Conference that Boosts Confidence in the Future' },
            content: [
                 { type: 'p', text: { ar: 'يُمثل مؤتمر الفجيرة للأطفال 2025 أكثر من مجرد حدث علمي، بل هو تجسيد لرؤية الإمارات في بناء جيل يتمتع بصحة أفضل، من خلال تكامل الجهود الطبية والتعليمية والإعلامية.', en: 'The Fujairah Pediatrics Conference 2025 represents more than just a scientific event; it is an embodiment of the UAE\'s vision to build a healthier generation through the integration of medical, educational, and media efforts.' }},
                 { type: 'p', text: { ar: 'ومع كل مؤتمر من هذا النوع، يزداد الإيمان بأن المعرفة حين تُشارك تُثمر، وأن الطب حين يُقرن بالوعي يصنع مستقبلًا أكثر إشراقًا.', en: 'With every conference of this kind, the belief grows that when knowledge is shared, it flourishes, and when medicine is paired with awareness, it creates a brighter future.' }},
                 { type: 'p', text: { ar: 'منصة MedPulse – نبض الطب، إذ تقدم هذا التقرير التحليلي، تؤكد استمرارها في توثيق ودعم كل الجهود العلمية التي تسعى لرفع جودة حياة الطفل العربي، وتعزيز مكانة الإمارات كمركز علمي إقليمي رائد في مجال طب الأطفال والرعاية الصحية.', en: 'The MedPulse platform, in presenting this analytical report, affirms its continuation in documenting and supporting all scientific efforts that seek to improve the quality of life for Arab children and to enhance the UAE\'s position as a leading regional scientific center in the field of pediatrics and healthcare.' }}
            ]
        }
    ]
};

export const CONTACT_PAGE_CONTENT = {
  hero: {
    title: { ar: 'تواصل معنا – لأن نبض المعرفة لا يتوقف', en: 'Contact Us – Because the Pulse of Knowledge Never Stops' },
    intro: {
      ar: 'في MedPulse – نبض الطب، نؤمن أن التواصل هو جوهر التطوير العلمي والإعلامي. نحن لا نُقدّم تقارير فقط، بل نبني جسورًا بين المنظمين، والأطباء، والباحثين، والشركات، من أجل رفع جودة الفعاليات الطبية وتبادل المعرفة والخبرات في كل أنحاء الإمارات.',
      en: 'At MedPulse, we believe that communication is the essence of scientific and media development. We don\'t just provide reports; we build bridges between organizers, doctors, researchers, and companies to elevate the quality of medical events and exchange knowledge throughout the UAE.'
    },
    subIntro: {
        ar: 'سواء كنت منظم مؤتمر، أو متحدثًا علميًا، أو شركة طبية، أو جهة راعية، أو صحفيًا متخصصًا — فأنت في المكان الصحيح للتفاعل معنا والانضمام إلى نبض التطوير.',
        en: 'Whether you are a conference organizer, a scientific speaker, a medical company, a sponsor, or a specialized journalist—you are in the right place to interact with us and join the pulse of development.'
    }
  },
  whyContact: {
    title: { ar: 'لماذا تتواصل معنا؟', en: 'Why Contact Us?' },
    intro: { ar: 'تفتح MedPulse قنواتها أمام كل من يسعى إلى التعاون العلمي والإعلامي:', en: 'MedPulse opens its channels to everyone seeking scientific and media collaboration:' },
    points: [
      { title: { ar: 'للجهات المنظمة', en: 'For Organizers' }, items: [{ ar: 'لطلب تقارير تحليلية أو تقييم رسمي لمؤتمرك الطبي.', en: 'To request analytical reports or an official evaluation of your medical conference.' }, { ar: 'للحصول على خطة تطوير وتوصيات علمية مستقبلية.', en: 'To obtain a development plan and future scientific recommendations.' }] },
      { title: { ar: 'للشركات الطبية والرعاة', en: 'For Medical Companies & Sponsors' }, items: [{ ar: 'لتسليط الضوء على مشاركتكم العلمية ضمن تغطياتنا الإعلامية.', en: 'To highlight your scientific participation in our media coverage.' }, { ar: 'لإعداد محتوى رقمي احترافي يعرض منتجاتكم أو مبادراتكم التعليمية.', en: 'To create professional digital content showcasing your products or educational initiatives.' }] },
      { title: { ar: 'للأطباء والباحثين', en: 'For Doctors & Researchers' }, items: [{ ar: 'للمشاركة بمقال علمي أو رأي تحليلي على المنصة.', en: 'To contribute a scientific article or analytical opinion on the platform.' }, { ar: 'للانضمام إلى برامج MedPulse كمستشار علمي أو متحدث.', en: 'To join MedPulse programs as a scientific advisor or speaker.' }] },
      { title: { ar: 'للإعلاميين والطلاب', en: 'For Media Professionals & Students' }, items: [{ ar: 'للتدريب ضمن فريق التغطية الإعلامية والطبية.', en: 'For training with the media and medical coverage team.' }, { ar: 'للمساهمة في نقل الأحداث العلمية من منظور إعلامي احترافي.', en: 'To contribute to covering scientific events from a professional media perspective.' }] }
    ]
  },
  contactDetails: {
    title: { ar: 'بيانات التواصل الرسمية', en: 'Official Contact Information' },
    address: { title: { ar: 'المقر الرئيسي', en: 'Headquarters' }, value: { ar: 'الإمارات العربية المتحدة – دبي, مدينة دبي الطبية – مبنى الابتكار الطبي – الطابق الخامس', en: 'UAE - Dubai, Dubai Healthcare City - Medical Innovation Building - 5th Floor' } },
    phone: { title: { ar: 'هاتف الاستقبال العام', en: 'General Reception Phone' }, value: '+971 50 000 0000' },
    emails: [
        { title: { ar: 'البريد الإلكتروني العام', en: 'General Email' }, value: 'info@medpulse.ae' },
        { title: { ar: 'البريد المخصص للتعاون العلمي', en: 'Email for Scientific Collaboration' }, value: 'research@medpulse.ae' },
        { title: { ar: 'البريد المخصص للتغطية الإعلامية', en: 'Email for Media Coverage' }, value: 'media@medpulse.ae' },
    ],
  },
  socials: {
    title: { ar: 'تواصل عبر المنصات الرقمية', en: 'Connect on Digital Platforms' },
    links: [
        { name: 'Website', url: 'https://www.medpulseuae.com' },
        { name: 'Facebook', url: 'https://www.facebook.com/MedPulseUAE/' },
        { name: 'Instagram', url: 'https://www.instagram.com/medpulseuae/' },
        { name: 'X', url: 'https://x.com/medpulseuae' },
        { name: 'Tiktok', url: 'https://www.tiktok.com/@medpulseuae' },
        { name: 'Youtube', url: 'https://www.youtube.com/@medpulse-u3z' },
    ]
  },
  form: {
    title: { ar: 'نموذج التواصل المباشر', en: 'Direct Contact Form' },
    intro: { ar: 'يمكنك ملء النموذج التالي وسيتواصل معك أحد أعضاء فريقنا خلال 24 ساعة عمل:', en: 'You can fill out the form below, and a member of our team will contact you within 24 business hours:' },
    fields: {
        name: { ar: 'الاسم الكامل', en: 'Full Name' },
        organization: { ar: 'الجهة أو المؤسسة', en: 'Company or Institution' },
        email: { ar: 'البريد الإلكتروني', en: 'Email' },
        phone: { ar: 'رقم الهاتف', en: 'Phone Number' },
        inquiryType: { ar: 'نوع الاستفسار', en: 'Inquiry Type' },
        message: { ar: 'الرسالة أو تفاصيل الطلب', en: 'Message or Request Details' },
    },
    inquiryOptions: [
        { key: 'evaluation', label: { ar: 'تقييم مؤتمر', en: 'Conference Evaluation' } },
        { key: 'media', label: { ar: 'تعاون إعلامي', en: 'Media Collaboration' } },
        { key: 'article', label: { ar: 'مشاركة بمقالة', en: 'Article Submission' } },
        { key: 'training', label: { ar: 'تدريب', en: 'Training' } },
        { key: 'other', label: { ar: 'أخرى', en: 'Other' } },
    ] as ContactInquiryType[],
    submit: { ar: 'إرسال الرسالة', en: 'Send Message' },
    privacy: { ar: 'نلتزم بسرية المعلومات وعدم مشاركتها مع أي طرف ثالث وفق سياسة الخصوصية المعتمدة لدى المنصة.', en: 'We are committed to information confidentiality and will not share it with any third party, in accordance with the platform\'s privacy policy.' },
  },
  partners: {
    title: { ar: 'شركاؤنا في النجاح', en: 'Our Partners in Success' },
    intro: { ar: 'تعتز MedPulse بتعاونها مع مجموعة من الشركاء في المجال الطبي والإعلامي الذين يشاركونها الهدف نفسه: رفع مستوى جودة الفعاليات الطبية وتطوير القطاع العلمي في الإمارات.', en: 'MedPulse is proud to collaborate with a group of partners in the medical and media fields who share the same goal: raising the quality of medical events and developing the scientific sector in the UAE.' },
    list: [
      { ar: 'الجمعيات الطبية الإماراتية', en: 'Emirati Medical Associations' },
      { ar: 'المستشفيات الجامعية', en: 'University Hospitals' },
      { ar: 'شركات تنظيم المؤتمرات والمعارض الطبية', en: 'Medical Conference and Exhibition Organizers' },
      { ar: 'المؤسسات التعليمية والأكاديمية', en: 'Educational and Academic Institutions' },
      { ar: 'شركات الإعلام الصحي', en: 'Health Media Companies' },
    ]
  },
  joinUs: {
    title: { ar: 'كن جزءًا من فريق MedPulse', en: 'Be Part of the MedPulse Team' },
    intro: { ar: 'إذا كنت تمتلك شغفًا بالعلم والإعلام، وترغب في المساهمة في مشروع يهدف إلى تطوير المشهد الطبي، ندعوك للانضمام إلى فريق MedPulse ضمن الأقسام التالية:', en: 'If you have a passion for science and media and want to contribute to a project aimed at developing the medical landscape, we invite you to join the MedPulse team in the following departments:' },
    departments: [
        { ar: 'التحرير العلمي والإعلامي', en: 'Scientific and Media Editing' },
        { ar: 'التغطية الميدانية', en: 'Field Coverage' },
        { ar: 'إنتاج الفيديوهات', en: 'Video Production' },
        { ar: 'العلاقات العامة والتنسيق', en: 'Public Relations and Coordination' },
    ],
    cta: { ar: 'أرسل سيرتك الذاتية إلى: career@medpulse.ae', en: 'Send your CV to: career@medpulse.ae' }
  },
  policy: {
    title: { ar: 'سياسة التواصل والرد', en: 'Communication and Response Policy' },
    points: [
      { ar: 'يتم الرد على جميع الرسائل خلال 24 إلى 48 ساعة عمل.', en: 'All messages are answered within 24 to 48 business hours.' },
      { ar: 'المراسلات الرسمية الخاصة بالتقارير تحتاج إلى إثبات هوية الجهة المنظمة.', en: 'Official correspondence regarding reports requires proof of the organizing body\'s identity.' },
      { ar: 'في حال وجود شكاوى أو تصحيحات علمية، يمكن إرسالها إلى editorial@medpulse.ae وسيتم مراجعتها من اللجنة العلمية.', en: 'In case of complaints or scientific corrections, they can be sent to editorial@medpulse.ae and will be reviewed by the scientific committee.' }
    ]
  },
  additionalInfo: {
    title: { ar: 'معلومات إضافية', en: 'Additional Information' },
    hours: { title: { ar: 'ساعات العمل الرسمية:', en: 'Official Working Hours:' }, value: { ar: 'الأحد إلى الخميس – من الساعة 9:00 صباحًا حتى 6:00 مساءً.', en: 'Sunday to Thursday – from 9:00 AM to 6:00 PM.' } },
    weekend: { title: { ar: 'العطلة الأسبوعية:', en: 'Weekend:' }, value: { ar: 'الجمعة والسبت.', en: 'Friday and Saturday.' } },
    support: { title: { ar: 'فريق الدعم الفني:', en: 'Technical Support Team:' }, value: { ar: 'متاح عبر البريد support@medpulse.ae لأي مشاكل فنية بالموقع أو النظام.', en: 'Available via email at support@medpulse.ae for any technical issues with the site or system.' } }
  }
};


export const PRIVACY_POLICY_CONTENT = {
    hero: {
        title: { ar: 'سياسة الخصوصية – التزامنا بحماية بياناتك في MedPulse', en: 'Privacy Policy – Our Commitment to Protecting Your Data at MedPulse' },
        intro: { ar: 'نشكرك على ثقتك بـ MedPulse – نبض الطب. نلتزم بحماية خصوصيتك وضمان أمن معلوماتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية بياناتك.', en: 'Thank you for trusting MedPulse. We are committed to protecting your privacy and ensuring the security of your personal information. This policy explains how we collect, use, and protect your data.' }
    },
    sections: [
        { icon: '📘', title: { ar: 'أولاً – نطاق السياسة', en: '1. Scope of the Policy' }, content: [{ ar: 'تسري هذه السياسة على جميع الخدمات والصفحات التابعة لموقع MedPulseuae.com. باستخدامك للموقع، فإنك توافق على شروط هذه السياسة.', en: 'This policy applies to all services and pages of MedPulseuae.com. By using the site, you agree to the terms of this policy.' }] },
        { icon: '🧾', title: { ar: 'ثانيًا – البيانات التي نقوم بجمعها', en: '2. Data We Collect' }, content: [
            { ar: 'نجمع نوعين من البيانات:', en: 'We collect two types of data:' },
            { ar: '**البيانات الشخصية التي تقدمها طوعًا:** مثل الاسم، البريد الإلكتروني، رقم الهاتف، والرسائل عبر نموذج التواصل.', en: '**Personal data you provide voluntarily:** Such as name, email, phone number, and messages through the contact form.' },
            { ar: '**البيانات التقنية التلقائية:** يتم جمعها عبر ملفات تعريف الارتباط (Cookies) وتشمل عنوان الـ IP، نوع الجهاز، والمتصفح. الغرض هو تحسين تجربة المستخدم.', en: '**Automatic technical data:** Collected via Cookies, including IP address, device type, and browser. The purpose is to improve user experience.' }
        ]},
        { icon: '🔍', title: { ar: 'ثالثًا – كيفية استخدام البيانات', en: '3. How We Use Data' }, content: [
            { ar: 'تُستخدم المعلومات المجمعة للرد على الاستفسارات، تحسين محتوى الموقع، إعداد تقارير تحليلية، والتواصل لأغراض مهنية (بعد موافقتك)، وإرسال نشرات دورية.', en: 'The collected information is used to respond to inquiries, improve site content, prepare analytical reports, communicate for professional purposes (with your consent), and send periodic newsletters.' },
            { ar: 'لن نستخدم بياناتك لأي أغراض تسويقية دون إذن صريح منك.', en: 'We will not use your data for any marketing purposes without your explicit consent.' }
        ]},
        { icon: '🧠', title: { ar: 'رابعًا – حماية المعلومات', en: '4. Information Protection' }, content: [{ ar: 'نتبع معايير أمنية عالية لحماية بيانات المستخدمين، بما في ذلك تشفير SSL وصلاحيات وصول محددة. لا نشارك أي معلومات شخصية مع أطراف ثالثة إلا عند الضرورة القانونية.', en: 'We follow high-security standards to protect user data, including SSL encryption and limited access permissions. We do not share any personal information with third parties except when legally required.' }] },
        { icon: '📨', title: { ar: 'خامسًا – ملفات تعريف الارتباط (Cookies)', en: '5. Cookies' }, content: [{ ar: 'يستخدم موقعنا ملفات تعريف الارتباط لتسهيل تصفحك. يمكنك تعديل إعدادات المتصفح لحظرها، لكن قد يؤدي ذلك إلى تعطيل بعض وظائف الموقع.', en: 'Our site uses cookies to facilitate your browsing. You can modify your browser settings to block them, but this may disable some site functions.' }] },
        { icon: '🤝', title: { ar: 'سادسًا – مشاركة المعلومات مع الغير', en: '6. Information Sharing with Third Parties' }, content: [{ ar: 'قد تتم مشاركة بعض البيانات مع مزودي خدمات التحليل (مثل Google Analytics) أو شركاء التكنولوجيا الداعمين للمنصة، مع التزامهم باتفاقيات سرية وحماية بيانات.', en: 'Some data may be shared with analytics service providers (like Google Analytics) or technology partners supporting the platform, under confidentiality and data protection agreements.' }] },
        { icon: '🧾', title: { ar: 'سابعًا – حقوق المستخدم', en: '7. User Rights' }, content: [
             { ar: 'يحق لك الاطلاع على بياناتك، طلب تعديلها أو حذفها، إلغاء الاشتراك في النشرات البريدية، والاعتراض على استخدام بياناتك. يمكنك ممارسة هذه الحقوق عبر البريد الإلكتروني: privacy@medpulseuae.com', en: 'You have the right to access your data, request its modification or deletion, unsubscribe from newsletters, and object to the use of your data. You can exercise these rights by emailing: privacy@medpulseuae.com' }
        ]},
        { icon: '🌍', title: { ar: 'ثامنًا – روابط خارجية', en: '8. External Links' }, content: [{ ar: 'قد يحتوي موقعنا على روابط لمواقع أخرى. نحن غير مسؤولين عن سياسات الخصوصية في تلك المواقع.', en: 'Our site may contain links to other websites. We are not responsible for the privacy policies of those sites.' }] },
        { icon: '🧩', title: { ar: 'تاسعًا – تحديثات سياسة الخصوصية', en: '9. Privacy Policy Updates' }, content: [{ ar: 'قد نقوم بتحديث هذه السياسة من وقت لآخر. سيتم الإعلان عن أي تعديل من خلال إشعار واضح في الصفحة الرئيسية. (آخر تحديث: نوفمبر 2025)', en: 'We may update this policy from time to time. Any changes will be announced via a clear notice on the homepage. (Last updated: November 2025)' }] },
        { icon: '🩺', title: { ar: 'عاشرًا – كيفية التواصل معنا', en: '10. How to Contact Us' }, content: [
            { ar: 'لأي استفسارات تتعلق بسياسة الخصوصية، يرجى التواصل معنا عبر البريد: privacy@medpulseuae.com', en: 'For any inquiries regarding the privacy policy, please contact us at: privacy@medpulseuae.com' },
            { ar: 'نؤمن أن الثقة تبدأ من الشفافية، والشفافية تبدأ من حماية بياناتك.', en: 'We believe that trust begins with transparency, and transparency begins with protecting your data.'}
        ]}
    ]
};

export const DISCLAIMER_PAGE_CONTENT = {
    hero: {
        title: { ar: 'بيان إخلاء المسؤولية – حدود الاستخدام والمحتوى في MedPulse', en: 'Disclaimer – Limits of Use and Content on MedPulse' },
        intro: { ar: 'يُعد هذا البيان جزءًا أساسيًا من شروط استخدام موقع MedPulse – نبض الطب. يهدف إلى توضيح حدود المسؤولية القانونية والإعلامية المتعلقة بالمحتوى المنشور.', en: 'This statement is an essential part of the terms of use for MedPulse. It aims to clarify the limits of legal and media liability related to the published content.' }
    },
    sections: [
        { icon: '🧾', title: { ar: 'أولاً – طبيعة المحتوى', en: '1. Nature of Content' }, content: [{ ar: 'جميع المواد المنشورة على موقع MedPulse تُقدَّم لأغراض إعلامية وعلمية تحليلية فقط، ولا تُعد بأي حال من الأحوال بديلًا عن الاستشارة الطبية. ننصح دائمًا بمراجعة الطبيب المختص.', en: 'All materials on MedPulse are for informational and analytical purposes only and are not a substitute for professional medical advice. Always consult a qualified physician.' }] },
        { icon: '🧠', title: { ar: 'ثانيًا – دقة المعلومات', en: '2. Accuracy of Information' }, content: [{ ar: 'نحرص على أن تكون جميع المعلومات دقيقة، إلا أننا لا نضمن خلوها من الأخطاء بنسبة 100%. MedPulse غير مسؤولة عن أي استخدام للمعلومات يتم خارج سياقها الصحيح.', en: 'While we strive for accuracy, we cannot guarantee that all information is 100% error-free. MedPulse is not responsible for any use of information outside its proper context.' }] },
        { icon: '🎓', title: { ar: 'ثالثًا – استقلالية التقييمات', en: '3. Independence of Evaluations' }, content: [{ ar: 'جميع التقييمات المنشورة تم إعدادها من قبل فريقنا بناءً على معايير مستقلة ولا تعكس بالضرورة وجهة نظر المنظمات التي تم تقييمها.', en: 'All published evaluations are prepared by our team based on independent criteria and do not necessarily reflect the views of the evaluated organizations.' }] },
        { icon: '💼', title: { ar: 'رابعًا – العلاقات التجارية', en: '4. Commercial Relationships' }, content: [{ ar: 'قد يتضمن الموقع محتوى مدعومًا من شركاء. أي محتوى ترويجي يتم الإفصاح عنه بوضوح وفصله عن المحتوى العلمي التحليلي.', en: 'The site may include sponsored content. Any promotional material is clearly disclosed and separated from analytical scientific content.' }] },
        { icon: '💬', title: { ar: 'خامسًا – الروابط الخارجية', en: '5. External Links' }, content: [{ ar: 'MedPulse لا تتحمل مسؤولية المحتوى أو السياسات في المواقع الخارجية التي نربط إليها.', en: 'MedPulse is not responsible for the content or policies of external sites we link to.' }] },
        { icon: '🧾', title: { ar: 'سادسًا – حقوق الملكية الفكرية', en: '6. Intellectual Property Rights' }, content: [{ ar: 'جميع المواد المنشورة على الموقع محفوظة الحقوق، ولا يجوز نسخها أو إعادة نشرها دون إذن كتابي مسبق. يُسمح بالاقتباس الجزئي مع ذكر المصدر.', en: 'All materials on the site are copyrighted. Copying or republishing without prior written permission is prohibited. Partial quoting with attribution is allowed.' }] },
        { icon: '⚖️', title: { ar: 'سابعًا – حدود المسؤولية القانونية', en: '7. Limitation of Liability' }, content: [{ ar: 'لا تتحمل MedPulse أي مسؤولية عن الأضرار الناتجة عن الاعتماد على محتوى منشور بالموقع، أخطاء في المعلومات، أو أعطال تقنية.', en: 'MedPulse assumes no liability for damages resulting from reliance on site content, information errors, or technical failures.' }] },
        { icon: '🧩', title: { ar: 'ثامنًا – تعديلات البيان', en: '8. Statement Amendments' }, content: [{ ar: 'تحتفظ MedPulse بحق تعديل هذا البيان في أي وقت. النسخة المنشورة على الموقع هي المعتمدة دائمًا. (آخر تحديث: نوفمبر 2025)', en: 'MedPulse reserves the right to amend this statement at any time. The version published on the site is always the current one. (Last updated: November 2025)' }] },
        { icon: '📩', title: { ar: 'للتواصل بخصوص إخلاء المسؤولية', en: 'Contact Regarding Disclaimer' }, content: [{ ar: 'يمكن إرسال أي ملاحظات إلى: legal@medpulse.com', en: 'Any feedback can be sent to: legal@medpulse.com' }] }
    ]
};


export const SIGNUP_PAGE_CONTENT = {
  title: { ar: "إنشاء حساب جديد", en: "Create New Account" },
  subtitle: { ar: "سجل حسابك للانضمام إلى مجتمع MedPulse", en: "Sign up to join the MedPulse community" },
  fields: {
    fullName: { ar: "الاسم الكامل", en: "Full Name" },
    email: { ar: "البريد الإلكتروني", en: "Email Address" },
    phone: { ar: "رقم الهاتف (اختياري)", en: "Phone Number (Optional)" },
    password: { ar: "كلمة المرور", en: "Password" },
    confirmPassword: { ar: "تأكيد كلمة المرور", en: "Confirm Password" },
    specialty: { ar: "التخصص الطبي (اختياري)", en: "Medical Specialty (Optional)" },
    country: { ar: "الدولة", en: "Country" },
  },
  checkboxes: {
    terms: { ar: "أوافق على الشروط والأحكام", en: "I agree to the Terms and Conditions" },
    newsletter: { ar: "الاشتراك في النشرة البريدية (اختياري)", en: "Subscribe to the newsletter (Optional)" },
  },
  button: { ar: "إنشاء حساب", en: "Create Account" },
  loginLink: { ar: "لديك حساب بالفعل؟ تسجيل الدخول", en: "Already have an account? Log In" },
  success: {
    title: { ar: "تم إنشاء حسابك بنجاح!", en: "Account Created Successfully!" },
    message: { ar: "مرحبًا بك في MedPulse.", en: "Welcome to MedPulse." },
    button: { ar: "الانتقال إلى الصفحة الرئيسية", en: "Go to Homepage" },
  },
  validation: {
    email: { ar: "البريد غير صحيح", en: "Invalid email address" },
    passwordLength: { ar: "كلمة المرور يجب ألا تقل عن 8 أحرف", en: "Password must be at least 8 characters" },
    passwordMatch: { ar: "كلمة المرور غير متطابقة", en: "Passwords do not match" },
  }
};

export const LOGIN_PAGE_CONTENT = {
  title: { ar: "تسجيل الدخول", en: "Log In" },
  fields: {
    email: { ar: "البريد الإلكتروني", en: "Email Address" },
    password: { ar: "كلمة المرور", en: "Password" },
  },
  checkbox: { ar: "تذكرني", en: "Remember Me" },
  button: { ar: "تسجيل الدخول", en: "Log In" },
  forgotPasswordLink: { ar: "نسيت كلمة المرور؟", en: "Forgot Password?" },
  signupLink: { ar: "ليس لديك حساب؟ إنشاء حساب جديد", en: "Don't have an account? Create a new one" },
};

export const PROFILE_PAGE_CONTENT = {
  title: { ar: "الملف الشخصي", en: "Profile" },
  welcome: { ar: "مرحباً بك،", en: "Welcome," },
};