/**
 * WebSocket server setup
 */
import { Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { clients } from "./commands.js";
import { handleWebSocketMessage } from "./handlers.js";
import { AggregatorWebSocketSendMessageType } from "../types/index.js";

/**
 * Initialize WebSocket server
 */
export function initializeWebSocketServer(server: Server): WebSocketServer {
  // Create WebSocket server
  const wss = new WebSocketServer({ server });

  // WebSocket connection handling
  wss.on("connection", (ws: WebSocket) => {
    console.log("Browser extension connected");
    clients.add(ws);

    // Send welcome message
    ws.send(JSON.stringify({ 
      type: AggregatorWebSocketSendMessageType.CONNECTION, 
      status: "connected" 
    }));

    // Handle messages from browser extension
    ws.on("message", (message) => {
      handleWebSocketMessage(message.toString());
    });

    // Handle disconnection
    ws.on("close", () => {
      console.log("Browser extension disconnected");
      clients.delete(ws);
    });
  });

  return wss;
}
