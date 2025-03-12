import { sendMessage } from "../websocket/messageSender";
import { BrowserMessageType, DomSnapshotMessage, GetDomSnapshotCommand } from "@summer-mcp/core";

// Define the type for the result of the executeScript function
interface DomSnapshotResult {
  html: string;
  title: string;
  url: string;
}

// Maximum size for HTML content (500KB)
const MAX_HTML_SIZE = 500 * 1024;

/**
 * Get DOM snapshot for a tab using content scripts
 * @param tabIdOrCommand The ID of the tab to get the DOM snapshot from or the entire command object
 */
export function getDomSnapshot(tabIdOrCommand: number | GetDomSnapshotCommand): void {
  // Extract tabId from either the number or the command object
  const tabId = typeof tabIdOrCommand === 'number' 
    ? tabIdOrCommand 
    : parseInt(tabIdOrCommand.params.tabId, 10);
  
  console.debug(`[DOM Snapshot] Getting DOM snapshot for tab: ${tabId}`);
  
  try {
    chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        // This function runs in the context of the web page
        // Keep it simple - just return the HTML, title, and URL
        try {
          return {
            html: document.documentElement.outerHTML,
            title: document.title,
            url: window.location.href
          };
        } catch (error) {
          // If that fails, return a minimal HTML with the error
          return {
            html: `<html><body><p>Error capturing DOM: ${String(error)}</p></body></html>`,
            title: document.title || 'Error',
            url: window.location.href || 'unknown'
          };
        }
      }
    }, (results) => {
      console.log("📸 DOM snapshot results", results);
      if (chrome.runtime.lastError) {
        const errorMessage = `❌ Error getting DOM snapshot: ${chrome.runtime.lastError.message}`;
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
      
      try {
        // Get the HTML and check its size
        let html = snapshot.html;
        const originalSize = html.length;
        console.debug(`[DOM Snapshot] Original HTML size: ${originalSize} bytes`);
        
        // Limit the size of the HTML content if it's too large
        if (html.length > MAX_HTML_SIZE) {
          console.warn(`[DOM Snapshot] HTML content too large (${html.length} bytes), truncating to ${MAX_HTML_SIZE} bytes`);
          html = html.substring(0, MAX_HTML_SIZE) + '\n<!-- HTML content truncated due to size limit -->';
        }
        
        // Send the successful snapshot to the server
        const message: DomSnapshotMessage = {
          type: BrowserMessageType.DOM_SNAPSHOT,
          data: {
            html: html
            // We don't include title and url in the data as they're not part of the interface
          },
          tabId,
          timestamp: Date.now(),
          success: true // Mark as successful
        };
        
        sendMessage(message);
        console.debug(`[DOM Snapshot] Successfully captured DOM snapshot for tab: ${tabId} (${snapshot.title}), size: ${html.length} bytes`);
      } catch (processingError) {
        const errorMessage = `Error processing DOM snapshot: ${String(processingError)}`;
        console.error(`[DOM Snapshot] ${errorMessage}`);
        sendErrorMessage(errorMessage, tabId);
      }
    });
  } catch (error) {
    const errorMessage = `Exception getting DOM snapshot: ${String(error)}`;
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