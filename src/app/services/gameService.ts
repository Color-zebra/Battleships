import { WebSocket } from "ws";
import DBInstance, { DB } from "../db/index";
import {
  CreateGameResponse,
  CreateGameResponseData,
} from "../sharedTypes/game";

export class GameService {
  db: DB;
  constructor() {
    this.db = DBInstance;
  }

  async createGame(roomId: string) {
    console.log("try to create game", roomId);

    const gameRoom = await this.db.getRoom(roomId);
    const playerIds = gameRoom?.roomUsers.map(({ index }) => index);
    if (!playerIds) {
      return;
    }
    const playerSockets = playerIds?.map((id) => this.db.getConnectionByID(id));
    await Promise.all(playerSockets);
    if (!playerSockets) {
      return;
    }

    playerSockets.forEach((socketData) => {
      if (socketData) {
        const { id, socket } = socketData;
        const playerResponseData: CreateGameResponseData = {
          idGame: roomId,
          idPlayer: id,
        };
        const playerResponse: CreateGameResponse = {
          type: "create_game",
          data: JSON.stringify(playerResponseData),
          id: 0,
        };
        console.log("responses for players", playerResponse);

        socket.send(JSON.stringify(playerResponse));
      }
    });
  }
}
