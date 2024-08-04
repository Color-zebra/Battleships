export type User = {
  name: string;
  index: string;
};

export type Room = {
  roomId: string | number;
  roomUsers: Array<{
    name: string;
    index: number | string;
  }>;
};
