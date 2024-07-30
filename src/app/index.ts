import { error } from "console";
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
        const parsedData = JSON.parse(parsedMsg.data);
        console.log(parsedData);
        socket.send(
          JSON.stringify({
            type: "reg",
            data: JSON.stringify({
              ...(parsedData.name === "12345678"
                ? {
                    error: true,
                    errorText: "Дядя, ты дурак?",
                  }
                : {}),
              name: "booba",
              index: Date.now(),
            }),
            id: 0,
          })
        );
      });
    });
  }
}

export default new App();
