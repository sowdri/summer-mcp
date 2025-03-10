#!/usr/bin/env node

// eslint-disable-next-line no-restricted-imports
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
// eslint-disable-next-line no-restricted-imports
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAllTools } from "./tools/index";

// Create the MCP server
const server = new McpServer({
  name: "Summer-MCP Browser Tools",
  version: "1.0.0",
});

// Set the aggregator port for tools to use
process.env.AGGREGATOR_PORT = process.env.AGGREGATOR_PORT || "3001";

// Register all tools
registerAllTools(server);

// Start the server
(async () => {
  try {
    const transport = new StdioServerTransport();

    // Ensure stdout is only used for JSON messages
    const originalStdoutWrite = process.stdout.write.bind(process.stdout);
    // @ts-expect-error - We're intentionally overriding the write method with a simplified version
    process.stdout.write = (chunk, encoding, callback) => {
      // Only allow JSON messages to pass through
      if (typeof chunk === "string" && !chunk.startsWith("{")) {
        return true; // Silently skip non-JSON messages
      }
      return originalStdoutWrite(chunk, encoding, callback);
    };

    await server.connect(transport);
  } catch (error) {
    console.error("Failed to initialize MCP server:", error);
    process.exit(1);
  }
})();
