'use client';

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  amountFilter: string;
  onAmountFilterChange: (filter: string) => void;
}

export default function SearchFilter({
  searchQuery,
  onSearchChange,
  amountFilter,
  onAmountFilterChange,
}: SearchFilterProps) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 mb-8 bg-surface-container-lowest p-4 rounded-xl ring-1 ring-outline-variant/10">
      <div className="relative flex-1 w-full">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
          search
        </span>
        <input
          className="w-full bg-transparent border-b border-outline-variant/20 focus:border-primary-container focus:outline-none text-sm py-2 pl-10 text-on-surface placeholder:text-on-surface-variant/40 transition-all"
          placeholder="Search by address..."
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-4 w-full md:w-auto">
        <select
          className="bg-surface-container-high border-none text-xs rounded-lg py-2 px-3 text-on-surface focus:ring-1 focus:ring-primary-container cursor-pointer min-w-[140px]"
          value={amountFilter}
          onChange={(e) => onAmountFilterChange(e.target.value)}
        >
          <option value="all">All Amounts</option>
          <option value="1m">&gt; 1M USDT</option>
          <option value="5m">&gt; 5M USDT</option>
          <option value="10m">&gt; 10M USDT</option>
        </select>
        <div className="flex items-center gap-3 px-4 py-2 bg-surface-container-high rounded-full">
          <div className="radar-pulse w-2 h-2 rounded-full bg-primary ring-4 ring-primary/20" />
          <span className="text-xs font-bold text-primary tracking-wide">LIVE</span>
        </div>
      </div>
    </div>
  );
}
