import { VALID_REGEX } from '@/constants/regex';

export function formatPhone(phone: string) {
  if (!phone) return '';

  // Match the country code (1–3 digits) after the plus sign
  const match = phone.match(VALID_REGEX.PHONE_FULL_MATCH);
  if (!match) return phone; // Return phone as is if no match

  const [, countryCode, number] = match;

  // Apply format (3-3-4) for 10-digit numbers
  const formatted = number.replace(VALID_REGEX.PHONE_INTERNAL_FORMAT, '$1-$2-$3');

  return `${countryCode} ${formatted}`;
}

export const formatCurrency = (amount: number) => {
  if (amount === undefined || amount === null) return '-';
  return new Intl.NumberFormat('en-IN', { currency: 'INR' }).format(amount);
};

export const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
};