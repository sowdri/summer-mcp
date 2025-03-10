/**
 * Bridge Class
 * Generic bridge for managing pending requests and responses between HTTP and WebSocket
 */
import { Response } from "express";

/**
 * Interface for pending request entry
 */
export interface PendingRequest {
  res: Response;
  timeout: NodeJS.Timeout;
}

/**
 * Bridge class for managing pending requests and responses
 * @template T The type of response data
 */
export class Bridge<T> {
  /**
   * Map of pending requests
   */
  public pendingRequests: Map<string, PendingRequest>;
  
  /**
   * Create a new Bridge instance
   * @param defaultTimeoutMessage Default message to send on timeout
   */
  constructor(private defaultTimeoutMessage: string) {
    this.pendingRequests = new Map<string, PendingRequest>();
  }
  
  /**
   * Register a new request
   * @param res Express response object
   * @param timeoutMs Timeout in milliseconds
   * @param timeoutMessage Message to send on timeout
   * @returns Request ID
   */
  registerRequest(res: Response, timeoutMs = 5000, timeoutMessage = this.defaultTimeoutMessage): string {
    // Generate a unique request ID
    const requestId = Date.now().toString();

    // Set a timeout to handle the case when no response is received
    const timeout = setTimeout(() => {
      // If the request is still pending when timeout occurs
      if (this.pendingRequests.has(requestId)) {
        this.pendingRequests.delete(requestId);
        res.status(504).json({ error: timeoutMessage });
      }
    }, timeoutMs);

    // Store the response object and timeout
    this.pendingRequests.set(requestId, { res, timeout });

    return requestId;
  }
  
  /**
   * Resolve all pending requests with the provided data
   * @param data Response data
   */
  resolveRequests(data: T): void {
    // Resolve all pending requests as they all need the same data
    for (const [requestId, { res, timeout }] of this.pendingRequests.entries()) {
      // Clear the timeout
      clearTimeout(timeout);

      // Send the response
      res.json(data);

      // Remove from pending requests
      this.pendingRequests.delete(requestId);
    }
  }
  
  /**
   * Remove a request by ID
   * @param requestId Request ID to remove
   * @returns Whether the request was found and removed
   */
  removeRequest(requestId: string): boolean {
    if (this.pendingRequests.has(requestId)) {
      const { timeout } = this.pendingRequests.get(requestId)!;
      clearTimeout(timeout);
      this.pendingRequests.delete(requestId);
      return true;
    }
    return false;
  }
} 