import { Bid } from "./bid";

export interface Collection {
  id: number;
  name: string;
  description: string;
  stocks: number;
  price: number;
  user: {
    id: string;
    name: string;
    email: string;
  };
  bids: Bid[];
}
