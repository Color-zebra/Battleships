import { WebSocket } from "ws";
import { Room, User, UserWithPassword } from "./types";

export class DB {
  users: UserWithPassword[];
  rooms: Room[];
  connectionsList: Array<{
    id: string;
    userName?: string;
    socket: WebSocket;
  }>;
  constructor() {
    this.users = [];
    this.rooms = [
      { roomId: "asd", roomUsers: [{ index: "asd", name: "testName" }] },
    ];
    this.connectionsList = [];
  }

  getAllConnections() {
    return this.connectionsList;
  }

  getConnectionByID(connectionId: string) {
    return this.connectionsList.find(({ id }) => connectionId === id);
  }

  addConnection(connection: { id: string; socket: WebSocket }) {
    this.connectionsList.push(connection);
  }

  deleteConnection(connectionId: string) {
    this.connectionsList = this.connectionsList.filter(
      ({ id }) => id !== connectionId
    );
  }

  async getUserByName(userName: string) {
    const user = this.users.find(({ name }) => name === userName);
    return user || null;
  }

  async getUserById(id: string) {
    const user = this.users.find(({ index }) => index === id);
    return user || null;
  }

  async addUser(userName: string, password: string, id: string) {
    const newUser: UserWithPassword = {
      name: userName,
      index: String(id),
      password,
    };
    this.users.push(newUser);
    return newUser;
  }

  async deleteUserByUserName(userName: string) {
    this.users = this.users.filter(({ name }) => name !== userName);
    return true;
  }

  async deleteUserByUserIndex(userIndex: string) {
    this.users = this.users.filter(({ index }) => index !== userIndex);
    return true;
  }

  async addRoom(creatorPlayerId: string) {
    const creatorUserName = await this.getUserById(creatorPlayerId);

    if (!creatorUserName) {
      throw new Error("There is no such user");
    }

    const newRoom: Room = {
      roomId: Date.now() + this.rooms.length,
      roomUsers: [
        {
          index: creatorPlayerId,
          name: creatorUserName.name,
        },
      ],
    };

    this.rooms.push(newRoom);
  }

  async getAllFreeRooms() {
    const freeRooms = this.rooms.filter(
      ({ roomUsers }) => roomUsers.length === 1
    );
    return freeRooms;
  }
}

export default new DB();
