/**
 * WebSocket server setup
 */
import { Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { clients } from "./messageSender";
import { handleWebSocketMessage } from "./messageReceiver";
import { ConnectionStatusCommand } from "@summer-mcp/core";

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

    // Send welcome message to this specific client
    const connectionMessage: ConnectionStatusCommand = {
      type: 'connection',
      status: 'connected'
    };
    
    // Send directly to this specific client
    ws.send(JSON.stringify(connectionMessage));

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
