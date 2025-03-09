import { build } from 'esbuild';
import { existsSync, mkdirSync, rmSync } from 'fs';

console.log('🚀 Building MCP server...');

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
  external: ['express'],
  sourcemap: true,
  minify: process.env.NODE_ENV === 'production',
};

// Start the build
console.log('Starting esbuild...');
build(buildOptions)
  .then(() => {
    console.log('✅ MCP server build complete!');
  })
  .catch(error => {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }); 