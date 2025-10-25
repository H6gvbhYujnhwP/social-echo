/**
 * Null-safety helpers for usage limits
 * 
 * Ultimate and Agency plans have usageLimit = null (unlimited)
 * These helpers provide type-safe checks and formatting
 */

/**
 * Check if a usage limit represents unlimited access
 * @param limit - The usage limit (number, null, or undefined)
 * @returns true if limit is null or undefined (unlimited)
 */
export const isUnlimitedMonthly = (limit: number | null | undefined): limit is null => limit == null;

/**
 * Format a usage limit for display
 * @param limit - The usage limit (number, null, or undefined)
 * @returns "unlimited" for null/undefined, or the number as a string
 */
export const formatLimit = (limit: number | null | undefined): string => limit == null ? 'unlimited' : String(limit);

