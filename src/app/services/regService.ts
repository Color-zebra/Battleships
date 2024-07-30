import DBInstance, { DB } from "../db/index";
import { IncomingMessageType, UserIncomingData } from "../types";

export class RegService {
  db: DB;

  constructor() {
    this.db = DBInstance;
  }

  async createUser(userData: UserIncomingData) {
    console.log(userData);
  }

  handleMsg(msg: IncomingMessageType) {
    console.log(msg);
  }
}
