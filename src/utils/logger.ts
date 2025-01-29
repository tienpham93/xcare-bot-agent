import winston, { createLogger } from "winston";

export const logger = createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    defaultMeta: { service: 'ollama-service' },
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'ollama-service.log' })
    ]
});