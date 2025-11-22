import './util/notification.cron';
import dotenv from 'dotenv';
import process from 'process';

import http from 'http';
dotenv.config();
import colors from 'colors';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import app from './app';
import config from './config';
import { seedSuperAdmin } from './DB/seedAdmin';
import { socketHelper } from './helpers/socketHelper';
import { errorLogger, logger } from './shared/logger';

process.on('uncaughtException', (error: Error) => {
  errorLogger.error('UnhandleException Detected', error);
  process.exit(1);
});

let server: http.Server | undefined;
async function main() {
  try {
    mongoose.connect(config.database_url as string);
    logger.info(colors.green('🚀 Database connected successfully'));

    await seedSuperAdmin();

    const port =
      typeof config.port === 'number' ? config.port : Number(config.port);

    server = app.listen(port, "0.0.0.0", () => {
      logger.info(
        colors.yellow(`♻️  Application listening on port:${config.port}`)
      );
    }) as http.Server;

    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: '*',
      },
    });
    socketHelper.socket(io);
    (globalThis as typeof globalThis & { io?: Server }).io = io;
  } catch (error) {
    errorLogger.error(colors.red('🤢 Failed to connect Database'), error);
  }

  process.on('unhandledRejection', (error: unknown) => {
    if (server) {
      server.close(() => {
        errorLogger.error('UnhandleRejection Detected', error);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}

main();

//SIGTERM
process.on('SIGTERM', () => {
  logger.info('SIGTERM IS RECEIVE');
  if (server) {
    server.close();
  }
});
