import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

const components = [
  'mcp-server',
  'nodejs-server',
  'browser-extension'
];

console.log('🚀 Starting build process for all components...');

// Build each component sequentially
for (const component of components) {
  console.log(`\n🔨 Building ${component}...\n`);
  
  const buildScriptPath = path.join(process.cwd(), component, 'build.mjs');
  
  if (!existsSync(buildScriptPath)) {
    console.error(`❌ Build script not found for ${component}`);
    process.exit(1);
  }
  
  try {
    // Use spawnSync for synchronous execution
    const result = spawn('node', [buildScriptPath], {
      stdio: 'inherit',
      shell: true
    });
    
    // Wait for the process to complete
    result.on('close', (code) => {
      if (code !== 0) {
        console.error(`\n❌ ${component} build failed with code ${code}\n`);
        process.exit(1);
      } else {
        console.log(`\n✅ ${component} build completed successfully\n`);
        
        // Check if we've built all components
        if (component === components[components.length - 1]) {
          console.log('🎉 All components built successfully!');
        }
      }
    });
  } catch (error) {
    console.error(`\n❌ Error building ${component}: ${error.message}\n`);
    process.exit(1);
  }
} 