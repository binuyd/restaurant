export type Role = 'CUSTOMER' | 'ADMIN';

export type OrderStatus = 'PLACED' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
}

export interface MenuItem {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  available: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface OrderItemDto {
  id: number;
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderStatusHistoryDto {
  id: number;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  changedBy: string;
  changedAt: string;
}

export interface OrderDto {
  id: number;
  userId: number;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  totalAmount: number;
  version: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDto[];
  statusHistory: OrderStatusHistoryDto[];
}

export interface TopSellingItemDto {
  menuItemId: number;
  name: string;
  totalQuantity: number;
  totalSales: number;
}

export interface DashboardSummaryDto {
  todayRevenue: number;
  todayOrderCount: number;
  last7DaysRevenue: number;
  last7DaysOrderCount: number;
  ordersByStatus: Record<OrderStatus, number>;
  topSellingItems: TopSellingItemDto[];
}
