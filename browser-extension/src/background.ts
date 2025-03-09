// WebSocket connection
let socket: WebSocket | null = null;
const SERVER_URL = "ws://localhost:3001";

// Debugger connection state
interface DebuggerConnection {
  tabId: number;
  attached: boolean;
}

const debuggerConnections: Map<number, DebuggerConnection> = new Map();

// Connect to WebSocket server
function connectWebSocket() {
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }

  socket = new WebSocket(SERVER_URL);

  socket.onopen = () => {
    console.log("Connected to WebSocket server");
    chrome.action.setBadgeText({ text: "ON" });
    chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log("Received message from server:", message);

      // Handle commands from the server
      if (message.command) {
        handleServerCommand(message);
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  };

  socket.onclose = () => {
    console.log("Disconnected from WebSocket server");
    chrome.action.setBadgeText({ text: "OFF" });
    chrome.action.setBadgeBackgroundColor({ color: "#F44336" });

    // Try to reconnect after 5 seconds
    setTimeout(connectWebSocket, 5000);
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
    chrome.action.setBadgeText({ text: "ERR" });
    chrome.action.setBadgeBackgroundColor({ color: "#F44336" });
  };
}

// Initialize connection
connectWebSocket();

// Handle commands from the server
function handleServerCommand(message: any) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]?.id) {
      console.error("No active tab found");
      return;
    }

    const tabId = tabs[0].id;

    switch (message.command) {
      case "takeScreenshot":
        takeScreenshot(tabId);
        break;
      case "getConsoleLogs":
        startConsoleMonitoring(tabId);
        break;
      case "getNetworkRequests":
        startNetworkMonitoring(tabId);
        break;
      case "getDomSnapshot":
        getDomSnapshot(tabId);
        break;
      default:
        console.log("Unknown command:", message.command);
    }
  });
}

// Attach debugger to a tab
function attachDebugger(tabId: number) {
  if (
    debuggerConnections.has(tabId) &&
    debuggerConnections.get(tabId)?.attached
  ) {
    return;
  }

  chrome.debugger.attach({ tabId }, "1.3", () => {
    if (chrome.runtime.lastError) {
      console.error("Failed to attach debugger:", chrome.runtime.lastError);
      return;
    }

    console.log("Debugger attached to tab:", tabId);
    debuggerConnections.set(tabId, { tabId, attached: true });

    // Enable necessary debugger domains
    chrome.debugger.sendCommand({ tabId }, "Network.enable", {});
    chrome.debugger.sendCommand({ tabId }, "Console.enable", {});
    chrome.debugger.sendCommand({ tabId }, "DOM.enable", {});
  });
}

// Detach debugger from a tab
function detachDebugger(tabId: number) {
  if (
    !debuggerConnections.has(tabId) ||
    !debuggerConnections.get(tabId)?.attached
  ) {
    return;
  }

  chrome.debugger.detach({ tabId }, () => {
    if (chrome.runtime.lastError) {
      console.error("Failed to detach debugger:", chrome.runtime.lastError);
      return;
    }

    console.log("Debugger detached from tab:", tabId);
    debuggerConnections.set(tabId, { tabId, attached: false });
  });
}

// Handle debugger events
chrome.debugger.onEvent.addListener((source, method, params) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return;
  }

  switch (method) {
    case "Console.messageAdded":
      socket.send(
        JSON.stringify({
          type: "console-logs",
          data: params,
        })
      );
      break;

    case "Network.responseReceived":
    case "Network.requestWillBeSent":
    case "Network.loadingFailed":
      socket.send(
        JSON.stringify({
          type: "network-requests",
          data: params,
        })
      );
      break;
  }
});

// Handle tab removal
chrome.tabs.onRemoved.addListener((tabId) => {
  if (debuggerConnections.has(tabId)) {
    detachDebugger(tabId);
    debuggerConnections.delete(tabId);
  }
});

// Handle browser action click (extension icon)
chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return;

  const tabId = tab.id;

  // Toggle debugger connection
  if (
    debuggerConnections.has(tabId) &&
    debuggerConnections.get(tabId)?.attached
  ) {
    detachDebugger(tabId);
    chrome.action.setBadgeText({ text: "OFF" });
    chrome.action.setBadgeBackgroundColor({ color: "#F44336" });
  } else {
    attachDebugger(tabId);
    chrome.action.setBadgeText({ text: "ON" });
    chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });

    // Send initial data
    takeScreenshot(tabId);
    startConsoleMonitoring(tabId);
    startNetworkMonitoring(tabId);
    getDomSnapshot(tabId);
  }
});

// Take screenshot
function takeScreenshot(tabId: number) {
  chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "screenshot",
          data: dataUrl,
        })
      );
    }
  });
}

// Start console monitoring
function startConsoleMonitoring(tabId: number) {
  // Ensure debugger is attached
  if (
    !debuggerConnections.has(tabId) ||
    !debuggerConnections.get(tabId)?.attached
  ) {
    attachDebugger(tabId);
  }

  // Request console messages
  chrome.debugger.sendCommand({ tabId }, "Console.enable", {}, () => {
    chrome.debugger.sendCommand({ tabId }, "Console.clearMessages", {});
    console.log("Console monitoring started");
  });
}

// Start network monitoring
function startNetworkMonitoring(tabId: number) {
  // Ensure debugger is attached
  if (
    !debuggerConnections.has(tabId) ||
    !debuggerConnections.get(tabId)?.attached
  ) {
    attachDebugger(tabId);
  }

  // Request network events
  chrome.debugger.sendCommand({ tabId }, "Network.enable", {}, () => {
    console.log("Network monitoring started");
  });
}

// Get DOM snapshot
function getDomSnapshot(tabId: number) {
  // Ensure debugger is attached
  if (
    !debuggerConnections.has(tabId) ||
    !debuggerConnections.get(tabId)?.attached
  ) {
    attachDebugger(tabId);
  }

  // Get DOM snapshot
  chrome.debugger.sendCommand({ tabId }, "DOM.getDocument", {}, (root) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "dom-snapshot",
          data: root,
        })
      );
    }
  });
}
