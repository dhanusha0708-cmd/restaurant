/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Table,
  Reservation,
  InventoryItem,
  MenuItem,
  TableOrder,
  InventoryMovementLog,
  WaitlistEntry,
  StaffUser,
  UserRole,
  TableStatus,
  StockStatus,
} from '../types/restaurant';
import {
  INITIAL_TABLES,
  INITIAL_INVENTORY,
  INITIAL_MENU_ITEMS,
  INITIAL_RESERVATIONS,
  INITIAL_ORDERS,
  INITIAL_MOVEMENT_LOGS,
  INITIAL_WAITLIST,
  INITIAL_STAFF,
} from '../data/initialData';

interface PurchaseOrderItem {
  itemId: string;
  sku: string;
  name: string;
  currentStock: number;
  parLevel: number;
  optimalLevel: number;
  orderQuantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  supplier: string;
}

interface RestaurantContextType {
  // Navigation & View mode
  activeTab: 'guest_portal' | 'floor_plan' | 'inventory' | 'orders' | 'recipes' | 'analytics';
  setActiveTab: (tab: 'guest_portal' | 'floor_plan' | 'inventory' | 'orders' | 'recipes' | 'analytics') => void;
  
  // Auth & Roles
  currentUser: StaffUser | null;
  currentRole: UserRole;
  isAdminUnlocked: boolean;
  authenticateStaff: (pin: string) => boolean;
  switchRole: (role: UserRole) => void;
  lockAdmin: () => void;
  allStaff: StaffUser[];

  // Tables
  tables: Table[];
  updateTableStatus: (tableId: string, status: TableStatus, extra?: Partial<Table>) => void;
  seatWalkIn: (tableId: string, guestName: string, partySize: number, serverName: string) => void;
  seatReservation: (reservationId: string, tableId: string) => void;
  markTableCleaned: (tableId: string) => void;
  freeTable: (tableId: string) => void;

  // Reservations
  reservations: Reservation[];
  createReservation: (data: Omit<Reservation, 'id' | 'referenceCode' | 'createdAt' | 'status'>) => Reservation;
  updateReservationStatus: (reservationId: string, status: Reservation['status']) => void;
  cancelReservation: (reservationId: string) => void;
  lookupReservation: (query: string) => Reservation | undefined;

  // Inventory
  inventory: InventoryItem[];
  movementLogs: InventoryMovementLog[];
  adjustStock: (itemId: string, delta: number, reason: string) => void;
  setStockQuantity: (itemId: string, newStock: number, reason: string) => void;
  logWastage: (itemId: string, quantity: number, reason: string) => void;
  generatePurchaseOrder: () => PurchaseOrderItem[];
  receivePurchaseOrder: (items: { itemId: string; quantity: number }[], poNumber: string) => void;

  // Menu & Recipes
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;

  // Orders & POS
  orders: TableOrder[];
  createTableOrder: (tableId: string, items: { menuItemId: string; quantity: number }[], serverName: string) => TableOrder;
  fireOrderToKitchen: (orderId: string) => void;
  settleOrder: (orderId: string) => void;

  // Waitlist
  waitlist: WaitlistEntry[];
  addToWaitlist: (entry: Omit<WaitlistEntry, 'id' | 'addedAt' | 'status'>) => void;
  seatWaitlistParty: (waitlistId: string, tableId: string, serverName: string) => void;
  removeWaitlistParty: (waitlistId: string) => void;

  // Live Simulation
  isSimulating: boolean;
  toggleSimulation: () => void;
  triggerSimulatedOrder: () => void;

  // Data helpers
  exportInventoryCSV: () => void;
  exportReservationsCSV: () => void;
  resetAllData: () => void;
  notifications: { id: string; title: string; message: string; type: 'info' | 'warning' | 'alert' | 'success'; timestamp: string }[];
  dismissNotification: (id: string) => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'spice_sizzle_v2_';

function calculateStockStatus(currentStock: number, parLevel: number): StockStatus {
  if (currentStock <= 0) return 'critical';
  if (currentStock < parLevel) return 'low_stock';
  return 'in_stock';
}

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation: Customers land on guest table booking by default
  const [activeTab, setActiveTab] = useState<'guest_portal' | 'floor_plan' | 'inventory' | 'orders' | 'recipes' | 'analytics'>('guest_portal');

  // Auth State: Defaults to locked/guest unless staff session exists in sessionStorage
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(() => {
    try {
      const saved = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}staff_user`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(`${STORAGE_KEY_PREFIX}admin_unlocked`) === 'true';
    } catch {
      return false;
    }
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    try {
      const saved = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}staff_user`);
      return saved ? JSON.parse(saved).role : 'guest';
    } catch {
      return 'guest';
    }
  });

  // App Data with localStorage persistence
  const [tables, setTables] = useState<Table[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}tables`);
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}reservations`);
    return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}inventory`);
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}menuItems`);
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  const [orders, setOrders] = useState<TableOrder[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}orders`);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [movementLogs, setMovementLogs] = useState<InventoryMovementLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}movementLogs`);
    return saved ? JSON.parse(saved) : INITIAL_MOVEMENT_LOGS;
  });

  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}waitlist`);
    return saved ? JSON.parse(saved) : INITIAL_WAITLIST;
  });

  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; type: 'info' | 'warning' | 'alert' | 'success'; timestamp: string }[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Auto-sync state to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}tables`, JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}reservations`, JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}inventory`, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}menuItems`, JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}orders`, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}movementLogs`, JSON.stringify(movementLogs));
  }, [movementLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}waitlist`, JSON.stringify(waitlist));
  }, [waitlist]);

  // Helper to add toast notification
  const addNotification = useCallback((title: string, message: string, type: 'info' | 'warning' | 'alert' | 'success' = 'info') => {
    const newNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setNotifications((prev) => [newNotification, ...prev.slice(0, 9)]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Auth Operations
  const authenticateStaff = useCallback((pin: string): boolean => {
    const match = INITIAL_STAFF.find((s) => s.pin === pin.trim());
    if (match) {
      setCurrentUser(match);
      setCurrentRole(match.role);
      setIsAdminUnlocked(true);
      try {
        sessionStorage.setItem(`${STORAGE_KEY_PREFIX}staff_user`, JSON.stringify(match));
        sessionStorage.setItem(`${STORAGE_KEY_PREFIX}admin_unlocked`, 'true');
      } catch (e) {
        console.error(e);
      }
      setActiveTab((prev) => (prev === 'guest_portal' ? 'floor_plan' : prev));
      addNotification('Access Granted', `Welcome back, ${match.name} (${match.title})`, 'success');
      return true;
    }
    return false;
  }, [addNotification]);

  const switchRole = useCallback((role: UserRole) => {
    setCurrentRole(role);
    if (role === 'guest') {
      setIsAdminUnlocked(false);
      setCurrentUser(null);
      try {
        sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}staff_user`);
        sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}admin_unlocked`);
      } catch (e) {
        console.error(e);
      }
      setActiveTab('guest_portal');
    } else {
      const staffMatch = INITIAL_STAFF.find((s) => s.role === role) || INITIAL_STAFF[0];
      setCurrentUser(staffMatch);
      setIsAdminUnlocked(true);
      try {
        sessionStorage.setItem(`${STORAGE_KEY_PREFIX}staff_user`, JSON.stringify(staffMatch));
        sessionStorage.setItem(`${STORAGE_KEY_PREFIX}admin_unlocked`, 'true');
      } catch (e) {
        console.error(e);
      }
      addNotification('Role Switched', `Active Profile: ${staffMatch.title}`, 'info');
    }
  }, [addNotification]);

  const lockAdmin = useCallback(() => {
    setIsAdminUnlocked(false);
    setCurrentRole('guest');
    setCurrentUser(null);
    try {
      sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}staff_user`);
      sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}admin_unlocked`);
    } catch (e) {
      console.error(e);
    }
    setActiveTab('guest_portal');
    addNotification('Terminal Locked', 'Admin privileges locked. Customer mode active.', 'info');
  }, [addNotification]);

  // Table Management
  const updateTableStatus = useCallback((tableId: string, status: TableStatus, extra?: Partial<Table>) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, status, ...extra } : t))
    );
  }, []);

  const seatWalkIn = useCallback((tableId: string, guestName: string, partySize: number, serverName: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: 'seated',
              currentGuestName: `${guestName} (${partySize}p)`,
              seatedAt: new Date().toISOString(),
              serverName,
              activeOrderTotal: 0,
            }
          : t
      )
    );
    addNotification('Walk-in Seated', `Seated ${guestName} at Table ${tables.find(t => t.id === tableId)?.number || ''}`, 'success');
  }, [tables, addNotification]);

  const seatReservation = useCallback((reservationId: string, tableId: string) => {
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) return;

    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: 'seated',
              currentReservationId: res.id,
              currentGuestName: `${res.guestName} (${res.partySize}p)`,
              seatedAt: new Date().toISOString(),
              serverName: 'Julian M.',
              activeOrderTotal: 0,
            }
          : t
      )
    );

    setReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, status: 'seated', tableId } : r))
    );

    addNotification('Reservation Seated', `${res.guestName} seated at Table ${tables.find(t => t.id === tableId)?.number || ''}`, 'success');
  }, [reservations, tables, addNotification]);

  const markTableCleaned = useCallback((tableId: string) => {
    const table = tables.find((t) => t.id === tableId);
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: 'available',
              currentGuestName: undefined,
              currentReservationId: undefined,
              seatedAt: undefined,
              serverName: undefined,
              activeOrderTotal: undefined,
            }
          : t
      )
    );
    addNotification('Table Ready', `Table ${table?.number || ''} sanitised and available`, 'info');
  }, [tables, addNotification]);

  const freeTable = useCallback((tableId: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: 'bussing',
              currentGuestName: undefined,
              currentReservationId: undefined,
              seatedAt: undefined,
              activeOrderTotal: undefined,
            }
          : t
      )
    );
  }, []);

  // Reservation Management
  const createReservation = useCallback((data: Omit<Reservation, 'id' | 'referenceCode' | 'createdAt' | 'status'>): Reservation => {
    const referenceCode = `SS-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReservation: Reservation = {
      ...data,
      id: `res-${Date.now()}`,
      referenceCode,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    // If a specific table was selected, mark it reserved
    if (data.tableId) {
      setTables((prev) =>
        prev.map((t) =>
          t.id === data.tableId
            ? { ...t, status: 'reserved', currentReservationId: newReservation.id, currentGuestName: data.guestName }
            : t
        )
      );
    }

    setReservations((prev) => [newReservation, ...prev]);
    addNotification('Reservation Confirmed', `Ref ${referenceCode} for ${data.guestName} (${data.partySize} guests)`, 'success');
    return newReservation;
  }, [addNotification]);

  const updateReservationStatus = useCallback((reservationId: string, status: Reservation['status']) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, status } : r))
    );
  }, []);

  const cancelReservation = useCallback((reservationId: string) => {
    const res = reservations.find((r) => r.id === reservationId);
    setReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, status: 'cancelled' } : r))
    );
    if (res?.tableId) {
      setTables((prev) =>
        prev.map((t) =>
          t.id === res.tableId && t.currentReservationId === reservationId
            ? { ...t, status: 'available', currentReservationId: undefined, currentGuestName: undefined }
            : t
        )
      );
    }
    addNotification('Reservation Cancelled', `Booking ${res?.referenceCode || ''} cancelled.`, 'warning');
  }, [reservations, addNotification]);

  const lookupReservation = useCallback((query: string): Reservation | undefined => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return undefined;
    return reservations.find(
      (r) =>
        r.referenceCode.toLowerCase() === cleanQuery ||
        r.guestPhone.toLowerCase().includes(cleanQuery) ||
        r.guestEmail.toLowerCase().includes(cleanQuery)
    );
  }, [reservations]);

  // Inventory Management
  const adjustStock = useCallback((itemId: string, delta: number, reason: string) => {
    setInventory((prev) => {
      return prev.map((item) => {
        if (item.id === itemId) {
          const newStock = Math.max(0, Number((item.currentStock + delta).toFixed(3)));
          const newStatus = calculateStockStatus(newStock, item.parLevel);
          return {
            ...item,
            currentStock: newStock,
            status: newStatus,
          };
        }
        return item;
      });
    });

    const item = inventory.find((i) => i.id === itemId);
    if (item) {
      const costImpact = Number((Math.abs(delta) * item.unitCost).toFixed(2));
      const log: InventoryMovementLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: delta >= 0 ? 'restock' : 'depletion',
        itemId,
        itemName: item.name,
        delta,
        unit: item.unit,
        reason,
        user: currentUser?.name || 'Staff User',
        costImpact,
      };
      setMovementLogs((prev) => [log, ...prev]);

      if (item.currentStock + delta <= item.parLevel) {
        addNotification('Low Stock Alert', `${item.name} is below par level (${item.currentStock + delta} ${item.unit})`, 'alert');
      }
    }
  }, [inventory, currentUser, addNotification]);

  const setStockQuantity = useCallback((itemId: string, newStock: number, reason: string) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;
    const delta = Number((newStock - item.currentStock).toFixed(3));
    adjustStock(itemId, delta, reason);
  }, [inventory, adjustStock]);

  const logWastage = useCallback((itemId: string, quantity: number, reason: string) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;

    adjustStock(itemId, -Math.abs(quantity), `Waste: ${reason}`);
    addNotification('Waste Logged', `Logged ${quantity} ${item.unit} of ${item.name} as write-off`, 'warning');
  }, [inventory, adjustStock, addNotification]);

  const generatePurchaseOrder = useCallback((): PurchaseOrderItem[] => {
    return inventory
      .filter((item) => item.currentStock < item.optimalLevel)
      .map((item) => {
        const orderQuantity = Number((item.optimalLevel - item.currentStock).toFixed(2));
        const totalCost = Number((orderQuantity * item.unitCost).toFixed(2));
        return {
          itemId: item.id,
          sku: item.sku,
          name: item.name,
          currentStock: item.currentStock,
          parLevel: item.parLevel,
          optimalLevel: item.optimalLevel,
          orderQuantity,
          unit: item.unit,
          unitCost: item.unitCost,
          totalCost,
          supplier: item.supplier,
        };
      })
      .sort((a, b) => b.totalCost - a.totalCost);
  }, [inventory]);

  const receivePurchaseOrder = useCallback((itemsToRestock: { itemId: string; quantity: number }[], poNumber: string) => {
    setInventory((prev) =>
      prev.map((item) => {
        const orderItem = itemsToRestock.find((x) => x.itemId === item.id);
        if (orderItem) {
          const newStock = Number((item.currentStock + orderItem.quantity).toFixed(2));
          return {
            ...item,
            currentStock: newStock,
            lastRestocked: new Date().toISOString().substring(0, 10),
            status: calculateStockStatus(newStock, item.parLevel),
          };
        }
        return item;
      })
    );

    // Create logs
    itemsToRestock.forEach((entry) => {
      const item = inventory.find((i) => i.id === entry.itemId);
      if (item) {
        const log: InventoryMovementLog = {
          id: `log-${Date.now()}-${entry.itemId}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          type: 'restock',
          itemId: entry.itemId,
          itemName: item.name,
          delta: entry.quantity,
          unit: item.unit,
          reason: `PO Received: ${poNumber}`,
          user: currentUser?.name || 'Antoine Laurent',
          costImpact: Number((entry.quantity * item.unitCost).toFixed(2)),
        };
        setMovementLogs((prev) => [log, ...prev]);
      }
    });

    addNotification('PO Received & Stocked', `Successfully received ${itemsToRestock.length} items on ${poNumber}`, 'success');
  }, [inventory, currentUser, addNotification]);

  // Menu Management
  const addMenuItem = useCallback((item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `menu-${Date.now()}`,
    };
    setMenuItems((prev) => [...prev, newItem]);
    addNotification('New Dish Created', `${item.name} added to restaurant menu`, 'success');
  }, [addNotification]);

  // Orders and POS with dynamic inventory recipe depletion
  const createTableOrder = useCallback((tableId: string, itemsToAdd: { menuItemId: string; quantity: number }[], serverName: string): TableOrder => {
    const table = tables.find((t) => t.id === tableId);
    const orderItems = itemsToAdd.map(({ menuItemId, quantity }) => {
      const dish = menuItems.find((m) => m.id === menuItemId)!;
      return {
        menuItemId,
        name: dish.name,
        price: dish.price,
        quantity,
        firedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    });

    const subtotal = orderItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const total = subtotal + tax;

    const newOrder: TableOrder = {
      id: `ord-${Date.now()}`,
      tableId,
      tableNumber: table?.number || 1,
      guestName: table?.currentGuestName || `Table ${table?.number || 1}`,
      serverName,
      status: 'active',
      items: orderItems,
      subtotal,
      tax,
      total,
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, activeOrderTotal: total } : t))
    );

    return newOrder;
  }, [tables, menuItems]);

  const fireOrderToKitchen = useCallback((orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    // Track total ingredients deducted for toast summary
    const deductions: { [itemId: string]: { name: string; quantity: number; unit: string; cost: number } } = {};

    order.items.forEach((item) => {
      const dish = menuItems.find((m) => m.id === item.menuItemId);
      if (dish && dish.recipeIngredients) {
        dish.recipeIngredients.forEach((recipe) => {
          const totalQty = recipe.quantity * item.quantity;
          const invItem = inventory.find((i) => i.id === recipe.inventoryItemId);
          if (invItem) {
            if (!deductions[invItem.id]) {
              deductions[invItem.id] = {
                name: invItem.name,
                quantity: 0,
                unit: invItem.unit,
                cost: invItem.unitCost,
              };
            }
            deductions[invItem.id].quantity += totalQty;
          }
        });
      }
    });

    // Apply inventory deductions
    setInventory((prev) =>
      prev.map((item) => {
        if (deductions[item.id]) {
          const deduction = deductions[item.id].quantity;
          const newStock = Math.max(0, Number((item.currentStock - deduction).toFixed(3)));
          return {
            ...item,
            currentStock: newStock,
            status: calculateStockStatus(newStock, item.parLevel),
          };
        }
        return item;
      })
    );

    // Create movement logs
    const newLogs: InventoryMovementLog[] = Object.entries(deductions).map(([itemId, d]) => ({
      id: `log-${Date.now()}-${itemId}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'depletion',
      itemId,
      itemName: d.name,
      delta: -Number(d.quantity.toFixed(3)),
      unit: d.unit,
      reason: `Kitchen Order fired for Table ${order.tableNumber}`,
      user: order.serverName || 'Kitchen Expediter',
      costImpact: Number((d.quantity * d.cost).toFixed(2)),
    }));

    setMovementLogs((prev) => [...newLogs, ...prev]);

    // Update order status
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'in_kitchen' } : o))
    );

    addNotification(
      'Order Fired to Kitchen',
      `Table ${order.tableNumber}: ${order.items.length} dishes fired. Real-time ingredient stock depleted.`,
      'success'
    );
  }, [orders, menuItems, inventory, addNotification]);

  const settleOrder = useCallback((orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'paid' } : o))
    );

    // Set table to bussing
    setTables((prev) =>
      prev.map((t) =>
        t.id === order.tableId
          ? {
              ...t,
              status: 'bussing',
              activeOrderTotal: undefined,
              currentGuestName: undefined,
              currentReservationId: undefined,
              seatedAt: undefined,
            }
          : t
      )
    );

    addNotification('Check Settled', `Table ${order.tableNumber} bill of ₹${order.total.toFixed(2)} paid. Table marked for cleaning.`, 'info');
  }, [orders, addNotification]);

  // Waitlist
  const addToWaitlist = useCallback((entry: Omit<WaitlistEntry, 'id' | 'addedAt' | 'status'>) => {
    const newEntry: WaitlistEntry = {
      ...entry,
      id: `wl-${Date.now()}`,
      addedAt: new Date().toISOString(),
      status: 'waiting',
    };
    setWaitlist((prev) => [...prev, newEntry]);
    addNotification('Guest Added to Waitlist', `${entry.name} (${entry.partySize} people) wait time ~${entry.quotedMins} mins`, 'info');
  }, [addNotification]);

  const seatWaitlistParty = useCallback((waitlistId: string, tableId: string, serverName: string) => {
    const entry = waitlist.find((w) => w.id === waitlistId);
    if (!entry) return;

    setWaitlist((prev) =>
      prev.map((w) => (w.id === waitlistId ? { ...w, status: 'seated' } : w))
    );

    seatWalkIn(tableId, entry.name, entry.partySize, serverName);
  }, [waitlist, seatWalkIn]);

  const removeWaitlistParty = useCallback((waitlistId: string) => {
    setWaitlist((prev) => prev.filter((w) => w.id !== waitlistId));
  }, []);

  // Real-time Simulation Engine
  const triggerSimulatedOrder = useCallback(() => {
    // Pick an active seated table or seat one
    const seatedTables = tables.filter((t) => t.status === 'seated');
    let targetTable = seatedTables[Math.floor(Math.random() * seatedTables.length)];

    if (!targetTable) {
      // Pick available table to seat
      const avail = tables.find((t) => t.status === 'available');
      if (avail) {
        seatWalkIn(avail.id, 'Walking Guests', 2, 'Amit Kumar');
        targetTable = avail;
      }
    }

    if (!targetTable) return;

    // Pick 1-2 random dishes
    const randomDishes = [
      menuItems[Math.floor(Math.random() * 3)],
      menuItems[3 + Math.floor(Math.random() * (menuItems.length - 3))],
    ].filter(Boolean);

    const itemsToAdd = randomDishes.map((d) => ({ menuItemId: d.id, quantity: 1 }));
    const newOrder = createTableOrder(targetTable.id, itemsToAdd, 'Amit Kumar');
    
    // Auto-fire to show dynamic inventory reduction
    setTimeout(() => {
      fireOrderToKitchen(newOrder.id);
    }, 400);
  }, [tables, menuItems, seatWalkIn, createTableOrder, fireOrderToKitchen]);

  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      triggerSimulatedOrder();
    }, 8500);

    return () => clearInterval(interval);
  }, [isSimulating, triggerSimulatedOrder]);

  const toggleSimulation = useCallback(() => {
    setIsSimulating((prev) => {
      const next = !prev;
      addNotification(
        next ? 'Live Orders Simulation Started' : 'Simulation Paused',
        next
          ? 'Live kitchen service running: orders will automatically use up stock ingredients.'
          : 'Simulation stopped.',
        next ? 'success' : 'info'
      );
      return next;
    });
  }, [addNotification]);

  // CSV Exports
  const exportInventoryCSV = useCallback(() => {
    const headers = ['SKU', 'Name', 'Category', 'Current Stock', 'Unit', 'Par Level', 'Optimal Level', 'Unit Cost (₹)', 'Stock Value (₹)', 'Supplier', 'Status'];
    const rows = inventory.map((i) => [
      i.sku,
      `"${i.name}"`,
      i.category,
      i.currentStock,
      i.unit,
      i.parLevel,
      i.optimalLevel,
      i.unitCost.toFixed(2),
      (i.currentStock * i.unitCost).toFixed(2),
      `"${i.supplier}"`,
      i.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `restaurant_inventory_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification('CSV Exported', 'Inventory stock report downloaded', 'info');
  }, [inventory, addNotification]);

  const exportReservationsCSV = useCallback(() => {
    const headers = ['Ref Code', 'Guest Name', 'Phone', 'Email', 'Date', 'Time Slot', 'Party Size', 'Area', 'Table #', 'Status', 'Occasion'];
    const rows = reservations.map((r) => [
      r.referenceCode,
      `"${r.guestName}"`,
      `"${r.guestPhone}"`,
      r.guestEmail,
      r.date,
      r.timeSlot,
      r.partySize,
      r.areaPreference,
      r.tableNumber || '',
      r.status,
      r.occasion || 'Casual',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `restaurant_reservations_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification('CSV Exported', 'Table reservations ledger downloaded', 'info');
  }, [reservations, addNotification]);

  const resetAllData = useCallback(() => {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}tables`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}reservations`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}inventory`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}menuItems`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}orders`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}movementLogs`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}waitlist`);

    setTables(INITIAL_TABLES);
    setReservations(INITIAL_RESERVATIONS);
    setInventory(INITIAL_INVENTORY);
    setMenuItems(INITIAL_MENU_ITEMS);
    setOrders(INITIAL_ORDERS);
    setMovementLogs(INITIAL_MOVEMENT_LOGS);
    setWaitlist(INITIAL_WAITLIST);
    addNotification('Data Reset', 'Restored restaurant sample data to factory baseline', 'info');
  }, [addNotification]);

  return (
    <RestaurantContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentUser,
        currentRole,
        isAdminUnlocked,
        authenticateStaff,
        switchRole,
        lockAdmin,
        allStaff: INITIAL_STAFF,

        tables,
        updateTableStatus,
        seatWalkIn,
        seatReservation,
        markTableCleaned,
        freeTable,

        reservations,
        createReservation,
        updateReservationStatus,
        cancelReservation,
        lookupReservation,

        inventory,
        movementLogs,
        adjustStock,
        setStockQuantity,
        logWastage,
        generatePurchaseOrder,
        receivePurchaseOrder,

        menuItems,
        addMenuItem,

        orders,
        createTableOrder,
        fireOrderToKitchen,
        settleOrder,

        waitlist,
        addToWaitlist,
        seatWaitlistParty,
        removeWaitlistParty,

        isSimulating,
        toggleSimulation,
        triggerSimulatedOrder,

        exportInventoryCSV,
        exportReservationsCSV,
        resetAllData,
        notifications,
        dismissNotification,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
