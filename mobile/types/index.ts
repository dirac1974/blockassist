export type OrderStatus =
  | 'open'
  | 'funded'
  | 'in_progress'
  | 'awaiting_acceptance'
  | 'completed'
  | 'disputed'
  | 'cancelled'
  | 'expired';

export type ListingStatus = OrderStatus;

export type Order = {
  id: string;
  listingTitle: string;
  counterparty: string;
  priceUsdcCents: number;
  status: OrderStatus;
  updatedAt: number;
};

export type Listing = {
  id: string;
  title: string;
  priceUsdcCents: number;
  status: ListingStatus;
  city: string;
  createdAt: number;
};

export type Assistant = {
  wallet: string;
  displayName: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  completedOrders: number;
  disputeLossRate: number;
};
