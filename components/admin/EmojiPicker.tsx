
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLocalization } from '../../hooks/useLocalization';

const EMOJI_LIST = [
  { char: '🩺', tags: 'stethoscope medical doctor health pulse heart' },
  { char: '🏥', tags: 'hospital building medical clinic' },
  { char: '💊', tags: 'pill medicine capsule drug' },
  { char: '🧬', tags: 'dna gene science research biology' },
  { char: '🔬', tags: 'microscope science research lab' },
  { char: '🧠', tags: 'brain mind psychology smart intelligence' },
  { char: '🦷', tags: 'tooth dentist dental' },
  { char: '🦴', tags: 'bone skeleton orthopedic' },
  { char: '👁️', tags: 'eye vision see look' },
  { char: '👂', tags: 'ear hearing listen' },
  { char: '🫀', tags: 'heart organ cardiology' },
  { char: '🫁', tags: 'lungs breathing respiratory' },
  { char: '🌡️', tags: 'thermometer temperature fever cold' },
  { char: '💉', tags: 'syringe vaccine injection needle' },
  { char: '🩹', tags: 'bandage wound injury' },
  { char: '🩻', tags: 'xray bone radiology' },
  { char: '🧪', tags: 'test tube chemistry lab' },
  { char: '📈', tags: 'chart increase growth success progress' },
  { char: '📊', tags: 'chart statistics data analysis' },
  { char: '📉', tags: 'chart decrease loss' },
  { char: '📝', tags: 'memo note writing document paper' },
  { char: '📅', tags: 'calendar date schedule event' },
  { char: '📋', tags: 'clipboard tasks list' },
  { char: '📌', tags: 'pushpin location mark' },
  { char: '📍', tags: 'round pushpin location map marker' },
  { char: '🔍', tags: 'search zoom find' },
  { char: '💡', tags: 'light bulb idea innovation bright' },
  { char: '💎', tags: 'gem stone diamond quality transparency' },
  { char: '🏆', tags: 'trophy winner prize' },
  { char: '🤝', tags: 'handshake deal cooperation partnership' },
  { char: '👤', tags: 'user person profile' },
  { char: '👥', tags: 'users people team group' },
  { char: '💬', tags: 'speech balloon chat message talk' },
  { char: '📧', tags: 'email envelope mail' },
  { char: '🌍', tags: 'earth globe world international' },
  { char: '🎯', tags: 'target bullseye goal aim' },
  { char: '🧩', tags: 'puzzle piece team work solution' },
  { char: '📚', tags: 'books library education knowledge' },
  { char: '🎓', tags: 'graduation cap education academic degree' },
  { char: '✨', tags: 'sparkles special future vision' },
  { char: '🚀', tags: 'rocket launch fast progress start' },
  { char: '⚖️', tags: 'balance scales justice equality neutral' },
  { char: '🏗️', tags: 'construction building development' },
  { char: '🏢', tags: 'office building company' },
  { char: '💻', tags: 'laptop computer tech' },
  { char: '📱', tags: 'mobile phone tech' },
  { char: '🏘️', tags: 'houses community neighborhood' },
  { char: '🛡️', tags: 'shield security protection' },
  { char: '🛠️', tags: 'tools repair development' },
  { char: '⚙️', tags: 'gear settings process' },
  { char: '📡', tags: 'satellite antenna coverage' },
  { char: '📣', tags: 'megaphone announcement media' },
  { char: '🎥', tags: 'movie camera video media' },
  { char: '🖼️', tags: 'picture frame image photo' },
  { char: '🛂', tags: 'passport control travel border' },
  { char: '🧪', tags: 'test tube science' },
  { char: '🔬', tags: 'microscope' },
  { char: '🩺', tags: 'stethoscope' },
  { char: '🩹', tags: 'bandage' },
  { char: '🚑', tags: 'ambulance' },
  { char: '🥼', tags: 'lab coat' },
  { char: '🧴', tags: 'lotion bottle' },
  { char: '🧼', tags: 'soap' },
  { char: '🧽', tags: 'sponge' },
  { char: '🧤', tags: 'gloves' },
  { char: '🧷', tags: 'safety pin' },
  { char: '🧸', tags: 'teddy bear pediatrics' },
  { char: '🍼', tags: 'baby bottle neonatology' },
];

interface EmojiPickerProps {
  onSelect: (char: string) => void;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose, triggerRef }) => {
  const { t } = useLocalization();
  const [search, setSearch] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);

  const filteredEmojis = useMemo(() => {
    const term = search.toLowerCase();
    return term 
      ? EMOJI_LIST.filter(e => e.tags.includes(term))
      : EMOJI_LIST;
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current && 
        !pickerRef.current.contains(event.target as Node) &&
        triggerRef.current && 
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, triggerRef]);

  return (
    <div 
      ref={pickerRef}
      className="absolute top-full mt-2 left-0 z-[110] w-64 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 animate-fade-in"
    >
      <div className="mb-3">
        <input 
          autoFocus
          type="text"
          className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-gray-50"
          placeholder={t({ ar: 'ابحث عن أيقونة...', en: 'Search for icon...' })}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="max-h-48 overflow-y-auto grid grid-cols-6 gap-1 custom-scrollbar">
        {filteredEmojis.map((e, idx) => (
          <button
            key={idx}
            onClick={() => { onSelect(e.char); onClose(); }}
            className="text-2xl p-1.5 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center"
            title={e.tags}
          >
            {e.char}
          </button>
        ))}
        {filteredEmojis.length === 0 && (
          <div className="col-span-6 py-4 text-center text-xs text-gray-400 italic">
            {t({ ar: 'لا توجد نتائج', en: 'No icons found' })}
          </div>
        )}
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f3f4f6; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default EmojiPicker;
