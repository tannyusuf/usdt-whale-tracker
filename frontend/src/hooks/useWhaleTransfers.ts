'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface WhaleTransfer {
  id: string;
  from: string;
  to: string;
  amount: number;
  rawValue: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: Date | null;
}

export function useWhaleTransfers(count = 50) {
  const [transfers, setTransfers] = useState<WhaleTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'whale-transfers'),
      orderBy('timestamp', 'desc'),
      limit(count),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            from: d.from,
            to: d.to,
            amount: d.amount,
            rawValue: d.rawValue,
            transactionHash: d.transactionHash,
            blockNumber: d.blockNumber,
            timestamp: d.timestamp?.toDate() || null,
          } as WhaleTransfer;
        });
        setTransfers(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Firestore listener error:', err);
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [count]);

  return { transfers, loading, error };
}
