
import React from 'react';
import type { Article, NavigateFunction } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface ArticleCardProps {
    article: Article;
    navigate: NavigateFunction;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, navigate }) => {
    const { t } = useLocalization();

    const handleReadMore = () => {
        if (article.id === 4) {
            navigate('consequences');
        } else {
            navigate('article-details', { id: article.id });
        }
    };

    // Helper to strip HTML tags for card preview
    const stripHtml = (html: string) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };

    const introText = stripHtml(t(article.intro));

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col border border-gray-100">
            <img src={article.image} alt={t(article.title)} className="w-full h-48 object-cover" />
            <div className="p-6 flex-grow flex flex-col">
                <p className="text-sm text-med-tech-blue font-semibold mb-2">{t(article.category)}</p>
                <h3 className="text-xl font-bold text-clinical-charcoal mb-3 font-arabic">{t(article.title)}</h3>
                <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">{introText}</p>
                <div className="mt-auto">
                     <button
                        onClick={handleReadMore}
                        className="font-semibold text-med-tech-blue hover:text-blue-800 transition-colors"
                    >
                        {t({ ar: 'اقرأ المزيد', en: 'Read More' })} &rarr;
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ArticleCard;
