import * as http from "http";
import express from "express";
// @ts-ignore -- actual path in build folder after build
import { handler } from "../../handler.js";
import injectSocketIO from "./socketHandler.js";

const app = express();
const server = http.createServer(app);

// Inject SocketIO
injectSocketIO(server);

// SvelteKit handlers
app.use(handler);

server.listen(3000, () => {
	console.log("Running on port 3000");
});
