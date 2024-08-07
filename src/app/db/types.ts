import { ShipData } from "../sharedTypes/game";

export type User = {
  name: string;
  index: string;
};

export type FullUser = User & {
  password: string;
  wins: number;
};

export type UserInRoom = {
  name: string;
  index: string;
  gameField: ShipData[] | null;
};

export type Room = {
  roomId: string;
  roomUsers: Array<UserInRoom>;
};
