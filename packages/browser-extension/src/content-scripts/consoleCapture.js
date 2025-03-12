// Console capture content script
// This script notifies the background script that it's loaded
// The actual console capture is handled by the Debugger API in the background script

(function() {
  // Notify background script that content script is loaded
  try {
    chrome.runtime.sendMessage({
      source: 'summer-mcp-console-capture',
      action: 'content-script-loaded',
      data: {
        url: window.location.href,
        timestamp: Date.now()
      }
    });
    
    console.debug('%cSummer MCP Console Capture: Content script loaded', 'color: #8c00ff; font-weight: bold');
  } catch (e) {
    // Silent fail if the extension context is invalidated
  }
})(); 