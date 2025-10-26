/**
 * GA4 Event Tracking Utility
 * 
 * Provides type-safe event tracking for user interactions
 */

// Event types for better organization in GA4
export type EventCategory = 
  | 'navigation'
  | 'cta'
  | 'form'
  | 'engagement'
  | 'conversion'
  | 'social';

export interface TrackEventParams {
  action: string;
  category: EventCategory;
  label?: string;
  value?: number;
  [key: string]: any;
}

/**
 * Track a custom event in GA4
 * 
 * @example
 * trackEvent({
 *   action: 'click_pricing_card',
 *   category: 'cta',
 *   label: 'Pro Plan',
 *   value: 49.99
 * });
 */
export function trackEvent({ action, category, label, value, ...rest }: TrackEventParams) {
  // Check if gtag is available
  if (typeof window === 'undefined' || !('gtag' in window)) {
    return;
  }

  // @ts-ignore
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
    ...rest
  });
}

/**
 * Track button clicks
 */
export function trackButtonClick(buttonName: string, location?: string) {
  trackEvent({
    action: 'button_click',
    category: 'engagement',
    label: buttonName,
    button_location: location
  });
}

/**
 * Track link clicks
 */
export function trackLinkClick(linkText: string, destination: string) {
  trackEvent({
    action: 'link_click',
    category: 'navigation',
    label: linkText,
    link_destination: destination
  });
}

/**
 * Track CTA (Call-to-Action) clicks
 */
export function trackCTAClick(ctaName: string, location: string) {
  trackEvent({
    action: 'cta_click',
    category: 'cta',
    label: ctaName,
    cta_location: location
  });
}

/**
 * Track form interactions
 */
export function trackFormStart(formName: string) {
  trackEvent({
    action: 'form_start',
    category: 'form',
    label: formName
  });
}

export function trackFormSubmit(formName: string, success: boolean) {
  trackEvent({
    action: success ? 'form_submit_success' : 'form_submit_error',
    category: 'form',
    label: formName
  });
}

/**
 * Track pricing card interactions
 */
export function trackPricingCardClick(planName: string, price: number) {
  trackEvent({
    action: 'pricing_card_click',
    category: 'conversion',
    label: planName,
    value: price,
    plan_name: planName
  });
}

/**
 * Track plan selection
 */
export function trackPlanSelected(planName: string, price: number, location: string) {
  trackEvent({
    action: 'plan_selected',
    category: 'conversion',
    label: planName,
    value: price,
    plan_name: planName,
    selection_location: location
  });
}

/**
 * Track social proof interactions
 */
export function trackSocialProof(action: string, label?: string) {
  trackEvent({
    action: `social_proof_${action}`,
    category: 'social',
    label: label
  });
}

