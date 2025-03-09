/**
 * Aggregator Server Entry Point
 */
import express from "express";
import http from "http";
import { PORT } from "./config/index.js";
import routes from "./routes/index.js";
import { initializeWebSocketServer } from "./websocket/index.js";

// Create Express app
const app = express();

// Middleware
app.use(express.json());

// Register routes
app.use(routes);

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
initializeWebSocketServer(server);

// Start server
server.listen(PORT, () => {
  console.log(`Aggregator Server running on port ${PORT}`);
});
