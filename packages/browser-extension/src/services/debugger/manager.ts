import { DEBUGGER_PROTOCOL_VERSION } from "../../config/constants";
import { DebuggerConnection } from "../../types/interfaces";

/**
 * DebuggerManager class for managing Chrome debugger connections
 */
export class DebuggerManager {
  // Map to track debugger connections
  private debuggerConnections: Map<number, DebuggerConnection> = new Map();

  /**
   * Get the map of all debugger connections
   * @returns Map of all debugger connections
   */
  public getDebuggerConnections(): Map<number, DebuggerConnection> {
    return this.debuggerConnections;
  }

  /**
   * Attach debugger to a tab
   * @param tabId The ID of the tab to attach to
   * @returns Promise that resolves to true if attached successfully
   */
  public attachDebugger(tabId: number): Promise<boolean> {
    if (
      this.debuggerConnections.has(tabId) &&
      this.debuggerConnections.get(tabId)?.attached
    ) {
      return Promise.resolve(true); // Already attached
    }

    return new Promise((resolve) => {
      chrome.debugger.attach({ tabId }, DEBUGGER_PROTOCOL_VERSION, async () => {
        if (chrome.runtime.lastError) {
          console.error("Failed to attach debugger:", chrome.runtime.lastError);
          resolve(false);
          return;
        }

        console.log("Debugger attached to tab:", tabId);
        this.debuggerConnections.set(tabId, { tabId, attached: true });

        // Enable necessary debugger domains with promises
        try {
          await this.sendDebuggerCommand(tabId, "Network.enable", {});
          await this.sendDebuggerCommand(tabId, "Console.enable", {});
          await this.sendDebuggerCommand(tabId, "DOM.enable", {});
          resolve(true);
        } catch (error) {
          console.error("Error enabling debugger domains:", error);
          resolve(false);
        }
      });
    });
  }

  /**
   * Send a command to the debugger
   * @param tabId The ID of the tab to send the command to
   * @param command The command to send
   * @param params The parameters for the command
   * @returns Promise that resolves when the command is complete
   */
  private sendDebuggerCommand(tabId: number, command: string, params: object): Promise<any> {
    return new Promise((resolve, reject) => {
      chrome.debugger.sendCommand({ tabId }, command, params, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve(result);
      });
    });
  }

  /**
   * Detach debugger from a tab
   * @param tabId The ID of the tab to detach from
   * @returns Promise that resolves to true if detached successfully
   */
  public detachDebugger(tabId: number): Promise<boolean> {
    if (
      !this.debuggerConnections.has(tabId) ||
      !this.debuggerConnections.get(tabId)?.attached
    ) {
      return Promise.resolve(true); // Already detached
    }

    return new Promise((resolve) => {
      chrome.debugger.detach({ tabId }, () => {
        if (chrome.runtime.lastError) {
          console.error("Failed to detach debugger:", chrome.runtime.lastError);
          resolve(false);
          return;
        }

        console.log("Debugger detached from tab:", tabId);
        this.debuggerConnections.set(tabId, { tabId, attached: false });
        resolve(true);
      });
    });
  }

  /**
   * Check if debugger is attached to a tab
   * @param tabId The ID of the tab to check
   * @returns Whether the debugger is attached
   */
  public isDebuggerAttached(tabId: number): boolean {
    return (
      this.debuggerConnections.has(tabId) &&
      this.debuggerConnections.get(tabId)?.attached === true
    );
  }

  /**
   * Attach debugger to all existing tabs
   * @returns Promise that resolves when all tabs have been processed
   */
  public attachDebuggerToAllTabs(): Promise<void> {
    console.debug("[Debugger] Attaching debugger to all existing tabs");
    
    return new Promise((resolve) => {
      chrome.tabs.query({}, async (tabs) => {
        const attachPromises = tabs
          .filter(tab => tab.id !== undefined)
          .map(tab => this.attachDebugger(tab.id!));
        
        await Promise.all(attachPromises);
        console.debug(`[Debugger] Attached to ${tabs.length} tabs`);
        resolve();
      });
    });
  }
}

// Create and export a singleton instance
export const debuggerManager = new DebuggerManager();

/**
 * Initialize debugger detach listener to keep manager state consistent
 * This ensures the debugger manager state is updated when detachments happen outside our control
 */
export function initDebuggerDetachListener(): void {
  console.debug("[Debugger] Initializing debugger detach listener");
  
  chrome.debugger.onDetach.addListener((source, reason) => {
    const tabId = source.tabId;
    
    // Skip if tabId is undefined
    if (tabId === undefined) {
      console.warn(`[Debugger] Received detach event with undefined tabId, reason: ${reason}`);
      return;
    }
    
    console.debug(`[Debugger] Debugger detached from tab: ${tabId}, reason: ${reason}`);
    
    // Update the debugger manager state to reflect the detachment
    if (debuggerManager.isDebuggerAttached(tabId)) {
      // Use detachDebugger to properly update the internal state
      // This is a no-op since the debugger is already detached, but it updates the state
      debuggerManager.detachDebugger(tabId).then(success => {
        if (success) {
          console.debug(`[Debugger] Updated manager state for tab: ${tabId} (detached)`);
        } else {
          console.warn(`[Debugger] Failed to update manager state for tab: ${tabId}`);
        }
      });
    }
  });
  
  console.debug("[Debugger] Debugger detach listener initialized");
}

initDebuggerDetachListener();
