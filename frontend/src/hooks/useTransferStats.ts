'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface TransferStats {
  totalTransfers: number;
  totalVolume: number;
  largestTransfer: number;
  last24h: number;
}

export function useTransferStats() {
  const [stats, setStats] = useState<TransferStats>({
    totalTransfers: 0,
    totalVolume: 0,
    largestTransfer: 0,
    last24h: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'whale-transfers'),
      orderBy('timestamp', 'desc'),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const now = Date.now();
        let totalVolume = 0;
        let largestTransfer = 0;
        let last24h = 0;

        snapshot.docs.forEach((doc) => {
          const d = doc.data();
          const amount = d.amount as number;
          totalVolume += amount;
          if (amount > largestTransfer) largestTransfer = amount;

          const timestamp = d.timestamp?.toDate();
          if (timestamp && now - timestamp.getTime() < 24 * 60 * 60 * 1000) {
            last24h++;
          }
        });

        setStats({
          totalTransfers: snapshot.docs.length,
          totalVolume,
          largestTransfer,
          last24h,
        });
        setLoading(false);
      },
      (err) => {
        console.error('Transfer stats error:', err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return { ...stats, loading };
}
