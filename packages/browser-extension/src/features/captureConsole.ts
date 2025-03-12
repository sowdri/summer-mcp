/// <reference types="chrome" />
import { BrowserMessageType, ConsoleLogsMessage } from "@summer-mcp/core";
import { sendMessage } from "../websocket/messageSender";

// Store active debugger attachments
const activeDebuggerAttachments = new Set<number>();

/**
 * Initialize console capture feature
 * Sets up event listeners for message handling and tab events
 */
export function initCaptureConsole(): void {
  console.debug("[Console Capture] Initializing console capture feature");
  
  // Set up message listener for content script loaded notifications
  setupMessageListener();
  
  // Set up tab event listeners
  setupTabEventListeners();
  
  // Attach debugger to all existing tabs
  attachDebuggerToAllTabs();
  
  console.debug("[Console Capture] Console capture feature initialized");
}

/**
 * Set up message listener for content script loaded notifications
 */
function setupMessageListener(): void {
  chrome.runtime.onMessage.addListener((message, sender) => {
    if (!sender.tab?.id) return;
    
    const tabId = sender.tab.id;
    
    if (message.source === 'summer-mcp-console-capture' && message.action === 'content-script-loaded') {
      // Attach debugger to this tab if not already attached
      attachDebuggerToTab(tabId);
    }
  });
}

/**
 * Set up tab event listeners
 */
function setupTabEventListeners(): void {
  // Listen for tab creation
  chrome.tabs.onCreated.addListener((tab) => {
    if (tab.id) {
      // Wait a bit for the tab to initialize before attaching debugger
      setTimeout(() => attachDebuggerToTab(tab.id!), 500);
    }
  });
  
  // Listen for tab updates (URL changes)
  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'complete') {
      attachDebuggerToTab(tabId);
    }
  });
  
  // Listen for tab removal
  chrome.tabs.onRemoved.addListener((tabId) => {
    detachDebuggerFromTab(tabId);
  });
}

/**
 * Attach debugger to all existing tabs
 */
async function attachDebuggerToAllTabs(): Promise<void> {
  try {
    const tabs = await chrome.tabs.query({});
    
    for (const tab of tabs) {
      if (tab.id && tab.url && tab.url.startsWith('http')) {
        attachDebuggerToTab(tab.id);
      }
    }
  } catch (error) {
    console.error("[Console Capture] Error attaching debugger to all tabs:", error);
  }
}

/**
 * Attach debugger to a specific tab
 * @param tabId The ID of the tab to attach the debugger to
 */
function attachDebuggerToTab(tabId: number): void {
  // Skip if already attached
  if (activeDebuggerAttachments.has(tabId)) {
    return;
  }
  
  try {
    chrome.debugger.attach({ tabId }, "1.3", () => {
      if (chrome.runtime.lastError) {
        console.debug(`[Console Capture] Could not attach debugger to tab ${tabId}: ${chrome.runtime.lastError.message}`);
        return;
      }
      
      console.debug(`[Console Capture] Debugger attached to tab ${tabId}`);
      activeDebuggerAttachments.add(tabId);
      
      // Enable console events
      chrome.debugger.sendCommand({ tabId }, "Runtime.enable", {}, () => {
        if (chrome.runtime.lastError) {
          console.error(`[Console Capture] Error enabling Runtime for tab ${tabId}: ${chrome.runtime.lastError.message}`);
          return;
        }
        
        console.debug(`[Console Capture] Runtime enabled for tab ${tabId}`);
      });
    });
  } catch (error) {
    console.error(`[Console Capture] Error attaching debugger to tab ${tabId}:`, error);
  }
}

/**
 * Detach debugger from a specific tab
 * @param tabId The ID of the tab to detach the debugger from
 */
function detachDebuggerFromTab(tabId: number): void {
  if (!activeDebuggerAttachments.has(tabId)) {
    return;
  }
  
  try {
    chrome.debugger.detach({ tabId }, () => {
      if (chrome.runtime.lastError) {
        console.debug(`[Console Capture] Error detaching debugger from tab ${tabId}: ${chrome.runtime.lastError.message}`);
        return;
      }
      
      console.debug(`[Console Capture] Debugger detached from tab ${tabId}`);
      activeDebuggerAttachments.delete(tabId);
    });
  } catch (error) {
    console.error(`[Console Capture] Error detaching debugger from tab ${tabId}:`, error);
  }
}

/**
 * Send a console log to the aggregator server
 * @param tabId The ID of the tab that generated the log
 * @param level The log level (log, info, warn, error, debug)
 * @param message The log message
 */
function sendConsoleLog(tabId: number, level: string, message: string): void {
  // Format message for sending to aggregator
  const consoleMessage: ConsoleLogsMessage = {
    type: BrowserMessageType.CONSOLE_LOGS,
    data: [{
      level,
      message,
      timestamp: Date.now()
    }],
    tabId,
    timestamp: Date.now()
  };
  
  // Send to aggregator
  sendMessage(consoleMessage);
}

// Set up debugger event listeners
chrome.debugger.onEvent.addListener((debuggeeId, method, params) => {
  if (!debuggeeId.tabId) return;
  
  const tabId = debuggeeId.tabId;
  
  if (method === "Runtime.consoleAPICalled" && params) {
    try {
      // Use a type assertion with an index signature to avoid property access errors
      const paramsObj = params as { [key: string]: unknown };
      const type = String(paramsObj.type || 'log');
      
      // Handle args safely
      let args: Array<{ [key: string]: unknown }> = [];
      if (Array.isArray(paramsObj.args)) {
        args = paramsObj.args as Array<{ [key: string]: unknown }>;
      }
      
      // Convert args to string
      let message = "";
      if (args.length > 0) {
        message = args.map(arg => {
          if (arg.value !== undefined) {
            return String(arg.value);
          } else if (arg.description) {
            return String(arg.description);
          } else if (arg.type === 'object' && arg.preview) {
            try {
              return JSON.stringify(arg.preview);
            } catch {
              return '[Object]';
            }
          } else if (arg.type) {
            return String(arg.type);
          } else {
            return '[Unknown]';
          }
        }).join(' ');
      } else {
        message = '[No message content]';
      }
      
      // Send log directly to aggregator
      sendConsoleLog(tabId, type, message);
    } catch (error) {
      // Log the error and provide a fallback message
      console.error("[Console Capture] Error processing console event:", error);
      sendConsoleLog(tabId, "error", "[Console event could not be processed]");
    }
  }
});

// Handle debugger detach events
chrome.debugger.onDetach.addListener((debuggeeId, reason) => {
  if (!debuggeeId.tabId) return;
  
  const tabId = debuggeeId.tabId;
  
  console.debug(`[Console Capture] Debugger detached from tab ${tabId}, reason: ${reason}`);
  activeDebuggerAttachments.delete(tabId);
  
  // Try to reattach if the tab still exists
  chrome.tabs.get(tabId, (tab) => {
    if (!chrome.runtime.lastError && tab) {
      console.debug(`[Console Capture] Attempting to reattach debugger to tab ${tabId}`);
      setTimeout(() => attachDebuggerToTab(tabId), 1000);
    }
  });
}); 