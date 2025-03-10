/**
 * Aggregator Server Entry Point
 */
import express from "express";
import http from "http";
import { PORT } from "./config/index";
import routes from "./routes/index";
import { clients } from "./websocket/messageSender";
import { initializeWebSocketServer } from "./websocket/index";

// Create Express app
const app = express();

// Middleware
app.use(express.json());

// Add middleware to intercept all requests and return "No browser extension connected" only if no clients are connected
app.use((req, res, next) => {
  // Skip the health check endpoint
  if (req.path === "/") {
    return next();
  }

  // Only intercept if no clients are connected
  if (clients.size === 0) {
    return res.status(503).json({
      error: "No browser extension connected",
      message: "Please ensure the browser extension is installed and connected",
    });
  }

  // Continue to the next middleware/route handler if clients are connected
  next();
});

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
