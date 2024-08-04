import { Room } from "../db/types";

export type IncomingRoomMessageType =
  | IncomingCreteRoomMessageType
  | IncomingAddUserToRoomMessageType;

export type IncomingCreteRoomMessageType = {
  type: "create_room";
  data: "";
  id: 0;
};

export type IncomingAddUserToRoomMessageType = {
  type: "add_user_to_room";
  data: string;
  id: 0;
};

export type AddUserToRoomIncomingData = {
  indexRoom: string | number;
};

export type RoomResponseData = Room[];

export type UpdateRoomResponse = {
  type: "update_room";
  data: string;
  id: 0;
};
