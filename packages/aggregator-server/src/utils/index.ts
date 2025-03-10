/**
 * Utility functions
 */

/**
 * Format date for logging
 */
export function formatDate(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Log with timestamp
 */
export function logWithTimestamp(
  message: string,
  level: "info" | "error" | "warn" = "info"
): void {
  const timestamp = formatDate();
  const logMessage = `[${timestamp}] ${message}`;

  switch (level) {
    case "error":
      console.error(logMessage);
      break;
    case "warn":
      console.warn(logMessage);
      break;
    default:
      console.log(logMessage);
  }
}
