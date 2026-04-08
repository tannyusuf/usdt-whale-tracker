'use client';

import { useState, useRef, useEffect } from 'react';
import { VolumeSlot } from '@/hooks/useVolumeStats';

function formatVolume(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return amount.toFixed(0);
}

interface VolumeCardProps {
  slots6h: VolumeSlot[];
  slots24h: VolumeSlot[];
  loading: boolean;
}

function BarChart({ slots, heightPx }: { slots: VolumeSlot[]; heightPx: number }) {
  const totalVolume = slots.reduce((sum, s) => sum + s.volume, 0);
  // Ceiling: max bar = 80% of height when one slot has all the volume
  const ceiling = Math.max(totalVolume, 1);

  return (
    <div className="flex flex-col w-full">
      {/* Bars - all aligned to same baseline */}
      <div className="flex items-end gap-2" style={{ height: `${heightPx}px` }}>
        {slots.map((slot, i) => {
          const ratio = slot.volume / ceiling;
          const barHeight = Math.max(ratio * heightPx * 0.8, 4);
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end">
              <span className="text-[9px] text-on-surface-variant/60 mb-1">
                {slot.volume > 0 ? formatVolume(slot.volume) : ''}
              </span>
              <div
                className="w-full bg-primary-container rounded-t-lg transition-all duration-700"
                style={{
                  height: `${barHeight}px`,
                  opacity: 0.3 + ratio * 0.7,
                }}
              />
            </div>
          );
        })}
      </div>
      {/* Time labels */}
      <div className="flex gap-2 mt-1">
        {slots.map((slot, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-[8px] text-on-surface-variant/40">
              {slot.label.split(' - ')[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VolumeCard({ slots6h, slots24h, loading }: VolumeCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const total6h = slots6h.reduce((sum, s) => sum + s.volume, 0);
  const count6h = slots6h.reduce((sum, s) => sum + s.count, 0);

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

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="lg:col-span-2 p-4 md:p-8 rounded-2xl bg-surface-container-low overflow-hidden relative group min-h-[200px] md:min-h-[300px] cursor-pointer"
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg md:text-xl font-bold">Volume Concentration</h4>
            <span className="text-xs text-on-surface-variant/60 flex items-center gap-1">
              Click for 24h view
              <span className="material-symbols-outlined text-sm">open_in_full</span>
            </span>
          </div>
          <p className="text-on-surface-variant text-xs md:text-sm max-w-sm mb-1 md:mb-2">
            Whale transfer volume distribution in the last 6 hours.
          </p>
          <p className="text-[10px] md:text-xs text-on-surface-variant/60 mb-4 md:mb-6">
            {count6h} transfers | {formatVolume(total6h)} USDT total
          </p>

          {loading ? (
            <div className="flex items-end gap-2" style={{ height: '120px' }}>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-surface-container-high rounded-t-lg animate-skeleton"
                  style={{ height: `${30 + i * 20}px` }}
                />
              ))}
            </div>
          ) : (
            <div>
              <div className="hidden md:block">
                <BarChart slots={slots6h} heightPx={160} />
              </div>
              <div className="md:hidden">
                <BarChart slots={slots6h} heightPx={100} />
              </div>
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-50" />
      </div>

      {/* 24h Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div
            ref={popupRef}
            className="bg-surface-container-high border border-outline-variant/20 rounded-2xl shadow-2xl w-[95vw] max-w-3xl p-4 md:p-8 animate-slide-in"
          >
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div>
                <h4 className="text-base md:text-xl font-bold">Volume Concentration - Last 24 Hours</h4>
                <p className="text-sm text-on-surface-variant mt-1">
                  Each bar represents a 2-hour window.{' '}
                  {slots24h.reduce((s, sl) => s + sl.count, 0)} transfers |{' '}
                  {formatVolume(slots24h.reduce((s, sl) => s + sl.volume, 0))} USDT total
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-surface-bright transition-colors text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="hidden md:block">
              <BarChart slots={slots24h} heightPx={280} />
            </div>
            <div className="md:hidden">
              <BarChart slots={slots24h} heightPx={180} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
