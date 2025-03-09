# Summer-MCP

An MCP server for use with Cursor AI to interact with Chrome Web Browser to enable the following:

## Features

- Screenshot capture directly into Cursor AI context
- Console logs capture via Chrome Debugger API
- Network requests monitoring via Chrome Debugger API
- DOM snapshots via Chrome Tabs API
- Browser tabs listing with IDs

## Simplified Architecture

Summer-MCP consists of three main components that work together:

```
Browser → Browser Extension → Aggregator Server → MCP Server → AI Model
```

1. **Browser Extension**: Collects data from the browser (console logs, screenshots, tab info)
2. **Aggregator Server**: Stores browser data and acts as a middleman
3. **MCP Server**: Provides tools for AI models to access browser data

### How It Works

1. **Data Collection**:

   - The browser extension monitors browser activity
   - When something happens (error, network request, etc.), it sends the data to the aggregator

2. **Data Storage**:

   - The aggregator server stores all the browser data in memory
   - It organizes the data into categories (console logs, network requests, etc.)

3. **AI Access**:
   - AI models can use MCP tools like `getConsoleLogs` or `takeScreenshot`
   - These tools fetch data from the aggregator server
   - The AI gets the information in a structured format

### Available Tools

- **getConsoleLogs**: View all browser console logs
- **getConsoleErrors**: View only error messages from the console
- **getNetworkErrorLogs**: View network request errors
- **getNetworkSuccessLogs**: View successful network requests
- **takeScreenshot**: Capture the current browser view
- **getSelectedElement**: Get information about the selected DOM element
- **getBrowserTabs**: List all open browser tabs with their IDs
- **wipeLogs**: Clear all logs from memory

## Component Details

### MCP Server

The MCP server is responsible for:

- Receiving commands from Cursor AI
- Processing data from the browser extension via the aggregator server
- Returning browser data to Cursor AI

### Aggregator Server

The aggregator server is responsible for:

- Handling WebSocket connections from the browser extension
- Storing and organizing browser data
- Providing HTTP endpoints for the MCP server
- Sending commands to the browser extension

### Browser Extension

The browser extension is a background-only extension that provides:

- Screenshot capture via Chrome Tabs API
- Console logs monitoring via Chrome Debugger API
- Network requests tracking via Chrome Debugger API
- DOM element inspection and snapshots via Chrome Debugger API
- Browser tabs listing with IDs

This extension operates entirely in the background without using content scripts or popup interfaces. It leverages Chrome's powerful Debugger API to monitor and interact with web pages.

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
2. Start the aggregator server:
   ```
   npm run start:aggregator
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
- Build aggregator server: `npm run build:aggregator`
- Build browser extension: `npm run build:extension`

### Starting Services

- Start MCP server: `npm run start:mcp`
- Start aggregator server: `npm run start:aggregator`

For the browser extension, after building, you'll need to load it in Chrome's extension page and reload it when you make changes.
