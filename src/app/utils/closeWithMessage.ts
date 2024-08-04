import { WebSocket } from "ws";

export const closeSocketWithMessage = (
  socket: WebSocket,
  msg: string = "Invalid input!"
) => {
  console.log("closing", msg);

  socket.close(1003, msg);
  console.log("closing succ");
};
