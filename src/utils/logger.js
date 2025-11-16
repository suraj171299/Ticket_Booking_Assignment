import { createLogger, format, transports } from 'winston';
import { join } from 'path';

const addCallsite = format((info) => {
  const oldStackTrace = (new Error()).stack.split('\n');
  const stackLine = oldStackTrace[3] || oldStackTrace[2];
  if (stackLine) {
    const match = stackLine.match(/at (.+?) \((.+):(\d+):(\d+)\)/) ||
      stackLine.match(/at (.+):(\d+):(\d+)/);
    if (match) {
      if (match.length === 5) {
        info.function = match[1];
        info.file = match[2];
        info.line = match[3];
      } else if (match.length === 4) {
        info.function = '';
        info.file = match[1];
        info.line = match[2];
      }
    }
  }
  return info
})

const logFormat = format.printf(({ timestamp, level, message, stack }) => {
  return `[${timestamp}] ${level}: ${stack || message}`
})

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.colorize(),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    addCallsite(),
    logFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: join('logs', 'error.log'),
      level: 'error',
    }),
    ...(process.env.NODE_ENV === 'production'
      ? [new transports.File({ filename: join('logs', 'combined.log') })]
      : [])
  ],
  exitOnError: false
})

export default logger