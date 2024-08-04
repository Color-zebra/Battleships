import { WebSocket } from "ws";
import DBInstance, { DB } from "../db/index";
import {
  IncomingRoomMessageType,
  UpdateRoomResponse,
} from "../sharedTypes/room";

export class RoomService {
  db: DB;
  constructor() {
    this.db = DBInstance;
  }

  async handleMsg(msg: IncomingRoomMessageType, id: string) {
    switch (msg.type) {
      case "create_room":
        await this.createRoom(id);
        break;
      case "add_user_to_room":
        break;
    }
    this.updateRoomsInfoForAllUsers();
  }

  async createRoom(creatorPlayerId: string) {
    await this.db.addRoom(creatorPlayerId);
  }

  async updateRoomsInfoForAllUsers() {
    const data = await this.db.getAllFreeRooms();
    const response: UpdateRoomResponse = {
      id: 0,
      data: JSON.stringify(data),
      type: "update_room",
    };
    this.db.getAllConnections().forEach(({ socket }) => {
      socket.send(JSON.stringify(response));
    });
  }

  async updateRoomsForOneUser(socket: WebSocket) {
    const data = await this.db.getAllFreeRooms();
    const response: UpdateRoomResponse = {
      id: 0,
      data: JSON.stringify(data),
      type: "update_room",
    };
    socket.send(JSON.stringify(response));
  }
}
