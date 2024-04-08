import injectSocketIO from "./server/socketHandler";

export const webSocketServer = {
    name: 'webSocketServer',
    configureServer(server: any) {
        injectSocketIO(server.httpServer);
    }
};