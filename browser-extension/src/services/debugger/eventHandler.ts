import { sendMessage } from "../websocket/connection";

/**
 * Initialize debugger event listeners
 */
export function initDebuggerEventListeners(): void {
  // Handle debugger events
  chrome.debugger.onEvent.addListener((source, method, params) => {
    switch (method) {
      case "Console.messageAdded":
        handleConsoleMessage(params);
        break;

      case "Network.responseReceived":
      case "Network.requestWillBeSent":
      case "Network.loadingFailed":
        handleNetworkEvent(method, params);
        break;
    }
  });
}

/**
 * Handle console messages from the debugger
 * @param params The console message parameters
 */
function handleConsoleMessage(params: any): void {
  sendMessage("console-logs", params);
}

/**
 * Handle network events from the debugger
 * @param method The network event method
 * @param params The network event parameters
 */
function handleNetworkEvent(method: string, params: any): void {
  sendMessage("network-requests", {
    method,
    ...params,
  });
}
