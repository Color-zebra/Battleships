import { WebSocket } from "ws";
import DBInstance, { DB } from "../db/index";
import { IncomingMessageType } from "../sharedTypes/types";
import {
  IncomingUserMessageType,
  UserIncomingData,
  UserResponse,
} from "../sharedTypes/user";
import { RoomService } from "./roomService";

export class RegService {
  db: DB;
  roomService: RoomService;

  constructor() {
    this.db = DBInstance;
    this.roomService = new RoomService();
  }

  async createUser(
    userData: UserIncomingData & {
      id: string;
    }
  ) {
    const isUserExist = !!(await this.db.getUserByName(userData.name));
    if (isUserExist) {
      throw new Error("User alredy exist");
    } else {
      const createdUser = await this.db.addUser(userData.name, userData.id);
      return createdUser;
    }
  }

  async handleMsg(msg: IncomingUserMessageType, socket: WebSocket, id: string) {
    if (this.isValidUserMsg(msg)) {
      let response: UserResponse = {
        type: "reg",
        data: "",
        id: 0,
      };
      try {
        const newUser = await this.createUser({
          name: msg.data.name,
          password: msg.data.password,
          id,
        });
        response.data = JSON.stringify({
          ...newUser,
          error: false,
        });
      } catch (error) {
        response.data = JSON.stringify({
          name: msg.data.name,
          index: "",
          error: true,
          errorText: "User already exist",
        });
      }
      socket.send(JSON.stringify(response));
      this.roomService.updateRoomsForOneUser(socket);
    }
  }

  isValidUserMsg(msg: IncomingMessageType) {
    return (
      msg.type === "reg" &&
      msg.id === 0 &&
      typeof msg.data.name === "string" &&
      !!msg.data.name.length &&
      typeof msg.data.password === "string" &&
      !!msg.data.password.length
    );
  }
}
