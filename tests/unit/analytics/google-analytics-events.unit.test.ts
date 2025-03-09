/**
 * Unit tests for Google Analytics event tracking utilities
 * 
 * Following TDD principles, we write tests before implementing the functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the Vercel Analytics library
vi.mock('@vercel/analytics', () => ({
  default: {
    track: vi.fn(),
  },
}));

// Import the mock after it's defined
import va from '@vercel/analytics';

describe('Google Analytics Event Tracking', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Page View Events', () => {
    it('should track page views with the correct parameters', async () => {
      // Import the module after mocking dependencies
      const { trackPageView } = await import('@/lib/analytics');
      
      // Call the function
      trackPageView('home');
      
      // Verify the tracking call
      expect(va.track).toHaveBeenCalledWith('page_view', { page: 'home' });
    });
  });

  describe('Authentication Events', () => {
    it('should track login events', async () => {
      const { trackAuth } = await import('@/lib/analytics');
      
      trackAuth.login();
      
      expect(va.track).toHaveBeenCalledWith('auth_login');
    });

    it('should track logout events', async () => {
      const { trackAuth } = await import('@/lib/analytics');
      
      trackAuth.logout();
      
      expect(va.track).toHaveBeenCalledWith('auth_logout');
    });
  });

  describe('Site Management Events', () => {
    it('should track site creation', async () => {
      const { trackSite } = await import('@/lib/analytics');
      
      trackSite.create();
      
      expect(va.track).toHaveBeenCalledWith('site_create');
    });

    it('should track site updates with site ID', async () => {
      const { trackSite } = await import('@/lib/analytics');
      
      trackSite.update('site-123');
      
      expect(va.track).toHaveBeenCalledWith('site_update', { siteId: 'site-123' });
    });

    it('should track site deletion with site ID', async () => {
      const { trackSite } = await import('@/lib/analytics');
      
      trackSite.delete('site-123');
      
      expect(va.track).toHaveBeenCalledWith('site_delete', { siteId: 'site-123' });
    });

    it('should track site views with site ID', async () => {
      const { trackSite } = await import('@/lib/analytics');
      
      trackSite.view('site-123');
      
      expect(va.track).toHaveBeenCalledWith('site_view', { siteId: 'site-123' });
    });
  });

  describe('Post Management Events', () => {
    it('should track post creation with site ID', async () => {
      const { trackPost } = await import('@/lib/analytics');
      
      trackPost.create('site-123');
      
      expect(va.track).toHaveBeenCalledWith('post_create', { siteId: 'site-123' });
    });

    it('should track post updates with post ID and site ID', async () => {
      const { trackPost } = await import('@/lib/analytics');
      
      trackPost.update('post-456', 'site-123');
      
      expect(va.track).toHaveBeenCalledWith('post_update', { 
        postId: 'post-456', 
        siteId: 'site-123' 
      });
    });

    it('should track post deletion with post ID and site ID', async () => {
      const { trackPost } = await import('@/lib/analytics');
      
      trackPost.delete('post-456', 'site-123');
      
      expect(va.track).toHaveBeenCalledWith('post_delete', { 
        postId: 'post-456', 
        siteId: 'site-123' 
      });
    });

    it('should track post publishing with post ID and site ID', async () => {
      const { trackPost } = await import('@/lib/analytics');
      
      trackPost.publish('post-456', 'site-123');
      
      expect(va.track).toHaveBeenCalledWith('post_publish', { 
        postId: 'post-456', 
        siteId: 'site-123' 
      });
    });

    it('should track post unpublishing with post ID and site ID', async () => {
      const { trackPost } = await import('@/lib/analytics');
      
      trackPost.unpublish('post-456', 'site-123');
      
      expect(va.track).toHaveBeenCalledWith('post_unpublish', { 
        postId: 'post-456', 
        siteId: 'site-123' 
      });
    });

    it('should track post views with post ID and site ID', async () => {
      const { trackPost } = await import('@/lib/analytics');
      
      trackPost.view('post-456', 'site-123');
      
      expect(va.track).toHaveBeenCalledWith('post_view', { 
        postId: 'post-456', 
        siteId: 'site-123' 
      });
    });
  });

  describe('Navigation Events', () => {
    it('should track menu clicks with menu item name', async () => {
      const { trackNavigation } = await import('@/lib/analytics');
      
      trackNavigation.menuClick('dashboard');
      
      expect(va.track).toHaveBeenCalledWith('navigation_menu_click', { 
        menuItem: 'dashboard' 
      });
    });

    it('should track external link clicks with link name and URL', async () => {
      const { trackNavigation } = await import('@/lib/analytics');
      
      trackNavigation.externalLink('GitHub', 'https://github.com');
      
      expect(va.track).toHaveBeenCalledWith('navigation_external_link', { 
        linkName: 'GitHub', 
        href: 'https://github.com' 
      });
    });
  });

  describe('User Engagement Events', () => {
    it('should track form submissions with form name', async () => {
      const { trackEngagement } = await import('@/lib/analytics');
      
      trackEngagement.formSubmit('contact');
      
      expect(va.track).toHaveBeenCalledWith('form_submit', { formName: 'contact' });
    });

    it('should track file uploads with file type', async () => {
      const { trackEngagement } = await import('@/lib/analytics');
      
      trackEngagement.fileUpload('image');
      
      expect(va.track).toHaveBeenCalledWith('file_upload', { fileType: 'image' });
    });

    it('should track abuse reports', async () => {
      const { trackEngagement } = await import('@/lib/analytics');
      
      trackEngagement.reportAbuse();
      
      expect(va.track).toHaveBeenCalledWith('report_abuse');
    });
  });

  describe('Feature Usage Events', () => {
    it('should track feature usage with feature name', async () => {
      const { trackFeature } = await import('@/lib/analytics');
      
      trackFeature.use('markdown-editor');
      
      expect(va.track).toHaveBeenCalledWith('feature_use', { 
        featureName: 'markdown-editor' 
      });
    });
  });
}); 