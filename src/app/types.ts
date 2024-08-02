export type IncomingMessageType = {
  type: "reg";
  data: UserIncomingData & { id: 0 };
  id: 0;
};

export type UserIncomingData = {
  name: string;
  password: string;
};

export type UserResponse = {
  type: "reg";
  data: string;
  id: 0;
};

export type UserResponseData = {
  name: string;
  index: number | string;
} & (
  | {
      error: true;
      errorText: string;
    }
  | {
      error: false;
    }
);

export type IncomingUserMessageType = {
  type: "reg";
  data: UserIncomingData;
  id: 0;
};
