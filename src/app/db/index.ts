import { User } from "./types";

export class DB {
  users: User[];
  constructor() {
    this.users = [];
  }

  async getUser(userName: string) {
    const user = this.users.find(({ name }) => name === userName);
    return user || null;
  }

  async addUser(userName: string) {
    const newUser: User = {
      name: userName,
      index: String(Date.now()) + this.users.length,
    };
    this.users.push(newUser);
    return newUser;
  }

  async deleteUserByUserName(userName: string) {
    this.users = this.users.filter(({ name }) => name !== userName);
    return true;
  }

  async deleteUserByUserIndex(userIndex: string | number) {
    this.users = this.users.filter(({ index }) => index !== userIndex);
    return true;
  }
}

export default new DB();
