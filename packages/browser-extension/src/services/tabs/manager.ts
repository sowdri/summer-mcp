import { BADGE_COLORS, BADGE_TEXT } from "../../config/constants";
import { startConsoleMonitoring } from "../../features/console";
import { getDomSnapshot } from "../../features/dom";
import { startNetworkMonitoring } from "../../features/network";
import { takeScreenshot } from "../../features/screenshot";
import {
  attachDebugger,
  debuggerConnections,
  detachDebugger,
} from "../debugger/manager";
import { sendMessage } from "../websocket/connection";

// Track the currently active tab
let activeTabId: number | null = null;

/**
 * Initialize tab event listeners
 */
export function initTabEventListeners(): void {
  // Handle tab removal
  chrome.tabs.onRemoved.addListener(handleTabRemoved);

  // Handle browser action click (extension icon)
  chrome.action.onClicked.addListener(handleActionClicked);

  // Handle tab activation (switching between tabs)
  chrome.tabs.onActivated.addListener(handleTabActivated);

  // Handle tab updates (URL changes, page loads, etc.)
  chrome.tabs.onUpdated.addListener(handleTabUpdated);

  // Get the current active tab on startup
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0 && tabs[0].id) {
      const tabId = tabs[0].id;
      activeTabId = tabId;
      sendActiveTabInfo(tabId);
      console.debug(`[Tab Manager] Initial active tab: ${tabId}`);
    }
  });

  console.debug("[Tab Manager] Tab event listeners initialized");
}

/**
 * Handle tab removal
 * @param tabId The ID of the removed tab
 */
function handleTabRemoved(tabId: number): void {
  console.debug(`[Tab Manager] Tab removed: ${tabId}`);

  if (debuggerConnections.has(tabId)) {
    detachDebugger(tabId);
    debuggerConnections.delete(tabId);
  }

  // Send tab closed event to aggregator
  sendMessage("tab-event", {
    event: "removed",
    tabId,
    timestamp: new Date().toISOString(),
  });

  // If the active tab was removed, set activeTabId to null
  if (activeTabId === tabId) {
    activeTabId = null;
  }
}

/**
 * Handle tab activation (switching between tabs)
 * @param activeInfo Information about the activated tab
 */
function handleTabActivated(activeInfo: chrome.tabs.TabActiveInfo): void {
  const tabId = activeInfo.tabId;
  console.debug(`[Tab Manager] Tab activated: ${tabId}`);

  // Update active tab tracking
  activeTabId = tabId;

  // Send active tab information to aggregator
  sendActiveTabInfo(tabId);

  // If debugger is attached to this tab, refresh monitoring
  if (
    debuggerConnections.has(tabId) &&
    debuggerConnections.get(tabId)?.attached
  ) {
    refreshMonitoring(tabId);
  }
}

/**
 * Handle tab updates (URL changes, page loads, etc.)
 * @param tabId The ID of the updated tab
 * @param changeInfo Information about the change
 * @param tab The updated tab
 */
function handleTabUpdated(
  tabId: number,
  changeInfo: chrome.tabs.TabChangeInfo,
  tab: chrome.tabs.Tab
): void {
  console.debug(`[Tab Manager] Tab updated: ${tabId}`, changeInfo);

  // Send tab update event to aggregator
  sendMessage("tab-event", {
    event: "updated",
    tabId,
    changeInfo,
    tab,
    timestamp: new Date().toISOString(),
  });

  // If this is the active tab and it's completed loading, refresh monitoring
  if (
    activeTabId === tabId &&
    changeInfo.status === "complete" &&
    debuggerConnections.has(tabId) &&
    debuggerConnections.get(tabId)?.attached
  ) {
    refreshMonitoring(tabId);
  }
}

/**
 * Handle browser action click (extension icon)
 * @param tab The tab that was clicked
 */
function handleActionClicked(tab: chrome.tabs.Tab): void {
  if (!tab.id) return;

  const tabId = tab.id;
  console.debug(`[Tab Manager] Browser action clicked on tab: ${tabId}`);

  // Toggle debugger connection
  if (
    debuggerConnections.has(tabId) &&
    debuggerConnections.get(tabId)?.attached
  ) {
    detachDebugger(tabId);
    chrome.action.setBadgeText({ text: BADGE_TEXT.DISCONNECTED });
    chrome.action.setBadgeBackgroundColor({ color: BADGE_COLORS.DISCONNECTED });

    // Send debugger detached event
    sendMessage("debugger-event", {
      event: "detached",
      tabId,
      timestamp: new Date().toISOString(),
    });
  } else {
    attachDebugger(tabId);
    chrome.action.setBadgeText({ text: BADGE_TEXT.CONNECTED });
    chrome.action.setBadgeBackgroundColor({ color: BADGE_COLORS.CONNECTED });

    // Send initial data
    refreshMonitoring(tabId);

    // Send debugger attached event
    sendMessage("debugger-event", {
      event: "attached",
      tabId,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Send active tab information to the aggregator
 * @param tabId The ID of the active tab
 */
function sendActiveTabInfo(tabId: number): void {
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError) {
      console.error(
        `[Tab Manager] Error getting tab info: ${chrome.runtime.lastError.message}`
      );
      return;
    }

    sendMessage("active-tab", {
      tabId,
      url: tab.url,
      title: tab.title,
      favIconUrl: tab.favIconUrl,
      timestamp: new Date().toISOString(),
    });

    console.debug(`[Tab Manager] Active tab info sent: ${tabId} - ${tab.url}`);
  });
}

/**
 * Refresh monitoring for a tab
 * @param tabId The ID of the tab to refresh monitoring for
 */
function refreshMonitoring(tabId: number): void {
  takeScreenshot(tabId);
  startConsoleMonitoring(tabId);
  startNetworkMonitoring(tabId);
  getDomSnapshot(tabId);

  console.debug(`[Tab Manager] Monitoring refreshed for tab: ${tabId}`);
}
