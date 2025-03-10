/**
 * Service for tracking WebSocket connection status
 */

import { SERVER_URL } from "../config/constants";

// Connection status enum
export enum ConnectionStatus {
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  ERROR = "error",
  CHECKING = "checking",
}

// Connection status data
interface ConnectionData {
  status: ConnectionStatus;
  serverUrl: string;
  lastConnected: number | null;
  lastError: string | null;
}

// Initialize connection data
const connectionData: ConnectionData = {
  status: ConnectionStatus.DISCONNECTED,
  serverUrl: SERVER_URL,
  lastConnected: null,
  lastError: null,
};

/**
 * Update connection status
 * @param status New connection status
 * @param error Optional error message
 */
export function updateConnectionStatus(
  status: ConnectionStatus,
  error?: string
): void {
  connectionData.status = status;

  if (status === ConnectionStatus.CONNECTED) {
    connectionData.lastConnected = Date.now();
    connectionData.lastError = null;
  } else if (status === ConnectionStatus.ERROR && error) {
    connectionData.lastError = error;
  }
}

/**
 * Get current connection status data
 * @returns Connection status data
 */
export function getConnectionData(): ConnectionData {
  return { ...connectionData };
}
