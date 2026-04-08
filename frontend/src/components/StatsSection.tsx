'use client';

import { TransferStats } from '@/hooks/useTransferStats';

interface StatsSectionProps {
  stats: TransferStats;
  loading: boolean;
}

function formatVolume(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
  return amount.toFixed(0);
}

export default function StatsSection({ stats, loading }: StatsSectionProps) {
  const { totalTransfers, totalVolume, largestTransfer, last24h } = stats;

  const cards = [
    { label: 'Total Transfers', value: totalTransfers.toLocaleString(), suffix: '' },
    { label: 'Total Volume', value: formatVolume(totalVolume), suffix: 'USDT' },
    { label: 'Largest Transfer', value: formatVolume(largestTransfer), suffix: 'USDT', highlight: true },
    { label: 'Last 24h', value: last24h.toLocaleString(), suffix: '' },
  ];

  return (
    <section className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-10">
      {cards.map((stat) => (
        <div
          key={stat.label}
          className={`p-4 md:p-6 rounded-xl bg-surface-container-low transition-all hover:bg-surface-container shadow-sm ${
            stat.highlight ? 'border-l-2 border-primary-container/20' : ''
          }`}
        >
          <p className="text-xs font-medium text-on-surface-variant uppercase tracking-widest mb-2">
            {stat.label}
          </p>
          {loading ? (
            <div className="h-9 w-24 bg-surface-container-high rounded animate-skeleton" />
          ) : (
            <div className="flex items-baseline gap-1">
              <h2 className={`text-2xl md:text-3xl font-extrabold tracking-tighter ${stat.highlight ? 'text-primary' : 'text-on-surface'}`}>
                {stat.value}
              </h2>
              {stat.suffix && (
                <span className="text-xs text-on-surface-variant">{stat.suffix}</span>
              )}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
