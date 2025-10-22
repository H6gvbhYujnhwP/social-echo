'use client';

import { useEffect, useState } from 'react';

interface TrialCountdownProps {
  trialEnd: Date | string;
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

export function TrialCountdown({ trialEnd, className = '' }: TrialCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const endDate = typeof trialEnd === 'string' ? new Date(trialEnd) : trialEnd;
      const now = new Date();
      const difference = endDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          expired: true,
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        expired: false,
      });
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [trialEnd]);

  if (timeRemaining.expired) {
    return (
      <span className={`text-red-200 font-semibold ${className}`}>
        Trial Expired
      </span>
    );
  }

  // Format time parts with leading zeros
  const formatTime = (value: number) => value.toString().padStart(2, '0');

  // Show different formats based on time remaining
  if (timeRemaining.days > 0) {
    // More than 1 day: show "Xd Xh"
    return (
      <span className={`font-mono font-semibold ${className}`}>
        {timeRemaining.days}d {formatTime(timeRemaining.hours)}h
      </span>
    );
  } else if (timeRemaining.hours > 0) {
    // Less than 1 day: show "Xh Xm"
    return (
      <span className={`font-mono font-semibold ${className}`}>
        {formatTime(timeRemaining.hours)}h {formatTime(timeRemaining.minutes)}m
      </span>
    );
  } else {
    // Less than 1 hour: show "Xm Xs" with urgency styling
    return (
      <span className={`font-mono font-semibold ${className} ${timeRemaining.minutes < 10 ? 'text-red-200' : ''}`}>
        {formatTime(timeRemaining.minutes)}m {formatTime(timeRemaining.seconds)}s
      </span>
    );
  }
}

