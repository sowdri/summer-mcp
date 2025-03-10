import { sendMessage } from "../websocket/messageSender";
import { 
  BrowserMessageType, 
  ConsoleLogsMessage, 
  NetworkRequestsMessage,
  NetworkErrorsMessage,
  DebuggerEventMessage,
  DebuggerDetachedMessage
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

    // Send debugger detached event to aggregator
    const message: DebuggerDetachedMessage = {
      type: BrowserMessageType.DEBUGGER_DETACHED,
      data: {
        reason: reason || "unknown"
      },
      tabId,
      timestamp: Date.now()
    };
    sendMessage(message);
  });

  console.debug("[Debugger] Debugger event listeners initialized");
}

/**
 * Handle console messages from the debugger
 * @param tabId The ID of the tab that generated the message
 * @param params The console message parameters
 */
function handleConsoleMessage(tabId: number, params: any): void {
  const message = params.message;
  const level = message.level || "info";

  // Log message details for debugging
  console.debug(`[Debugger] Console ${level}: ${message.text} (tab: ${tabId})`);

  // Send all logs (including errors and warnings) to aggregator with the same message type
  const logMessage: ConsoleLogsMessage = {
    type: BrowserMessageType.CONSOLE_LOGS,
    data: [{
      level,
      message: message.text,
      timestamp: Date.now(),
      ...params
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
function handleNetworkEvent(tabId: number, method: string, params: any): void {
  // Extract useful information for logging
  let logInfo = "";

  if (method === "Network.requestWillBeSent" && params.request) {
    logInfo = `${params.request.method} ${params.request.url}`;
  } else if (method === "Network.responseReceived" && params.response) {
    logInfo = `${params.response.status} ${params.response.url}`;
  } else if (method === "Network.loadingFailed") {
    logInfo = `Failed: ${params.errorText} ${params.url}`;
  }

  console.debug(
    `[Debugger] Network event: ${method} - ${logInfo} (tab: ${tabId})`
  );

  // Determine if this is a success or error
  const isError = method === "Network.loadingFailed" || 
    (method === "Network.responseReceived" && params.response && params.response.status >= 400);

  if (isError) {
    const errorMessage: NetworkErrorsMessage = {
      type: BrowserMessageType.NETWORK_ERRORS,
      data: {
        method: params.request?.method || "UNKNOWN",
        url: params.request?.url || params.url || "UNKNOWN",
        status: params.response?.status,
        statusText: params.response?.statusText || params.errorText,
        timestamp: Date.now(),
        error: params.errorText || `HTTP ${params.response?.status}`,
        ...params
      },
      tabId,
      timestamp: Date.now()
    };
    sendMessage(errorMessage);
  } else {
    const requestMessage: NetworkRequestsMessage = {
      type: BrowserMessageType.NETWORK_REQUESTS,
      data: {
        method: params.request?.method || "UNKNOWN",
        url: params.request?.url || params.url || "UNKNOWN",
        status: params.response?.status,
        statusText: params.response?.statusText,
        timestamp: Date.now(),
        ...params
      },
      tabId,
      timestamp: Date.now()
    };
    sendMessage(requestMessage);
  }
}
