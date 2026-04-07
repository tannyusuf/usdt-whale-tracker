'use client';

import { WhaleTransfer } from '@/hooks/useWhaleTransfers';

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatAmount(amount: number) {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
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

interface TransferCardProps {
  transfer: WhaleTransfer;
  index: number;
}

export default function TransferCard({ transfer, index }: TransferCardProps) {
  const isWhaleAlert = transfer.amount >= 1_000_000;
  const bgClass = index % 2 === 0 ? 'bg-surface-container-low' : 'bg-surface-container-lowest';

  return (
    <div
      className={`group flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl ${bgClass} hover:bg-surface-container-high transition-all duration-300 gap-4 animate-slide-in`}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-primary tracking-tighter">
            {formatAmount(transfer.amount)} USDT
          </span>
          {isWhaleAlert && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-error/20 text-error uppercase">
              Whale Alert
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-on-surface-variant">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
            <a
              href={`https://etherscan.io/address/${transfer.from}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              {shortenAddress(transfer.from)}
            </a>
          </span>
          <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
          <a
            href={`https://etherscan.io/address/${transfer.to}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            {shortenAddress(transfer.to)}
          </a>
        </div>
      </div>
      <div className="flex items-center md:items-end flex-row md:flex-col justify-between md:justify-center gap-2">
        <a
          className="text-xs font-mono text-secondary hover:text-primary transition-colors flex items-center gap-1"
          href={`https://etherscan.io/tx/${transfer.transactionHash}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {shortenAddress(transfer.transactionHash)}
          <span className="material-symbols-outlined text-[12px]">open_in_new</span>
        </a>
        <span className="text-xs text-on-surface-variant/60">{timeAgo(transfer.timestamp)}</span>
      </div>
    </div>
  );
}
