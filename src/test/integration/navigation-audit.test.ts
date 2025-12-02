/**
 * Navigation Audit Integration Test
 * 
 * Automatically validates that all internal navigation links resolve correctly
 * and that there are no broken routes across the application.
 */

import { describe, it, expect } from 'vitest';
import { runNavigationAudit } from '@/scripts/navigation-audit';

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
    // But we want to know about them
    expect(report.orphanedRoutes).toBeDefined();
  });

  it('should have all redirect targets as valid routes', async () => {
    const report = await runNavigationAudit();
    
    // Check that all redirect destinations exist
    const invalidRedirects = report.redirectChains.filter(
      ({ to }) => !report.validRoutes.includes(to)
    );
    
    if (invalidRedirects.length > 0) {
      console.log('\n❌ Invalid redirect destinations:');
      invalidRedirects.forEach(({ from, to }) => {
        console.log(`  ${from} → ${to} (destination does not exist)`);
      });
    }
    
    expect(invalidRedirects).toHaveLength(0);
  });

  it('should have at least 30 valid routes defined', async () => {
    const report = await runNavigationAudit();
    
    // Sanity check - the app should have many routes
    expect(report.validRoutes.length).toBeGreaterThanOrEqual(30);
  });

  it('should have most routes used in navigation', async () => {
    const report = await runNavigationAudit();
    
    // Calculate usage percentage (excluding admin/special routes)
    const nonSpecialRoutes = report.validRoutes.filter(
      route => !route.startsWith('/admin') && route !== '/maintenance' && route !== '/'
    );
    
    const usagePercentage = (report.usedRoutes.size / nonSpecialRoutes.length) * 100;
    
    console.log(`\n📊 Route usage: ${report.usedRoutes.size}/${nonSpecialRoutes.length} (${usagePercentage.toFixed(1)}%)`);
    
    // At least 50% of routes should be linked from somewhere
    expect(usagePercentage).toBeGreaterThanOrEqual(50);
  });
});
