/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Bold, Italic, Underline, Link as LinkIcon, List, ListOrdered, Heading1, Heading2, Eraser } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    // Only update content if different to avoid resetting caret
    if (ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || '';
    }
  }, [value]);

  const exec = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const handleInput = () => {
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const addLink = () => {
    const url = window.prompt('Enter URL');
    if (url) exec('createLink', url);
  };

  const clearFormatting = () => {
    exec('removeFormat');
  };

  return (
    <div className="border rounded-md">
      <div className="flex items-center gap-1 p-2 flex-wrap">
        <Button type="button" variant="ghost" size="sm" onClick={() => exec('bold')} aria-label="Bold"><Bold className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => exec('italic')} aria-label="Italic"><Italic className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => exec('underline')} aria-label="Underline"><Underline className="h-4 w-4" /></Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Button type="button" variant="ghost" size="sm" onClick={() => exec('formatBlock', '<H1>')} aria-label="H1"><Heading1 className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => exec('formatBlock', '<H2>')} aria-label="H2"><Heading2 className="h-4 w-4" /></Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Button type="button" variant="ghost" size="sm" onClick={() => exec('insertUnorderedList')} aria-label="Bulleted list"><List className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => exec('insertOrderedList')} aria-label="Numbered list"><ListOrdered className="h-4 w-4" /></Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Button type="button" variant="ghost" size="sm" onClick={addLink} aria-label="Add link"><LinkIcon className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" onClick={clearFormatting} aria-label="Clear formatting"><Eraser className="h-4 w-4" /></Button>
      </div>
      <Separator />
      <div
        ref={ref}
        className="min-h-[160px] p-3 focus:outline-none prose prose-sm max-w-none"
        contentEditable
        data-placeholder={placeholder || 'Write your campaign description...'}
        onInput={handleInput}
        suppressContentEditableWarning
      />
      <style jsx>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}


