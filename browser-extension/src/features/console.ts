import {
  attachDebugger,
  isDebuggerAttached,
} from "../services/debugger/manager";

/**
 * Start console monitoring for a tab
 * @param tabId The ID of the tab to monitor
 */
export function startConsoleMonitoring(tabId: number): void {
  // Ensure debugger is attached
  if (!isDebuggerAttached(tabId)) {
    attachDebugger(tabId);
  }

  // Request console messages
  chrome.debugger.sendCommand({ tabId }, "Console.enable", {}, () => {
    chrome.debugger.sendCommand({ tabId }, "Console.clearMessages", {});
    console.log("Console monitoring started");
  });
}
