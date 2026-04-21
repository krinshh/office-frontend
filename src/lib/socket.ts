import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './store';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

let socket: Socket | null = null;
let currentToken: string | null = null;

export const initSocket = (token: string) => {
    // If socket is already connected and token hasn't changed, don't re-initialize
    if (socket && socket.connected && currentToken === token) {
        console.log('Socket already connected with valid token, skipping re-init');
        return socket;
    }

    if (socket) {
        console.log('Token changed or socket disconnected, re-initializing...');
        socket.disconnect();
    }

    currentToken = token;

    socket = io(SOCKET_URL, {
        auth: {
            token
        },
        withCredentials: true,
        transports: ['websocket']
    });

    socket.on('connect', () => {
        console.log('Socket connected successfully');
    });

    socket.on('connect_error', (err) => {
        // If it's an auth error, we might need to refresh credentials
        if (err.message.includes('Authentication error')) {
            console.error('Socket Auth Error:', err.message);
        } else {
            console.error('Socket connection error:', err.message);
        }
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
