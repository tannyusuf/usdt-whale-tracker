'use client';

import { useState, useRef, useEffect } from 'react';
import { WhaleTransfer } from '@/hooks/useWhaleTransfers';
import { useTheme } from '@/components/ThemeProvider';

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

interface HeaderProps {
  transfers: WhaleTransfer[];
}

export default function Header({ transfers }: HeaderProps) {
  const { theme, toggle: toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState(0);
  const popupRef = useRef<HTMLDivElement>(null);

  const recentNotifications = transfers.slice(0, 10);
  const unreadCount = transfers.filter(
    (t) => t.timestamp && t.timestamp.getTime() > lastSeen,
  ).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      setLastSeen(Date.now());
    }
    setIsOpen(!isOpen);
  };

  return (
    <nav className="sticky top-0 z-50 flex justify-between items-center w-full px-6 py-4 bg-surface/95 backdrop-blur-md border-b border-outline-variant/10">
      <div className="text-xl font-bold tracking-tight text-on-surface flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">hub</span>
        USDT Whale Tracker
      </div>
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={popupRef}>
          <button
            onClick={handleToggle}
            className="p-2 rounded-full hover:bg-surface-bright transition-colors text-on-surface-variant relative"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-error text-[10px] font-bold rounded-full flex items-center justify-center text-on-primary">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 top-12 w-80 md:w-96 bg-surface-container-high border border-outline-variant/20 rounded-xl shadow-2xl overflow-hidden animate-slide-in">
              <div className="px-4 py-3 border-b border-outline-variant/10 flex items-center justify-between">
                <h4 className="text-sm font-bold text-on-surface">Notifications</h4>
                <span className="text-xs text-on-surface-variant">
                  {recentNotifications.length} recent
                </span>
              </div>
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {recentNotifications.length === 0 ? (
                  <div className="p-6 text-center text-on-surface-variant text-sm">
                    No notifications yet
                  </div>
                ) : (
                  recentNotifications.map((tx) => (
                    <div
                      key={tx.id}
                      className="px-4 py-3 hover:bg-surface-container transition-colors border-b border-outline-variant/5"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-primary">
                          {formatAmount(tx.amount)} USDT
                        </span>
                        <span className="text-[10px] text-on-surface-variant/60">
                          {timeAgo(tx.timestamp)}
                        </span>
                      </div>
                      <div className="text-xs text-on-surface-variant flex items-center gap-1">
                        {shortenAddress(tx.from)}
                        <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                        {shortenAddress(tx.to)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-surface-bright transition-colors text-on-surface-variant cursor-pointer"
        >
          <span className="material-symbols-outlined">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
      </div>
    </nav>
  );
}
