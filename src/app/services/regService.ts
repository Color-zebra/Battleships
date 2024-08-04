import { WebSocket } from "ws";
import DBInstance, { DB } from "../db/index";
import {
  IncomingMessageType,
  UserIncomingData,
  UserResponse,
  UserResponseData,
} from "../types";

export class RegService {
  db: DB;

  constructor() {
    this.db = DBInstance;
  }

  async createUser(
    userData: UserIncomingData & {
      id: number;
    }
  ) {
    const isUserExist = !!(await this.db.getUser(userData.name));
    if (isUserExist) {
      throw new Error("User alredy exist");
    } else {
      const createdUser = await this.db.addUser(userData.name, userData.id);
      return createdUser;
    }
  }

  async handleMsg(msg: IncomingMessageType, socket: WebSocket, id: number) {
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
