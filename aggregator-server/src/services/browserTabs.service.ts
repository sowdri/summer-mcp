/**
 * Browser Tabs Service
 * Handles communication between HTTP requests and WebSocket responses
 */
import { Response } from "express";
import { BrowserTabsResponse } from "../types/index.js";

// Interface for pending request entry
interface PendingTabRequest {
  res: Response;
  timeout: NodeJS.Timeout;
}

// Store pending requests with their response objects
const pendingTabRequests = new Map<string, PendingTabRequest>();

/**
 * Register a new browser tabs request
 * @param res Express response object
 * @param timeoutMs Timeout in milliseconds
 * @returns Request ID
 */
export function registerTabsRequest(res: Response, timeoutMs = 5000): string {
  // Generate a unique request ID
  const requestId = Date.now().toString();

  // Set a timeout to handle the case when no response is received
  const timeout = setTimeout(() => {
    // If the request is still pending when timeout occurs
    if (pendingTabRequests.has(requestId)) {
      pendingTabRequests.delete(requestId);
      res.status(504).json({ error: "Timeout waiting for browser tabs data" });
    }
  }, timeoutMs);

  // Store the response object and timeout
  pendingTabRequests.set(requestId, { res, timeout });

  return requestId;
}

/**
 * Handle browser tabs response from websocket
 * @param data Browser tabs data
 */
export function handleBrowserTabsResponse(data: BrowserTabsResponse): void {
  // Resolve all pending requests as they all need the same data
  for (const [requestId, { res, timeout }] of pendingTabRequests.entries()) {
    // Clear the timeout
    clearTimeout(timeout);

    // Send the response
    res.json(data);

    // Remove from pending requests
    pendingTabRequests.delete(requestId);
  }
}
