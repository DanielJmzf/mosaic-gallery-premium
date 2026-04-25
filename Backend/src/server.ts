import 'dotenv/config';
import http from 'http';
import app from './app';
import { initSocket } from './socket';

const PORT = parseInt(process.env.PORT ?? '3001', 10);

const httpServer = http.createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Socket.IO ready`);
    console.log(`🖼  Uploads served at /uploads`);
    console.log(`📋 API at /api/events`);
});
