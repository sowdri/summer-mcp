import { sendMessage } from "../websocket/messageSender";
import { 
  BrowserMessageType, 
  BrowserTabsMessage, 
  ActiveTabMessage, 
  ActivateTabResultMessage,
  BrowserTab
} from "@summer-mcp/core";

/**
 * List all browser tabs with their IDs
 * Returns a list of all open tabs with their IDs, URLs, and titles
 */
export function listBrowserTabs(): void {
  chrome.tabs.query({}, (tabs) => {
    const tabsList = tabs.map((tab) => ({
      id: tab.id || 0,
      url: tab.url || "",
      title: tab.title || "",
      active: tab.active,
      windowId: tab.windowId,
      index: tab.index,
      favIconUrl: tab.favIconUrl
    } as BrowserTab));

    const message: BrowserTabsMessage = {
      type: BrowserMessageType.BROWSER_TABS,
      data: tabsList,
      timestamp: Date.now()
    };

    sendMessage(message);
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
    const tabInfo: BrowserTab = {
      id: activeTab.id || 0,
      url: activeTab.url || "",
      title: activeTab.title || "",
      active: true,
      windowId: activeTab.windowId,
      index: activeTab.index,
      favIconUrl: activeTab.favIconUrl
    };

    const message: ActiveTabMessage = {
      type: BrowserMessageType.ACTIVE_TAB,
      data: tabInfo,
      timestamp: Date.now()
    };

    sendMessage(message);
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
    const message: ActivateTabResultMessage = {
      type: BrowserMessageType.ACTIVATE_TAB_RESULT,
      data: {
        success: false,
        tabId: undefined,
        error: errorMessage
      },
      timestamp: Date.now()
    };

    sendMessage(message);
    return;
  }

  chrome.tabs.update(numericTabId, { active: true }, (tab) => {
    const success = !!tab;
    
    const message: ActivateTabResultMessage = {
      type: BrowserMessageType.ACTIVATE_TAB_RESULT,
      data: {
        success,
        tabId: numericTabId,
        error: success ? undefined : `Failed to activate tab ${tabId}`
      },
      timestamp: Date.now()
    };

    sendMessage(message);
    console.log(
      success ? "Tab activated successfully" : "Failed to activate tab",
      tabId
    );
  });
}
