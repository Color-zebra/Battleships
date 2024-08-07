import { WebSocket } from "ws";
import DBInstance, { DB } from "../db/index";
import {
  AddShipsIncomingData,
  CreateGameResponse,
  CreateGameResponseData,
  IncomingAddShipsMessageType,
  ShipData,
  StartGameResponse,
  StartGameResponseData,
} from "../sharedTypes/game";
import { closeSocketWithMessage } from "../utils/closeWithMessage";
import { Room } from "../db/types";

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

  async handleMsg(msg: IncomingAddShipsMessageType, socket: WebSocket) {
    switch (msg.type) {
      case "add_ships":
        this.addShips(msg.data, socket);
    }
  }

  async addShips(shipsIncomingData: AddShipsIncomingData, socket: WebSocket) {
    if (!this.isValidShipsIncomingData(shipsIncomingData)) {
      closeSocketWithMessage(socket);
      return;
    }
    const { gameId, indexPlayer, ships } = shipsIncomingData;
    await this.db.addShipsToUser(indexPlayer, gameId, ships);
    const room = await this.db.getRoom(gameId);
    if (!room) {
      throw new Error("Incorrect game id");
    }
    if (room.roomUsers.every(({ gameField }) => !!gameField)) {
      console.log("try to start");

      this.startGame(room);
    }
  }

  async startGame(room: Required<Room>) {
    const playerOne = room.roomUsers[0];
    const playerTwo = room.roomUsers[1];
    const playerOneSocket = this.db.getConnectionByID(playerOne.index);
    const playerTwoSocket = this.db.getConnectionByID(playerTwo.index);
    if (
      !playerOne.gameField ||
      !playerTwo.gameField ||
      !playerOneSocket ||
      !playerTwoSocket
    ) {
      return;
    }
    const playerOneResponseData: StartGameResponseData = {
      currentPlayerIndex: playerOne.index,
      ships: playerOne.gameField,
    };
    const playerOneResponse: StartGameResponse = {
      data: JSON.stringify(playerOneResponseData),
      id: 0,
      type: "start_game",
    };
    const playerTwoResponseData: StartGameResponseData = {
      currentPlayerIndex: playerTwo.index,
      ships: playerTwo.gameField,
    };
    const playerTwoResponse: StartGameResponse = {
      data: JSON.stringify(playerTwoResponseData),
      id: 0,
      type: "start_game",
    };

    playerOneSocket.socket.send(JSON.stringify(playerOneResponse));
    playerTwoSocket.socket.send(JSON.stringify(playerTwoResponse));
  }

  isValidShipsIncomingData(
    shipsData: unknown
  ): shipsData is AddShipsIncomingData {
    const res =
      !!shipsData &&
      typeof shipsData === "object" &&
      "gameId" in shipsData &&
      typeof shipsData.gameId === "string" &&
      "indexPlayer" in shipsData &&
      typeof shipsData.indexPlayer === "string" &&
      "ships" in shipsData &&
      typeof shipsData.ships === "object" &&
      Array.isArray(shipsData.ships) &&
      shipsData.ships.every((item) => this.isValidShipData(item));
    console.log("isValidData", res);

    return res;
  }

  isValidShipData(shipData: unknown): shipData is ShipData {
    console.log("input", shipData);

    const res =
      !!shipData &&
      typeof shipData === "object" &&
      "position" in shipData &&
      !!shipData.position &&
      typeof shipData.position === "object" &&
      "x" in shipData.position &&
      typeof shipData.position.x === "number" &&
      "y" in shipData.position &&
      typeof shipData.position.y === "number" &&
      "direction" in shipData &&
      typeof shipData.direction === "boolean" &&
      "length" in shipData &&
      typeof shipData.length === "number" &&
      shipData.length >= 1 &&
      shipData.length <= 4 &&
      "type" in shipData &&
      typeof shipData.type === "string" &&
      ["small", "medium", "large", "huge"].includes(shipData.type);
    console.log("is every valid", res);

    return res;
  }
}
