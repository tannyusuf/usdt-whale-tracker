'use client';

import { useState, useEffect } from 'react';

export default function AlertToggleCard() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('alerts-enabled');
    if (stored !== null) {
      setEnabled(stored === 'true');
    }
  }, []);

  const toggle = async () => {
    if (!enabled) {
      // Turning on - check permission
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;
      }
    }
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem('alerts-enabled', String(next));
  };

  return (
    <div
      onClick={toggle}
      className={`p-8 rounded-2xl flex flex-col justify-between cursor-pointer transition-all duration-300 ${
        enabled
          ? 'bg-primary-container text-on-primary-container'
          : 'bg-surface-container-high text-on-surface-variant'
      }`}
    >
      <div>
        <span
          className="material-symbols-outlined text-4xl mb-4"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {enabled ? 'notifications_active' : 'notifications_off'}
        </span>
        <h4 className="text-2xl font-black leading-tight">
          {enabled ? 'Instant Alerts Enabled' : 'Instant Alerts Disabled'}
        </h4>
      </div>
      <p className={`text-sm font-medium mt-4 ${enabled ? 'opacity-80' : 'opacity-50'}`}>
        {enabled
          ? 'You will receive push notifications for whale transfers.'
          : 'Tap to enable real-time whale transfer alerts.'}
      </p>
    </div>
  );
}
