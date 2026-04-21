'use client';

// Utility functions for IST timezone handling
export const toISTDate = (date: Date): Date => {
  const utcDate = new Date(date.toISOString());
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  return new Date(utcDate.getTime() + istOffset);
};

export const getISTDateString = (date: Date): string => {
  const istDate = toISTDate(date);
  const year = istDate.getUTCFullYear();
  const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(istDate.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseISTDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  const istDate = new Date(Date.UTC(year, month - 1, day));
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(istDate.getTime() - istOffset);
};

export const formatDateIST = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return getISTDateString(date);
};
