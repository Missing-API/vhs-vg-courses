import pino, { transport } from 'pino';
import { SERVICE_NAME, type LoggerOptions, type LogLevel, type LogFormat, type LogDestination } from './types';

// Read env with sane defaults
const envLevel = (process.env.LOG_LEVEL as LogLevel | undefined) || 'info';
const envFormat = (process.env.LOG_FORMAT as LogFormat | undefined) || 'json';
const envDest = (process.env.LOG_DESTINATION as LogDestination | undefined) || 'console';
const envReqDetails = ((process.env.LOG_REQUEST_DETAILS || 'true').toLowerCase() === 'true');
const envFilePath = process.env.LOG_FILE_PATH;

function buildTransport(format: LogFormat, destination: LogDestination, filePath?: string) {
  if (destination === 'file') {
    const dest = filePath || './logs/app.log';
    return transport({
      targets: [
        {
          target: 'pino/file',
          options: { destination: dest, mkdir: true, append: true },
          level: 'trace',
        },
      ],
    });
  }

  if (format === 'pretty') {
    return transport({
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        singleLine: true,
        messageFormat: '{msg}',
      },
    });
  }

  // default: json to stdout
  return undefined;
}

export function createLogger(opts?: LoggerOptions) {
  const level = opts?.level || envLevel;
  const format = opts?.format || envFormat;
  const destination = opts?.destination || envDest;
  const filePath = opts?.filePath || envFilePath;

  const t = buildTransport(format, destination, filePath);

  const logger = pino(
    {
      level,
      base: {
        service: SERVICE_NAME,
        env: process.env.NODE_ENV || 'development',
      },
      redact: {
        paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.token'],
        censor: '[redacted]',
      },
      formatters: {
        level(label) {
          return { level: label };
        },
        bindings(bindings) {
          // Keep pid and hostname minimal
          return { pid: bindings.pid, host: bindings.hostname };
        },
      },
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    t
  );

  if (envReqDetails) {
    // Leave room for potential request serializers
  }

  return logger;
}

// Default shared logger instance
const logger = createLogger();

export default logger;