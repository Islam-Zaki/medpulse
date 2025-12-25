
import React, { useState, useRef } from 'react';
import EmojiPicker from './EmojiPicker';

interface IconEditorProps {
    val: string;
    onChange: (v: string) => void;
    label?: string;
    size?: 'sm' | 'md' | 'lg';
}

const IconEditor: React.FC<IconEditorProps> = ({ val, onChange, label, size = 'md' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const sizeClasses = {
        sm: 'w-8 h-8 text-lg',
        md: 'w-12 h-12 text-2xl',
        lg: 'w-20 h-20 text-4xl'
    };

    return (
        <div className="relative inline-flex items-center gap-2">
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-center ${sizeClasses[size]} bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-med-tech-blue hover:text-med-tech-blue transition-all shadow-sm active:scale-95`}
                title={label || "Select Icon"}
            >
                {val || '✨'}
            </button>
            {isOpen && (
                <EmojiPicker 
                    triggerRef={triggerRef}
                    onSelect={onChange}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

export default IconEditor;
