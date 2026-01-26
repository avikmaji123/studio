
'use client';

import { useState, useEffect } from 'react';
import { differenceInSeconds } from 'date-fns';

type CountdownTimerProps = {
  endDate: Date;
  onEnd?: () => void;
};

export function CountdownTimer({ endDate, onEnd }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const totalSeconds = differenceInSeconds(endDate, now);

      if (totalSeconds <= 0) {
        clearInterval(interval);
        setRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        onEnd?.();
        return;
      }

      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setRemaining({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate, onEnd]);

  if (differenceInSeconds(endDate, new Date()) <= 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5 text-xs font-mono rounded-full bg-destructive/10 text-destructive px-2 py-1">
      <span>Offer ends in:</span>
      {remaining.days > 0 && <div className="flex flex-col items-center"><span className="font-bold">{String(remaining.days).padStart(2, '0')}</span></div>}
      {remaining.days > 0 && <span>:</span>}
      <div className="flex flex-col items-center"><span className="font-bold">{String(remaining.hours).padStart(2, '0')}</span></div>
      <span>:</span>
      <div className="flex flex-col items-center"><span className="font-bold">{String(remaining.minutes).padStart(2, '0')}</span></div>
      <span>:</span>
      <div className="flex flex-col items-center"><span className="font-bold">{String(remaining.seconds).padStart(2, '0')}</span></div>
    </div>
  );
}
