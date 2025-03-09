import axios from "axios";
import express from "express";
import http from "http";
import { Server as WebSocketServer } from "ws";

const app = express();
const PORT = process.env.PORT || 3001;
const MCP_SERVER_URL = process.env.MCP_SERVER_URL || "http://localhost:3000";

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Middleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Spiller Node.js WebSocket Server is running" });
});

// Store connected clients
const clients = new Set();

// WebSocket connection handling
wss.on("connection", (ws) => {
  console.log("Browser extension connected");
  clients.add(ws);

  // Send welcome message
  ws.send(JSON.stringify({ type: "connection", status: "connected" }));

  // Handle messages from browser extension
  ws.on("message", (message) => {
    try {
      const parsedMessage = JSON.parse(message.toString());
      console.log("Received from extension:", parsedMessage.type);

      // Forward data to MCP server based on message type
      switch (parsedMessage.type) {
        case "screenshot":
          forwardToMCP("/api/screenshot", parsedMessage.data);
          break;
        case "console-logs":
          forwardToMCP("/api/console-logs", parsedMessage.data);
          break;
        case "network-requests":
          forwardToMCP("/api/network-requests", parsedMessage.data);
          break;
        case "dom-snapshot":
          forwardToMCP("/api/dom-snapshot", parsedMessage.data);
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

// Forward data to MCP server
function forwardToMCP(endpoint, data) {
  axios
    .post(`${MCP_SERVER_URL}${endpoint}`, { data })
    .then((response) => {
      console.log(`Forwarded to MCP ${endpoint}:`, response.status);
      return response.data;
    })
    .catch((error) => {
      console.error(`Error forwarding to MCP ${endpoint}:`, error);
      return null;
    });
}

// Start server
server.listen(PORT, () => {
  console.log(`Node.js WebSocket Server running on port ${PORT}`);
});
