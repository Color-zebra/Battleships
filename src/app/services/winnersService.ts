import { WebSocket } from "ws";
import DBInstance, { DB } from "../db/index";
import { WinnersResponse, WinnersResponseData } from "../sharedTypes/winners";

export class WinnersService {
  db: DB;
  constructor() {
    this.db = DBInstance;
  }

  async updateWinnersForAllUsers() {
    const data: WinnersResponseData = (await this.db.getAllUsers()).map(
      ({ name, wins }) => ({ name, wins })
    );
    const response: WinnersResponse = {
      id: 0,
      data: JSON.stringify(data),
      type: "update_winners",
    };
    this.db.getAllConnections().forEach(({ socket }) => {
      socket.send(JSON.stringify(response));
    });
  }
}
