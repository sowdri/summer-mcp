import { startConsoleMonitoring } from "../../features/console";
import { getDomSnapshot } from "../../features/dom";
import { startNetworkMonitoring } from "../../features/network";
import { takeScreenshot } from "../../features/screenshot";
import { activateBrowserTab, getActiveBrowserTab, listBrowserTabs } from "../../features/tabs";
import { ServerCommand, ServerCommandType } from "@summer-mcp/core";

// Handle commands received from the server
export function handleServerCommand(message: ServerCommand): void {

  // Debug log to track incoming commands
  console.log("Received server command:", message);

  // Handle commands that don't require an active tab
  if (message.command === ServerCommandType.LIST_BROWSER_TABS) {
    listBrowserTabs();
    return;
  }
  
  if (message.command === ServerCommandType.GET_ACTIVE_BROWSER_TAB) {
    getActiveBrowserTab();
    return;
  }
  
  if (message.command === ServerCommandType.ACTIVATE_BROWSER_TAB && message.params?.tabId) {
    activateBrowserTab(message.params.tabId);
    return;
  }

  // Handle commands that require an active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]?.id) {
      console.error("No active tab found");
      return;
    }

    const tabId = tabs[0].id;

    switch (message.command) {
      case ServerCommandType.TAKE_SCREENSHOT:
        takeScreenshot(tabId);
        break;
      case ServerCommandType.GET_CONSOLE_LOGS:
        startConsoleMonitoring(tabId);
        break;
      case ServerCommandType.GET_NETWORK_REQUESTS:
        startNetworkMonitoring(tabId);
        break;
      case ServerCommandType.GET_SELECTED_ELEMENT:
        getDomSnapshot(tabId);
        break;
      default:
        console.log("Unknown command:", message.command);
    }
  });
}
