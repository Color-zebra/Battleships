export type CreateGameResponse = {
  type: "create_game";
  data: string;
  id: 0;
};

export type CreateGameResponseData = {
  idGame: string;
  idPlayer: string;
};
