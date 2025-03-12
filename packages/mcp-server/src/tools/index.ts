// eslint-disable-next-line no-restricted-imports
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerGetNetworkRequestsTool } from "./getNetworkRequests";
import { registerGetNetworkErrorsTool } from "./getNetworkErrors";
import { registerGetConsoleLogsTool } from "./getConsoleLogs";
import { registerGetConsoleErrorsAndWarningsTool } from "./getConsoleErrors";
import { registerTakeScreenshotTool } from "./takeScreenshot";
import { registerGetActiveBrowserTabTool } from "./getActiveBrowserTab";
import { registerGetBrowserTabsTool } from "./getBrowserTabs";
import { registerActivateTabTool } from "./activateTab";
import { registerGetDomSnapshotTool } from "./getDomSnapshot";

export function registerAllTools(server: McpServer) {
  // Register the network tools
  registerGetNetworkRequestsTool(server);
  registerGetNetworkErrorsTool(server);
  
  // Register the console tools
  registerGetConsoleLogsTool(server);
  registerGetConsoleErrorsAndWarningsTool(server);
  
  // Register other tools
  // registerTakeScreenshotTool(server);
  registerGetActiveBrowserTabTool(server);
  registerGetBrowserTabsTool(server);
  registerActivateTabTool(server);
  registerGetDomSnapshotTool(server);
} 