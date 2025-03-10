/**
 * Get Active Tab Bridge
 * Bridge for handling active tab retrieval requests
 */
import { Response } from "express";
import { ActiveTabMessage, GetActiveTabResponse } from "@summer-mcp/core";
import { Bridge } from "./Bridge";

/**
 * Convert ActiveTabMessage to GetActiveTabResponse
 * @param message Active tab message from WebSocket
 * @returns GetActiveTabResponse for HTTP response
 */
function convertActiveTabMessageToResponse(message: ActiveTabMessage): GetActiveTabResponse {
  return {
    ...message.data,
    timestamp: typeof message.timestamp === 'number' 
      ? message.timestamp 
      : Date.now()
  };
}

/**
 * Bridge for active tab retrieval requests
 */
export class GetActiveTabBridge extends Bridge<ActiveTabMessage, GetActiveTabResponse> {
  constructor() {
    super("Timeout waiting for active tab data", convertActiveTabMessageToResponse);
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
 * @param message Active tab message from WebSocket
 */
export function handleGetActiveTabResponse(message: ActiveTabMessage): void {
  getActiveTabBridge.resolveRequests(message);
} 