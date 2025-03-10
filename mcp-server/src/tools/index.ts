import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerGetConsoleLogsTool } from "./getConsoleLogs.js";
import { registerGetConsoleErrorsTool } from "./getConsoleErrors.js";
import { registerGetNetworkErrorLogsTool } from "./getNetworkErrorLogs.js";
import { registerGetNetworkSuccessLogsTool } from "./getNetworkSuccessLogs.js";
import { registerTakeScreenshotTool } from "./takeScreenshot.js";
import { registerGetActiveBrowserTabTool } from "./getActiveBrowserTab.js";
import { registerGetBrowserTabsTool } from "./getBrowserTabs.js";
import { registerActivateTabTool } from "./activateTab.js";
import { registerWipeLogsTool } from "./wipeLogs.js";

export function registerAllTools(server: McpServer) {
  registerGetConsoleLogsTool(server);
  registerGetConsoleErrorsTool(server);
  registerGetNetworkErrorLogsTool(server);
  registerGetNetworkSuccessLogsTool(server);
  registerTakeScreenshotTool(server);
  registerGetActiveBrowserTabTool(server);
  registerGetBrowserTabsTool(server);
  registerActivateTabTool(server);
  registerWipeLogsTool(server);
} 