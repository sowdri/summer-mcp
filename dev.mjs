import { spawn } from 'child_process';
import { existsSync, mkdirSync, rmSync } from 'fs';
import path from 'path';

console.log('🚀 Starting development environment...');

// Track child processes
const processes = [];
let aggregatorServerProcess = null;

// Function to start the extension watcher
function startExtensionWatcher() {
  console.log('\n👀 Setting up watch for browser-extension...');
  
  const extensionDir = path.join(process.cwd(), 'browser-extension');
  const buildScriptPath = path.join(extensionDir, 'build.mjs');
  
  if (!existsSync(buildScriptPath)) {
    console.error('❌ Build script not found for browser-extension');
    return false;
  }
  
  try {
    // Initial build
    console.log('🔨 Building browser extension...');
    const buildProcess = spawn('node', ['build.mjs'], {
      stdio: 'inherit',
      shell: true,
      cwd: extensionDir
    });
    
    // Set up file watcher using nodemon
    const watchProcess = spawn('npx', ['nodemon', '--watch', 'src', '--ext', 'ts,js,html,css,json', '--exec', 'node build.mjs'], {
      stdio: 'inherit',
      shell: true,
      cwd: extensionDir
    });
    
    processes.push(watchProcess);
    
    watchProcess.on('error', (error) => {
      console.error(`\n❌ Error watching browser-extension: ${error.message}\n`);
    });
    
    return true;
  } catch (error) {
    console.error(`\n❌ Error setting up watch for browser-extension: ${error.message}\n`);
    return false;
  }
}

// Function to start the MCP server watcher
function startMcpWatcher() {
  console.log('\n👀 Setting up watch for mcp-server...');
  
  const mcpDir = path.join(process.cwd(), 'mcp-server');
  const buildScriptPath = path.join(mcpDir, 'build.mjs');
  
  if (!existsSync(buildScriptPath)) {
    console.error('❌ Build script not found for mcp-server');
    return false;
  }
  
  try {
    // Initial build
    console.log('🔨 Building MCP server...');
    const buildProcess = spawn('node', ['build.mjs'], {
      stdio: 'inherit',
      shell: true,
      cwd: mcpDir
    });
    
    // Set up file watcher using nodemon
    const watchProcess = spawn('npx', ['nodemon', '--watch', 'src', '--ext', 'ts,js', '--exec', 'node build.mjs'], {
      stdio: 'inherit',
      shell: true,
      cwd: mcpDir
    });
    
    processes.push(watchProcess);
    
    watchProcess.on('error', (error) => {
      console.error(`\n❌ Error watching mcp-server: ${error.message}\n`);
    });
    
    return true;
  } catch (error) {
    console.error(`\n❌ Error setting up watch for mcp-server: ${error.message}\n`);
    return false;
  }
}

// Function to start or restart the aggregator server
function startAggregatorServer() {
  if (aggregatorServerProcess) {
    console.log('🔄 Restarting aggregator server...');
    aggregatorServerProcess.kill();
  } else {
    console.log('🚀 Starting aggregator server...');
  }

  const aggregatorDir = path.join(process.cwd(), 'aggregator-server');
  const serverPath = path.join(aggregatorDir, 'dist', 'index.js');
  
  aggregatorServerProcess = spawn('node', ['dist/index.js'], {
    stdio: 'inherit',
    shell: true,
    cwd: aggregatorDir
  });

  aggregatorServerProcess.on('error', (error) => {
    console.error(`❌ Aggregator server error: ${error.message}`);
  });

  aggregatorServerProcess.on('exit', (code, signal) => {
    if (signal !== 'SIGTERM') {
      console.log(`⚠️ Aggregator server process exited with code ${code}`);
    }
  });
  
  processes.push(aggregatorServerProcess);
}

// Function to start the aggregator server in dev mode
async function startAggregatorDev() {
  console.log('\n🚀 Setting up dev mode for aggregator-server...');
  
  const aggregatorDir = path.join(process.cwd(), 'aggregator-server');
  const distDir = path.join(aggregatorDir, 'dist');
  
  // Ensure dist directory exists
  if (!existsSync(distDir)) {
    console.log('Creating dist directory...');
    mkdirSync(distDir, { recursive: true });
  } else {
    console.log('Cleaning dist directory...');
    rmSync(distDir, { recursive: true, force: true });
    mkdirSync(distDir, { recursive: true });
  }
  
  try {
    // Initial build and start
    console.log('🔨 Building aggregator server...');
    const buildProcess = spawn('node', ['build.mjs'], {
      stdio: 'inherit',
      shell: true,
      cwd: aggregatorDir
    });
    
    // Wait for the build to complete
    buildProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Initial aggregator server build completed');
        // Start the server after the initial build
        startAggregatorServer();
      } else {
        console.error('❌ Initial aggregator server build failed');
      }
    });
    
    // Set up file watcher using nodemon
    const watchProcess = spawn('npx', ['nodemon', '--watch', 'src', '--ext', 'ts,js', '--exec', 'node build.mjs'], {
      stdio: 'inherit',
      shell: true,
      cwd: aggregatorDir
    });
    
    processes.push(watchProcess);
    
    // When the build completes, restart the server
    watchProcess.stdout?.on('data', (data) => {
      const output = data.toString();
      if (output.includes('server build complete')) {
        startAggregatorServer();
      }
    });
    
    watchProcess.on('error', (error) => {
      console.error(`\n❌ Error watching aggregator-server: ${error.message}\n`);
    });
    
    console.log('👀 Watching aggregator server for file changes...');
    
    return true;
  } catch (error) {
    console.error('❌ Aggregator server development mode failed:', error);
    return false;
  }
}

// Start all watchers
const extensionStarted = startExtensionWatcher();
const mcpStarted = startMcpWatcher();

// Start aggregator dev mode (this is async)
startAggregatorDev().then(aggregatorStarted => {
  // Check if all components started successfully
  if (extensionStarted && mcpStarted && aggregatorStarted) {
    console.log('\n✅ Development environment started successfully!');
    console.log('👀 Watching all components for changes.');
    console.log('🔄 The aggregator server is running and will restart on changes.');
    console.log('🛑 Press Ctrl+C to stop all processes.\n');
  } else {
    console.error('\n⚠️ Some components failed to start. Check the logs above for details.');
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping all processes...');
  
  // Kill all child processes
  for (const proc of processes) {
    if (proc && typeof proc.kill === 'function') {
      proc.kill('SIGTERM');
    }
  }
  
  console.log('👋 Development environment stopped.');
  process.exit(0);
}); 