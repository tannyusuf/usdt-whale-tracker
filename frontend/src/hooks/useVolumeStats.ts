'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface VolumeSlot {
  label: string;
  volume: number;
  count: number;
}

export function useVolumeStats() {
  const [slots24h, setSlots24h] = useState<VolumeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const q = query(
      collection(db, 'whale-transfers'),
      where('timestamp', '>=', Timestamp.fromDate(twentyFourHoursAgo)),
      orderBy('timestamp', 'desc'),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const transfers = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            amount: d.amount as number,
            timestamp: d.timestamp?.toDate() as Date,
          };
        });

        // 12 slots of 2 hours each (24h total)
        const now = Date.now();
        const slots: VolumeSlot[] = [];

        for (let i = 11; i >= 0; i--) {
          const slotStart = now - (i + 1) * 2 * 60 * 60 * 1000;
          const slotEnd = now - i * 2 * 60 * 60 * 1000;

          const startDate = new Date(slotStart);
          const endDate = new Date(slotEnd);

          const slotTransfers = transfers.filter(
            (t) => t.timestamp >= startDate && t.timestamp < endDate,
          );

          const label = `${startDate.getHours().toString().padStart(2, '0')}:00 - ${endDate.getHours().toString().padStart(2, '0')}:00`;

          slots.push({
            label,
            volume: slotTransfers.reduce((sum, t) => sum + t.amount, 0),
            count: slotTransfers.length,
          });
        }

        setSlots24h(slots);
        setLoading(false);
      },
      (err) => {
        console.error('Volume stats error:', err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  // Last 3 slots = last 6 hours
  const slots6h = slots24h.slice(-3);

  return { slots24h, slots6h, loading };
}
