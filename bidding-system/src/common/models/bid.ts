export interface Bid {
  id: number;
  price: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  collectionId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  collection?: {
    id: string;
    name: string;
    price: number;
  };
}