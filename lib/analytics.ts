/**
 * Google Analytics Event Tracking Utilities
 * 
 * This file contains utility functions for tracking events in Google Analytics.
 * It uses the Vercel Analytics library to send events to Google Analytics.
 */

import va from "@vercel/analytics";

// Page View Events
export const trackPageView = (pageName: string) => {
  va.track("page_view", { page: pageName });
};

// Authentication Events
export const trackAuth = {
  login: () => va.track("auth_login"),
  logout: () => va.track("auth_logout"),
};

// Site Management Events
export const trackSite = {
  create: () => va.track("site_create"),
  update: (siteId: string) => va.track("site_update", { siteId }),
  delete: (siteId: string) => va.track("site_delete", { siteId }),
  view: (siteId: string) => va.track("site_view", { siteId }),
};

// Post Management Events
export const trackPost = {
  create: (siteId: string) => va.track("post_create", { siteId }),
  update: (postId: string, siteId: string) => va.track("post_update", { postId, siteId }),
  delete: (postId: string, siteId: string) => va.track("post_delete", { postId, siteId }),
  publish: (postId: string, siteId: string) => va.track("post_publish", { postId, siteId }),
  unpublish: (postId: string, siteId: string) => va.track("post_unpublish", { postId, siteId }),
  view: (postId: string, siteId: string) => va.track("post_view", { postId, siteId }),
};

// Navigation Events
export const trackNavigation = {
  menuClick: (menuItem: string) => va.track("navigation_menu_click", { menuItem }),
  externalLink: (linkName: string, href: string) => va.track("navigation_external_link", { linkName, href }),
};

// User Engagement Events
export const trackEngagement = {
  formSubmit: (formName: string) => va.track("form_submit", { formName }),
  fileUpload: (fileType: string) => va.track("file_upload", { fileType }),
  reportAbuse: () => va.track("report_abuse"),
};

// Feature Usage Events
export const trackFeature = {
  use: (featureName: string) => va.track("feature_use", { featureName }),
};

// Agent Management Events
export const trackAgent = {
  create: () => va.track("agent_created"),
  update: (agentId: string) => va.track("agent_updated", { agentId }),
  delete: (agentId: string) => va.track("agent_deleted", { agentId }),
  view: (agentId: string) => va.track("agent_viewed", { agentId }),
}; 