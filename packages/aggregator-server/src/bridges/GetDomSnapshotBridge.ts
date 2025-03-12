/**
 * GetDomSnapshotBridge
 * Bridge for handling DOM snapshot requests and responses
 */
import { Response } from "express";
import { Bridge } from "./Bridge";
import { 
  DomSnapshotMessage, 
  GetDomSnapshotResponse, 
  GetDomSnapshotErrorResponse 
} from "@summer-mcp/core";

/**
 * Convert DomSnapshotMessage to GetDomSnapshotResponse
 * @param message DOM snapshot message from WebSocket
 * @returns GetDomSnapshotResponse for HTTP response
 */
function convertDomSnapshotMessageToResponse(message: DomSnapshotMessage): GetDomSnapshotResponse | GetDomSnapshotErrorResponse {
  if (message.success === false) {
    return {
      error: message.error || "Unknown error",
      success: false
    };
  }
  
  try {
    // Check if HTML content is present
    if (!message.data || !message.data.html) {
      return {
        error: "No HTML content in DOM snapshot",
        success: false
      };
    }
    
    // Create a summary if the HTML is very large
    const html = message.data.html;
    const htmlLength = html.length;
    
    // Log the size for debugging
    console.log(`DOM snapshot HTML size: ${htmlLength} bytes`);
    
    return {
      html: html,
      success: true,
      timestamp: typeof message.timestamp === 'string' ? Date.parse(message.timestamp) : message.timestamp
    };
  } catch (error) {
    console.error("Error converting DOM snapshot message to response:", error);
    return {
      error: "Error processing DOM snapshot",
      message: error instanceof Error ? error.message : String(error),
      success: false
    };
  }
}

/**
 * Bridge for DOM snapshot requests
 */
export class GetDomSnapshotBridge extends Bridge<DomSnapshotMessage, GetDomSnapshotResponse | GetDomSnapshotErrorResponse> {
  constructor() {
    super("Timeout waiting for DOM snapshot", convertDomSnapshotMessageToResponse);
  }
}

// Create singleton instance
export const domSnapshotBridge = new GetDomSnapshotBridge();

/**
 * Register a new DOM snapshot request
 * @param res Express response object
 * @param timeoutMs Timeout in milliseconds
 * @returns Request ID
 */
export function registerDomSnapshotRequest(res: Response, timeoutMs = 5000): string {
  return domSnapshotBridge.registerRequest(res, timeoutMs);
}

/**
 * Handle DOM snapshot response from websocket
 * @param message DOM snapshot message from the browser extension
 */
export function handleDomSnapshotResponse(message: DomSnapshotMessage): void {
  domSnapshotBridge.resolveRequests(message);
}

/**
 * Get the DOM snapshot bridge instance
 * @returns DOM snapshot bridge instance
 */
export function getDomSnapshotBridge(): GetDomSnapshotBridge {
  return domSnapshotBridge;
} 