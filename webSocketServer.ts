import * as http from 'http';
import * as express from 'express';
import { handler } from './build/handler.js';

const app = express();
const server = http.createServer(app);

// SvelteKit handlers
app.use(handler);

server.listen(3000, () => {
	console.log('Running on port 3000');
});
