export interface ITransaction {
  type: 'incoming' | 'outgoing';
  amount: number;
  address: string;
  date: string;
  status: 'confirmed' | 'pending';
}
