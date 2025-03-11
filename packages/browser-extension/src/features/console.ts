import { debuggerManager } from "../services/debugger/manager";
import { injectConsoleCapture } from "../services/console/injectionService";

/**
 * Start console monitoring for a tab
 * @param tabId The ID of the tab to monitor
 */
export async function startConsoleMonitoring(tabId: number): Promise<void> {
  console.debug(
    `[Console Monitor] Starting console monitoring for tab: ${tabId}`
  );

  // Use both approaches for redundancy
  // 1. Try to attach debugger (will fail if DevTools is open)
  let debuggerAttached = false;
  if (!debuggerManager.isDebuggerAttached(tabId)) {
    console.debug(
      `[Console Monitor] Debugger not attached for tab: ${tabId}, attaching now`
    );
    debuggerAttached = await debuggerManager.attachDebugger(tabId);
  } else {
    debuggerAttached = true;
  }

  if (debuggerAttached) {
    // Request console messages via debugger API
    chrome.debugger.sendCommand({ tabId }, "Console.enable", {}, () => {
      if (chrome.runtime.lastError) {
        console.error(
          `[Console Monitor] Error enabling console via debugger: ${chrome.runtime.lastError.message}`
        );
      } else {
        chrome.debugger.sendCommand(
          { tabId },
          "Console.clearMessages",
          {},
          () => {
            if (chrome.runtime.lastError) {
              console.error(
                `[Console Monitor] Error clearing console: ${chrome.runtime.lastError.message}`
              );
            } else {
              console.debug(
                `[Console Monitor] Console monitoring via debugger started successfully for tab: ${tabId}`
              );
            }
          }
        );
      }
    });
  }

  // 2. Always inject the content script as a fallback
  // This will work even if DevTools is open
  const injected = await injectConsoleCapture(tabId);
  if (injected) {
    console.debug(
      `[Console Monitor] Console monitoring via script injection started successfully for tab: ${tabId}`
    );
  } else {
    console.error(
      `[Console Monitor] Failed to start console monitoring via script injection for tab: ${tabId}`
    );
  }

  console.debug(
    `[Console Monitor] Console monitoring setup complete for tab: ${tabId}`
  );
}

/**
 * Stop console monitoring for a tab
 * @param tabId The ID of the tab to stop monitoring
 */
export function stopConsoleMonitoring(tabId: number): void {
  console.debug(
    `[Console Monitor] Stopping console monitoring for tab: ${tabId}`
  );

  // Disable debugger-based monitoring if attached
  if (debuggerManager.isDebuggerAttached(tabId)) {
    chrome.debugger.sendCommand({ tabId }, "Console.disable", {}, () => {
      if (chrome.runtime.lastError) {
        console.error(
          `[Console Monitor] Error disabling console via debugger: ${chrome.runtime.lastError.message}`
        );
      } else {
        console.debug(
          `[Console Monitor] Console monitoring via debugger stopped successfully for tab: ${tabId}`
        );
      }
    });
  }

  // Note: We can't remove the injected script, but it will be removed when the tab is closed
  console.debug(
    `[Console Monitor] Console monitoring stopped for tab: ${tabId}`
  );
}
