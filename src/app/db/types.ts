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
};

export type Room = {
  roomId: string | number;
  roomUsers: Array<UserInRoom>;
};
