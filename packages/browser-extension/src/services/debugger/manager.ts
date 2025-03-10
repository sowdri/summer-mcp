import { DEBUGGER_PROTOCOL_VERSION } from "../../config/constants";
import { DebuggerConnection } from "../../types/interfaces";

// Map to track debugger connections
export const debuggerConnections: Map<number, DebuggerConnection> = new Map();

/**
 * Attach debugger to a tab
 * @param tabId The ID of the tab to attach to
 * @returns Whether the debugger was attached successfully
 */
export function attachDebugger(tabId: number): boolean {
  if (
    debuggerConnections.has(tabId) &&
    debuggerConnections.get(tabId)?.attached
  ) {
    return true; // Already attached
  }

  chrome.debugger.attach({ tabId }, DEBUGGER_PROTOCOL_VERSION, () => {
    if (chrome.runtime.lastError) {
      console.error("Failed to attach debugger:", chrome.runtime.lastError);
      return false;
    }

    console.log("Debugger attached to tab:", tabId);
    debuggerConnections.set(tabId, { tabId, attached: true });

    // Enable necessary debugger domains
    chrome.debugger.sendCommand({ tabId }, "Network.enable", {});
    chrome.debugger.sendCommand({ tabId }, "Console.enable", {});
    chrome.debugger.sendCommand({ tabId }, "DOM.enable", {});
  });

  return true;
}

/**
 * Detach debugger from a tab
 * @param tabId The ID of the tab to detach from
 * @returns Whether the debugger was detached successfully
 */
export function detachDebugger(tabId: number): boolean {
  if (
    !debuggerConnections.has(tabId) ||
    !debuggerConnections.get(tabId)?.attached
  ) {
    return true; // Already detached
  }

  chrome.debugger.detach({ tabId }, () => {
    if (chrome.runtime.lastError) {
      console.error("Failed to detach debugger:", chrome.runtime.lastError);
      return false;
    }

    console.log("Debugger detached from tab:", tabId);
    debuggerConnections.set(tabId, { tabId, attached: false });
  });

  return true;
}

/**
 * Check if debugger is attached to a tab
 * @param tabId The ID of the tab to check
 * @returns Whether the debugger is attached
 */
export function isDebuggerAttached(tabId: number): boolean {
  return (
    debuggerConnections.has(tabId) &&
    debuggerConnections.get(tabId)?.attached === true
  );
}

/**
 * Attach debugger to all existing tabs
 * This will automatically attach the debugger to all existing tabs
 */
export function attachDebuggerToAllTabs(): void {
  console.debug("[Debugger] Attaching debugger to all existing tabs");
  
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) {
        attachDebugger(tab.id);
      }
    });
    console.debug(`[Debugger] Attached to ${tabs.length} tabs`);
  });
}
