/**
 * Popup script for the browser extension
 * Displays the connection status and provides controls
 */

// DOM elements
const statusDot = document.getElementById("status-dot") as HTMLDivElement;
const statusText = document.getElementById("status-text") as HTMLDivElement;
const serverUrl = document.getElementById("server-url") as HTMLSpanElement;
const lastConnected = document.getElementById(
  "last-connected"
) as HTMLSpanElement;
const reconnectBtn = document.getElementById(
  "reconnect-btn"
) as HTMLButtonElement;
const settingsBtn = document.getElementById(
  "settings-btn"
) as HTMLButtonElement;

// Connection status enum
enum ConnectionStatus {
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  ERROR = "error",
  CHECKING = "checking",
}

// Status text mapping
const statusMessages = {
  [ConnectionStatus.CONNECTED]: "Connected to server",
  [ConnectionStatus.DISCONNECTED]: "Disconnected from server",
  [ConnectionStatus.ERROR]: "Connection error",
  [ConnectionStatus.CHECKING]: "Checking connection...",
};

// Initialize with checking status
let currentStatus: ConnectionStatus = ConnectionStatus.CHECKING;
updateStatusUI(currentStatus);

// Get connection status when popup opens
chrome.runtime.sendMessage({ action: "getConnectionStatus" }, (response) => {
  if (response && response.status) {
    updateStatusUI(response.status);

    if (response.serverUrl) {
      serverUrl.textContent = response.serverUrl;
    }

    if (response.lastConnected) {
      lastConnected.textContent = formatDate(response.lastConnected);
    }
  } else {
    updateStatusUI(ConnectionStatus.ERROR);
  }
});

// Event listeners
reconnectBtn.addEventListener("click", () => {
  updateStatusUI(ConnectionStatus.CHECKING);
  chrome.runtime.sendMessage({ action: "reconnect" }, (response) => {
    if (response && response.success) {
      setTimeout(() => {
        chrome.runtime.sendMessage(
          { action: "getConnectionStatus" },
          (statusResponse) => {
            if (statusResponse && statusResponse.status) {
              updateStatusUI(statusResponse.status);
            } else {
              updateStatusUI(ConnectionStatus.ERROR);
            }
          }
        );
      }, 1000); // Give it a second to connect
    } else {
      updateStatusUI(ConnectionStatus.ERROR);
    }
  });
});

settingsBtn.addEventListener("click", () => {
  // Open options page if it exists, or create a simple settings popup
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    // For future implementation
    alert("Settings will be available in a future update.");
  }
});

// Update UI based on connection status
function updateStatusUI(status: ConnectionStatus): void {
  currentStatus = status;

  // Remove all status classes
  statusDot.classList.remove(
    ConnectionStatus.CONNECTED,
    ConnectionStatus.DISCONNECTED,
    ConnectionStatus.ERROR
  );

  // Add current status class
  statusDot.classList.add(status);

  // Update status text
  statusText.textContent = statusMessages[status] || "Unknown status";

  // Update button state
  reconnectBtn.disabled = status === ConnectionStatus.CHECKING;
}

// Format date for display
function formatDate(timestamp: number): string {
  if (!timestamp) return "Never";

  const date = new Date(timestamp);
  return date.toLocaleString();
}
