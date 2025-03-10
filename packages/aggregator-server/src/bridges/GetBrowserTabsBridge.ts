/**
 * Get Browser Tabs Bridge
 * Bridge for handling browser tabs retrieval requests
 */
import { Response } from "express";
import { BrowserTabsMessage, GetBrowserTabsResponse } from "@summer-mcp/core";
import { Bridge } from "./Bridge";

/**
 * Convert BrowserTabsMessage to GetBrowserTabsResponse
 * @param message Browser tabs message from WebSocket
 * @returns GetBrowserTabsResponse for HTTP response
 */
function convertBrowserTabsMessageToResponse(message: BrowserTabsMessage): GetBrowserTabsResponse {
  return {
    tabs: message.data,
    timestamp: typeof message.timestamp === 'number' 
      ? message.timestamp 
      : Date.now()
  };
}

/**
 * Bridge for browser tabs retrieval requests
 */
export class GetBrowserTabsBridge extends Bridge<BrowserTabsMessage, GetBrowserTabsResponse> {
  constructor() {
    super("Timeout waiting for browser tabs data", convertBrowserTabsMessageToResponse);
  }
}

// Create singleton instance
export const getBrowserTabsBridge = new GetBrowserTabsBridge();

/**
 * Register a new browser tabs retrieval request
 * @param res Express response object
 * @param timeoutMs Timeout in milliseconds
 * @returns Request ID
 */
export function registerGetBrowserTabsRequest(res: Response, timeoutMs = 5000): string {
  return getBrowserTabsBridge.registerRequest(res, timeoutMs);
}

/**
 * Handle browser tabs response from websocket
 * @param message Browser tabs message from WebSocket
 */
export function handleGetBrowserTabsResponse(message: BrowserTabsMessage): void {
  getBrowserTabsBridge.resolveRequests(message);
} 