/**
 * Centralized Regular Expressions for Frontend Validation
 * This file ensures validation parity with the Backend.
 * Any update here must be reflected in backend/constants/regex.js
 */

export const VALID_REGEX = {
  // 2-50 characters, letters, spaces, hyphens, apostrophes, and dots
  NAME: /^[a-zA-Z\s\-'.]{2,50}$/,
  NAME_CLEAN: /[^a-zA-Z\s\-'.]/g,

  // 3-20 characters, letters, numbers, dots, underscores, and hyphens (No special symbols)
  USERNAME: /^[a-zA-Z0-9._-]{3,20}$/,
  USERNAME_CLEAN: /[^a-zA-Z0-9._-]/g,

  // Standard email validation (RFC 5322 compatible variant) + Preventing double dots
  EMAIL: /^(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  EMAIL_CLEAN: /[^a-zA-Z0-9._%+-@]/g,

  // Mobile numbers (optional +, followed by 7-15 digits)
  MOBILE: /^\+?[0-9]{7,15}$/,

  // At least 8 characters, 1 Uppercase, 1 Lowercase, 1 Number, 1 Special character (@$!%*?&.)
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/,

  // 11 characters, uppercase letters and numbers
  IFSC: /^[A-Z0-9]{11}$/,

  // Supported image extensions
  IMAGE_EXT: /\.(jpg|jpeg|png|webp)$/i,

  // Prevention for Formula Injection (CSV/Excel)
  CSV_INJECTION: /^[=+\-@]/,

  // Only alphabets and spaces
  ONLY_ALPHABETS: /^[a-zA-Z\s]+$/,

  // Non-alphanumeric characters (for sanitization)
  NON_ALPHANUMERIC: /[^a-zA-Z0-9]/g,

  // Non-numeric characters
  NON_DIGIT: /[^\d]/g,

  // Indian Phone Number (10 digits)
  TEN_DIGITS: /^\d{10}$/,

  // Only digits and spaces (for sanitization)
  WHITESPACE: /\s+/g,

  // Numbers and dots (for currency/decimal sanitization)
  NUMERIC_DECIMAL: /[^0-9.]/g,

  // Underscore (for permission/slug formatting)
  UNDERSCORE: /_/g,

  // Office Name (Letters, numbers, spaces, dots, hyphens, ampersands)
  OFFICE_NAME: /^[a-zA-Z0-9\s.\-&]{3,50}$/,
  OFFICE_NAME_CLEAN: /[^a-zA-Z0-9\s.\-&]/g,

  // City Name (Letters, accents, spaces, dots, hyphens, apostrophes)
  CITY_NAME: /^[a-zA-Z\u00C0-\u017F\s.\-']{2,85}$/,
  CITY_NAME_CLEAN: /[^a-zA-Z\u00C0-\u017F\s.\-']/g,

  // Latitude (-90 to 90 with up to 6 decimal places)
  LATITUDE: /^-?([0-8]?\d(\.\d{1,6})?|90(\.0{1,6})?)$/,

  // Longitude (-180 to 180 with up to 6 decimal places)
  LONGITUDE: /^-?((1[0-7]\d)|([0-9]?\d))(\.\d{1,6})?$|^-?180(\.0{1,6})?$/,

  // Title Case boundary
  TITLE_CASE: /\b\w/g,

  // Coordinate sanitization (Numbers, dots, minus sign)
  COORD_CLEAN: /[^-0-9.]/g,

  // Phone Formatter (XXX-XXX-XXXX)
  PHONE_FORMAT_1: /^(\d{3})(\d{3})(\d+)$/,
  PHONE_FORMAT_2: /^(\d{3})(\d+)$/,
  DOUBLE_HYPHEN: /--+/g,

  // Image path cleaning (Remove leading slashes)
  IMAGE_PATH_CLEAN: /^\/+/,

  // Country code extraction
  PHONE_COUNTRY_CLEAN: /^\+?\d+/,

  // Full phone match for formatting (e.g., +91 1234567890)
  PHONE_FULL_MATCH: /^(\+\d{1,3})(\d{10})$/,
  PHONE_INTERNAL_FORMAT: /(\d{3})(\d{3})(\d{4})/
};
