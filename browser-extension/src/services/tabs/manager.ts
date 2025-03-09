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

/**
 * Initialize tab event listeners
 */
export function initTabEventListeners(): void {
  // Handle tab removal
  chrome.tabs.onRemoved.addListener(handleTabRemoved);

  // Handle browser action click (extension icon)
  chrome.action.onClicked.addListener(handleActionClicked);
}

/**
 * Handle tab removal
 * @param tabId The ID of the removed tab
 */
function handleTabRemoved(tabId: number): void {
  if (debuggerConnections.has(tabId)) {
    detachDebugger(tabId);
    debuggerConnections.delete(tabId);
  }
}

/**
 * Handle browser action click (extension icon)
 * @param tab The tab that was clicked
 */
function handleActionClicked(tab: chrome.tabs.Tab): void {
  if (!tab.id) return;

  const tabId = tab.id;

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
    takeScreenshot(tabId);
    startConsoleMonitoring(tabId);
    startNetworkMonitoring(tabId);
    getDomSnapshot(tabId);
  }
}
