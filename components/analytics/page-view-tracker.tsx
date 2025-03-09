'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { trackPageView } from '@/lib/analytics';

/**
 * PageViewTracker component
 * 
 * This component tracks page views in Google Analytics.
 * It should be added to the root layout to track all page views.
 */
export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track page view when the pathname or search params change
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    
    // Extract page name from pathname
    const pageName = pathname.split('/').pop() || 'home';
    
    // Track the page view
    trackPageView(pageName);
  }, [pathname, searchParams]);

  // This component doesn't render anything
  return null;
} 