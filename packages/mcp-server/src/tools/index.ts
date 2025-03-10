// eslint-disable-next-line no-restricted-imports
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerGetNetworkErrorLogsTool } from "./getNetworkErrorLogs";
import { registerGetNetworkSuccessLogsTool } from "./getNetworkSuccessLogs";
import { registerTakeScreenshotTool } from "./takeScreenshot";
import { registerGetActiveBrowserTabTool } from "./getActiveBrowserTab";
import { registerGetBrowserTabsTool } from "./getBrowserTabs";
import { registerActivateTabTool } from "./activateTab";

export function registerAllTools(server: McpServer) {
  registerGetNetworkErrorLogsTool(server);
  registerGetNetworkSuccessLogsTool(server);
  registerTakeScreenshotTool(server);
  registerGetActiveBrowserTabTool(server);
  registerGetBrowserTabsTool(server);
  registerActivateTabTool(server);
} 