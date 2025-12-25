
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { useLocalization } from '../hooks/useLocalization';
import type { LocalizedString } from '../types';

interface Message {
    role: 'user' | 'model';
    text: string;
}

const ChatIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const CloseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SendIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
);

const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1 p-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
    </div>
);


const AIChatWidget: React.FC = () => {
    const { t, language, dir } = useLocalization();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chat, setChat] = useState<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const WIDGET_CONTENT: { [key: string]: LocalizedString } = {
        headerTitle: { ar: 'مساعد MedPulse الذكي', en: 'MedPulse AI Assistant' },
        welcomeMessage: { ar: 'أهلاً بك! أنا نبض، مساعدك الذكي. كيف يمكنني خدمتك اليوم؟', en: 'Welcome! I am Nabd, your smart assistant. How can I help you today?' },
        inputPlaceholder: { ar: 'اكتب رسالتك هنا...', en: 'Type your message here...' }
    };
    
    useEffect(() => {
        if (isOpen && !chat) {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const newChat = ai.chats.create({
                model: 'gemini-3-flash-preview',
                config: {
                    systemInstruction: `You are 'Nabd' (meaning 'Pulse' in Arabic), a friendly and professional medical media evaluation assistant for MedPulse.
                    MedPulse is a platform specialized in evaluating medical conferences in the UAE and Middle East.
                    Our mission is to provide unbiased, scientific reviews of scientific content, organization, speakers, and social impact of medical events.
                    The founder is Dr. Khaled Al-Atawi, a Consultant Neonatologist.
                    Answer questions about our evaluations, team of experts, articles, and services.
                    Always be helpful, concise, and professional. 
                    If a user asks about medical advice, politely remind them that we evaluate media/conferences and they should consult a doctor for clinical advice.
                    Respond in the same language as the user (Arabic or English).`,
                },
            });
            setChat(newChat);
            setMessages([{ role: 'model', text: t(WIDGET_CONTENT.welcomeMessage) }]);
        }
    }, [isOpen, chat, language, t]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || !chat || isLoading) return;

        const userMessage: Message = { role: 'user', text: inputValue };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await chat.sendMessage({ message: userMessage.text });
            if (response.text) {
                const modelMessage: Message = { role: 'model', text: response.text };
                setMessages(prev => [...prev, modelMessage]);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: Message = { role: 'model', text: language === 'ar' ? 'عذراً، حدث خطأ ما. يرجى المحاولة لاحقاً.' : 'Sorry, I encountered an error. Please try again later.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-8 ${dir === 'rtl' ? 'left-8' : 'right-8'} z-50 w-16 h-16 bg-med-tech-blue text-white rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-med-tech-blue`}
                aria-label={t({ ar: 'فتح نافذة الدردشة', en: 'Open chat window' })}
            >
                {isOpen ? <CloseIcon /> : <ChatIcon />}
            </button>

            {isOpen && (
                <div dir={dir} className={`fixed bottom-28 ${dir === 'rtl' ? 'left-8' : 'right-8'} z-50 w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up`}>
                    {/* Header */}
                    <header className="bg-med-tech-blue text-white p-4 flex justify-between items-center flex-shrink-0">
                        <h3 className="font-bold text-lg">{t(WIDGET_CONTENT.headerTitle)}</h3>
                        <button onClick={() => setIsOpen(false)} aria-label={t({ ar: 'إغلاق', en: 'Close' })}>
                            <CloseIcon />
                        </button>
                    </header>

                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                        <div className="space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm break-words ${
                                        msg.role === 'user'
                                            ? 'bg-med-tech-blue text-white rounded-br-none'
                                            : 'bg-gray-200 text-clinical-charcoal rounded-bl-none'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                     <div className="bg-gray-200 rounded-2xl rounded-bl-none">
                                        <TypingIndicator />
                                     </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input */}
                    <footer className="p-4 border-t border-gray-200 bg-white">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={t(WIDGET_CONTENT.inputPlaceholder)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-med-tech-blue"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                className="w-10 h-10 bg-med-vital-green text-white rounded-full flex items-center justify-center flex-shrink-0 disabled:bg-gray-400 transition-colors hover:bg-green-700"
                                disabled={isLoading || !inputValue.trim()}
                                aria-label={t({ar: 'إرسال', en: 'Send'})}
                            >
                                <SendIcon />
                            </button>
                        </form>
                    </footer>
                </div>
            )}
             <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </>
    );
};

export default AIChatWidget;
