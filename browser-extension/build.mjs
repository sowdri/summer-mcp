import { exec } from 'child_process';
import { build } from 'esbuild';
import { cpSync, existsSync, mkdirSync, rmSync } from 'fs';
import { promisify } from 'util';

const execPromise = promisify(exec);

console.log('🚀 Building browser extension...');

// Ensure dist directory exists
if (!existsSync('./dist')) {
  console.log('Creating dist directory...');
  mkdirSync('./dist', { recursive: true });
} else {
  console.log('Cleaning dist directory...');
  rmSync('./dist', { recursive: true, force: true });
  mkdirSync('./dist', { recursive: true });
}

// Build options
const buildOptions = {
  entryPoints: ['src/background.ts'],
  bundle: true,
  outfile: 'dist/background.js',
  sourcemap: true,
  minify: process.env.NODE_ENV === 'production',
};

// Start the build
console.log('Starting esbuild...');
build(buildOptions)
  .then(() => {
    console.log('Build complete, copying assets...');
    copyAssets();
    console.log('✅ Browser extension build complete!');
  })
  .catch(error => {
    console.error('❌ Build failed:', error);
    process.exit(1);
  });

// Function to copy assets
function copyAssets() {
  try {
    // Create icons directory
    mkdirSync('./dist/icons', { recursive: true });

    // Copy static assets
    if (existsSync('./dist/icons')) {
      // If icons already exist in dist, don't overwrite them
      if (!existsSync('./dist/icons/icon16.png') && existsSync('./src/icons')) {
        console.log('No PNG icons found in dist, copying from src...');
        cpSync('./src/icons', './dist/icons', { recursive: true });
      }
    } else if (existsSync('./src/icons')) {
      // If dist/icons doesn't exist, copy from src
      cpSync('./src/icons', './dist/icons', { recursive: true });
    }
    
    // Copy manifest
    cpSync('./manifest.json', './dist/manifest.json');
  } catch (error) {
    console.error('❌ Failed to copy assets:', error);
    process.exit(1);
  }
} 