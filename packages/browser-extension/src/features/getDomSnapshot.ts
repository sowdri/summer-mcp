import { sendMessage } from "../websocket/messageSender";
import { BrowserMessageType, DomSnapshotMessage } from "@summer-mcp/core";

// Define the type for the result of the executeScript function
interface DomSnapshotResult {
  html: string;
  title: string;
  url: string;
}

/**
 * Get DOM snapshot for a tab using content scripts
 * @param tabId The ID of the tab to get the DOM snapshot from
 */
export function getDomSnapshot(tabId: number): void {
  console.debug(`[DOM Snapshot] Getting DOM snapshot for tab: ${tabId}`);
  
  try {
    chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        // This function runs in the context of the web page
        return {
          html: document.documentElement.outerHTML,
          title: document.title,
          url: window.location.href
        };
      }
    }, (results) => {
      if (chrome.runtime.lastError) {
        const errorMessage = `Error getting DOM snapshot: ${chrome.runtime.lastError.message}`;
        console.error(`[DOM Snapshot] ${errorMessage}`);
        sendErrorMessage(errorMessage, tabId);
        return;
      }

      if (!results || !results[0]) {
        const errorMessage = "No results returned from executeScript";
        console.error(`[DOM Snapshot] ${errorMessage}`);
        sendErrorMessage(errorMessage, tabId);
        return;
      }

      const snapshot = results[0].result as DomSnapshotResult;
      
      // Send the successful snapshot to the server
      const message: DomSnapshotMessage = {
        type: BrowserMessageType.DOM_SNAPSHOT,
        data: {
          html: snapshot.html
          // We don't include title and url in the data as they're not part of the interface
        },
        tabId,
        timestamp: Date.now(),
        success: true // Mark as successful
      };
      
      sendMessage(message);
      console.debug(`[DOM Snapshot] Successfully captured DOM snapshot for tab: ${tabId} (${snapshot.title})`);
    });
  } catch (error) {
    const errorMessage = `Exception getting DOM snapshot: ${error}`;
    console.error(`[DOM Snapshot] ${errorMessage}`);
    sendErrorMessage(errorMessage, tabId);
  }
}

/**
 * Send an error message for DOM snapshot
 * @param errorMessage The error message
 * @param tabId The tab ID
 */
function sendErrorMessage(errorMessage: string, tabId: number): void {
  const message: DomSnapshotMessage = {
    type: BrowserMessageType.DOM_SNAPSHOT,
    data: {
      html: "" // Empty HTML for error case
    },
    tabId,
    timestamp: Date.now(),
    success: false, // Mark as failed
    error: errorMessage // Include the error message
  };
  
  sendMessage(message);
} 