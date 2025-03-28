import { build, context } from 'esbuild';
import { existsSync, mkdirSync, rmSync } from 'fs';

console.log('🚀 Building Node.js server...');

// Check if watch mode is enabled
const isWatchMode = process.argv.includes('--watch');
if (isWatchMode) {
  console.log('Watch mode enabled, will rebuild on changes...');
}

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
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  outdir: 'dist',
  format: 'esm',
  external: ['express', 'ws', 'axios', 'sharp'],
  sourcemap: true,
  minify: process.env.NODE_ENV === 'production',
};

// Start the build
console.log('Starting esbuild...');

if (isWatchMode) {
  context(buildOptions)
    .then(ctx => {
      return ctx.watch();
    })
    .then(() => {
      console.log('✅ Node.js server build complete!');
      console.log('👀 Watching for changes...');
    })
    .catch(error => {
      console.error('❌ Build failed:', error);
      process.exit(1);
    });
} else {
  build(buildOptions)
    .then(() => {
      console.log('✅ Node.js server build complete!');
    })
    .catch(error => {
      console.error('❌ Build failed:', error);
      process.exit(1);
    });
} 