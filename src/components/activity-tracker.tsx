'use client';

import { useEffect } from 'react';

export default function ActivityTracker() {
  useEffect(() => {
    const pingActivity = async () => {
      try {
        await fetch('/api/user/ping', { method: 'POST' });
      } catch (error) {
        // Silently fail, it's just a background ping
      }
    };

    // Ping immediately on mount
    pingActivity();

    // Ping every 3 minutes (180,000 ms)
    const intervalId = setInterval(pingActivity, 3 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return null; // This component doesn't render anything
}
