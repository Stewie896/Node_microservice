const winston = require('winston');

// Define a custom format using winston.format.printf
const printf = winston.format.printf(({ timestamp, label, level, message }) => {
    return `${timestamp} -- ${label} -- ${level}: -- ${message}`;
});

// Determine the logging level based on the environment
const logLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

// Create the logger
const logger = winston.createLogger({
    level: logLevel,
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), 
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.label({ label: '-----' }),
        printf
    ),
    defaultMeta: { service: 'identity-service' },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({ filename: 'err.txt', level: 'error' })
    ]
});

module.exports = { logger };
