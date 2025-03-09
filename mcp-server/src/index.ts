#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Create the MCP server
const server = new McpServer({
  name: "Summer-MCP Browser Tools",
  version: "1.0.0",
});

// Aggregator server port
const AGGREGATOR_PORT = process.env.AGGREGATOR_PORT || 3001;

// Console logs tool
server.tool("getConsoleLogs", "Check our browser logs", async () => {
  const response = await fetch(
    `http://127.0.0.1:${AGGREGATOR_PORT}/console-logs`
  );
  const json = await response.json();
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(json, null, 2),
      },
    ],
  };
});

// Console errors tool
server.tool(
  "getConsoleErrors",
  "Check our browsers console errors",
  async () => {
    const response = await fetch(
      `http://127.0.0.1:${AGGREGATOR_PORT}/console-errors`
    );
    const json = await response.json();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(json, null, 2),
        },
      ],
    };
  }
);

// Network error logs tool
server.tool("getNetworkErrorLogs", "Check our network ERROR logs", async () => {
  const response = await fetch(
    `http://127.0.0.1:${AGGREGATOR_PORT}/network-errors`
  );
  const json = await response.json();
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(json, null, 2),
      },
    ],
  };
});

// Network success logs tool
server.tool(
  "getNetworkSuccessLogs",
  "Check our network SUCCESS logs",
  async () => {
    const response = await fetch(
      `http://127.0.0.1:${AGGREGATOR_PORT}/network-success`
    );
    const json = await response.json();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(json, null, 2),
        },
      ],
    };
  }
);

// Screenshot tool
server.tool(
  "takeScreenshot",
  "Take a screenshot of the current browser tab",
  async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:${AGGREGATOR_PORT}/capture-screenshot`,
        {
          method: "POST",
        }
      );

      // Log the response status and headers for debugging
      console.log(`Screenshot response status: ${response.status}`);
      console.log(
        `Screenshot response headers:`,
        Object.fromEntries(response.headers.entries())
      );

      // Try to parse the response as JSON
      let result;
      try {
        result = await response.json();
        console.log("Screenshot response parsed successfully");
      } catch (parseError) {
        console.error("Error parsing screenshot response:", parseError);
        const text = await response.text();
        console.log("Raw response text:", text.substring(0, 100) + "...");
        return {
          content: [
            {
              type: "text",
              text: `Error parsing screenshot response: ${parseError}`,
            },
          ],
        };
      }

      if (response.ok) {
        // Check if we have the expected data structure
        if (result && result.data) {
          console.log("Screenshot data received, length:", result.data.length);
          const contentType = result.contentType || "image/png";

          return {
            content: [
              {
                type: "image",
                data: result.data,
                mimeType: contentType,
              },
            ],
          };
        } else {
          console.log(
            "Unexpected response structure:",
            JSON.stringify(result).substring(0, 100) + "..."
          );
          return {
            content: [
              {
                type: "text",
                text: `Screenshot taken but unexpected response format: ${JSON.stringify(
                  result
                )}`,
              },
            ],
          };
        }
      } else {
        return {
          content: [
            {
              type: "text",
              text: `Error taking screenshot: ${
                result.error || "Unknown error"
              }`,
            },
          ],
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("Screenshot error:", errorMessage);
      return {
        content: [
          {
            type: "text",
            text: `Failed to take screenshot: ${errorMessage}`,
          },
        ],
      };
    }
  }
);

// Get selected element tool
server.tool(
  "getSelectedElement",
  "Get the selected element from the browser",
  async () => {
    const response = await fetch(
      `http://127.0.0.1:${AGGREGATOR_PORT}/selected-element`
    );
    const json = await response.json();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(json, null, 2),
        },
      ],
    };
  }
);

// Browser tabs tool
server.tool(
  "getBrowserTabs",
  "Get the list of open browser tabs with their IDs",
  async () => {
    const response = await fetch(
      `http://127.0.0.1:${AGGREGATOR_PORT}/browser-tabs`
    );
    const json = await response.json();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(json, null, 2),
        },
      ],
    };
  }
);

// Wipe logs tool
server.tool("wipeLogs", "Wipe all browser logs from memory", async () => {
  const response = await fetch(`http://127.0.0.1:${AGGREGATOR_PORT}/wipelogs`, {
    method: "POST",
  });
  const json = await response.json();
  return {
    content: [
      {
        type: "text",
        text: json.message,
      },
    ],
  };
});

// Start the MCP server
// try {
//   const transport = new StdioServerTransport();
//   await server.connect(transport);
//   console.error("MCP server started and ready to receive commands");
// } catch (error) {
//   console.error("Failed to initialize MCP server:", error);
//   process.exit(1);
// }
(async () => {
  try {
    const transport = new StdioServerTransport();

    // Ensure stdout is only used for JSON messages
    const originalStdoutWrite = process.stdout.write.bind(process.stdout);
    process.stdout.write = (chunk: any, encoding?: any, callback?: any) => {
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
