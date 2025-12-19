
import React from 'react';

interface InputGroupProps {
    label: string;
    children?: React.ReactNode;
    className?: string;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, children, className = '' }) => (
    <div className={`mb-4 ${className}`}>
        <label className="block text-sm font-bold text-gray-800 mb-2">{label}</label>
        {children}
    </div>
);

export default InputGroup;
