'use client';

import { useState, useMemo } from 'react';
import { useWhaleTransfers } from '@/hooks/useWhaleTransfers';
import Header from '@/components/Header';
import StatsSection from '@/components/StatsSection';
import SearchFilter from '@/components/SearchFilter';
import TransferCard from '@/components/TransferCard';
import TransferSkeleton from '@/components/TransferSkeleton';
import MobileNav from '@/components/MobileNav';

const AMOUNT_FILTERS: Record<string, number> = {
  all: 0,
  '1m': 1_000_000,
  '5m': 5_000_000,
  '10m': 10_000_000,
};

export default function Home() {
  const { transfers, loading, error } = useWhaleTransfers();
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
        <main className="p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-8">
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
          </div>

          {/* Bento Insights Grid */}
          <section className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-8 rounded-2xl bg-surface-container-low overflow-hidden relative group min-h-[300px]">
              <div className="relative z-10">
                <h4 className="text-xl font-bold mb-4">Volume Concentration</h4>
                <p className="text-on-surface-variant text-sm max-w-sm mb-6">
                  Distribution of whale transfer volumes across recent transactions.
                </p>
                <div className="flex items-end gap-2 h-32">
                  {[40, 70, 90, 50].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-primary-container rounded-t-lg transition-all duration-700"
                      style={{
                        height: `${h}%`,
                        opacity: 0.2 + i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-50" />
            </div>
            <div className="p-8 rounded-2xl bg-primary-container text-on-primary-container flex flex-col justify-between">
              <div>
                <span
                  className="material-symbols-outlined text-4xl mb-4"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  bolt
                </span>
                <h4 className="text-2xl font-black leading-tight">
                  Instant Alerts Enabled
                </h4>
              </div>
              <p className="text-sm font-medium opacity-80">
                Connected to Ethereum mainnet via Alchemy WebSocket for real-time transaction visibility.
              </p>
            </div>
          </section>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
