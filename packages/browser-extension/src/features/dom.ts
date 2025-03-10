import {
  attachDebugger,
  isDebuggerAttached,
} from "../services/debugger/manager";
import { sendMessage } from "../websocket/messageSender";
import { BrowserMessageType, DomSnapshotMessage } from "@summer-mcp/core";

/**
 * Get DOM snapshot for a tab
 * @param tabId The ID of the tab to get the DOM snapshot from
 */
export function getDomSnapshot(tabId: number): void {
  // Ensure debugger is attached
  if (!isDebuggerAttached(tabId)) {
    attachDebugger(tabId);
  }

  // Get DOM snapshot
  chrome.debugger.sendCommand({ tabId }, "DOM.getDocument", {}, (root) => {
    const message: DomSnapshotMessage = {
      type: BrowserMessageType.DOM_SNAPSHOT,
      data: {
        html: JSON.stringify(root)
      },
      tabId,
      timestamp: Date.now()
    };
    sendMessage(message);
  });
}
