import { IncomingMessageType } from "../types";

export const parseMessage = (json: string): IncomingMessageType | null => {
  let message = null;

  try {
    message = JSON.parse(json);
    message.data = JSON.parse(message.data);
  } catch (e) {
    return null;
  }

  return message;
};
