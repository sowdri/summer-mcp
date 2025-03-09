# Spiller MCP

An MCP server for use with Cursor AI to interact with Chrome Web Browser to enable the following:

## Features

- Screenshot capture directly into Cursor AI context
- Console logs capture via Chrome Debugger API
- Network requests monitoring via Chrome Debugger API
- DOM snapshots via Chrome Tabs API

## Architecture

Spiller consists of three main components:

1. **MCP Server**: Interfaces with Cursor AI to receive commands and return results
2. **Node.js Server**: Acts as a bridge between the MCP server and browser extension
3. **Browser Extension**: Background-only extension that uses Chrome's Debugger and Tabs APIs to interact with the browser without requiring content scripts

The extension operates entirely in the background, using Chrome's powerful debugging APIs to monitor and interact with web pages without injecting content scripts.

## Component Details

### MCP Server

The MCP server is responsible for:

- Receiving commands from Cursor AI
- Processing data from the browser extension via the Node.js server
- Returning browser data to Cursor AI

The MCP server provides APIs for:

- Screenshot capture
- Console logs monitoring via Chrome Debugger API
- Network requests tracking via Chrome Debugger API
- DOM snapshots via Chrome Debugger API

### Node.js Server

The Node.js server is responsible for:

- Handling WebSocket connections from the browser extension
- Processing and routing messages between components
- Maintaining state and session information
- Forwarding data to the MCP server

### Browser Extension

The browser extension is a background-only extension that provides:

- Screenshot capture via Chrome Tabs API
- Console logs monitoring via Chrome Debugger API
- Network requests tracking via Chrome Debugger API
- DOM element inspection and snapshots via Chrome Debugger API

This extension operates entirely in the background without using content scripts or popup interfaces. Instead, it leverages Chrome's powerful Debugger API to:

1. Attach to browser tabs
2. Monitor console messages, network requests, and DOM changes
3. Capture this information and send it to the Node.js server via WebSocket

The extension can be toggled on/off by clicking its icon in the Chrome toolbar. When active, it will:

- Show a green "ON" badge
- Automatically monitor the current tab
- Send data to the Node.js server

This approach provides several advantages:

- No need to inject code into web pages
- Access to lower-level browser information
- Ability to monitor pages that might block content scripts
- More reliable data collection

## Data Flow

1. Cursor AI sends a request to the MCP server
2. MCP server processes the request and communicates with the Node.js server
3. Node.js server sends commands to the browser extension via WebSocket
4. Browser extension uses Chrome's Debugger API to interact with the browser
5. Data is captured and sent back through the same path to Cursor AI

## Setup and Installation

### Prerequisites

- Node.js 16+
- npm or yarn
- Chrome browser

### Installation

This project uses npm workspaces to manage dependencies across all components. To install all dependencies:

1. Clone the repository
2. Install all dependencies with a single command:

   ```
   npm install
   ```

   This will install dependencies for the root project and all component packages.

3. Build all components:
   ```
   npm run build
   ```

### Running the Components

1. Start the MCP server:
   ```
   npm run start:mcp
   ```
2. Start the Node.js server:
   ```
   npm run start:nodejs
   ```
3. Load the browser extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `browser-extension/dist` directory
   - Click the extension icon in the toolbar to toggle monitoring on/off

## Development

Each component is a TypeScript project that uses esbuild for bundling:

### Project Structure

The project uses npm workspaces to manage dependencies:

- Root workspace contains shared dependencies and build scripts
- Each component has its own package.json with specific dependencies
- Installing dependencies at the root will install for all components

### Build Scripts

- Build all components: `npm run build`
- Build MCP server: `npm run build:mcp`
- Build Node.js server: `npm run build:nodejs`
- Build browser extension: `npm run build:extension`

### Starting Services

- Start MCP server: `npm run start:mcp`
- Start Node.js server: `npm run start:nodejs`

For the browser extension, after building, you'll need to load it in Chrome's extension page and reload it when you make changes.
