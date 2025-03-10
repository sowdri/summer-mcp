/**
 * Get Active Tab Bridge
 * Bridge for handling active tab retrieval requests
 */
import { Response } from "express";
import { BrowserTab } from "@summer-mcp/core";
import { Bridge } from "./Bridge";

/**
 * Bridge for active tab retrieval requests
 */
export class GetActiveTabBridge extends Bridge<BrowserTab> {
  constructor() {
    super("Timeout waiting for active tab data");
  }
}

// Create singleton instance
export const getActiveTabBridge = new GetActiveTabBridge();

/**
 * Register a new active tab retrieval request
 * @param res Express response object
 * @param timeoutMs Timeout in milliseconds
 * @returns Request ID
 */
export function registerGetActiveTabRequest(res: Response, timeoutMs = 5000): string {
  return getActiveTabBridge.registerRequest(res, timeoutMs);
}

/**
 * Handle active tab response from websocket
 * @param data Active tab data
 */
export function handleGetActiveTabResponse(data: BrowserTab): void {
  getActiveTabBridge.resolveRequests(data);
} 