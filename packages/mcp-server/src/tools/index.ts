// eslint-disable-next-line no-restricted-imports
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerGetNetworkErrorLogsTool } from "./getNetworkErrorLogs";
import { registerGetNetworkSuccessLogsTool } from "./getNetworkSuccessLogs";
import { registerGetNetworkRequestsTool } from "./getNetworkRequests";
import { registerTakeScreenshotTool } from "./takeScreenshot";
import { registerGetActiveBrowserTabTool } from "./getActiveBrowserTab";
import { registerGetBrowserTabsTool } from "./getBrowserTabs";
import { registerActivateTabTool } from "./activateTab";
import { registerGetDomSnapshotTool } from "./getDomSnapshot";

export function registerAllTools(server: McpServer) {
  // Register the new unified network requests tool
  registerGetNetworkRequestsTool(server);
  
  // Register legacy tools for backward compatibility
  registerGetNetworkErrorLogsTool(server);
  registerGetNetworkSuccessLogsTool(server);
  
  // Register other tools
  registerTakeScreenshotTool(server);
  registerGetActiveBrowserTabTool(server);
  registerGetBrowserTabsTool(server);
  registerActivateTabTool(server);
  registerGetDomSnapshotTool(server);
} 