import {
  attachDebugger,
  isDebuggerAttached,
} from "../services/debugger/manager";

/**
 * Start network monitoring for a tab
 * @param tabId The ID of the tab to monitor
 */
export function startNetworkMonitoring(tabId: number): void {
  // Ensure debugger is attached
  if (!isDebuggerAttached(tabId)) {
    attachDebugger(tabId);
  }

  // Request network events
  chrome.debugger.sendCommand({ tabId }, "Network.enable", {}, () => {
    console.log("Network monitoring started");
  });
}
