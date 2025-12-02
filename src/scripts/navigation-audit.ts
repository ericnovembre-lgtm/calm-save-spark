/**
 * Navigation Audit Script
 * 
 * Automatically detects broken internal links across all components by:
 * 1. Extracting all valid routes from App.tsx
 * 2. Scanning components for navigation patterns (navigate(), to=, path=)
 * 3. Cross-referencing found links against valid routes
 * 4. Reporting broken links, redirect chains, and orphaned routes
 * 
 * Usage: npx ts-node src/scripts/navigation-audit.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface AuditReport {
  brokenLinks: Array<{
    file: string;
    line: number;
    link: string;
    context: string;
  }>;
  redirectChains: Array<{
    from: string;
    to: string;
  }>;
  orphanedRoutes: string[];
  validRoutes: string[];
  usedRoutes: Set<string>;
}

/**
 * Extract all routes from App.tsx
 */
function extractRoutesFromApp(): { validRoutes: string[]; redirects: Map<string, string> } {
  const appPath = path.join(process.cwd(), 'src/App.tsx');
  const appContent = fs.readFileSync(appPath, 'utf-8');

  const validRoutes: string[] = [];
  const redirects = new Map<string, string>();

  // Match <Route path="/something" ... />
  const routePattern = /<Route\s+path="([^"]+)"/g;
  let match;
  while ((match = routePattern.exec(appContent)) !== null) {
    const route = match[1];
    if (route !== '*') { // Exclude catch-all route
      validRoutes.push(route);
    }
  }

  // Match redirects: <Route path="/old" element={<Navigate to="/new" replace />} />
  const redirectPattern = /<Route\s+path="([^"]+)"[^>]*element=\{<Navigate\s+to="([^"]+)"/g;
  while ((match = redirectPattern.exec(appContent)) !== null) {
    redirects.set(match[1], match[2]);
  }

  return { validRoutes, redirects };
}

/**
 * Recursively scan directory for navigation patterns
 */
function scanDirectory(dir: string, usedRoutes: Set<string>, brokenLinks: AuditReport['brokenLinks'], validRoutes: string[]): void {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and build directories
      if (!['node_modules', 'dist', 'build', '.git'].includes(file)) {
        scanDirectory(filePath, usedRoutes, brokenLinks, validRoutes);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      scanFile(filePath, usedRoutes, brokenLinks, validRoutes);
    }
  }
}

/**
 * Scan a single file for navigation patterns
 */
function scanFile(filePath: string, usedRoutes: Set<string>, brokenLinks: AuditReport['brokenLinks'], validRoutes: string[]): void {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Patterns to match navigation
  const patterns = [
    /navigate\(['"`]([^'"`]+)['"`]\)/g,      // navigate('/path')
    /to=['"`]([^'"`]+)['"`]/g,                // to="/path"
    /path=['"`]([^'"`]+)['"`]/g,              // path="/path"
    /href=['"`]([^'"`]+)['"`]/g,              // href="/path"
  ];

  lines.forEach((line, index) => {
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const link = match[1];
        
        // Only check internal links (starting with /)
        if (link.startsWith('/')) {
          usedRoutes.add(link);
          
          // Check if it's a valid route
          const isValid = validRoutes.some(route => {
            // Exact match
            if (route === link) return true;
            
            // Handle dynamic routes (:param)
            const routePattern = route.replace(/:[^/]+/g, '[^/]+');
            const regex = new RegExp(`^${routePattern}$`);
            return regex.test(link);
          });

          if (!isValid) {
            brokenLinks.push({
              file: path.relative(process.cwd(), filePath),
              line: index + 1,
              link,
              context: line.trim(),
            });
          }
        }
      }
    });
  });
}

/**
 * Find orphaned routes (defined but never used)
 */
function findOrphanedRoutes(validRoutes: string[], usedRoutes: Set<string>, redirects: Map<string, string>): string[] {
  const orphaned: string[] = [];

  for (const route of validRoutes) {
    // Skip if route is used
    if (usedRoutes.has(route)) continue;
    
    // Skip if route is a redirect target
    const isRedirectTarget = Array.from(redirects.values()).includes(route);
    if (isRedirectTarget) continue;
    
    // Skip special routes
    if (route === '/' || route.startsWith('/admin') || route === '/maintenance') continue;

    orphaned.push(route);
  }

  return orphaned;
}

/**
 * Run the complete navigation audit
 */
export async function runNavigationAudit(): Promise<AuditReport> {
  console.log('🔍 Starting navigation audit...\n');

  // Step 1: Extract routes from App.tsx
  const { validRoutes, redirects } = extractRoutesFromApp();
  console.log(`✓ Found ${validRoutes.length} valid routes`);
  console.log(`✓ Found ${redirects.size} redirect rules\n`);

  // Step 2: Scan all components for navigation patterns
  const usedRoutes = new Set<string>();
  const brokenLinks: AuditReport['brokenLinks'] = [];
  
  const srcDir = path.join(process.cwd(), 'src');
  scanDirectory(srcDir, usedRoutes, brokenLinks, validRoutes);
  
  console.log(`✓ Scanned components, found ${usedRoutes.size} unique route references\n`);

  // Step 3: Find orphaned routes
  const orphanedRoutes = findOrphanedRoutes(validRoutes, usedRoutes, redirects);

  // Step 4: Prepare redirect chains report
  const redirectChains = Array.from(redirects.entries()).map(([from, to]) => ({ from, to }));

  const report: AuditReport = {
    brokenLinks,
    redirectChains,
    orphanedRoutes,
    validRoutes,
    usedRoutes,
  };

  return report;
}

/**
 * Format and print the audit report
 */
function printReport(report: AuditReport): void {
  console.log('\n' + '='.repeat(60));
  console.log('📊 NAVIGATION AUDIT REPORT');
  console.log('='.repeat(60) + '\n');

  // Broken Links
  if (report.brokenLinks.length > 0) {
    console.log('❌ BROKEN LINKS FOUND:');
    console.log('-'.repeat(60));
    report.brokenLinks.forEach(({ file, line, link, context }) => {
      console.log(`  ${file}:${line}`);
      console.log(`    Link: ${link}`);
      console.log(`    Context: ${context}`);
      console.log('');
    });
  } else {
    console.log('✅ No broken links found!\n');
  }

  // Redirect Chains
  if (report.redirectChains.length > 0) {
    console.log('🔄 REDIRECT CHAINS:');
    console.log('-'.repeat(60));
    report.redirectChains.forEach(({ from, to }) => {
      console.log(`  ${from} → ${to}`);
    });
    console.log('');
  }

  // Orphaned Routes
  if (report.orphanedRoutes.length > 0) {
    console.log('👻 ORPHANED ROUTES (defined but never used):');
    console.log('-'.repeat(60));
    report.orphanedRoutes.forEach(route => {
      console.log(`  ${route}`);
    });
    console.log('');
  } else {
    console.log('✅ No orphaned routes found!\n');
  }

  // Summary
  console.log('📈 SUMMARY:');
  console.log('-'.repeat(60));
  console.log(`  Total Routes:      ${report.validRoutes.length}`);
  console.log(`  Routes Used:       ${report.usedRoutes.size}`);
  console.log(`  Broken Links:      ${report.brokenLinks.length}`);
  console.log(`  Redirect Chains:   ${report.redirectChains.length}`);
  console.log(`  Orphaned Routes:   ${report.orphanedRoutes.length}`);
  console.log('');

  if (report.brokenLinks.length === 0) {
    console.log('✅ All navigation links are valid!');
  } else {
    console.log('⚠️  Please fix broken links to improve navigation reliability.');
  }
}

// Run if called directly
if (require.main === module) {
  runNavigationAudit()
    .then(printReport)
    .catch(error => {
      console.error('❌ Audit failed:', error);
      process.exit(1);
    });
}
