import colors from 'colors';
import { Server } from 'socket.io';
import { logger } from '../shared/logger';

let ioInstance: Server | null = null;
const socket = (io: Server) => {
  ioInstance = io;
  io.on('connection', socket => {
    logger.info(colors.blue('A user connected'));

    //disconnect
    socket.on('disconnect', () => {
      logger.info(colors.red('A user disconnect'));
    });
  });
};

export const socketHelper = {
  socket,
  get io() {
    return ioInstance;
  }
};
