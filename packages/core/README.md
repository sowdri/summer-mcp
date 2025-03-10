# @summer-mcp/core

This package contains shared types and utilities for the Summer MCP (Monitoring and Control Platform) project.

## Types

### Server Commands

Types for commands sent from the aggregator server to the browser extension:

- `ServerCommandType` - Enum of all possible command types
- `ServerCommand` - Union type of all possible server commands
- `ServerMessage` - Union type of all possible server messages (commands + connection status)

### Browser Messages

Types for messages sent from the browser extension to the aggregator server:

- `BrowserMessageType` - Enum of all possible message types
- `BrowserMessage` - Union type of all possible browser messages

## Utilities

### Type Guards

Type guard functions for type-safe message handling:

- `isBrowserMessageType` - Check if a message is a specific browser message type
- `isServerCommandType` - Check if a message is a specific server command type
- `isConnectionStatusMessage` - Check if a message is a connection status message

## Usage

```typescript
import {
  ServerCommandType,
  BrowserMessageType,
  isServerCommandType,
  isBrowserMessageType,
} from "@summer-mcp/core";

// Handle a server command
function handleServerMessage(message: ServerMessage) {
  if (isServerCommandType(message, ServerCommandType.TAKE_SCREENSHOT)) {
    // TypeScript knows this is a TakeScreenshotCommand
    console.log("Taking screenshot");
  }
}

// Send a browser message
function sendBrowserMessage(message: BrowserMessage) {
  if (isBrowserMessageType(message, BrowserMessageType.SCREENSHOT)) {
    // TypeScript knows this is a ScreenshotMessage
    console.log(
      "Sending screenshot data:",
      message.data.substring(0, 20) + "..."
    );
  }
}
```
