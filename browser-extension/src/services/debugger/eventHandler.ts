import { sendMessage } from "../websocket/connection";

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
    sendMessage("debugger-detached", {
      tabId,
      reason,
      timestamp: new Date().toISOString(),
    });
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

  // Send to aggregator with additional metadata
  sendMessage("console-logs", {
    tabId,
    message: params,
    timestamp: new Date().toISOString(),
  });
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
  let eventType = "network-requests";
  if (method === "Network.loadingFailed") {
    eventType = "network-errors";
  } else if (
    method === "Network.responseReceived" &&
    params.response &&
    params.response.status >= 400
  ) {
    eventType = "network-errors";
  }

  // Send to aggregator with additional metadata
  sendMessage(eventType, {
    tabId,
    method,
    data: params,
    timestamp: new Date().toISOString(),
  });
}
