'use client';

import { useWhaleTransfers } from '@/hooks/useWhaleTransfers';

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatAmount(amount: number) {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function timeAgo(date: Date | null) {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Home() {
  const { transfers, loading, error } = useWhaleTransfers();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">USDT Whale Tracker</h1>
          <div className="flex items-center gap-2 text-sm text-green-400">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Live
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading && (
          <div className="text-center text-gray-400 py-12">Loading transfers...</div>
        )}

        {error && (
          <div className="text-center text-red-400 py-12">Error: {error}</div>
        )}

        {!loading && transfers.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg">No whale transfers yet</p>
            <p className="text-sm mt-2">Waiting for transfers &ge; 100,000 USDT...</p>
          </div>
        )}

        <div className="space-y-3">
          {transfers.map((tx) => (
            <div
              key={tx.id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-green-400">
                  {formatAmount(tx.amount)} USDT
                </span>
                <span className="text-xs text-gray-500">
                  {timeAgo(tx.timestamp)}
                </span>
              </div>

              <div className="text-sm text-gray-400 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 w-12">From</span>
                  <a
                    href={`https://etherscan.io/address/${tx.from}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline font-mono"
                  >
                    {shortenAddress(tx.from)}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 w-12">To</span>
                  <a
                    href={`https://etherscan.io/address/${tx.to}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline font-mono"
                  >
                    {shortenAddress(tx.to)}
                  </a>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-gray-800">
                <a
                  href={`https://etherscan.io/tx/${tx.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 hover:text-blue-400 font-mono"
                >
                  {shortenAddress(tx.transactionHash)}
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
