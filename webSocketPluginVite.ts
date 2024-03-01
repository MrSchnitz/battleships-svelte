import injectSocketIO from "./socketIoHandler";

export const webSocketServer = {
    name: 'webSocketServer',
    configureServer(server) {
        injectSocketIO(server.httpServer);
    }
};