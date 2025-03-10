/**
 * Get Browser Tabs Bridge
 * Bridge for handling browser tabs retrieval requests
 */
import { Response } from "express";
import { BrowserTabsResponse } from "@summer-mcp/core";
import { Bridge } from "./Bridge";

/**
 * Bridge for browser tabs retrieval requests
 */
export class GetBrowserTabsBridge extends Bridge<BrowserTabsResponse> {
  constructor() {
    super("Timeout waiting for browser tabs data");
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
 * @param data Browser tabs response data
 */
export function handleGetBrowserTabsResponse(data: BrowserTabsResponse): void {
  getBrowserTabsBridge.resolveRequests(data);
} 