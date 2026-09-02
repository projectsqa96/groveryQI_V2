import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Product } from '../../types';

interface ProductSearchSelectProps {
  products: Product[];
  value: string; // selected productId, or newProductValue when adding a new one
  newProductValue: string;
  isNewProduct: boolean;
  onChange: (productId: string) => void;
}

// A searchable replacement for the plain <select> product picker. Typing
// filters by product name or brand; the currently selected product (or "Add
// New") always shows first when the list isn't filtered, so scrolling a long
// catalog isn't required for the common case of reusing a recent product.
export const ProductSearchSelect: React.FC<ProductSearchSelectProps> = ({
  products,
  value,
  newProductValue,
  isNewProduct,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = products.find((p) => p.id === value);
  const selectedLabel = isNewProduct
    ? '+ Add New Product / Brand'
    : selected
    ? `${selected.name} (${selected.brand})`
    : '';

  const q = query.trim().toLowerCase();
  const filtered = q
    ? products.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q))
    : products;

  // Rows shown in the dropdown: "+ Add New" is always pinned first.
  const rows: Array<{ id: string; label: string; isAddNew?: boolean }> = [
    { id: newProductValue, label: '+ Add New Product / Brand', isAddNew: true },
    ...filtered.map((p) => ({ id: p.id, label: `${p.name} (${p.brand})` }))
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setHighlightIndex(0);
  }, [query, isOpen]);

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, rows.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const row = rows[highlightIndex];
      if (row) handleSelect(row.id);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        {isOpen ? (
          <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        ) : null}
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? query : selectedLabel}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setQuery('');
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search products..."
          className={`w-full py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 mb-1 font-medium pr-6 ${
            isOpen ? 'pl-6' : 'pl-2'
          }`}
        />
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ marginTop: '-2px' }} />
      </div>

      {isOpen && (
        <div className="absolute z-20 w-full max-h-56 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
          {rows.length === 1 ? (
            <div className="px-2.5 py-2 text-[11px] text-slate-400">No products match &quot;{query}&quot;</div>
          ) : null}
          {rows.map((row, i) => (
            <button
              key={row.id}
              type="button"
              // onMouseDown (not onClick) fires before the input's onBlur/
              // outside-click handler, so the selection registers instead of
              // the dropdown closing first and swallowing the click.
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(row.id);
              }}
              onMouseEnter={() => setHighlightIndex(i)}
              className={`w-full text-left px-2.5 py-1.5 text-xs ${
                row.isAddNew
                  ? 'font-bold text-emerald-600 dark:text-emerald-400 border-b border-slate-100 dark:border-slate-800'
                  : row.id === value
                  ? 'font-semibold text-slate-900 dark:text-slate-100'
                  : 'text-slate-700 dark:text-slate-300'
              } ${i === highlightIndex ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
            >
              {row.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
