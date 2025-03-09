import express from "express";
import http from "http";
import { WebSocket, WebSocketServer } from "ws";

const app = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Middleware
app.use(express.json());

// Define types for our stored data
interface ConsoleLog {
  level?: string;
  type?: string;
  message?: string;
  [key: string]: any;
}

interface NetworkRequest {
  method: string;
  [key: string]: any;
}

interface BrowserData {
  consoleLogs: ConsoleLog[];
  consoleErrors: ConsoleLog[];
  networkRequests: {
    success: NetworkRequest[];
    errors: NetworkRequest[];
  };
  screenshot: string | null;
  selectedElement: any | null;
  browserTabs: any[];
}

// Store data from browser extension
const browserData: BrowserData = {
  consoleLogs: [],
  consoleErrors: [],
  networkRequests: {
    success: [],
    errors: [],
  },
  screenshot: null,
  selectedElement: null,
  browserTabs: [],
};

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Spiller Aggregator Server is running" });
});

// MCP endpoints
app.get("/console-logs", (req, res) => {
  res.json(browserData.consoleLogs);
});

app.get("/console-errors", (req, res) => {
  const errors = browserData.consoleLogs.filter(
    (log) => log.level === "error" || log.type === "error"
  );
  res.json(errors);
});

app.get("/network-errors", (req, res) => {
  res.json(browserData.networkRequests.errors);
});

app.get("/network-success", (req, res) => {
  res.json(browserData.networkRequests.success);
});

app.post("/capture-screenshot", (req, res) => {
  // Send command to browser extension
  sendCommandToExtension("takeScreenshot");

  // Return the most recent screenshot or an error if none available
  if (browserData.screenshot) {
    res.json({ success: true, data: browserData.screenshot });
  } else {
    res.status(404).json({
      success: false,
      error: "No screenshot available. Please try again in a moment.",
    });
  }
});

app.get("/selected-element", (req, res) => {
  if (browserData.selectedElement) {
    res.json(browserData.selectedElement);
  } else {
    res.status(404).json({ error: "No element currently selected" });
  }
});

app.post("/wipelogs", (req, res) => {
  // Clear stored data
  browserData.consoleLogs = [];
  browserData.consoleErrors = [];
  browserData.networkRequests.success = [];
  browserData.networkRequests.errors = [];

  res.json({ message: "All logs have been cleared" });
});

app.get("/browser-tabs", (req, res) => {
  // Send command to browser extension if we don't have tabs data
  if (browserData.browserTabs.length === 0) {
    sendCommandToExtension("listBrowserTabs");
  }

  res.json(browserData.browserTabs);
});

// Store connected clients
const clients = new Set<WebSocket>();

// WebSocket connection handling
wss.on("connection", (ws: WebSocket) => {
  console.log("Browser extension connected");
  clients.add(ws);

  // Send welcome message
  ws.send(JSON.stringify({ type: "connection", status: "connected" }));

  // Handle messages from browser extension
  ws.on("message", (message) => {
    try {
      const parsedMessage = JSON.parse(message.toString());
      console.log("Received from extension:", parsedMessage.type);

      // Store data based on message type
      switch (parsedMessage.type) {
        case "screenshot":
          browserData.screenshot = parsedMessage.data;
          break;
        case "console-logs":
          browserData.consoleLogs.push(parsedMessage.data as ConsoleLog);
          break;
        case "network-requests":
          if (parsedMessage.data.method === "Network.loadingFailed") {
            browserData.networkRequests.errors.push(
              parsedMessage.data as NetworkRequest
            );
          } else {
            browserData.networkRequests.success.push(
              parsedMessage.data as NetworkRequest
            );
          }
          break;
        case "dom-snapshot":
          browserData.selectedElement = parsedMessage.data;
          break;
        case "browser-tabs":
          browserData.browserTabs = parsedMessage.data;
          break;
        default:
          console.log("Unknown message type:", parsedMessage.type);
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  // Handle disconnection
  ws.on("close", () => {
    console.log("Browser extension disconnected");
    clients.delete(ws);
  });
});

// Send command to browser extension
function sendCommandToExtension(command: string): void {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ command }));
    }
  });
}

// Start server
server.listen(PORT, () => {
  console.log(`Aggregator Server running on port ${PORT}`);
});
