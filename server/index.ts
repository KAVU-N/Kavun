import http from 'http';
import dotenv from 'dotenv';

import { initSocketServer } from './socketServer';

dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local' });

const DEFAULT_PORT = 5000;
const port = Number(process.env.SOCKET_PORT || process.env.PORT || DEFAULT_PORT);

const server = http.createServer();

initSocketServer(server);

server.listen(port, () => {
  console.log(`Socket server listening on http://localhost:${port}`);
});
