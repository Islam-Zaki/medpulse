import React from 'react';

interface SectionTitleProps {
  children: React.ReactNode;
  subtitle?: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ children, subtitle }) => {
  return (
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-clinical-charcoal font-arabic tracking-wide">{children}</h2>
      {subtitle && <p className="mt-2 text-lg text-gray-600">{subtitle}</p>}
    </div>
  );
};

export default SectionTitle;