import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { autocomplete } from '@/services/api';
import { cn } from '@/lib/utils';

interface Props {
  model: 'prasanga' | 'kavi' | 'publisher' | 'contributor';
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

const AutocompleteInput: React.FC<Props> = ({ model, value, onValueChange, label, placeholder, className }) => {
  const [suggestions, setSuggestions] = useState<{ id: number; name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const debouncedValue = useDebounce(value, 280);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debouncedValue.length >= 1) {
      autocomplete(model, debouncedValue).then((res) => {
        setSuggestions(res.data);
        setOpen(res.data.length > 0);
        setActiveIdx(-1);
      }).catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
      setOpen(false);
    }
  }, [debouncedValue, model]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (name: string) => {
    onValueChange(name);
    setOpen(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); select(suggestions[activeIdx].name); }
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      )}
      <Input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onValueChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden">
          <ul className="max-h-52 overflow-y-auto py-1">
            {suggestions.map((s, idx) => (
              <li
                key={s.id}
                onMouseDown={() => select(s.name)}
                className={cn(
                  'px-3 py-2 text-sm cursor-pointer kn transition-colors',
                  idx === activeIdx ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                )}
              >
                {s.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
