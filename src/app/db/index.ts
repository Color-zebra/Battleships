import { WebSocket } from "ws";
import { Room, FullUser, UserInRoom } from "./types";
import { ShipData } from "../sharedTypes/game";

export class DB {
  users: FullUser[];
  rooms: Room[];
  connectionsList: Array<{
    id: string;
    userName?: string;
    socket: WebSocket;
  }>;
  constructor() {
    this.users = [];
    this.rooms = [];
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

  async getAllUsers() {
    return this.users;
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
    const newUser: FullUser = {
      name: userName,
      index: String(id),
      password,
      wins: 0,
    };
    this.users.push(newUser);
    return newUser;
  }

  async addShipsToUser(userId: string, roomId: string, ships: ShipData[]) {
    const room = await this.getRoom(roomId);
    if (!room) {
      throw new Error("There is no such room");
    }
    const user = room.roomUsers.find(({ index }) => index === userId);
    if (!user) {
      throw new Error("There is no such user in the room");
    }
    user.gameField = ships;
    return user;
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
      roomId: String(Date.now() + this.rooms.length),
      roomUsers: [
        {
          index: creatorPlayerId,
          name: creatorUserName.name,
          gameField: null,
        },
      ],
    };

    this.rooms.push(newRoom);
  }

  async deleteRoom(roomId: string) {
    this.rooms = this.rooms.filter((room) => room.roomId !== roomId);
  }

  async addUserToRoom(roomId: string, user: UserInRoom) {
    console.log("room id", roomId);
    console.log("rooms", this.rooms);

    const room = this.rooms.find(
      ({ roomId: currRoomId }) => roomId === currRoomId
    );
    console.log(room);

    if (!room) {
      console.log("no room");

      throw new Error("There is no room with such id!");
    } else if (room.roomUsers.length !== 1) {
      throw new Error("Room already in use!");
    } else {
      room.roomUsers.push(user);
      return room.roomId;
    }
  }

  async getAllFreeRooms() {
    const freeRooms = this.rooms.filter(
      ({ roomUsers }) => roomUsers.length === 1
    );
    return freeRooms;
  }

  async getRoom(currRoomId: string) {
    const room = this.rooms.find(({ roomId }) => roomId === currRoomId);
    return !!room ? room : null;
  }

  async getFreeRoomByPlayerId(playerId: string) {
    const room = this.rooms.find(
      ({ roomUsers }) =>
        roomUsers.length === 1 &&
        roomUsers.some(({ index }) => index === playerId)
    );
    console.log("room with disconnected player", room);
    return room ? room : null;
  }
}

export default new DB();
