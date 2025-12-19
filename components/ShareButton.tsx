import React, { useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';

const ShareIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
    </svg>
);

const CopyIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon: React.FC = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);


const ShareButton: React.FC<{ title: string; text: string; className?: string }> = ({ title, text, className }) => {
    const { t } = useLocalization();
    const [copied, setCopied] = useState(false);
    const [canShare, setCanShare] = useState(false);

    useEffect(() => {
        if (navigator.share) {
            setCanShare(true);
        }
    }, []);

    const handleShare = async () => {
        const shareData = {
            title: title,
            text: text,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            // Fallback for browsers that do not support the Web Share API
            navigator.clipboard.writeText(window.location.href).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        }
    };

    return (
        <button
            onClick={handleShare}
            className={`flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-med-sky transition-colors ${className}`}
        >
            {canShare ? (
                <>
                    <ShareIcon />
                    {t({ ar: 'مشاركة', en: 'Share' })}
                </>
            ) : (
                copied ? (
                    <>
                        <CheckIcon />
                        {t({ ar: 'تم النسخ!', en: 'Copied!' })}
                    </>
                ) : (
                    <>
                        <CopyIcon />
                        {t({ ar: 'نسخ الرابط', en: 'Copy Link' })}
                    </>
                )
            )}
        </button>
    );
};

export default ShareButton;