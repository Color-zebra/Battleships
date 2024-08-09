import { WebSocket } from "ws";
import DBInstance, { DB } from "../db/index";
import {
  AddShipsIncomingData,
  AttackData,
  CreateGameResponse,
  CreateGameResponseData,
  GameField,
  IncomingAddShipsMessageType,
  ShipData,
  StartGameResponse,
  StartGameResponseData,
} from "../sharedTypes/game";
import { closeSocketWithMessage } from "../utils/closeWithMessage";
import { Room, UserInRoom } from "../db/types";
import { start } from "repl";

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
    if (room.roomUsers.every(({ shipsInfo }) => !!shipsInfo)) {
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
      !playerOne.shipsInfo ||
      !playerTwo.shipsInfo ||
      !playerOneSocket ||
      !playerTwoSocket
    ) {
      return;
    }
    const playerOneResponseData: StartGameResponseData = {
      currentPlayerIndex: playerOne.index,
      ships: playerOne.shipsInfo,
    };
    const playerOneResponse: StartGameResponse = {
      data: JSON.stringify(playerOneResponseData),
      id: 0,
      type: "start_game",
    };
    const playerTwoResponseData: StartGameResponseData = {
      currentPlayerIndex: playerTwo.index,
      ships: playerTwo.shipsInfo,
    };
    const playerTwoResponse: StartGameResponse = {
      data: JSON.stringify(playerTwoResponseData),
      id: 0,
      type: "start_game",
    };

    playerOneSocket.socket.send(JSON.stringify(playerOneResponse));
    playerTwoSocket.socket.send(JSON.stringify(playerTwoResponse));
  }

  generateGameField() {
    const field: GameField = Array.from(Array(10)).map((item) =>
      Array.from(Array(10)).map((item) => ({ status: "hidden" }))
    );
    return field;
  }

  async getShotResult(attackData: AttackData) {
    const room = await this.db.getRoom(attackData.gameId);
    const attackedUser = room?.roomUsers.find(
      ({ index }) => index !== attackData.indexPlayer
    );
    if (!attackedUser) {
      throw new Error("No user found");
    }
    const { shipsInfo, userGameField } = attackedUser;
    if (!shipsInfo || !userGameField) {
      throw new Error("No ships found");
    }

    const shipsInfoCopy: ShipData[] = JSON.parse(JSON.stringify(shipsInfo));
    let attackResult = "miss";
    for (let i = 0; i < shipsInfoCopy.length; i++) {
      const isHit = this.detectHitOnShip(
        shipsInfoCopy[i],
        userGameField,
        attackData.x,
        attackData.y
      );
      if (isHit) {
        shipsInfoCopy[i].lives -= 1;
        await this.db.addShipsToUser(
          attackedUser.index,
          attackData.gameId,
          shipsInfo
        );
        if (shipsInfoCopy[i].lives === 0) {
          attackResult = "killed";
          this.db;
        } else {
          attackResult = "shot";
        }
        break;
      }
    }
  }

  detectHitOnShip(ship: ShipData, gameField: GameField, x: number, y: number) {
    if (gameField[y][x].status !== "hidden") {
      return gameField[y][x].status;
    }
    const { x: shipX, y: shipY } = ship.position;
    const yData =
      ship.direction === false
        ? { start: shipY, end: shipY }
        : { start: shipY, end: shipY + ship.length - 1 };
    const xData =
      ship.direction === false
        ? { start: shipX, end: shipX + ship.length - 1 }
        : { start: shipX, end: shipX };

    const isHit =
      x >= xData.start && x <= xData.end && y >= yData.start && y <= yData.end;

    return isHit;
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
    return res;
  }

  isValidShipData(shipData: unknown): shipData is ShipData {
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

    return res;
  }
}
