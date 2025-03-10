import {
  attachDebugger,
  isDebuggerAttached,
} from "../services/debugger/manager";
import { sendMessage } from "../services/websocket/connection";

/**
 * Start console monitoring for a tab
 * @param tabId The ID of the tab to monitor
 */
export function startConsoleMonitoring(tabId: number): void {
  console.debug(
    `[Console Monitor] Starting console monitoring for tab: ${tabId}`
  );

  // Ensure debugger is attached
  if (!isDebuggerAttached(tabId)) {
    console.debug(
      `[Console Monitor] Debugger not attached for tab: ${tabId}, attaching now`
    );
    attachDebugger(tabId);
  }

  // Request console messages
  chrome.debugger.sendCommand({ tabId }, "Console.enable", {}, (result) => {
    if (chrome.runtime.lastError) {
      console.error(
        `[Console Monitor] Error enabling console: ${chrome.runtime.lastError.message}`
      );

      // Send error to aggregator
      sendMessage("console-monitor-error", {
        tabId,
        error: chrome.runtime.lastError.message,
        timestamp: new Date().toISOString(),
      });

      return;
    }

    chrome.debugger.sendCommand(
      { tabId },
      "Console.clearMessages",
      {},
      (clearResult) => {
        if (chrome.runtime.lastError) {
          console.error(
            `[Console Monitor] Error clearing console: ${chrome.runtime.lastError.message}`
          );
        } else {
          console.debug(
            `[Console Monitor] Console monitoring started successfully for tab: ${tabId}`
          );

          // Send success to aggregator
          sendMessage("console-monitor-status", {
            tabId,
            status: "started",
            timestamp: new Date().toISOString(),
          });
        }
      }
    );
  });
}

/**
 * Stop console monitoring for a tab
 * @param tabId The ID of the tab to stop monitoring
 */
export function stopConsoleMonitoring(tabId: number): void {
  console.debug(
    `[Console Monitor] Stopping console monitoring for tab: ${tabId}`
  );

  if (!isDebuggerAttached(tabId)) {
    console.debug(
      `[Console Monitor] Debugger not attached for tab: ${tabId}, nothing to stop`
    );
    return;
  }

  chrome.debugger.sendCommand({ tabId }, "Console.disable", {}, (result) => {
    if (chrome.runtime.lastError) {
      console.error(
        `[Console Monitor] Error disabling console: ${chrome.runtime.lastError.message}`
      );
    } else {
      console.debug(
        `[Console Monitor] Console monitoring stopped successfully for tab: ${tabId}`
      );

      // Send status to aggregator
      sendMessage("console-monitor-status", {
        tabId,
        status: "stopped",
        timestamp: new Date().toISOString(),
      });
    }
  });
}
