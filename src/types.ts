export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "Food" | "Drinks";
  popular?: boolean;
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
  imageEmoji?: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export type OrderStatus = "Pending" | "Preparing" | "Served" | "Completed";

export interface OrderItemSummary {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: "Food" | "Drinks";
}

export interface Order {
  id: string;
  tableNumber: string;
  items: OrderItemSummary[];
  totalPrice: number;
  timestamp: string; // ISO string
  status: OrderStatus;
  note?: string;
}
