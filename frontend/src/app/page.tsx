'use client';

import { useState, useMemo } from 'react';
import { useWhaleTransfers } from '@/hooks/useWhaleTransfers';
import { useVolumeStats } from '@/hooks/useVolumeStats';
import Header from '@/components/Header';
import StatsSection from '@/components/StatsSection';
import SearchFilter from '@/components/SearchFilter';
import TransferCard from '@/components/TransferCard';
import TransferSkeleton from '@/components/TransferSkeleton';
import VolumeCard from '@/components/VolumeCard';
import AlertToggleCard from '@/components/AlertToggleCard';

const AMOUNT_FILTERS: Record<string, number> = {
  all: 0,
  '1m': 1_000_000,
  '5m': 5_000_000,
  '10m': 10_000_000,
};

const PAGE_SIZES = [3, 5, 10, 20, 40, 50, 100];

export default function Home() {
  const [pageSize, setPageSize] = useState(3);
  const { transfers, loading, error } = useWhaleTransfers(pageSize);
  const { slots6h, slots24h, loading: volumeLoading } = useVolumeStats();
  const [searchQuery, setSearchQuery] = useState('');
  const [amountFilter, setAmountFilter] = useState('all');

  const filteredTransfers = useMemo(() => {
    let result = transfers;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.from.toLowerCase().includes(q) ||
          t.to.toLowerCase().includes(q) ||
          t.transactionHash.toLowerCase().includes(q),
      );
    }

    const minAmount = AMOUNT_FILTERS[amountFilter] || 0;
    if (minAmount > 0) {
      result = result.filter((t) => t.amount >= minAmount);
    }

    return result;
  }, [transfers, searchQuery, amountFilter]);

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Header transfers={transfers} />

      <div className="min-h-[calc(100vh-68px)]">
        <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-8">
          <StatsSection transfers={transfers} loading={loading} />

          <SearchFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            amountFilter={amountFilter}
            onAmountFilterChange={setAmountFilter}
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between px-4 mb-4">
              <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">
                Recent Transactions
              </h3>
              <span className="text-xs text-on-surface-variant">
                {filteredTransfers.length} transfers
              </span>
            </div>

            {loading && <TransferSkeleton />}

            {error && (
              <div className="text-center text-error py-12">Error: {error}</div>
            )}

            {!loading && filteredTransfers.length === 0 && (
              <div className="text-center text-on-surface-variant py-12">
                <span className="material-symbols-outlined text-4xl mb-4 block">waves</span>
                <p className="text-lg">No whale transfers yet</p>
                <p className="text-sm mt-2">
                  Waiting for transfers &ge; 100,000 USDT...
                </p>
              </div>
            )}

            {filteredTransfers.map((tx, index) => (
              <TransferCard key={tx.id} transfer={tx} index={index} />
            ))}

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 pt-4 md:pt-6">
              <span className="text-xs text-on-surface-variant">Show</span>
              <div className="flex flex-wrap items-center gap-1 bg-surface-container-lowest rounded-lg ring-1 ring-outline-variant/10 p-1">
                {PAGE_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setPageSize(size)}
                    className={`px-2.5 md:px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                      pageSize === size
                        ? 'bg-primary text-on-primary'
                        : 'text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <span className="text-xs text-on-surface-variant">transfers</span>
            </div>
          </div>

          {/* Bento Insights Grid */}
          <section className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <VolumeCard slots6h={slots6h} slots24h={slots24h} loading={volumeLoading} />
            <AlertToggleCard />
          </section>
        </main>
      </div>

    </div>
  );
}
