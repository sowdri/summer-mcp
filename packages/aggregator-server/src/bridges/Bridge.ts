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
 * @template TBrowserMessage The type of browser message received from WebSocket
 * @template THttpResponse The type of HTTP response sent to the MCP server
 */
export class Bridge<TBrowserMessage, THttpResponse> {
  /**
   * Map of pending requests
   */
  public pendingRequests: Map<string, PendingRequest>;
  
  /**
   * Create a new Bridge instance
   * @param defaultTimeoutMessage Default message to send on timeout
   * @param convertMessageToResponse Function to convert browser message to HTTP response
   */
  constructor(
    private defaultTimeoutMessage: string,
    private convertMessageToResponse: (message: TBrowserMessage) => THttpResponse | Promise<THttpResponse>
  ) {
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
   * Resolve all pending requests with the provided browser message
   * @param message Browser message from WebSocket
   */
  async resolveRequests(message: TBrowserMessage): Promise<void> {
    try {
      // Convert the browser message to an HTTP response
      const response = await Promise.resolve(this.convertMessageToResponse(message));
      
      // Resolve all pending requests as they all need the same data
      for (const [requestId, { res, timeout }] of this.pendingRequests.entries()) {
        // Clear the timeout
        clearTimeout(timeout);

        try {
          // Set appropriate headers for large responses
          res.setHeader('Content-Type', 'application/json');
          
          // Send the response
          res.json(response);
        } catch (error) {
          console.error(`Error sending response for request ${requestId}:`, error);
          // If there's an error sending the response, send a simplified error response
          res.status(500).json({ 
            error: "Failed to send response", 
            message: error instanceof Error ? error.message : String(error) 
          });
        }

        // Remove from pending requests
        this.pendingRequests.delete(requestId);
      }
    } catch (error) {
      console.error("Error in resolveRequests:", error);
      
      // Handle error for all pending requests
      for (const [requestId, { res, timeout }] of this.pendingRequests.entries()) {
        clearTimeout(timeout);
        res.status(500).json({ 
          error: "Failed to process response", 
          message: error instanceof Error ? error.message : String(error) 
        });
        this.pendingRequests.delete(requestId);
      }
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