import React, { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

/**
 * Searchable dropdown for selecting an associate by name or uniqueId.
 * Use when admin has to assign/select associate and the list is long.
 * @param {Object} props
 * @param {Array<{id: number, name: string, uniqueId: string}>} props.associates
 * @param {string} props.value - selected associate id (number as string) or ''
 * @param {function(string)} props.onChange - (idOrEmpty) => void
 * @param {string} props.placeholder - e.g. 'Select Associate'
 * @param {string} [props.emptyOptionLabel] - e.g. 'All Associates' or 'Select Associate'; if provided, first option is clear selection
 * @param {string} [props.className]
 * @param {boolean} [props.disabled]
 */
const SearchableAssociateDropdown = ({
  associates = [],
  value,
  onChange,
  placeholder = 'Select Associate',
  emptyOptionLabel,
  className = '',
  disabled = false
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  const searchLower = (search || '').trim().toLowerCase();
  const filtered = searchLower
    ? associates.filter(
        (a) =>
          (a.name && a.name.toLowerCase().includes(searchLower)) ||
          (a.uniqueId && a.uniqueId.toLowerCase().includes(searchLower))
      )
    : associates;

  const selectedAssociate = value ? associates.find((a) => String(a.id) === String(value)) : null;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayText = selectedAssociate
    ? `${selectedAssociate.name} (${selectedAssociate.uniqueId})`
    : placeholder;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left border border-gray-300 rounded-md shadow-sm bg-white focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="truncate">{displayText}</span>
        <ChevronDownIcon className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-72 flex flex-col">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="searchable-associate-search"
                name="associateSearch"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Search by name or Unique ID..."
                className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 min-h-0">
            {emptyOptionLabel && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setOpen(false);
                  setSearch('');
                }}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${!value ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'}`}
              >
                {emptyOptionLabel}
              </button>
            )}
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">No associate found</div>
            ) : (
              filtered.map((associate) => (
                <button
                  type="button"
                  key={associate.id}
                  onClick={() => {
                    onChange(String(associate.id));
                    setOpen(false);
                    setSearch('');
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${String(associate.id) === String(value) ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'}`}
                >
                  {associate.name} ({associate.uniqueId})
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableAssociateDropdown;
