import { WebSocket } from "ws";
import DBInstance, { DB } from "../db/index";
import { IncomingMessageType } from "../sharedTypes/types";
import {
  IncomingUserMessageType,
  UserIncomingData,
  UserResponse,
} from "../sharedTypes/user";
import { RoomService } from "./roomService";
import { User } from "../db/types";
import { WinnersService } from "./winnersService";

export class RegService {
  db: DB;
  roomService: RoomService;
  winnersService: WinnersService;

  constructor() {
    this.db = DBInstance;
    this.roomService = new RoomService();
    this.winnersService = new WinnersService();
  }

  async handleUserSignin(
    userData: UserIncomingData & {
      id: string;
    }
  ): Promise<User> {
    const isUserAlreadyLogin = this.db
      .getAllConnections()
      .find(({ userName }) => userName === userData.name);
    if (isUserAlreadyLogin) {
      throw new Error("User already login!");
    }

    const userInDb = await this.db.getUserByName(userData.name);
    const isPasswordCorrect = userInDb?.password === userData.password;
    let userResponse: User | null = null;
    if (isPasswordCorrect) {
      userResponse = { ...userInDb };
    } else if (!!userInDb) {
      throw new Error("Wrong password");
    } else {
      userResponse = await this.db.addUser(
        userData.name,
        userData.password,
        userData.id
      );
    }

    const userConnection = this.db.getConnectionByID(userData.id);
    if (userConnection) {
      userConnection.userName = userResponse.name;
    }
    return {
      index: userResponse.index,
      name: userResponse.name,
    };
  }

  async handleMsg(msg: IncomingUserMessageType, socket: WebSocket, id: string) {
    if (this.isValidUserMsg(msg)) {
      let response: UserResponse = {
        type: "reg",
        data: "",
        id: 0,
      };
      try {
        const newUser = await this.handleUserSignin({
          name: msg.data.name,
          password: msg.data.password,
          id,
        });
        response.data = JSON.stringify({
          ...newUser,
          error: false,
        });
      } catch (error) {
        if (error instanceof Error) {
          response.data = JSON.stringify({
            name: msg.data.name,
            index: "",
            error: true,
            errorText: error.message,
          });
        }
      }
      socket.send(JSON.stringify(response));
      this.roomService.updateRoomsInfoForAllUsers();
      this.winnersService.updateWinnersForAllUsers();
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
