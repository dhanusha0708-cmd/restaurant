/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TableZone = 'main' | 'garden' | 'ac_hall' | 'lounge';

export type TableShape = 'round' | 'rect' | 'booth';

export type TableStatus = 'available' | 'reserved' | 'seated' | 'bussing';

export interface Table {
  id: string;
  number: number;
  name: string;
  capacity: number;
  zone: TableZone;
  shape: TableShape;
  status: TableStatus;
  x: number;
  y: number;
  currentReservationId?: string;
  currentGuestName?: string;
  seatedAt?: string;
  serverName?: string;
  activeOrderTotal?: number;
}

export type ReservationStatus = 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';

export interface Reservation {
  id: string;
  referenceCode: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  date: string;
  timeSlot: string;
  partySize: number;
  areaPreference: TableZone | 'any';
  tableId?: string;
  tableNumber?: number;
  status: ReservationStatus;
  occasion?: string;
  dietaryNotes?: string[];
  specialRequests?: string;
  createdAt: string;
}

export type InventoryCategory = 
  | 'Chicken & Meat' 
  | 'Vegetables & Herbs' 
  | 'Dairy & Ghee' 
  | 'Drinks & Bar' 
  | 'Rice & Spices';

export type StockStatus = 'in_stock' | 'low_stock' | 'critical';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: InventoryCategory;
  currentStock: number;
  unit: 'kg' | 'g' | 'L' | 'bottles' | 'packs' | 'units';
  parLevel: number;
  optimalLevel: number;
  unitCost: number; // in INR (₹)
  supplier: string;
  lastRestocked: string;
  status: StockStatus;
}

export interface RecipeIngredient {
  inventoryItemId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'Starter' | 'Main' | 'Dessert' | 'Beverage';
  price: number; // in INR (₹)
  description: string;
  prepTimeMins: number;
  image?: string;
  recipeIngredients: RecipeIngredient[];
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  firedAt: string;
}

export interface TableOrder {
  id: string;
  tableId: string;
  tableNumber: number;
  guestName: string;
  serverName: string;
  status: 'active' | 'in_kitchen' | 'served' | 'paid';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
}

export interface InventoryMovementLog {
  id: string;
  timestamp: string;
  type: 'depletion' | 'restock' | 'waste' | 'adjustment';
  itemId: string;
  itemName: string;
  delta: number;
  unit: string;
  reason: string;
  user: string;
  costImpact: number;
}

export interface WaitlistEntry {
  id: string;
  name: string;
  phone: string;
  partySize: number;
  areaPreference: TableZone | 'any';
  quotedMins: number;
  addedAt: string;
  status: 'waiting' | 'notified' | 'seated' | 'cancelled';
}

export type UserRole = 'admin' | 'floor_manager' | 'chef_inventory' | 'guest';

export interface StaffUser {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  pin: string;
}
