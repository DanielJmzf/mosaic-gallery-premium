import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';

let io: SocketServer | null = null;

export function initSocket(httpServer: HttpServer): SocketServer {
    const allowedOrigin = process.env.CORS_ORIGIN ?? '*';
    io = new SocketServer(httpServer, {
        cors: {
            origin: allowedOrigin,
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);
        socket.on('disconnect', () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
        });
    });

    return io;
}

export function getIO(): SocketServer {
    if (!io) throw new Error('Socket.IO not initialised');
    return io;
}
