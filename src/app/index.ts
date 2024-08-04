import { IncomingMessage } from "http";
import WebSocket, { WebSocketServer } from "ws";
import { Controller } from "./controller";

class App {
  port: number;
  server: WebSocket.Server<typeof WebSocket, typeof IncomingMessage>;
  controller: Controller;

  constructor() {
    this.port = Number(process.env.WS_PORT ?? 3000);
    this.server = new WebSocketServer({ port: this.port });
    this.controller = new Controller();
  }

  start() {
    console.log(`Websocket server starts on ${this.port}`);
    this.server.on("connection", this.controller.handleConnection);
    process.on("SIGINT", () => {
      this.controller.closeAllConnections();
      this.server.close();
    });
  }
}

export default new App();
