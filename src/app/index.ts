import { IncomingMessage } from "http";
import WebSocket, { WebSocketServer } from "ws";

class App {
  port: number;
  server: WebSocket.Server<typeof WebSocket, typeof IncomingMessage>;

  constructor() {
    this.port = Number(process.env.WS_PORT ?? 3000);
    this.server = new WebSocketServer({ port: this.port });
  }

  start() {
    console.log(`Websocket server starts on ${this.port}`);
    this.server.on("connection", (socket) => {
      console.log("connection");

      socket.on("message", (msg) => {
        const parsedMsg = JSON.parse(msg.toString());
        console.log(parsedMsg);
        socket.send(JSON.stringify(parsedMsg));
      });
    });
  }
}

export default new App();
