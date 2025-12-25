
import React, { useEffect, useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  height?: string;
}

declare const Quill: any;

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, className = "", height = "120px" }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<any>(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (editorRef.current && !quillInstance.current) {
      quillInstance.current = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: placeholder || 'Start writing...',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'header': [2, 3, false] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'clean'],
          ],
        },
      });

      // Handle changes
      quillInstance.current.on('text-change', () => {
        if (!isInternalChange.current) {
            const html = quillInstance.current.root.innerHTML;
            // Prevent recursive updates if Quill adds standard empty paragraph
            if (html === '<p><br></p>') {
                onChange('');
            } else {
                onChange(html);
            }
        }
      });
    }
  }, []);

  // Sync external value to Quill
  useEffect(() => {
    if (quillInstance.current) {
        const currentContent = quillInstance.current.root.innerHTML;
        // Only update if the value is different from current internal state
        // and we handle the common empty paragraph edge case
        const normalizedValue = value || '';
        const normalizedCurrent = currentContent === '<p><br></p>' ? '' : currentContent;

        if (normalizedValue !== normalizedCurrent) {
            isInternalChange.current = true;
            const selection = quillInstance.current.getSelection();
            quillInstance.current.root.innerHTML = normalizedValue;
            if (selection) {
                quillInstance.current.setSelection(selection.index, selection.length);
            }
            isInternalChange.current = false;
        }
    }
  }, [value]);

  return (
    <div className={`border rounded-xl overflow-hidden bg-white ${className}`}>
      <div ref={editorRef} style={{ height, overflowY: 'auto' }} />
    </div>
  );
};

export default RichTextEditor;
