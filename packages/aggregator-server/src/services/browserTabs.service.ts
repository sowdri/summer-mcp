/**
 * Browser Tabs Service
 * Handles communication between HTTP requests and WebSocket responses
 */
import { Response } from "express";
import { BrowserTab, BrowserTabsResponse } from "@summer-mcp/core";

// Interface for pending request entry
interface PendingTabRequest {
  res: Response;
  timeout: NodeJS.Timeout;
}

// Store pending requests with their response objects
export const pendingTabRequests = new Map<string, PendingTabRequest>();

// Store pending active tab requests
export const pendingActiveTabRequests = new Map<string, PendingTabRequest>();

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

/**
 * Register a new active tab request
 * @param res Express response object
 * @param timeoutMs Timeout in milliseconds
 * @returns Request ID
 */
export function registerActiveTabRequest(res: Response, timeoutMs = 5000): string {
  // Generate a unique request ID
  const requestId = Date.now().toString();

  // Set a timeout to handle the case when no response is received
  const timeout = setTimeout(() => {
    // If the request is still pending when timeout occurs
    if (pendingActiveTabRequests.has(requestId)) {
      pendingActiveTabRequests.delete(requestId);
      res.status(504).json({ error: "Timeout waiting for active tab data" });
    }
  }, timeoutMs);

  // Store the response object and timeout
  pendingActiveTabRequests.set(requestId, { res, timeout });

  return requestId;
}

/**
 * Handle active tab response from websocket
 * @param data Active tab data
 */
export function handleActiveTabResponse(data: BrowserTab): void {
  // Resolve all pending requests as they all need the same data
  for (const [requestId, { res, timeout }] of pendingActiveTabRequests.entries()) {
    // Clear the timeout
    clearTimeout(timeout);

    // Send the response
    res.json(data);

    // Remove from pending requests
    pendingActiveTabRequests.delete(requestId);
  }
}
