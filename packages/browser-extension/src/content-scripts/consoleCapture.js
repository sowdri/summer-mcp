// Console capture content script
// This script overrides the native console methods to capture logs
// and send them back to the extension via message passing

(function() {
  // Store original console methods
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug
  };

  // Function to send log to extension
  function sendLogToExtension(level, args) {
    try {
      // Convert arguments to array and handle non-serializable objects
      const serializedArgs = Array.from(args).map(arg => {
        try {
          // Handle special types
          if (arg instanceof Error) {
            return {
              message: arg.message,
              stack: arg.stack,
              name: arg.name,
              __type: 'Error'
            };
          }
          
          // For DOM elements, just return the tag name and some attributes
          if (arg instanceof HTMLElement) {
            return {
              tagName: arg.tagName,
              id: arg.id,
              className: arg.className,
              __type: 'HTMLElement'
            };
          }
          
          // For other objects, try to stringify
          return arg;
        } catch (e) {
          return String(arg);
        }
      });

      // Create message object
      const logData = {
        level,
        message: serializedArgs,
        timestamp: Date.now(),
        url: window.location.href
      };

      // Send message to extension
      window.postMessage({
        source: 'summer-mcp-console-capture',
        data: logData
      }, '*');
      
      // Also send directly to background script
      chrome.runtime.sendMessage({
        source: 'summer-mcp-console-capture',
        data: logData
      });
    } catch (e) {
      // If something goes wrong, make sure we don't break the console
      originalConsole.error('Error in console capture:', e);
    }
  }

  // Override console methods
  console.log = function() {
    sendLogToExtension('log', arguments);
    originalConsole.log.apply(console, arguments);
  };

  console.info = function() {
    sendLogToExtension('info', arguments);
    originalConsole.info.apply(console, arguments);
  };

  console.warn = function() {
    sendLogToExtension('warn', arguments);
    originalConsole.warn.apply(console, arguments);
  };

  console.error = function() {
    sendLogToExtension('error', arguments);
    originalConsole.error.apply(console, arguments);
  };

  console.debug = function() {
    sendLogToExtension('debug', arguments);
    originalConsole.debug.apply(console, arguments);
  };

  // Set up message relay from window.postMessage to chrome.runtime.sendMessage
  window.addEventListener('message', (event) => {
    // Only accept messages from the same frame
    if (event.source !== window) return;
    
    const message = event.data;
    
    // Check if this is a console capture message
    if (message && message.source === 'summer-mcp-console-capture') {
      // Forward to background script
      chrome.runtime.sendMessage(message);
    }
  }, false);

  // Notify that console capture is active
  originalConsole.log('%cConsole capture active', 'color: #8c00ff; font-weight: bold');
})(); 