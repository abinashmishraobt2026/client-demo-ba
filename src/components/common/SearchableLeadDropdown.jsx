import React, { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

/**
 * Searchable dropdown for selecting a lead (e.g. in Create Package).
 * Data comes from API (leadsAPI) – stays in sync with backend.
 * @param {Object} props
 * @param {Array<{id: number, customerName: string, visitingLocation?: string, numberOfPeople?: number}>} props.leads
 * @param {string} props.value - selected lead id (number as string) or ''
 * @param {function(string)} props.onChange - (idOrEmpty) => void
 * @param {string} props.placeholder - e.g. 'Choose a confirmed lead'
 * @param {string} [props.className]
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.hasError] - for validation styling
 */
const SearchableLeadDropdown = ({
  leads = [],
  value,
  onChange,
  placeholder = 'Choose a confirmed lead',
  className = '',
  disabled = false,
  hasError = false
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  const searchLower = (search || '').trim().toLowerCase();
  const filtered = searchLower
    ? leads.filter(
        (l) =>
          (l.customerName && l.customerName.toLowerCase().includes(searchLower)) ||
          (l.visitingLocation && l.visitingLocation.toLowerCase().includes(searchLower)) ||
          (l.numberOfPeople != null && String(l.numberOfPeople).includes(searchLower))
      )
    : leads;

  const selectedLead = value ? leads.find((l) => String(l.id) === String(value)) : null;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const leadLabel = (l) =>
    `${l.customerName || 'Unknown'} - ${l.visitingLocation || 'Location TBD'} (${l.numberOfPeople ?? 0} people)`;
  const displayText = selectedLead ? leadLabel(selectedLead) : placeholder;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left border rounded-md shadow-sm bg-white focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
          hasError ? 'border-red-300' : 'border-gray-300'
        }`}
      >
        <span className="truncate">{displayText}</span>
        <ChevronDownIcon className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-[100] mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-72 flex flex-col">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="searchable-lead-search"
                name="leadSearch"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Search by customer name or destination..."
                className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 min-h-0">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">No lead found</div>
            ) : (
              filtered.map((lead) => (
                <button
                  type="button"
                  key={lead.id}
                  onClick={() => {
                    onChange(String(lead.id));
                    setOpen(false);
                    setSearch('');
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${String(lead.id) === String(value) ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'}`}
                >
                  {leadLabel(lead)}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableLeadDropdown;
