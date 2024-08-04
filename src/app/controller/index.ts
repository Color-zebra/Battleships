import { RawData, WebSocket } from "ws";
import { parseMessage } from "../utils/parseMessage";
import { RegService } from "../services/regService";
import DBInstance, { DB } from "../db/index";
import { RoomService } from "../services/roomService";

export class Controller {
  regService: RegService;
  roomService: RoomService;
  db: DB;

  constructor() {
    this.regService = new RegService();
    this.roomService = new RoomService();
    this.handleConnection = this.handleConnection.bind(this);
    this.db = DBInstance;
  }

  closeAllConnections() {
    this.db.getAllConnections().forEach((socket) => socket.socket.close());
  }

  createMessageHandler(socket: WebSocket, id: string) {
    return (msg: RawData) => {
      const parsedMsg = parseMessage(msg.toString());

      if (!parsedMsg) {
        socket.close(1003, "Invalid input");
        return;
      }

      switch (parsedMsg.type) {
        case "reg":
          this.regService.handleMsg(parsedMsg, socket, id);
          break;
        case "create_room":
        case "add_user_to_room":
          this.roomService.handleMsg(parsedMsg, id, socket);
          break;
      }
    };
  }

  handleConnection(socket: WebSocket) {
    const id = String(Date.now() + this.db.getAllConnections().length);
    const socketObj = {
      id,
      socket,
    };

    socket.on("close", () => this.db.deleteConnection(id));
    socket.on("message", this.createMessageHandler(socket, id));
    this.db.addConnection(socketObj);
  }
}
