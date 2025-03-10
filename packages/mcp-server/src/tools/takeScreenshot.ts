// eslint-disable-next-line no-restricted-imports
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Aggregator server port
const AGGREGATOR_PORT = process.env.AGGREGATOR_PORT || 3001;

export function registerTakeScreenshotTool(server: McpServer) {
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
} 