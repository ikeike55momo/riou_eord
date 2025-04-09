/**
 * ロガーユーティリティ
 * アプリケーション全体で一貫したログ出力を提供します
 */

import winston from 'winston';
const { format, transports } = winston;

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'info';
};

const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf((info) => {
    return `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`;
  })
);

const logger = winston.createLogger({
  level: level(),
  levels,
  format: format.combine(
    format.colorize({ all: true }),
    logFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    ),
  }));
}

const httpLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
    
    if (res.statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.http(message);
    }
  });
  
  next();
};

export default {
  error: (message) => logger.error(message),
  warn: (message) => logger.warn(message),
  info: (message) => logger.info(message),
  http: (message) => logger.http(message),
  debug: (message) => logger.debug(message),
  httpLogger,
};
