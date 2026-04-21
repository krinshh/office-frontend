'use client';

import React, { useState, useEffect } from 'react';
import Clock from 'lucide-react/dist/esm/icons/clock';

interface LiveTimeDisplayProps {
  t: any;
}

export const LiveTimeDisplay = React.memo(({ t }: LiveTimeDisplayProps) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 p-3 border border-border rounded-lg">
      <Clock className="w-4 h-4 text-secondary" />
      <span className="text-foreground text-sm">
        {t('userAttendance.labels.currentTime')} {time}
      </span>
    </div>
  );
});

LiveTimeDisplay.displayName = 'LiveTimeDisplay';
