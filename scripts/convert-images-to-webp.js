#!/usr/bin/env node
/**
 * Convert PNG images to WebP format
 * This script converts the perch diagram images to WebP for better compression
 */

import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicDir = join(__dirname, '..', 'public', 'images');

const images = [
  { input: 'perches-ne.png', output: 'perches-ne.webp' },
  { input: 'perches-sw.png', output: 'perches-sw.webp' },
];

async function convertImages() {
  console.log('Converting images to WebP format...\n');

  for (const { input, output } of images) {
    const inputPath = join(publicDir, input);
    const outputPath = join(publicDir, output);

    try {
      const info = await sharp(inputPath)
        .webp({ quality: 85, effort: 6 }) // High quality, high compression effort
        .toFile(outputPath);

      const inputSize = (await sharp(inputPath).metadata()).size;
      const reduction = ((1 - info.size / inputSize) * 100).toFixed(1);

      console.log(`✓ ${input} → ${output}`);
      console.log(
        `  ${(inputSize / 1024 / 1024).toFixed(2)}MB → ${(info.size / 1024 / 1024).toFixed(2)}MB (${reduction}% reduction)\n`
      );
    } catch (error) {
      console.error(`✗ Failed to convert ${input}:`, error.message);
      process.exit(1);
    }
  }

  console.log('✓ All images converted successfully!');
}

convertImages();
