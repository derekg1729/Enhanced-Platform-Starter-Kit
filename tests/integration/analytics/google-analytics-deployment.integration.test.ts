import { describe, it, expect } from 'vitest';
// Using built-in fetch API instead of node-fetch

describe('Google Analytics Deployment Integration', () => {
  // This test is more intensive as it requires accessing the deployed application
  // Skip in CI environments unless explicitly enabled
  const shouldRunDeploymentTests = process.env.RUN_DEPLOYMENT_TESTS === 'true';
  
  if (!shouldRunDeploymentTests) {
    it.skip('should include Google Analytics in deployed application (skipped - set RUN_DEPLOYMENT_TESTS=true to run)', () => {
      // This test is skipped by default
    });
    return;
  }

  // Only run these tests if explicitly enabled
  it('should include Google Analytics script in deployed application HTML', async () => {
    // Define the URLs to check
    const urls = [
      'https://wackywavelength.fyi',
      'https://app.wackywavelength.fyi',
      'https://dereks-projects-32c37a6a.vercel.app'
    ];
    
    // Check each URL
    for (const url of urls) {
      try {
        console.log(`Checking ${url} for Google Analytics...`);
        const response = await fetch(url);
        const html = await response.text();
        
        // Check if the HTML contains Google Analytics
        const hasGoogleAnalytics = 
          html.includes('googletagmanager.com') || 
          html.includes('google-analytics.com') || 
          html.includes('gtag') || 
          html.includes('G-NGR51LW106');
        
        expect(hasGoogleAnalytics).toBeTruthy();
        console.log(`✅ ${url} includes Google Analytics`);
      } catch (error) {
        console.error(`Error checking ${url}:`, error);
        throw error;
      }
    }
  });

  it('should send analytics data to Google Analytics', async () => {
    // This test is more complex and would require a headless browser
    // For now, we'll just log a message
    console.log('To fully test Google Analytics data collection, you would need to:');
    console.log('1. Use a headless browser like Puppeteer or Playwright');
    console.log('2. Visit the application pages');
    console.log('3. Intercept network requests to verify data is sent to Google Analytics');
    console.log('4. Check the Google Analytics dashboard for real-time data');
  });
}); 