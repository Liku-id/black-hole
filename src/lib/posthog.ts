'use client';

import posthog from 'posthog-js';
import React, { useEffect, useState } from 'react';

// Initialize PostHog
export const initPostHog = () => {
  if (typeof window !== 'undefined') {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    
    if (posthogKey) {
      if (process.env.NODE_ENV === 'development') {
        return;
      }
      
      posthog.init(posthogKey, {
        api_host: posthogHost,
        person_profiles: 'identified_only',
        debug: false,
        disable_session_recording: true,
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        verbose: false
      });
    } else {
      console.warn('PostHog key not found. Please set NEXT_PUBLIC_POSTHOG_KEY environment variable.');
    }
  }
};

// Hook untuk menggunakan PostHog
export const usePostHog = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkPostHog = () => {
      if (typeof window !== 'undefined' && window.posthog) {
        setIsLoaded(true);
      } else {
        setTimeout(checkPostHog, 100);
      }
    };
    checkPostHog();
  }, []);

  return {
    posthog: typeof window !== 'undefined' ? window.posthog : null,
    isLoaded,
  };
};

// Event tracking functions
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.posthog && process.env.NODE_ENV !== 'development') {
    posthog.capture(eventName, properties);
  }
};

// User identification - hanya nama dan email
export const identifyUser = (userId: string, name?: string, email?: string) => {
  if (typeof window !== 'undefined' && window.posthog && process.env.NODE_ENV !== 'development') {
    const properties: Record<string, any> = {};
    if (name) properties.name = name;
    if (email) properties.email = email;
    
    posthog.identify(userId, properties);
  }
};

// Set user properties
export const setUserProperties = (properties: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.posthog && process.env.NODE_ENV !== 'development') {
    posthog.setPersonProperties(properties);
  }
};

// Reset user (logout)
export const resetUser = () => {
  if (typeof window !== 'undefined' && window.posthog && process.env.NODE_ENV !== 'development') {
    posthog.reset();
  }
};

// Common events
export function trackLogin(userId: string, name?: string, email?: string, method?: string): void;
export function trackLogin(userId: string, name?: string, email?: string): void;
export function trackLogin(userId: string, name?: string, email?: string, method?: string): void {
  identifyUser(userId, name, email);
  trackEvent('user_login', { method: method || 'email' });
}

export const trackRegistration = (userId: string, name?: string, email?: string, method?: string) => {
  identifyUser(userId, name, email);
  trackEvent('user_registration', { method: method || 'email' });
};

export const trackTicketPurchase = (ticketId: string, eventId: string, price: number) => {
  trackEvent('ticket_purchase', {
    ticket_id: ticketId,
    event_id: eventId,
    price,
  });
};

export const trackEventView = (eventId: string, eventName: string) => {
  trackEvent('event_view', {
    event_id: eventId,
    event_name: eventName,
  });
};

// Track page views
export const trackPageView = (pageName?: string) => {
  if (typeof window !== 'undefined' && window.posthog) {
    posthog.capture('$pageview', {
      page: pageName || window.location.pathname
    });
  }
};

// Track button clicks
export const trackButtonClick = (buttonName: string, properties?: Record<string, any>) => {
  trackEvent('button_clicked', {
    button_name: buttonName,
    ...properties
  });
};

// Track form submissions
export const trackFormSubmission = (formName: string, properties?: Record<string, any>) => {
  trackEvent('form_submitted', {
    form_name: formName,
    ...properties
  });
};

// Track errors
export const trackError = (error: Error, context?: Record<string, any>) => {
  trackEvent('error', {
    error_message: error.message,
    error_stack: error.stack,
    ...context
  });
};

// Component untuk initialize PostHog
export const PostHogProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize PostHog
  useEffect(() => {
    initPostHog();
  }, []);

  return children;
};

export default posthog;
