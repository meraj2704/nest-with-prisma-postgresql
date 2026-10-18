import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import 'winston-daily-rotate-file';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.ms(),
  nestWinstonModuleUtilities.format.nestLike('TeamTask', {
    colors: true,
    prettyPrint: true,
  }),
);

const isProduction = process.env.NODE_ENV === 'production';

// Vercel's filesystem is read-only and its log drain already captures stdout, so rotating
// files are only written when running on a normal host (local dev, VPS, Docker).
const fileTransports = process.env.VERCEL
  ? []
  : [
      new winston.transports.DailyRotateFile({
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'info',
        format: logFormat,
      }),
      new winston.transports.DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        level: 'error',
        format: logFormat,
      }),
    ];

export const loggerConfig: winston.LoggerOptions = {
  handleExceptions: true,
  handleRejections: true,
  transports: [
    new winston.transports.Console({
      format: isProduction ? logFormat : consoleFormat,
      level: isProduction ? 'info' : 'debug',
    }),
    ...fileTransports,
  ],
};
