import { IncomingMessageType } from "../sharedTypes/types";
import util from "util";

export const parseMessage = (json: string): IncomingMessageType | null => {
  let message = null;

  try {
    message = JSON.parse(json);
    message.data = message.data !== "" ? JSON.parse(message.data) : "";
    console.log("parsed message", util.inspect(message, { depth: null }));
  } catch (e) {
    return null;
  }

  return message;
};
