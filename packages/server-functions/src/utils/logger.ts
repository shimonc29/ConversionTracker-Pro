import { logger } from 'firebase-functions';

export const logInfo = (msg: string, meta?: any) => logger.info(msg, meta);
export const logError = (msg: string, meta?: any) => logger.error(msg, meta); 