'use client';

import { useEffect, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { getMessagingInstance } from '@/lib/firebase';

interface Notification {
  id: string;
  title: string;
  body: string;
  timestamp: number;
}

export default function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (permission !== 'granted') return;

    let unsubscribe: (() => void) | undefined;

    async function setupMessaging() {
      const messaging = await getMessagingInstance();
      if (!messaging) return;

      try {
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });
        console.log('FCM Token:', token);
      } catch (err) {
        console.error('FCM token error:', err);
      }

      unsubscribe = onMessage(messaging, (payload) => {
        const newNotification: Notification = {
          id: Date.now().toString(),
          title: payload.notification?.title || 'Whale Alert!',
          body: payload.notification?.body || '',
          timestamp: Date.now(),
        };
        setNotification(newNotification);

        setTimeout(() => setNotification(null), 5000);
      });
    }

    setupMessaging();
    return () => unsubscribe?.();
  }, [permission]);

  const requestPermission = async () => {
    const result = await window.Notification.requestPermission();
    setPermission(result);
  };

  return (
    <>
      {children}

      {permission === 'default' && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
          <p className="text-sm mb-2">
            Enable notifications to receive whale alerts in real-time.
          </p>
          <button
            onClick={requestPermission}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded cursor-pointer"
          >
            Enable Notifications
          </button>
        </div>
      )}

      {notification && (
        <div className="fixed top-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm animate-slide-in">
          <p className="font-semibold text-sm">{notification.title}</p>
          <p className="text-gray-300 text-xs mt-1">{notification.body}</p>
        </div>
      )}
    </>
  );
}
