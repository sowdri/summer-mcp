import {
  attachDebugger,
  isDebuggerAttached,
} from "../services/debugger/manager";
import { sendMessage } from "../services/websocket/messageSender";
import { 
  BrowserMessageType, 
  NetworkMonitorErrorMessage, 
  NetworkMonitorStatusMessage 
} from "@summer-mcp/core";

/**
 * Start network monitoring for a tab
 * @param tabId The ID of the tab to monitor
 */
export function startNetworkMonitoring(tabId: number): void {
  console.debug(
    `[Network Monitor] Starting network monitoring for tab: ${tabId}`
  );

  // Ensure debugger is attached
  if (!isDebuggerAttached(tabId)) {
    console.debug(
      `[Network Monitor] Debugger not attached for tab: ${tabId}, attaching now`
    );
    attachDebugger(tabId);
  }

  // Request network events
  chrome.debugger.sendCommand({ tabId }, "Network.enable", {}, (result) => {
    if (chrome.runtime.lastError) {
      console.error(
        `[Network Monitor] Error enabling network: ${chrome.runtime.lastError.message}`
      );

      // Send error to aggregator
      const message: NetworkMonitorErrorMessage = {
        type: BrowserMessageType.NETWORK_MONITOR_ERROR,
        data: {
          tabId,
          error: chrome.runtime.lastError?.message || "Unknown error",
          timestamp: Date.now()
        },
        tabId,
        timestamp: Date.now()
      };
      sendMessage(message);

      return;
    }

    console.debug(
      `[Network Monitor] Network monitoring started successfully for tab: ${tabId}`
    );

    // Send success to aggregator
    const message: NetworkMonitorStatusMessage = {
      type: BrowserMessageType.NETWORK_MONITOR_STATUS,
      data: {
        tabId,
        status: "started",
        timestamp: Date.now()
      },
      tabId,
      timestamp: Date.now()
    };
    sendMessage(message);
  });
}

/**
 * Stop network monitoring for a tab
 * @param tabId The ID of the tab to stop monitoring
 */
export function stopNetworkMonitoring(tabId: number): void {
  console.debug(
    `[Network Monitor] Stopping network monitoring for tab: ${tabId}`
  );

  if (!isDebuggerAttached(tabId)) {
    console.debug(
      `[Network Monitor] Debugger not attached for tab: ${tabId}, nothing to stop`
    );
    return;
  }

  chrome.debugger.sendCommand({ tabId }, "Network.disable", {}, (result) => {
    if (chrome.runtime.lastError) {
      console.error(
        `[Network Monitor] Error disabling network: ${chrome.runtime.lastError.message}`
      );
    } else {
      console.debug(
        `[Network Monitor] Network monitoring stopped successfully for tab: ${tabId}`
      );

      // Send status to aggregator
      const message: NetworkMonitorStatusMessage = {
        type: BrowserMessageType.NETWORK_MONITOR_STATUS,
        data: {
          tabId,
          status: "stopped",
          timestamp: Date.now()
        },
        tabId,
        timestamp: Date.now()
      };
      sendMessage(message);
    }
  });
}
