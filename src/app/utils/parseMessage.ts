import { IncomingMessageType } from "../sharedTypes/types";

export const parseMessage = (json: string): IncomingMessageType | null => {
  let message = null;

  try {
    message = JSON.parse(json);
    message.data = message.data !== "" ? JSON.parse(message.data) : "";
  } catch (e) {
    return null;
  }

  return message;
};
