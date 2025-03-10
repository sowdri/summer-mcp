import { sendMessage } from "../services/websocket/connection";
import { BrowserWebSocketSendMessageType } from "../types/interfaces";

/**
 * List all browser tabs with their IDs
 * Returns a list of all open tabs with their IDs, URLs, and titles
 */
export function listBrowserTabs(): void {
  chrome.tabs.query({}, (tabs) => {
    const tabsList = tabs.map((tab) => ({
      id: tab.id,
      url: tab.url,
      title: tab.title,
      active: tab.active,
      windowId: tab.windowId,
      index: tab.index,
    }));

    sendMessage(BrowserWebSocketSendMessageType.BROWSER_TABS, tabsList);
    console.log("Sent browser tabs list:", tabsList.length, "tabs");
  });
}

/**
 * Get the active browser tab
 * Returns information about the currently active tab
 */
export function getActiveBrowserTab(): void {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      console.error("No active tab found");
      return;
    }

    const activeTab = tabs[0];
    const tabInfo = {
      id: activeTab.id,
      url: activeTab.url,
      title: activeTab.title,
      windowId: activeTab.windowId,
      index: activeTab.index,
    };

    sendMessage(BrowserWebSocketSendMessageType.ACTIVE_TAB, tabInfo);
    console.log("Sent active tab info:", tabInfo.url);
  });
}

/**
 * Activate a browser tab by ID
 * @param tabId The ID of the tab to activate
 */
export function activateBrowserTab(tabId: string): void {
  const numericTabId = parseInt(tabId, 10);
  
  if (isNaN(numericTabId)) {
    const errorMessage = `Invalid tab ID: ${tabId}`;
    console.error(errorMessage);
    
    // Send error response
    sendMessage(BrowserWebSocketSendMessageType.ACTIVATE_TAB_RESULT, {
      success: false,
      error: errorMessage,
    });
    return;
  }

  chrome.tabs.update(numericTabId, { active: true }, (tab) => {
    const success = !!tab;
    const response = {
      success,
      tabId: numericTabId,
      error: success ? undefined : `Failed to activate tab ${tabId}`,
    };

    sendMessage(BrowserWebSocketSendMessageType.ACTIVATE_TAB_RESULT, response);
    console.log(
      success ? "Tab activated successfully" : "Failed to activate tab",
      tabId
    );
  });
}
