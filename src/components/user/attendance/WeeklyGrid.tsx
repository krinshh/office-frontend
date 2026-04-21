'use client';

import React from 'react';

interface WeeklyGridProps {
  myAttendance: any[];
  t: any;
}

export const WeeklyGrid = React.memo(({ myAttendance, t }: WeeklyGridProps) => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sunday
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysToMonday);

  const weekDays = [
    t('userAttendance.weekDays.mon'),
    t('userAttendance.weekDays.tue'),
    t('userAttendance.weekDays.wed'),
    t('userAttendance.weekDays.thu'),
    t('userAttendance.weekDays.fri'),
    t('userAttendance.weekDays.sat'),
    t('userAttendance.weekDays.sun')
  ];

  const formatLocalDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  return (
    <>
      {weekDays.map((day, index) => {
        const currentDate = new Date(monday);
        currentDate.setDate(monday.getDate() + index);
        const dateKey = formatLocalDate(currentDate);

        const dayAttendance = myAttendance.find((att: any) => {
          const attDate = new Date(att.date);
          return formatLocalDate(attDate) === dateKey;
        });

        let dotColor = 'bg-muted-foreground/30';

        if (index < 5) { // Mon-Fri
          if (dayAttendance) {
            if (dayAttendance.status === 'Present' || dayAttendance.status === 'Late') {
              dotColor = 'bg-secondary';
            } else if (dayAttendance.status === 'Half-Day') {
              dotColor = 'bg-primary';
            } else {
              dotColor = 'bg-destructive';
            }
          } else {
            // Check if date is in the past for absent marking
            const todayKey = formatLocalDate(today);
            if (dateKey < todayKey) {
              dotColor = 'bg-destructive';
            }
          }
        }

        return (
          <div key={day} className="p-4 bg-background border border-border rounded-lg text-center hover:bg-muted/50 transition-colors duration-200">
            <div className="text-sm font-semibold text-foreground mb-2">{day}</div>
            <div className={`w-3 h-3 rounded-full mx-auto ${dotColor}`} />
          </div>
        );
      })}
    </>
  );
});

WeeklyGrid.displayName = 'WeeklyGrid';
