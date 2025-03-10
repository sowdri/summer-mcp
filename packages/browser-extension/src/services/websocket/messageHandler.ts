import { startConsoleMonitoring } from "../../features/console";
import { getDomSnapshot } from "../../features/dom";
import { startNetworkMonitoring } from "../../features/network";
import { takeScreenshot } from "../../features/screenshot";
import { activateBrowserTab, getActiveBrowserTab, listBrowserTabs } from "../../features/tabs";
import { ServerCommand } from "../../types/interfaces";

// Define command types as an enum to match the server
export enum BrowserCommand {
  LIST_BROWSER_TABS = "listBrowserTabs",
  GET_ACTIVE_BROWSER_TAB = "getActiveBrowserTab",
  ACTIVATE_BROWSER_TAB = "activateBrowserTab",
  TAKE_SCREENSHOT = "takeScreenshot",
  GET_CONSOLE_LOGS = "getConsoleLogs",
  GET_CONSOLE_ERRORS = "getConsoleErrors",
  GET_NETWORK_REQUESTS = "getNetworkRequests",
  GET_SELECTED_ELEMENT = "getSelectedElement",
  CLEAR_LOGS = "clearLogs"
}

/**
 * Handle commands received from the server
 * @param message The message received from the server
 */
export function handleServerCommand(message: ServerCommand): void {

  // Debug log to track incoming commands
  console.log("Received server command:", message);

  // Handle commands that don't require an active tab
  if (message.command === BrowserCommand.LIST_BROWSER_TABS) {
    listBrowserTabs();
    return;
  }
  
  if (message.command === BrowserCommand.GET_ACTIVE_BROWSER_TAB) {
    getActiveBrowserTab();
    return;
  }
  
  if (message.command === BrowserCommand.ACTIVATE_BROWSER_TAB && message.params?.tabId) {
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
      case BrowserCommand.TAKE_SCREENSHOT:
        takeScreenshot(tabId);
        break;
      case BrowserCommand.GET_CONSOLE_LOGS:
        startConsoleMonitoring(tabId);
        break;
      case BrowserCommand.GET_NETWORK_REQUESTS:
        startNetworkMonitoring(tabId);
        break;
      case BrowserCommand.GET_SELECTED_ELEMENT:
        getDomSnapshot(tabId);
        break;
      default:
        console.log("Unknown command:", message.command);
    }
  });
}
