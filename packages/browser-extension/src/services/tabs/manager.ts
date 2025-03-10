import { BADGE_COLORS, BADGE_TEXT } from "../../config/constants";
import { startConsoleMonitoring } from "../../features/console";
import { getDomSnapshot } from "../../features/dom";
import { startNetworkMonitoring } from "../../features/network";
import { takeScreenshot } from "../../features/screenshot";
import {
  attachDebugger,
  attachDebuggerToAllTabs,
  debuggerConnections,
  detachDebugger,
} from "../debugger/manager";
import { sendMessage } from "../../websocket/messageSender";
import { 
  BrowserMessageType, 
  ActiveTabMessage
} from "@summer-mcp/core";

// Track the currently active tab
let activeTabId: number | null = null;

/**
 * Initialize tab event listeners
 */
export function initTabEventListeners(): void {
  // Handle tab creation
  chrome.tabs.onCreated.addListener(handleTabCreated);

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

  // Attach debugger to all existing tabs
  attachDebuggerToAllTabs();

  console.debug("[Tab Manager] Tab event listeners initialized");
}

/**
 * Handle tab creation
 * @param tab The created tab
 */
function handleTabCreated(tab: chrome.tabs.Tab): void {
  if (!tab.id) return;
  
  const tabId = tab.id;
  console.debug(`[Tab Manager] Tab created: ${tabId}`);

  // Immediately attach debugger to the new tab
  if (!debuggerConnections.has(tabId) || !debuggerConnections.get(tabId)?.attached) {
    console.debug(`[Tab Manager] Attaching debugger to newly created tab: ${tabId}`);
    attachDebugger(tabId);
    chrome.action.setBadgeText({ tabId, text: BADGE_TEXT.CONNECTED });
    chrome.action.setBadgeBackgroundColor({ tabId, color: BADGE_COLORS.CONNECTED });
  }
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
 */
function handleTabUpdated(
  tabId: number,
  changeInfo: chrome.tabs.TabChangeInfo
): void {
  console.debug(`[Tab Manager] Tab updated: ${tabId}`, changeInfo);

  // If this is a new tab or page load, ensure debugger is attached
  if (changeInfo.status === "complete") {
    // Automatically attach debugger to the tab if not already attached
    if (!debuggerConnections.has(tabId) || !debuggerConnections.get(tabId)?.attached) {
      console.debug(`[Tab Manager] New page loaded in tab ${tabId}, attaching debugger`);
      attachDebugger(tabId);
      chrome.action.setBadgeText({ tabId, text: BADGE_TEXT.CONNECTED });
      chrome.action.setBadgeBackgroundColor({ tabId, color: BADGE_COLORS.CONNECTED });
    }
    
    // If this is the active tab, refresh monitoring
    if (activeTabId === tabId) {
      refreshMonitoring(tabId);
    }
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
  } else {
    attachDebugger(tabId);
    chrome.action.setBadgeText({ text: BADGE_TEXT.CONNECTED });
    chrome.action.setBadgeBackgroundColor({ color: BADGE_COLORS.CONNECTED });

    // Send initial data
    refreshMonitoring(tabId);
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

    const message: ActiveTabMessage = {
      type: BrowserMessageType.ACTIVE_TAB,
      data: {
        id: tabId,
        url: tab.url || "",
        title: tab.title || "",
        active: true,
        windowId: tab.windowId,
        index: tab.index,
        favIconUrl: tab.favIconUrl
      },
      tabId,
      timestamp: Date.now()
    };
    sendMessage(message);

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
