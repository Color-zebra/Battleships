export type IncomingAddShipsMessageType = {
  type: "add_ships";
  data: AddShipsIncomingData;
  id: 0;
};

export type ShipData = {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  type: "huge" | "large" | "medium" | "small";
  length: 1 | 2 | 3 | 4;
  lives: number;
};

export type AddShipsIncomingData = {
  gameId: string;
  ships: ShipData[];
  indexPlayer: string;
};

export type CreateGameResponse = {
  type: "create_game";
  data: string;
  id: 0;
};

export type CreateGameResponseData = {
  idGame: string;
  idPlayer: string;
};

export type StartGameResponse = {
  type: "start_game";
  data: string;
  id: 0;
};

export type StartGameResponseData = {
  ships: ShipData[];
  currentPlayerIndex: string;
};

export type GameField = Array<Array<GameCell>>;

export type GameCell = {
  status: "shot" | "miss" | "killed" | "hidden";
};

export type IncomingAttackMessageType = {
  type: "attack";
  data: AttackData;
  id: 0;
};

export type IncomingRandomAttackMessageType = {
  type: "randomAttack";
  data: AttackData;
  id: 0;
};

export type RandomAttackData = {
  gameId: string;
  indexPlayer: string;
};

export type AttackData = {
  x: number;
  y: number;
  gameId: string;
  indexPlayer: string;
};
