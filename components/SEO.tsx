
import React, { useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import type { SEOConfig } from '../types';

interface SEOProps {
    page: string;
    dynamicTitle?: string;
    dynamicDescription?: string;
}

const SEO: React.FC<SEOProps> = ({ page, dynamicTitle, dynamicDescription }) => {
    const { language, config } = useLocalization();

    useEffect(() => {
        // 1. Try to get SEO from Config (passed down from DB via Provider)
        const pageConfig = config ? (config as any)[page] : null;
        const configSeo: SEOConfig | undefined = pageConfig?.seo;

        // 2. Fallback to LocalStorage (legacy/drafts)
        const storedSeo = localStorage.getItem('seo_settings');
        const seoSettings = storedSeo ? JSON.parse(storedSeo) : {};
        const localSeo = seoSettings[page] || {};

        // Final Priority Selection
        const seoData = configSeo || localSeo;

        // Title Priority: Dynamic Prop > Config/LocalStorage > Default
        let title = '';
        if (dynamicTitle) {
            title = dynamicTitle;
        } else {
            title = language === 'ar' 
                ? (seoData.meta_title_ar || 'MedPulse | نبض الطب') 
                : (seoData.meta_title_en || 'MedPulse | Nabd Al-Tibb');
        }

        // Description Priority: Dynamic Prop > Config/LocalStorage > Default
        let description = '';
        if (dynamicDescription) {
            description = dynamicDescription;
        } else {
            description = language === 'ar' 
                ? (seoData.meta_description_ar || 'منصة علمية-إعلامية متخصصة في تقييم المؤتمرات الطبية') 
                : (seoData.meta_description_en || 'A scientific-media platform specialized in evaluating medical conferences');
        }

        // Keywords
        const keywords = language === 'ar' 
            ? (seoData.keywords_ar || 'مؤتمرات طبية, تقييم, الإمارات') 
            : (seoData.keywords_en || 'Medical Conferences, Evaluation, UAE');

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

    }, [page, dynamicTitle, dynamicDescription, language, config]);

    return null;
};

export default SEO;
