/// <reference types="chrome" />
import { BrowserMessageType, ConsoleLogsMessage } from "@summer-mcp/core";
import { sendMessage } from "../websocket/messageSender";

// Track tabs where we've injected the script
const injectedTabs = new Set<number>();

/**
 * Initialize console capture feature
 * Sets up event listeners for tab events
 */
export function initConsoleCapture(): void {
  console.debug("[Console Capture] Initializing console capture feature");
  
  // Set up message listener for console logs
  setupMessageListener();
  
  // Set up tab event listeners
  chrome.tabs.onCreated.addListener(handleTabCreated);
  chrome.tabs.onUpdated.addListener(handleTabUpdated);
  chrome.tabs.onRemoved.addListener(handleTabRemoved);
  
  // Inject into all existing tabs
  injectIntoExistingTabs();
  
  console.debug("[Console Capture] Console capture feature initialized");
}

/**
 * Inject console capture script into all existing tabs
 */
async function injectIntoExistingTabs(): Promise<void> {
  const tabs = await chrome.tabs.query({});
  
  for (const tab of tabs) {
    if (tab.id && tab.url && tab.url.startsWith('http')) {
      injectConsoleCapture(tab.id);
    }
  }
}

/**
 * Handle tab creation
 * @param tab The created tab
 */
function handleTabCreated(tab: chrome.tabs.Tab): void {
  if (!tab.id) return;
  
  // Wait for the tab to load before injecting
  // The actual injection will happen in the onUpdated listener
  console.debug(`[Console Capture] New tab created: ${tab.id}`);
}

/**
 * Handle tab updates
 * @param tabId The ID of the updated tab
 * @param changeInfo Information about the change
 * @param tab The updated tab
 */
function handleTabUpdated(
  tabId: number,
  changeInfo: chrome.tabs.TabChangeInfo,
  tab: chrome.tabs.Tab
): void {
  // Only inject when the page has completed loading
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    injectConsoleCapture(tabId);
  }
}

/**
 * Handle tab removal
 * @param tabId The ID of the removed tab
 */
function handleTabRemoved(tabId: number): void {
  if (injectedTabs.has(tabId)) {
    injectedTabs.delete(tabId);
    console.debug(`[Console Capture] Removed tab ${tabId} from injected tabs list`);
  }
}

/**
 * Inject console capture script into a tab
 * @param tabId The ID of the tab to inject into
 * @returns Promise that resolves to true if injected successfully
 */
async function injectConsoleCapture(tabId: number): Promise<boolean> {
  // Skip if already injected
  if (injectedTabs.has(tabId)) {
    console.debug(`[Console Capture] Script already injected in tab: ${tabId}`);
    return true;
  }

  console.debug(`[Console Capture] Injecting console capture script into tab: ${tabId}`);

  try {
    // Inject the content script
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content-scripts/consoleCapture.js"]
    });

    // Set up content script message relay
    await chrome.scripting.executeScript({
      target: { tabId },
      func: setupContentScriptMessageRelay
    });

    // Mark as injected
    injectedTabs.add(tabId);
    console.debug(`[Console Capture] Script injected successfully in tab: ${tabId}`);
    return true;
  } catch (error) {
    console.error(`[Console Capture] Error injecting script: ${error}`);
    return false;
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
function handleConsoleLog(tabId: number, logData: {
  level: string;
  message: unknown[];
  timestamp: number;
  url: string;
}): void {
  console.debug(`[Console Capture] Received console ${logData.level} from tab: ${tabId}`);
  
  // Format message for sending to aggregator
  const consoleMessage: ConsoleLogsMessage = {
    type: BrowserMessageType.CONSOLE_LOGS,
    data: [{
      level: logData.level,
      message: Array.isArray(logData.message) 
        ? logData.message.map((item: unknown) => JSON.stringify(item)).join(' ')
        : String(logData.message),
      timestamp: logData.timestamp
    }],
    tabId,
    timestamp: Date.now()
  };
  
  // Send to aggregator
  sendMessage(consoleMessage);
} 