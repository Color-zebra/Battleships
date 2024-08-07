import { IncomingAddShipsMessageType } from "./game";
import { IncomingRoomMessageType } from "./room";
import { IncomingUserMessageType } from "./user";

export type IncomingMessageType =
  | IncomingUserMessageType
  | IncomingRoomMessageType
  | IncomingAddShipsMessageType;
