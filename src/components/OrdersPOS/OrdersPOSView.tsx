/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { TableOrder } from '../../types/restaurant';
import {
  Flame,
  CheckCircle,
  Receipt,
  Plus,
  X,
  Sparkles,
} from 'lucide-react';

export const OrdersPOSView: React.FC = () => {
  const {
    orders,
    tables,
    menuItems,
    createTableOrder,
    fireOrderToKitchen,
    settleOrder,
  } = useRestaurant();

  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState(tables[0]?.id || '');
  const [orderItemsMap, setOrderItemsMap] = useState<{ [menuItemId: string]: number }>({});
  const [serverName, setServerName] = useState('Amit Kumar');

  const [settlingOrder, setSettlingOrder] = useState<TableOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'in_kitchen' | 'served' | 'paid'>('all');

  const activeOrders = orders.filter((o) =>
    statusFilter === 'all' ? true : o.status === statusFilter
  );

  const handleIncrementDish = (dishId: string) => {
    setOrderItemsMap((prev) => ({
      ...prev,
      [dishId]: (prev[dishId] || 0) + 1,
    }));
  };

  const handleDecrementDish = (dishId: string) => {
    setOrderItemsMap((prev) => {
      const current = prev[dishId] || 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[dishId];
        return copy;
      }
      return { ...prev, [dishId]: current - 1 };
    });
  };

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const itemsToAdd = Object.entries(orderItemsMap).map(([menuItemId, quantity]) => ({
      menuItemId,
      quantity,
    }));

    if (itemsToAdd.length === 0) return;

    const newOrder = createTableOrder(selectedTableId, itemsToAdd, serverName);
    fireOrderToKitchen(newOrder.id);

    setShowNewOrderModal(false);
    setOrderItemsMap({});
  };

  const getIngredientPreview = () => {
    const preview: { [name: string]: { qty: number; unit: string } } = {};
    Object.entries(orderItemsMap).forEach(([dishId, count]) => {
      const dish = menuItems.find((d) => d.id === dishId);
      if (dish) {
        dish.recipeIngredients.forEach((r) => {
          if (!preview[r.ingredientName]) {
            preview[r.ingredientName] = { qty: 0, unit: r.unit };
          }
          preview[r.ingredientName].qty += Number((r.quantity * count).toFixed(3));
        });
      }
    });
    return preview;
  };

  const ingredientPreview = getIngredientPreview();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">Kitchen Orders &amp; Bill Counter</h2>
          <div className="flex items-center gap-2 text-xs text-stone-500 mt-1 font-medium">
            <span className="text-orange-600 font-bold">{orders.filter(o => o.status !== 'paid').length} Active Orders</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>All Prices in Rupees (₹)</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>Automatic Stock Deduction</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter Tabs */}
          <div className="flex items-center p-1 bg-stone-100 border border-stone-200 rounded-2xl text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all font-semibold ${
                statusFilter === 'all' ? 'bg-white text-stone-900 font-bold shadow-xs' : 'text-stone-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('in_kitchen')}
              className={`px-3 py-1.5 rounded-xl transition-all font-semibold ${
                statusFilter === 'in_kitchen' ? 'bg-orange-100 text-orange-900 font-bold shadow-xs' : 'text-stone-600'
              }`}
            >
              Cooking Now
            </button>
            <button
              onClick={() => setStatusFilter('served')}
              className={`px-3 py-1.5 rounded-xl transition-all font-semibold ${
                statusFilter === 'served' ? 'bg-violet-100 text-violet-900 font-bold shadow-xs' : 'text-stone-600'
              }`}
            >
              Served
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1.5 rounded-xl transition-all font-semibold ${
                statusFilter === 'paid' ? 'bg-emerald-100 text-emerald-900 font-bold shadow-xs' : 'text-stone-600'
              }`}
            >
              Paid
            </button>
          </div>

          <button
            onClick={() => setShowNewOrderModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* Active Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {activeOrders.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-stone-400 bg-white border border-stone-200 rounded-3xl">
            No active orders right now. Click &ldquo;New Order&rdquo; to add food for a table.
          </div>
        ) : (
          activeOrders.map((order) => {
            return (
              <div
                key={order.id}
                className="bg-white border border-stone-200 rounded-3xl p-5 flex flex-col justify-between hover:border-orange-300 transition-colors shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-orange-100 border border-orange-200 text-orange-700 font-mono font-extrabold text-sm flex items-center justify-center">
                        T{order.tableNumber}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-stone-900">{order.guestName}</h4>
                        <span className="text-[11px] text-stone-500">Server: {order.serverName}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        order.status === 'in_kitchen'
                          ? 'bg-orange-50 text-orange-800 border border-orange-200'
                          : order.status === 'served'
                          ? 'bg-violet-50 text-violet-800 border border-violet-200'
                          : order.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {order.status === 'in_kitchen' ? 'Cooking in Kitchen' : order.status === 'served' ? 'Food Served' : 'Paid Bill'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-orange-600 tabular-nums">
                            {item.quantity}x
                          </span>
                          <span className="text-stone-800 font-medium">{item.name}</span>
                        </div>
                        <span className="font-mono text-stone-600 tabular-nums font-bold">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-stone-500 font-medium">Total Bill (Incl. GST):</span>
                    <span className="text-lg font-extrabold text-stone-900 tabular-nums">
                      ₹{order.total.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {order.status === 'active' && (
                      <button
                        onClick={() => fireOrderToKitchen(order.id)}
                        className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>Send to Kitchen</span>
                      </button>
                    )}

                    {order.status === 'in_kitchen' && (
                      <button
                        onClick={() => {
                          const updated = orders.map((o) =>
                            o.id === order.id ? { ...o, status: 'served' as const } : o
                          );
                          localStorage.setItem('spice_sizzle_v2_orders', JSON.stringify(updated));
                          window.location.reload();
                        }}
                        className="flex-1 py-2.5 bg-violet-50 hover:bg-violet-100 text-violet-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-violet-200 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Mark as Served</span>
                      </button>
                    )}

                    {order.status !== 'paid' && (
                      <button
                        onClick={() => setSettlingOrder(order)}
                        className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Pay Bill</span>
                      </button>
                    )}

                    {order.status === 'paid' && (
                      <div className="w-full text-center py-2 text-xs font-mono text-emerald-800 font-bold bg-emerald-50 rounded-xl border border-emerald-200">
                        Paid &amp; Closed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: New Order */}
      {showNewOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white border border-stone-200 rounded-3xl p-6 shadow-2xl text-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="text-base font-bold text-stone-900">Create New Table Order</h3>
                <p className="text-stone-500 text-xs mt-0.5">Select dishes to cook for the table</p>
              </div>
              <button onClick={() => setShowNewOrderModal(false)} className="text-stone-400 hover:text-stone-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrderSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">Select Table *</label>
                  <select
                    value={selectedTableId}
                    onChange={(e) => setSelectedTableId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:border-orange-500 font-bold"
                  >
                    {tables.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.zone} - {t.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 font-medium mb-1">Server on Duty</label>
                  <select
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                  >
                    <option value="Amit Kumar">Amit Kumar (Supervisor)</option>
                    <option value="Rahul">Rahul (Server)</option>
                    <option value="Suresh">Suresh (Server)</option>
                  </select>
                </div>
              </div>

              {/* Menu Dishes */}
              <div>
                <label className="block text-stone-600 font-bold mb-2">Select Dishes &amp; Drinks</label>
                <div className="max-h-60 overflow-y-auto space-y-2 border border-stone-200 rounded-2xl p-2 bg-stone-50">
                  {menuItems.map((dish) => {
                    const count = orderItemsMap[dish.id] || 0;
                    return (
                      <div
                        key={dish.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-stone-200 hover:border-orange-200 transition-colors shadow-2xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900 text-xs">{dish.name}</span>
                            <span className="text-[10px] text-stone-400 font-mono font-medium">({dish.category})</span>
                          </div>
                          <span className="text-orange-600 font-mono font-extrabold">₹{dish.price.toFixed(2)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDecrementDish(dish.id)}
                            className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 flex items-center justify-center font-bold text-sm"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-mono font-extrabold text-stone-900 tabular-nums text-sm">
                            {count}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleIncrementDish(dish.id)}
                            className="w-7 h-7 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ingredient Deduction Preview */}
              {Object.keys(ingredientPreview).length > 0 && (
                <div className="p-3.5 bg-orange-50 border border-orange-200 rounded-2xl space-y-1.5">
                  <span className="text-[11px] font-bold text-orange-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                    <span>Live Stock Deduction for this Order:</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-700 font-mono">
                    {Object.entries(ingredientPreview).map(([name, val]) => (
                      <div key={name} className="flex justify-between">
                        <span className="font-sans text-stone-600 truncate max-w-[140px] font-medium">{name}:</span>
                        <span className="text-orange-600 font-bold tabular-nums">-{val.qty} {val.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={Object.keys(orderItemsMap).length === 0}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Flame className="w-4 h-4" />
                  <span>Send to Kitchen &amp; Deduct Stock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bill Settlement in Light Mode */}
      {settlingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border border-stone-200 rounded-3xl p-6 shadow-2xl text-xs space-y-4">
            <div className="text-center pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900">Food Bill Checkout</h3>
              <p className="text-stone-500 text-xs mt-0.5">
                Table {settlingOrder.tableNumber} · {settlingOrder.guestName}
              </p>
            </div>

            <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 space-y-2 font-mono">
              {settlingOrder.items.map((it, i) => (
                <div key={i} className="flex justify-between text-stone-700">
                  <span className="font-sans font-medium">{it.quantity}x {it.name}</span>
                  <span className="tabular-nums font-bold">₹{(it.price * it.quantity).toFixed(2)}</span>
                </div>
              ))}

              <div className="pt-2 border-t border-stone-200 flex justify-between text-stone-500 font-medium">
                <span>Subtotal:</span>
                <span className="tabular-nums">₹{settlingOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-500 font-medium">
                <span>GST (5%):</span>
                <span className="tabular-nums">₹{settlingOrder.tax.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-extrabold text-stone-900">
                <span>Total Amount:</span>
                <span className="tabular-nums text-orange-600">₹{settlingOrder.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  settleOrder(settlingOrder.id);
                  setSettlingOrder(null);
                }}
                className="py-2.5 px-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl transition-all text-center shadow-xs"
              >
                UPI / QR
              </button>
              <button
                type="button"
                onClick={() => {
                  settleOrder(settlingOrder.id);
                  setSettlingOrder(null);
                }}
                className="py-2.5 px-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl transition-colors text-center"
              >
                Cash
              </button>
              <button
                type="button"
                onClick={() => {
                  settleOrder(settlingOrder.id);
                  setSettlingOrder(null);
                }}
                className="py-2.5 px-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl transition-colors text-center"
              >
                Card
              </button>
            </div>

            <button
              onClick={() => setSettlingOrder(null)}
              className="w-full py-2 text-stone-400 hover:text-stone-700 text-center font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
