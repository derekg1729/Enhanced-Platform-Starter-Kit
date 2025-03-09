# Google Analytics Integration

This project includes Google Analytics integration using the `@next/third-parties` package, which provides an optimized way to add Google Analytics to Next.js applications.

## Setup

1. Create a Google Analytics 4 property in the [Google Analytics console](https://analytics.google.com/).
2. Get your Measurement ID (starts with "G-").
3. Add the Measurement ID to your environment variables:

```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

You'll need to add this to:
- `.env.local` for local development
- `.env.preview` for preview deployments
- `.env.production` for production deployments

## How It Works

The Google Analytics integration is implemented in the root layout component (`app/layout.tsx`). The integration:

- Only loads if the `NEXT_PUBLIC_GA_ID` environment variable is set
- Uses the official Next.js integration via `@next/third-parties/google`
- Is optimized for performance with minimal impact on Core Web Vitals

## Implemented Events

The application tracks various events using the utilities in `lib/analytics.ts`. Current event tracking includes:

### Page Views
- **page_view**: Tracks when users view a page, including the page name

### Authentication Events
- **auth_login**: Tracks when a user attempts to log in
- **auth_logout**: Tracks when a user logs out

### Site Management Events
- **site_create**: Tracks when a user creates a new site
- **site_update**: Tracks when a site is updated (with site ID)
- **site_delete**: Tracks when a site is deleted (with site ID)
- **site_view**: Tracks when a site is viewed (with site ID)

### Post Management Events
- **post_create**: Tracks when a user creates a new post (with site ID)
- **post_update**: Tracks when a post is updated (with post and site IDs)
- **post_delete**: Tracks when a post is deleted (with post and site IDs)
- **post_publish**: Tracks when a post is published (with post and site IDs)
- **post_unpublish**: Tracks when a post is unpublished (with post and site IDs)
- **post_view**: Tracks when a post is viewed (with post and site IDs)

### Navigation Events
- **navigation_menu_click**: Tracks menu item clicks
- **navigation_external_link**: Tracks clicks on external links

### User Engagement Events
- **form_submit**: Tracks form submissions
- **file_upload**: Tracks file uploads
- **report_abuse**: Tracks abuse reports

### Feature Usage Events
- **feature_use**: Generic event for tracking feature usage

## Components with Event Tracking

The following components currently implement event tracking:
- `components/analytics/page-view-tracker.tsx`: Tracks page views
- `components/logout-button.tsx`: Tracks user logout
- `app/app/(auth)/login/login-button.tsx`: Tracks login attempts
- `components/create-site-button.tsx`: Tracks site creation
- `components/create-post-button.tsx`: Tracks post creation

## Future Event Tracking Opportunities

Consider adding event tracking to the following areas:

1. **User Settings**: Track when users update their profile or settings
2. **Search Functionality**: Track search queries and result interactions
3. **Error Tracking**: Track when users encounter errors
4. **Performance Metrics**: Track core web vitals and performance metrics
5. **Multi-tenant Features**: Track tenant-specific actions and customizations
6. **Content Interactions**: Track interactions with content (likes, shares, comments)
7. **Conversion Funnels**: Track user progression through key workflows
8. **A/B Testing**: Track which variants users see and their interactions
9. **User Onboarding**: Track completion of onboarding steps
10. **Feature Adoption**: Track first-time usage of features

## Testing

Tests for the Google Analytics integration are located in:
- `tests/unit/analytics/google-analytics.unit.test.ts` - Tests the basic functionality
- `tests/unit/analytics/google-analytics-integration.unit.test.tsx` - Tests the integration in the layout
- `tests/unit/analytics/google-analytics-events.unit.test.ts` - Tests event tracking utilities
- `tests/unit/analytics/page-view-tracker.unit.test.tsx` - Tests the page view tracker component
- `tests/integration/analytics/google-analytics.integration.test.ts` - Integration tests

To run all Google Analytics tests:

```bash
npm run test:ga
```

For build-specific tests:
```bash
npm run test:ga:build
```

For deployment tests:
```bash
npm run test:ga:deployment
```

## Debugging

To verify that Google Analytics is working:

1. Open your site in a browser with the developer tools open
2. Look for network requests to `google-analytics.com`
3. Check the Google Analytics real-time dashboard to see if your visit is being tracked

## Privacy Considerations

When using Google Analytics, ensure your privacy policy is updated to reflect the data collection. Consider:

- Adding a cookie consent banner
- Implementing IP anonymization
- Respecting Do Not Track settings
- Complying with GDPR, CCPA, and other privacy regulations

## Additional Resources

- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [Next.js Third Parties Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/third-party-libraries) 