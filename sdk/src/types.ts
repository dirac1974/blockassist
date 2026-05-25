export interface Order {
  id: string;
  status: 'created' | 'accepted' | 'delivered' | 'completed' | 'disputed';
  amount: number;
  currency: 'USDC';
}

export interface Assistant {
  id: string;
  rating: number;
  collateral: number; // in USDC
}