export type WinnersResponse = {
  type: "update_winners";
  data: string;
  id: 0;
};

export type WinnersResponseData = Array<{
  name: string;
  wins: number;
}>;
