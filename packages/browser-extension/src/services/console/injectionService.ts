import { sendMessage } from "../../websocket/messageSender";
import { BrowserMessageType, ConsoleLogsMessage } from "@summer-mcp/core";

// Track tabs where we've injected the script
const injectedTabs = new Set<number>();

/**
 * Inject console capture script into a tab
 * @param tabId The ID of the tab to inject into
 * @returns Promise that resolves to true if injected successfully
 */
export async function injectConsoleCapture(tabId: number): Promise<boolean> {
  // Skip if already injected
  if (injectedTabs.has(tabId)) {
    console.debug(`[Console Injection] Script already injected in tab: ${tabId}`);
    return true;
  }

  console.debug(`[Console Injection] Injecting console capture script into tab: ${tabId}`);

  try {
    // Inject the content script
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content-scripts/consoleCapture.js"]
    });

    // Set up message listener if not already set
    if (!chrome.runtime.onMessage.hasListeners()) {
      setupMessageListener();
    }

    // Mark as injected
    injectedTabs.add(tabId);
    console.debug(`[Console Injection] Script injected successfully in tab: ${tabId}`);
    return true;
  } catch (error) {
    console.error(`[Console Injection] Error injecting script: ${error}`);
    return false;
  }
}

/**
 * Remove tab from injected tabs list when closed
 * @param tabId The ID of the tab that was closed
 */
export function handleTabClosed(tabId: number): void {
  if (injectedTabs.has(tabId)) {
    injectedTabs.delete(tabId);
    console.debug(`[Console Injection] Removed tab ${tabId} from injected tabs list`);
  }
}

/**
 * Set up message listener for console logs from content script
 */
function setupMessageListener(): void {
  // Listen for messages from content script via content -> background bridge
  chrome.runtime.onMessage.addListener((message, sender) => {
    if (!sender.tab?.id) return;
    
    const tabId = sender.tab.id;
    
    if (message.source === 'summer-mcp-console-capture') {
      handleConsoleLog(tabId, message.data);
    }
  });

  // Set up window message listener in content script
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && injectedTabs.has(tabId)) {
      chrome.scripting.executeScript({
        target: { tabId },
        func: setupContentScriptMessageRelay
      });
    }
  });
}

/**
 * This function will be injected into the page to relay window.postMessage to chrome.runtime.sendMessage
 */
function setupContentScriptMessageRelay(): void {
  window.addEventListener('message', (event) => {
    // Only accept messages from the same frame
    if (event.source !== window) return;
    
    const message = event.data;
    
    // Check if this is a console capture message
    if (message && message.source === 'summer-mcp-console-capture') {
      // Forward to background script
      chrome.runtime.sendMessage(message);
    }
  }, false);
}

/**
 * Handle console log from content script
 * @param tabId The ID of the tab that generated the log
 * @param logData The log data
 */
function handleConsoleLog(tabId: number, logData: any): void {
  console.debug(`[Console Injection] Received console ${logData.level} from tab: ${tabId}`);
  
  // Format message for sending to aggregator
  const consoleMessage: ConsoleLogsMessage = {
    type: BrowserMessageType.CONSOLE_LOGS,
    data: [{
      level: logData.level,
      message: Array.isArray(logData.message) 
        ? logData.message.map((item: any) => JSON.stringify(item)).join(' ')
        : String(logData.message),
      timestamp: logData.timestamp
    }],
    tabId,
    timestamp: Date.now()
  };
  
  // Send to aggregator
  sendMessage(consoleMessage);
} 