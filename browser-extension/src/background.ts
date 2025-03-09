/**
 * Background script for the browser extension
 * This is the entry point for the extension
 */

// Import services
import { initDebuggerEventListeners } from "./services/debugger/eventHandler";
import { initTabEventListeners } from "./services/tabs/manager";
import { connectWebSocket } from "./services/websocket/connection";

// Initialize WebSocket connection
connectWebSocket();

// Initialize event listeners
initDebuggerEventListeners();
initTabEventListeners();

console.log("Browser extension background script initialized");
