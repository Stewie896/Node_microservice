const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: process.env.NODE_ENV == 'production' ? 'info' : 'debug',
  defaultMeta: { service: 'post-service' },
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.label({ label: "---" }),
    winston.format.printf(({ timestamp, label, level, message }) => {
      return `${timestamp} -- ${level} ${label} => ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../lgerror/post-servceErr.txt'),
      level: 'error'
    })
  ]
});

module.exports = { logger };
