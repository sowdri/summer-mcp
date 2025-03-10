import { sendMessage } from "../services/websocket/connection";

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

    sendMessage("browser-tabs", tabsList);
    console.log("Sent browser tabs list:", tabsList.length, "tabs");
  });
}

/**
 * Get the currently active browser tab
 * Returns information about the active tab in the current window
 */
export function getActiveBrowserTab(): void {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const activeTab = {
        id: tabs[0].id,
        url: tabs[0].url,
        title: tabs[0].title,
        windowId: tabs[0].windowId,
        index: tabs[0].index,
      };
      
      sendMessage("active-tab", activeTab);
      console.log("Sent active tab info:", activeTab.title);
    } else {
      sendMessage("active-tab", null);
      console.log("No active tab found");
    }
  });
}

/**
 * Set a specific browser tab as active (focused)
 * @param tabId The ID of the tab to activate
 */
export function activateBrowserTab(tabId: number): void {
  chrome.tabs.update(tabId, { active: true }, (tab) => {
    if (chrome.runtime.lastError) {
      sendMessage("activate-tab-result", { 
        success: false, 
        error: chrome.runtime.lastError.message 
      });
      console.error("Failed to activate tab:", chrome.runtime.lastError.message);
    } else {
      sendMessage("activate-tab-result", { 
        success: true, 
        tabId: tab?.id 
      });
      console.log("Set tab as active:", tab?.id);
    }
  });
}
