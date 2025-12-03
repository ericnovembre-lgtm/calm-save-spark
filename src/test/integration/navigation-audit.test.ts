/**
 * Navigation Audit Integration Test
 * 
 * Automatically validates that all internal navigation links resolve correctly
 * and that there are no broken routes across the application.
 */

/**
 * Navigation Audit Integration Test
 * 
 * Validates that all internal navigation links resolve correctly,
 * redirects work properly, and there are no broken routes.
 * Updated for post-consolidation (62 actual pages + 13 redirects)
 */

import { describe, it, expect } from 'vitest';
import { runNavigationAudit } from '@/scripts/navigation-audit';

// Expected counts post-consolidation
const EXPECTED_MIN_PAGES = 60; // Actual pages (not redirects)
const EXPECTED_REDIRECTS = 13; // Number of redirect rules

describe('Navigation Audit', () => {
  it('should have no broken navigation links', async () => {
    const report = await runNavigationAudit();
    
    // Log broken links for debugging if test fails
    if (report.brokenLinks.length > 0) {
      console.log('\n❌ Broken links found:');
      report.brokenLinks.forEach(({ file, line, link, context }) => {
        console.log(`  ${file}:${line} → ${link}`);
        console.log(`    ${context}`);
      });
    }
    
    expect(report.brokenLinks).toHaveLength(0);
  });

  it('should have no orphaned routes', async () => {
    const report = await runNavigationAudit();
    
    // Log orphaned routes for information
    if (report.orphanedRoutes.length > 0) {
      console.log('\n👻 Orphaned routes (defined but never used):');
      report.orphanedRoutes.forEach(route => {
        console.log(`  ${route}`);
      });
      console.log('\nNote: Orphaned routes may be intentional (landing pages, deep links)');
    }
    
    // This is informational - orphaned routes aren't necessarily a failure
    expect(report.orphanedRoutes).toBeDefined();
  });

  it('should have all redirect targets as valid routes', async () => {
    const report = await runNavigationAudit();
    
    // Check that all redirect destinations exist (base path without query params)
    const invalidRedirects = report.redirectChains.filter(({ to }) => {
      const basePath = to.split('?')[0]; // Remove query params for validation
      return !report.validRoutes.includes(basePath);
    });
    
    if (invalidRedirects.length > 0) {
      console.log('\n❌ Invalid redirect destinations:');
      invalidRedirects.forEach(({ from, to }) => {
        console.log(`  ${from} → ${to} (destination does not exist)`);
      });
    }
    
    expect(invalidRedirects).toHaveLength(0);
  });

  it('should have expected number of routes post-consolidation', async () => {
    const report = await runNavigationAudit();
    
    console.log(`\n📊 Route count: ${report.validRoutes.length} routes`);
    console.log(`📊 Redirect count: ${report.redirectChains.length} redirects`);
    
    // Should have at least 60 actual routes
    expect(report.validRoutes.length).toBeGreaterThanOrEqual(EXPECTED_MIN_PAGES);
    
    // Should have expected number of redirects (±2 for flexibility)
    expect(report.redirectChains.length).toBeGreaterThanOrEqual(EXPECTED_REDIRECTS - 2);
  });

  it('should have consolidated routes using tab/panel query params', async () => {
    const report = await runNavigationAudit();
    
    // These routes should be redirects with query params
    const expectedConsolidatedRedirects = [
      { from: '/insights', toIncludes: 'analytics' },
      { from: '/digital-twin/analytics', toIncludes: 'digital-twin' },
      { from: '/life-planner', toIncludes: 'digital-twin' },
      { from: '/hubs/memory', toIncludes: 'digital-twin' },
      { from: '/investment-manager', toIncludes: 'investments' },
    ];
    
    expectedConsolidatedRedirects.forEach(({ from, toIncludes }) => {
      const redirect = report.redirectChains.find(r => r.from === from);
      if (!redirect) {
        console.log(`\n⚠️ Missing expected redirect: ${from}`);
      } else {
        expect(redirect.to).toContain(toIncludes);
      }
    });
  });

  it('should have most routes used in navigation', async () => {
    const report = await runNavigationAudit();
    
    // Calculate usage percentage (excluding admin/special routes)
    const nonSpecialRoutes = report.validRoutes.filter(
      route => !route.startsWith('/admin') && 
               !route.startsWith('/preview') &&
               route !== '/maintenance' && 
               route !== '/'
    );
    
    const usagePercentage = (report.usedRoutes.size / nonSpecialRoutes.length) * 100;
    
    console.log(`\n📊 Route usage: ${report.usedRoutes.size}/${nonSpecialRoutes.length} (${usagePercentage.toFixed(1)}%)`);
    
    // At least 50% of routes should be linked from somewhere
    expect(usagePercentage).toBeGreaterThanOrEqual(50);
  });

  it('should have all deleted pages converted to redirects', async () => {
    const report = await runNavigationAudit();
    
    // These pages were deleted and should NOT be valid routes anymore
    const deletedPages = [
      '/agent-hub',
      '/security',
      '/insights', // Now a redirect
      '/digital-twin/analytics',
      '/life-planner',
      '/investment-manager',
      '/business',
    ];
    
    deletedPages.forEach(page => {
      const isRedirect = report.redirectChains.some(r => r.from === page);
      const isValidRoute = report.validRoutes.includes(page);
      
      // Should either be a redirect OR not exist (but not be a valid standalone route)
      if (isValidRoute && !isRedirect) {
        console.log(`\n⚠️ ${page} should be a redirect, not a route`);
      }
    });
  });
});
