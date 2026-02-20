import { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

interface CodeSearchInputProps {
  codes: string[];
  value: string;
  onChange: (code: string) => void;
  className?: string;
}

export default function CodeSearchInput({ codes, value, onChange, className = '' }: CodeSearchInputProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep query in sync when external value changes (e.g. reset filters)
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        // If user left field without selecting, revert display to current value
        setQuery(value);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [value]);

  const filtered = query.trim()
    ? codes.filter(c => c.toLowerCase().includes(query.toLowerCase()))
    : codes;

  const select = (code: string) => {
    onChange(code);
    setQuery(code);
    setOpen(false);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input */}
      <div className="relative flex items-center">
        <Search className="absolute start-3 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Search code…"
          onFocus={() => setOpen(true)}
          onChange={e => {
            setQuery(e.target.value);
            setOpen(true);
            // If user clears the field, also clear the filter
            if (!e.target.value) onChange('');
          }}
          className="w-full bg-surface border border-border rounded-xl ps-9 pe-8 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
        {query ? (
          <button onClick={clear} className="absolute end-2.5 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <ChevronDown className={`absolute end-2.5 h-3.5 w-3.5 text-muted-foreground transition-transform pointer-events-none ${open ? 'rotate-180' : ''}`} />
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-[200] top-full mt-1 inset-x-0 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
          {/* "All Codes" option */}
          <button
            onMouseDown={e => { e.preventDefault(); select(''); }}
            className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors ${
              value === '' ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:bg-surface'
            }`}
          >
            All Codes
          </button>

          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-xs text-muted-foreground text-center">No codes found</p>
            ) : (
              filtered.map(code => (
                <button
                  key={code}
                  onMouseDown={e => { e.preventDefault(); select(code); }}
                  className={`w-full text-left px-3 py-2 text-sm font-mono transition-colors ${
                    value === code
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-foreground hover:bg-surface'
                  }`}
                >
                  {code}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
