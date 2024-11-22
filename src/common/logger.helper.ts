import { Logger } from '@nestjs/common';

/**
 * Set Central Log
 * 
 * @param options - Logging options
 * @param options.level - Log level (e.g., 'info', 'warn', 'error')
 * @param options.method - The method name or context
 * @param options.message - Log message
 * @param options.error - Optional error object
 * @param options.others - Optional additional information
 */
export const setLog = (options: {
  level: 'info' | 'warn' | 'error' | 'debug' | 'verbose';
  method: string;
  message: string;
  error?: Error;
  others?: string;
}) => {
  // Fallback for `method` if not provided
  const method = options.method || 'DefaultContext';
  const logger = new Logger(method);

  // Sanitize inputs to prevent unexpected behavior
  const sanitize = (str: string) =>
    str.replace(/[^a-zA-Z0-9\s\-_:]/g, '').trim(); // Allow alphanumeric, spaces, hyphens, underscores, colons

  const level = sanitize(options.level.toLowerCase());
  const message = sanitize(options.message);
  const others = options.others ? sanitize(options.others) : null;

  let logOutput = `${method}: ${message}`;
  if (others) logOutput += ` | Additional Info: ${others}`;

  // Log based on the level
  switch (level) {
    case 'info':
      logger.log(logOutput);
      break;
    case 'warn':
      logger.warn(logOutput);
      if (options.error) logger.warn(options.error.stack || options.error.message);
      break;
    case 'error':
      logger.error(logOutput);
      if (options.error) logger.error(options.error.stack || options.error.message);
      break;
    case 'debug':
      logger.debug(logOutput);
      break;
    case 'verbose':
      logger.verbose(logOutput);
      break;
    default:
      logger.log(`Unknown Level: ${logOutput}`);
      break;
  }
};