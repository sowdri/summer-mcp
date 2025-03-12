import { sendMessage } from "../websocket/messageSender";
import { BrowserMessageType, NetworkRequest, NetworkRequestsMessage } from "@summer-mcp/core";

/**
 * Initialize network request monitoring
 * Sets up listeners for network requests
 */
export function initNetworkMonitoring(): void {
  console.debug("[Network Monitor] Initializing network monitoring");
  
  // Listen for completed requests
  chrome.webRequest.onCompleted.addListener(
    handleRequestCompleted,
    { urls: ["<all_urls>"] },
    ["responseHeaders"]
  );
  
  // Listen for error requests
  chrome.webRequest.onErrorOccurred.addListener(
    handleRequestError,
    { urls: ["<all_urls>"] }
  );
  
  console.debug("[Network Monitor] Network monitoring initialized");
}

/**
 * Handle completed network requests
 * @param details Details of the completed request
 */
function handleRequestCompleted(details: chrome.webRequest.WebResponseCacheDetails): void {
  // Extract response headers
  const responseHeaders: Record<string, string> = {};
  if (details.responseHeaders) {
    for (const header of details.responseHeaders) {
      if (header.name && header.value) {
        responseHeaders[header.name.toLowerCase()] = header.value;
      }
    }
  }
  
  // Create network request object
  const networkRequest: NetworkRequest = {
    method: details.method,
    url: details.url,
    status: details.statusCode,
    statusText: getStatusText(details.statusCode),
    type: details.type,
    timestamp: details.timeStamp,
    duration: 0, // We don't have request start time
    size: getContentLength(responseHeaders),
    isError: false,
    responseHeaders,
    tabId: details.tabId
  };
  
  // Send network request message
  sendNetworkRequest(networkRequest, details.tabId);
}

/**
 * Handle network request errors
 * @param details Details of the error request
 */
function handleRequestError(details: chrome.webRequest.WebResponseErrorDetails): void {
  // Create network request object
  const networkRequest: NetworkRequest = {
    method: details.method,
    url: details.url,
    type: details.type,
    timestamp: details.timeStamp,
    isError: true,
    error: details.error,
    tabId: details.tabId
  };
  
  // Send network request message
  sendNetworkRequest(networkRequest, details.tabId);
}

/**
 * Send network request message to the aggregator server
 * @param networkRequest The network request data
 * @param tabId The ID of the tab that made the request
 */
function sendNetworkRequest(networkRequest: NetworkRequest, tabId: number): void {
  // Ensure tabId is set on the network request
  networkRequest.tabId = networkRequest.tabId || tabId;
  
  const message: NetworkRequestsMessage = {
    type: BrowserMessageType.NETWORK_REQUESTS,
    data: networkRequest,
    tabId,
    timestamp: Date.now()
  };
  
  sendMessage(message);
  
  // Log the request
  if (networkRequest.isError) {
    console.debug(`[Network Monitor] Error: ${networkRequest.method} ${networkRequest.url} - ${networkRequest.error} (Tab: ${tabId})`);
  } else {
    console.debug(`[Network Monitor] ${networkRequest.method} ${networkRequest.url} - ${networkRequest.status} (Tab: ${tabId})`);
  }
}

/**
 * Get content length from response headers
 * @param headers Response headers
 * @returns Content length in bytes, or 0 if not available
 */
function getContentLength(headers: Record<string, string>): number {
  const contentLength = headers['content-length'];
  return contentLength ? parseInt(contentLength, 10) : 0;
}

/**
 * Get status text for a status code
 * @param statusCode The HTTP status code
 * @returns The corresponding status text
 */
function getStatusText(statusCode: number): string {
  const statusTexts: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    301: 'Moved Permanently',
    302: 'Found',
    304: 'Not Modified',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable'
  };
  
  return statusTexts[statusCode] || 'Unknown';
} 