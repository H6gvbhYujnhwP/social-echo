"use client";

import { useEffect } from "react";
import { trackButtonClick, trackLinkClick } from "@/lib/analytics/track-event";

/**
 * Automatic Click Tracker
 * 
 * Automatically tracks clicks on buttons and links throughout the site
 * without requiring manual tracking code on each element
 */
export default function GAClickTracker() {
  useEffect(() => {
    // Only run in browser with GA loaded
    if (typeof window === 'undefined' || !('gtag' in window)) return;

    // Track all button clicks
    const handleButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button');
      
      if (button) {
        const buttonText = button.textContent?.trim() || button.getAttribute('aria-label') || 'Unknown Button';
        const buttonId = button.id || undefined;
        const buttonClass = button.className || undefined;
        
        trackButtonClick(buttonText, window.location.pathname);
        
        // Log for debugging (remove in production if needed)
        console.log('[GA] Button clicked:', buttonText, 'on', window.location.pathname);
      }
    };

    // Track all link clicks
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link) {
        const linkText = link.textContent?.trim() || link.getAttribute('aria-label') || 'Unknown Link';
        const destination = link.getAttribute('href') || '#';
        
        // Only track internal links and important external links
        if (destination && !destination.startsWith('javascript:')) {
          trackLinkClick(linkText, destination);
          
          // Log for debugging
          console.log('[GA] Link clicked:', linkText, '→', destination);
        }
      }
    };

    // Attach event listeners
    document.addEventListener('click', handleButtonClick, true);
    document.addEventListener('click', handleLinkClick, true);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleButtonClick, true);
      document.removeEventListener('click', handleLinkClick, true);
    };
  }, []);

  return null;
}

