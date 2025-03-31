const winston = require("winston");
const path = require("path");
const printf = winston.format.printf(({ timestamp, label, level, message }) => {
  // const coloredTimestamp = returnlevel == 'info' ? chalk.green(timestamp)
  // : level == 'warn' ? chalk.yellow(timestamp)
  // :level == 'error' ? chalk.red(timestamp)
  // : chalk.white(timestamp)

  return `${timestamp} ----- ${label} ----- ${level}: ----- ${message}`;
});

const logLevel = process.env.NODE_ENV === "production" ? "info" : "debug";

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.label({ label: "-----" }),
    printf
  ),
  defaultMeta: {service: "Identity-service"},
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),

    new winston.transports.File({
      filename: path.join( __dirname , '../errhandler/apierr.txt'),
      level: "error",  
      
    }),
    new winston.transports.File({
       filename: path.join(__dirname , '../errhandler/combinedlogs.txt'), 
       level: 'info',
    })
  ],
});

module.exports = { logger };
