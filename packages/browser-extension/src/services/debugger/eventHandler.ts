import { sendMessage } from "../../websocket/messageSender";
import { 
  BrowserMessageType, 
  ConsoleLogsMessage, 
  NetworkRequestsMessage
} from "@summer-mcp/core";

/**
 * Initialize debugger event listeners
 */
export function initDebuggerEventListeners(): void {
  console.debug("[Debugger] Initializing debugger event listeners");

  // Handle debugger events
  chrome.debugger.onEvent.addListener((source, method, params) => {
    const tabId = source.tabId;

    // Skip if tabId is undefined
    if (tabId === undefined) {
      console.warn(`[Debugger] Received event with undefined tabId: ${method}`);
      return;
    }

    switch (method) {
      case "Console.messageAdded":
        console.debug(`[Debugger] Console message received from tab: ${tabId}`);
        handleConsoleMessage(tabId, params);
        break;

      case "Network.responseReceived":
        console.debug(`[Debugger] Network response received for tab: ${tabId}`);
        handleNetworkEvent(tabId, method, params);
        break;

      case "Network.requestWillBeSent":
        console.debug(
          `[Debugger] Network request will be sent for tab: ${tabId}`
        );
        handleNetworkEvent(tabId, method, params);
        break;

      case "Network.loadingFailed":
        console.debug(`[Debugger] Network loading failed for tab: ${tabId}`);
        handleNetworkEvent(tabId, method, params);
        break;

      default:
        // Log other events but don't process them
        console.debug(
          `[Debugger] Unhandled event: ${method} for tab: ${tabId}`
        );
        break;
    }
  });

  // Handle debugger detached events
  chrome.debugger.onDetach.addListener((source, reason) => {
    const tabId = source.tabId;

    // Skip if tabId is undefined
    if (tabId === undefined) {
      console.warn(
        `[Debugger] Received detach event with undefined tabId, reason: ${reason}`
      );
      return;
    }

    console.debug(
      `[Debugger] Debugger detached from tab: ${tabId}, reason: ${reason}`
    );
  });

  console.debug("[Debugger] Debugger event listeners initialized");
}

/**
 * Handle console messages from the debugger
 * @param tabId The ID of the tab that generated the message
 * @param params The console message parameters
 */
function handleConsoleMessage(tabId: number, params: unknown): void {
  const typedParams = params as { message: { level?: string; text: string } };
  const message = typedParams.message;
  const level = message.level || "info";

  // Log message details for debugging
  console.debug(`[Debugger] Console ${level}: ${message.text} (tab: ${tabId})`);

  // Send all logs (including errors and warnings) to aggregator with the same message type
  const logMessage: ConsoleLogsMessage = {
    type: BrowserMessageType.CONSOLE_LOGS,
    data: [{
      level,
      message: message.text,
      timestamp: Date.now()
    }],
    tabId,
    timestamp: Date.now()
  };
  sendMessage(logMessage);
}

/**
 * Handle network events from the debugger
 * @param tabId The ID of the tab that generated the event
 * @param method The network event method
 * @param params The network event parameters
 */
function handleNetworkEvent(tabId: number, method: string, params: unknown): void {
  // Extract useful information for logging
  let logInfo = "";
  let errorText = "";
  
  // Type cast params to access properties
  const typedParams = params as Record<string, unknown>;
  const request = typedParams.request as Record<string, unknown> | undefined;
  const response = typedParams.response as Record<string, unknown> | undefined;
  
  if (method === "Network.requestWillBeSent" && request) {
    logInfo = `${request.method || 'UNKNOWN'} ${request.url || 'UNKNOWN'}`;
  } else if (method === "Network.responseReceived" && response) {
    logInfo = `${response.status || 'UNKNOWN'} ${response.url || 'UNKNOWN'}`;
  } else if (method === "Network.loadingFailed") {
    errorText = (typedParams.errorText as string) || 'Unknown Error';
    const url = (typedParams.url as string) || 'UNKNOWN';
    logInfo = `Failed: ${errorText} ${url}`;
  }

  console.debug(
    `[Debugger] Network event: ${method} - ${logInfo} (tab: ${tabId})`
  );

  // Send all network events with a single message format
  const requestMessage: NetworkRequestsMessage = {
    type: BrowserMessageType.NETWORK_REQUESTS,
    data: {
      method: request?.method as string || "UNKNOWN",
      url: request?.url as string || typedParams.url as string || "UNKNOWN",
      status: response?.status as number | undefined,
      statusText: response?.statusText as string || errorText,
      timestamp: Date.now(),
      eventType: method
    },
    tabId,
    timestamp: Date.now()
  };
  sendMessage(requestMessage);
}
