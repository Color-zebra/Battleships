import { RawData, WebSocket } from "ws";
import { parseMessage } from "../utils/parseMessage";
import { RegService } from "../services/regService";

export class Controller {
  private connectionsList: Array<{
    id: number;
    socket: WebSocket;
  }>;
  regService: RegService;

  constructor() {
    this.connectionsList = [];
    this.regService = new RegService();
    this.handleConnection = this.handleConnection.bind(this);
  }

  closeAllConnections() {
    this.connectionsList.forEach((socket) => socket.socket.close());
  }

  createMessageHandler(socket: WebSocket) {
    return (msg: RawData) => {
      const parsedMsg = parseMessage(msg.toString());

      if (!parsedMsg) {
        socket.close(400, "Invalid input");
        return;
      }

      switch (parsedMsg.type) {
        case "reg":
          this.regService.handleMsg(parsedMsg);
      }
    };
  }

  handleConnection(socket: WebSocket) {
    const id = Date.now() + this.connectionsList.length;
    const socketObj = {
      id,
      socket,
    };

    socket.on("close", () => {
      this.connectionsList = this.connectionsList.filter(
        (currSocket) => currSocket.id !== id
      );
    });

    socket.on("message", this.createMessageHandler(socket));

    this.connectionsList.push(socketObj);
  }
}
