import { WebSocket } from "ws";
import DBInstance, { DB } from "../db/index";
import {
  AddUserToRoomRequest,
  IncomingRoomMessageType,
  UpdateRoomResponse,
} from "../sharedTypes/room";
import { closeSocketWithMessage } from "../utils/closeWithMessage";
import { GameService } from "./gameService";

export class RoomService {
  db: DB;
  gameService: GameService;
  constructor() {
    this.db = DBInstance;
    this.gameService = new GameService();
  }

  async handleMsg(msg: IncomingRoomMessageType, id: string, socket: WebSocket) {
    console.log("recieved in room service", msg, id);

    switch (msg.type) {
      case "create_room":
        await this.createRoom(id);
        break;
      case "add_user_to_room":
        if (this.isValidAddUserToRoomMesssage(msg)) {
          try {
            await this.addUserToRoom(id, String(msg.data.indexRoom));
          } catch (error) {
            console.log("catched");

            if (error instanceof Error) {
              closeSocketWithMessage(socket, error.message);
            }
          }
        } else {
          closeSocketWithMessage(socket);
        }
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

  async addUserToRoom(playerId: string, roomId: string) {
    console.log("try to add", playerId, roomId);

    const player = await this.db.getUserById(playerId);
    if (!player) {
      throw new Error("There is no such player");
    }

    console.log(player);

    try {
      await this.db.addUserToRoom(roomId, {
        index: player?.index,
        name: player?.name,
      });
      console.log("Добавили в руму");
      await this.updateRoomsInfoForAllUsers();
      console.log("Обновили");
      await this.gameService.createGame(roomId);
      console.log("Вроде норм");
    } catch (error) {
      console.log("rethrow", error);

      throw error;
    }
  }

  isValidAddUserToRoomMesssage(msg: unknown): msg is AddUserToRoomRequest {
    return (
      !!msg &&
      typeof msg === "object" &&
      "id" in msg &&
      msg.id === 0 &&
      "data" in msg &&
      !!msg.data &&
      typeof msg.data === "object" &&
      "indexRoom" in msg.data
    );
  }
}
