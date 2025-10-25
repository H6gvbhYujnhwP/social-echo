/**
 * Check if a plan is Ultimate
 * Centralized helper to determine if unlimited features should be enabled
 */
export const isUltimatePlan = (plan?: string | null): boolean =>
  (plan ?? '').toLowerCase() === 'ultimate';

