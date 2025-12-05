#!/usr/bin/env node
/**
 * Image Optimization Script
 * Converts images to WebP format with multiple sizes and blur placeholders
 * 
 * Usage: node scripts/optimize-images.js [directory]
 * Default directory: public/
 * 
 * Requirements: npm install sharp glob
 */

const fs = require('fs').promises;
const path = require('path');

// Check for sharp module
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('Sharp module not found. Install it with: npm install sharp');
  process.exit(1);
}

// Configuration
const CONFIG = {
  // Quality settings
  webpQuality: 80,
  jpegQuality: 85,
  pngCompressionLevel: 9,
  
  // Size presets
  sizes: {
    thumbnail: [320, 640],
    standard: [640, 768, 1024],
    hero: [768, 1024, 1280, 1920],
    avatar: [48, 96, 128, 256],
    icon: [48, 96, 192, 512],
  },
  
  // Blur placeholder settings
  blurWidth: 20,
  blurQuality: 10,
  
  // Supported input formats
  inputFormats: ['.png', '.jpg', '.jpeg', '.gif', '.tiff', '.webp'],
  
  // Skip patterns
  skipPatterns: [
    /node_modules/,
    /\.git/,
    /dist/,
    /-optimized\./,
    /-blur\./,
    /icon-\d+\./,  // Skip existing icons
  ],
};

/**
 * Get all image files in directory
 */
async function getImageFiles(dir) {
  const files = [];
  
  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      // Check skip patterns
      if (CONFIG.skipPatterns.some(pattern => pattern.test(fullPath))) {
        continue;
      }
      
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (CONFIG.inputFormats.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  await walk(dir);
  return files;
}

/**
 * Get size preset based on filename
 */
function getSizePreset(filename) {
  const name = filename.toLowerCase();
  
  if (name.includes('avatar') || name.includes('profile')) {
    return CONFIG.sizes.avatar;
  }
  if (name.includes('icon') || name.includes('favicon')) {
    return CONFIG.sizes.icon;
  }
  if (name.includes('hero') || name.includes('banner') || name.includes('cover')) {
    return CONFIG.sizes.hero;
  }
  if (name.includes('thumb') || name.includes('preview')) {
    return CONFIG.sizes.thumbnail;
  }
  
  return CONFIG.sizes.standard;
}

/**
 * Convert image to WebP
 */
async function convertToWebP(inputPath, outputPath) {
  await sharp(inputPath)
    .webp({ quality: CONFIG.webpQuality })
    .toFile(outputPath);
    
  const inputStats = await fs.stat(inputPath);
  const outputStats = await fs.stat(outputPath);
  const savings = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);
  
  return {
    originalSize: inputStats.size,
    optimizedSize: outputStats.size,
    savings,
  };
}

/**
 * Generate responsive sizes
 */
async function generateSizes(inputPath, outputDir, sizes) {
  const filename = path.basename(inputPath, path.extname(inputPath));
  const results = [];
  
  const metadata = await sharp(inputPath).metadata();
  const originalWidth = metadata.width || 1920;
  
  for (const size of sizes) {
    // Skip sizes larger than original
    if (size > originalWidth) continue;
    
    const outputPath = path.join(outputDir, `${filename}-${size}w.webp`);
    
    await sharp(inputPath)
      .resize(size)
      .webp({ quality: CONFIG.webpQuality })
      .toFile(outputPath);
      
    const stats = await fs.stat(outputPath);
    results.push({ size, path: outputPath, bytes: stats.size });
  }
  
  return results;
}

/**
 * Generate blur placeholder
 */
async function generateBlurPlaceholder(inputPath) {
  const buffer = await sharp(inputPath)
    .resize(CONFIG.blurWidth)
    .webp({ quality: CONFIG.blurQuality })
    .toBuffer();
    
  return `data:image/webp;base64,${buffer.toString('base64')}`;
}

/**
 * Process single image
 */
async function processImage(inputPath, options = {}) {
  const dir = path.dirname(inputPath);
  const ext = path.extname(inputPath);
  const filename = path.basename(inputPath, ext);
  
  console.log(`\nProcessing: ${inputPath}`);
  
  const results = {
    original: inputPath,
    webp: null,
    sizes: [],
    blur: null,
    savings: 0,
  };
  
  try {
    // 1. Convert to WebP
    const webpPath = path.join(dir, `${filename}.webp`);
    if (ext.toLowerCase() !== '.webp') {
      const webpResult = await convertToWebP(inputPath, webpPath);
      results.webp = webpPath;
      results.savings = parseFloat(webpResult.savings);
      console.log(`  WebP: ${webpResult.savings}% smaller`);
    }
    
    // 2. Generate responsive sizes (if requested)
    if (options.generateSizes) {
      const sizePreset = options.sizes || getSizePreset(filename);
      const sizeResults = await generateSizes(inputPath, dir, sizePreset);
      results.sizes = sizeResults;
      console.log(`  Sizes: ${sizeResults.map(s => s.size).join(', ')}`);
    }
    
    // 3. Generate blur placeholder (if requested)
    if (options.generateBlur) {
      const blur = await generateBlurPlaceholder(inputPath);
      results.blur = blur;
      console.log(`  Blur: ${blur.length} chars`);
    }
    
    return results;
  } catch (error) {
    console.error(`  Error: ${error.message}`);
    return null;
  }
}

/**
 * Generate manifest of optimized images
 */
async function generateManifest(results, outputPath) {
  const manifest = {
    generated: new Date().toISOString(),
    images: results.filter(Boolean).map(r => ({
      original: r.original,
      webp: r.webp,
      sizes: r.sizes.map(s => ({ width: s.size, path: s.path })),
      blur: r.blur,
      savings: r.savings,
    })),
    totalSavings: results.filter(Boolean).reduce((sum, r) => sum + (r.savings || 0), 0) / results.length,
  };
  
  await fs.writeFile(outputPath, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest written to: ${outputPath}`);
  
  return manifest;
}

/**
 * Main execution
 */
async function main() {
  const targetDir = process.argv[2] || 'public';
  const absoluteDir = path.resolve(process.cwd(), targetDir);
  
  console.log('='.repeat(50));
  console.log('Image Optimization Script');
  console.log('='.repeat(50));
  console.log(`Target directory: ${absoluteDir}`);
  
  // Check if directory exists
  try {
    await fs.access(absoluteDir);
  } catch {
    console.error(`Directory not found: ${absoluteDir}`);
    process.exit(1);
  }
  
  // Get all image files
  const images = await getImageFiles(absoluteDir);
  console.log(`Found ${images.length} images to process`);
  
  if (images.length === 0) {
    console.log('No images to process');
    return;
  }
  
  // Process each image
  const results = [];
  for (const image of images) {
    const result = await processImage(image, {
      generateSizes: false, // Set to true for responsive images
      generateBlur: false,  // Set to true for blur placeholders
    });
    results.push(result);
  }
  
  // Generate manifest
  const manifestPath = path.join(absoluteDir, 'image-manifest.json');
  const manifest = await generateManifest(results, manifestPath);
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('Summary');
  console.log('='.repeat(50));
  console.log(`Processed: ${results.filter(Boolean).length}/${images.length} images`);
  console.log(`Average savings: ${manifest.totalSavings.toFixed(1)}%`);
  console.log('Done!');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { processImage, convertToWebP, generateSizes, generateBlurPlaceholder };
