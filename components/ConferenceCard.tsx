
import React from 'react';
import type { Conference, NavigateFunction } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface ConferenceCardProps {
    conference: Conference;
    navigate: NavigateFunction;
    stars?: number; // Add optional stars prop to use API data
}

const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
    <svg className={`w-4 h-4 ${filled ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const ConferenceCard: React.FC<ConferenceCardProps> = ({ conference, navigate, stars }) => {
    const { t } = useLocalization();

    // Use API stars if provided, otherwise calculate from score (legacy behavior)
    const starCount = stars !== undefined ? stars : Math.round(conference.score / 20);

    const renderStars = () => {
        return Array.from({ length: 5 }, (_, i) => <StarIcon key={i} filled={i < starCount} />);
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col border border-gray-100">
            <img src={conference.image} alt={t(conference.title)} className="w-full h-48 object-cover" />
            <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-clinical-charcoal mb-2 font-arabic">{t(conference.title)}</h3>
                <p className="text-gray-600 text-sm mb-1">{t(conference.organizer)}</p>
                <p className="text-gray-500 text-sm mb-4">{t(conference.city)} - {t(conference.date)}</p>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">{renderStars()}</div>
                    <span className="font-bold text-lg text-med-tech-blue">{conference.score}%</span>
                </div>
                <div className="mt-auto">
                    <button
                        onClick={() => navigate('conference-details', { id: conference.id })}
                        className="w-full bg-med-vital-green text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-300 shadow-sm"
                    >
                        {t({ ar: 'عرض التقييم الكامل', en: 'View Full Evaluation' })}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConferenceCard;
