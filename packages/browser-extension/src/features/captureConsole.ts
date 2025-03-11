/// <reference types="chrome" />
import { BrowserMessageType, ConsoleLogsMessage } from "@summer-mcp/core";
import { sendMessage } from "../websocket/messageSender";

/**
 * Initialize console capture feature
 * Sets up event listeners for message handling
 */
export function initCaptureConsole(): void {
  console.debug("[Console Capture] Initializing console capture feature");
  
  // Set up message listener for console logs
  setupMessageListener();
  
  console.debug("[Console Capture] Console capture feature initialized");
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