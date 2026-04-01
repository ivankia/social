import { env } from '../config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

const currentLevel: LogLevel = env.LOG_LEVEL;

function formatMessage(level: LogLevel, message: string, meta?: unknown) {
    const timestamp = new Date().toISOString();
    const payload =
        meta !== undefined ? `${message} ${JSON.stringify(meta)}` : message;
    return `${timestamp} [${level.toUpperCase()}] ${payload}`;
}

function shouldLog(level: LogLevel) {
    return levels[level] >= levels[currentLevel];
}

export const logger = {
    debug(message: string, meta?: unknown) {
        if (!shouldLog('debug')) return;
        console.debug(formatMessage('debug', message, meta));
    },
    info(message: string, meta?: unknown) {
        if (!shouldLog('info')) return;
        console.info(formatMessage('info', message, meta));
    },
    warn(message: string, meta?: unknown) {
        if (!shouldLog('warn')) return;
        console.warn(formatMessage('warn', message, meta));
    },
    error(message: string, meta?: unknown) {
        if (!shouldLog('error')) return;
        console.error(formatMessage('error', message, meta));
    },
};
