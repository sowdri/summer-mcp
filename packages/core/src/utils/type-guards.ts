/**
 * Type guard utilities for type-safe message handling
 */
import { BrowserMessage, BrowserMessageType } from '../types/messages';
import { ServerCommand, ServerCommandType, ServerMessage } from '../types/commands';

/**
 * Type guard to check if a message is a specific browser message type
 * @param message The message to check
 * @param type The browser message type to check for
 * @returns True if the message is of the specified type
 */
export function isBrowserMessageType<T extends BrowserMessageType>(
  message: BrowserMessage,
  type: T
): message is Extract<BrowserMessage, { type: T }> {
  return message.type === type;
}

/**
 * Type guard to check if a message is a specific server command type
 * @param message The message to check
 * @param command The server command type to check for
 * @returns True if the message is of the specified command type
 */
export function isServerCommandType<T extends ServerCommandType>(
  message: ServerMessage,
  command: T
): message is Extract<ServerCommand, { command: T }> {
  return (
    message.type === 'command' && 
    'command' in message && 
    message.command === command
  );
}

/**
 * Type guard to check if a message is a connection status message
 * @param message The message to check
 * @returns True if the message is a connection status message
 */
export function isConnectionStatusMessage(
  message: ServerMessage
): message is Extract<ServerMessage, { type: 'connection' }> {
  return message.type === 'connection';
} 