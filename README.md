# Summer MCP - Browser Monitoring and Control Platform

A monorepo for the Summer MCP (Monitoring and Control Platform) project, which provides tools for monitoring and controlling web browsers.

## Packages

- **@summer-mcp/core**: Shared types and utilities
- **@summer-mcp/browser-extension**: Chrome extension for browser monitoring and control
- **@summer-mcp/aggregator-server**: Server for aggregating and processing browser data
- **@summer-mcp/mcp-server**: MCP server for Cursor AI browser integration

## Development

This project uses pnpm for package management and workspace handling.

### Setup

```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run development mode for all packages
pnpm dev
```

### Project Structure

```
summer-mcp/
├── packages/
│   ├── core/                 # Shared types and utilities
│   ├── browser-extension/    # Chrome extension
│   ├── aggregator-server/    # Aggregator server
│   └── mcp-server/           # MCP server
├── package.json              # Root package.json
└── pnpm-workspace.yaml       # pnpm workspace configuration
```

## Architecture

The project consists of four main components:

1. **Browser Extension**: A Chrome extension that monitors browser activity and sends data to the aggregator server.
2. **Aggregator Server**: A server that receives data from the browser extension, processes it, and provides an API for accessing it.
3. **MCP Server**: A server that implements the Model Context Protocol for Cursor AI integration.
4. **Core Package**: Shared types and utilities used by all components.

### Communication Flow

```
┌─────────────────┐     WebSocket     ┌─────────────────┐
│                 │  ServerCommands   │                 │
│     Browser     │ ◄───────────────► │   Aggregator    │
│    Extension    │  BrowserMessages  │     Server      │
│                 │                   │                 │
└─────────────────┘                   └─────────────────┘
```

- **ServerCommands**: Commands sent from the aggregator server to the browser extension
- **BrowserMessages**: Messages sent from the browser extension to the aggregator server

## License

MIT
