import injectSocketIO from "./server/server";

export const webSocketServer = {
    name: 'webSocketServer',
    configureServer(server: any) {
        injectSocketIO(server.httpServer);
    }
};