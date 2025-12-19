
import React, { useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';

interface SEOProps {
    page: string;
    dynamicTitle?: string;
    dynamicDescription?: string;
}

const SEO: React.FC<SEOProps> = ({ page, dynamicTitle, dynamicDescription }) => {
    const { language } = useLocalization();

    useEffect(() => {
        const storedSeo = localStorage.getItem('seo_settings');
        const seoSettings = storedSeo ? JSON.parse(storedSeo) : {};
        const pageSeo = seoSettings[page] || {};

        // Title Priority: Dynamic Prop > LocalStorage > Default
        let title = '';
        if (dynamicTitle) {
            title = dynamicTitle;
        } else {
            title = language === 'ar' 
                ? (pageSeo.meta_title_ar || 'MedPulse | نبض الطب') 
                : (pageSeo.meta_title_en || 'MedPulse');
        }

        // Description Priority: Dynamic Prop > LocalStorage > Default
        let description = '';
        if (dynamicDescription) {
            description = dynamicDescription;
        } else {
            description = language === 'ar' 
                ? (pageSeo.meta_description_ar || 'منصة علمية-إعلامية متخصصة في تقييم المؤتمرات الطبية') 
                : (pageSeo.meta_description_en || 'A scientific-media platform specialized in evaluating medical conferences');
        }

        // Keywords (LocalStorage only)
        const keywords = language === 'ar' 
            ? (pageSeo.keywords_ar || 'مؤتمرات طبية, تقييم, الإمارات') 
            : (pageSeo.keywords_en || 'Medical Conferences, Evaluation, UAE');

        // Apply to Document
        document.title = title;

        const setMetaTag = (name: string, content: string) => {
            let element = document.querySelector(`meta[name="${name}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute('name', name);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        setMetaTag('description', description);
        setMetaTag('keywords', keywords);

    }, [page, dynamicTitle, dynamicDescription, language]);

    return null;
};

export default SEO;
