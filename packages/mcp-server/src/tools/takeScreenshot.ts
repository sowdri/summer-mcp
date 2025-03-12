// eslint-disable-next-line no-restricted-imports
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TakeScreenshotResponse, TakeScreenshotErrorResponse } from "@summer-mcp/core";
// eslint-disable-next-line no-restricted-imports
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";

// Aggregator server port
const AGGREGATOR_PORT = process.env.AGGREGATOR_PORT || 3001;

export function registerTakeScreenshotTool(server: McpServer) {
  const handler: ToolCallback = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:${AGGREGATOR_PORT}/take-screenshot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({})
        }
      );

      // Log the response status and headers for debugging
      console.log(`Screenshot response status: ${response.status}`);
      console.log(
        `Screenshot response headers:`,
        Object.fromEntries(response.headers.entries())
      );

      // Try to parse the response as JSON
      let result: TakeScreenshotResponse | TakeScreenshotErrorResponse;
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
        // Success response
        const screenshotData = (result as TakeScreenshotResponse).data;
        const contentType = (result as TakeScreenshotResponse).contentType || "image/png";
        
        return {
          content: [
            {
              type: "image",
              data: screenshotData,
              mimeType: contentType
            }
          ],
        };
      } else {
        // Error response
        const errorData = result as TakeScreenshotErrorResponse;
        return {
          content: [
            {
              type: "text",
              text: `Failed to take screenshot: ${errorData.error || "Unknown error"}. ${errorData.message || ""}`,
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
  };

  server.tool(
    "takeScreenshot",
    "Take a screenshot of the current browser tab",
    handler
  );
} 