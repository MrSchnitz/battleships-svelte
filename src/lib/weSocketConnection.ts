import ioClient from 'socket.io-client';
// const ENDPOINT = 'http://localhost:3000';
const ENDPOINT = 'http://10.0.0.17:3000';

const socket = ioClient(ENDPOINT);

export const io = socket;