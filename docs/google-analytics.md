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

## Testing

Tests for the Google Analytics integration are located in:
- `tests/unit/analytics/google-analytics.unit.test.ts` - Tests the basic functionality
- `tests/unit/analytics/google-analytics-integration.unit.test.tsx` - Tests the integration in the layout

To run the tests:

```bash
npm test tests/unit/analytics/google-analytics.unit.test.ts tests/unit/analytics/google-analytics-integration.unit.test.tsx
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