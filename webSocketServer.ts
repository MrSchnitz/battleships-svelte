import * as http from 'http';
import * as express from 'express';
import injectSocketIO from './server/socketIoHandler.js';
import { handler } from './build/handler.js';

const app = express();
const server = http.createServer(app);

// Inject SocketIO
injectSocketIO(server);

// SvelteKit handlers
app.use(handler);

server.listen(3000, () => {
	console.log('Running on http://localhost:3000');
});
