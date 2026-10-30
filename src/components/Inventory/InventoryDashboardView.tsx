/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { InventoryCategory, StockStatus, InventoryItem } from '../../types/restaurant';
import {
  Boxes,
  AlertTriangle,
  TrendingDown,
  ShoppingCart,
  Plus,
  Minus,
  Search,
  Download,
  Trash2,
  PackageCheck,
  Flame,
  X,
} from 'lucide-react';

export const InventoryDashboardView: React.FC = () => {
  const {
    inventory,
    movementLogs,
    adjustStock,
    setStockQuantity,
    logWastage,
    generatePurchaseOrder,
    receivePurchaseOrder,
    exportInventoryCSV,
    isSimulating,
    toggleSimulation,
    triggerSimulatedOrder,
  } = useRestaurant();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<StockStatus | 'all'>('all');

  const [showPOModal, setShowPOModal] = useState(false);
  const [poNumber, setPoNumber] = useState(() => `PO-${Math.floor(1000 + Math.random() * 9000)}`);

  const [showWasteModal, setShowWasteModal] = useState(false);
  const [wasteItemId, setWasteItemId] = useState(inventory[0]?.id || '');
  const [wasteQty, setWasteQty] = useState(1);
  const [wasteReason, setWasteReason] = useState('Expired / Overripe');

  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [newStockValue, setNewStockValue] = useState(0);

  const filteredItems = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalValuation = inventory.reduce((sum, item) => sum + item.currentStock * item.unitCost, 0);
  const lowStockCount = inventory.filter((item) => item.status === 'low_stock').length;
  const criticalCount = inventory.filter((item) => item.status === 'critical').length;
  const poItems = generatePurchaseOrder();
  const totalPOCost = poItems.reduce((acc, p) => acc + p.totalCost, 0);

  const todayDepletionCost = movementLogs
    .filter((log) => log.type === 'depletion')
    .reduce((sum, log) => sum + log.costImpact, 0);

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem) return;
    setStockQuantity(adjustingItem.id, newStockValue, 'Physical stock count verified');
    setAdjustingItem(null);
  };

  const handleWasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wasteItemId || wasteQty <= 0) return;
    logWastage(wasteItemId, wasteQty, wasteReason);
    setShowWasteModal(false);
    setWasteQty(1);
  };

  const handleApprovePO = () => {
    const itemsToReceive = poItems.map((p) => ({
      itemId: p.itemId,
      quantity: p.orderQuantity,
    }));
    receivePurchaseOrder(itemsToReceive, poNumber);
    setShowPOModal(false);
    setPoNumber(`PO-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const getCategoryColor = (cat: InventoryCategory) => {
    switch (cat) {
      case 'Chicken & Meat': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'Vegetables & Herbs': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Dairy & Ghee': return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'Rice & Spices': return 'text-yellow-800 bg-yellow-50 border-yellow-200';
      case 'Drinks & Bar': return 'text-cyan-800 bg-cyan-50 border-cyan-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">Kitchen Food Stock &amp; Inventory</h2>
          <div className="flex items-center gap-2 text-xs text-stone-500 mt-1 font-medium">
            <span>{inventory.length} Items in Kitchen</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>Auto Stock Deduction with Orders</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="text-amber-700 font-bold">{lowStockCount} Items Low</span>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Simulate 1 Order */}
          <button
            onClick={triggerSimulatedOrder}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white hover:bg-stone-50 text-orange-700 border border-orange-300 rounded-xl transition-all shadow-xs"
            title="Simulate 1 order to see live ingredient deduction"
          >
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-100" />
            <span>Simulate 1 Order</span>
          </button>

          {/* Report Waste */}
          <button
            onClick={() => setShowWasteModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors whitespace-nowrap"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>Report Waste</span>
          </button>

          {/* Restock PO */}
          <button
            onClick={() => setShowPOModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-orange-600 rounded-xl transition-all whitespace-nowrap shadow-sm"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Order Stock ({poItems.length})</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={exportInventoryCSV}
            className="p-2 text-stone-500 hover:text-stone-900 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl transition-colors"
            title="Download Stock CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Colorful Status Banner */}
      <div className={`p-4 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs ${
        isSimulating 
          ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900' 
          : 'bg-white border-stone-200 text-stone-700'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-3.5 h-3.5 rounded-full ${isSimulating ? 'bg-emerald-500 ring-4 ring-emerald-200 animate-pulse' : 'bg-stone-300'}`} />
          <div>
            <span className="font-bold text-stone-900 text-sm">
              {isSimulating ? 'Live Kitchen Orders Running' : 'Kitchen Simulation Paused'}
            </span>
            <p className="text-stone-500 text-xs mt-0.5">
              {isSimulating
                ? 'Orders are firing live! Watch stock levels for chicken, paneer, and butter decrement in real time.'
                : 'Turn on simulation to see stock quantities automatically reduce as customers order dishes.'}
            </p>
          </div>
        </div>

        <button
          onClick={toggleSimulation}
          className={`px-4 py-2 font-bold rounded-xl transition-all whitespace-nowrap text-xs ${
            isSimulating
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
          }`}
        >
          {isSimulating ? 'Pause Service' : 'Start Live Orders'}
        </button>
      </div>

      {/* Colorful KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stock Valuation */}
        <div className="p-4 bg-white border border-stone-200 rounded-3xl space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-600 font-bold">
            <span>Total Stock Value</span>
            <Boxes className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-stone-900 tabular-nums tracking-tight">
            ₹{totalValuation.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <p className="text-[11px] text-stone-400 font-medium">Total ingredients in kitchen</p>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-4 bg-white border border-amber-200 rounded-3xl space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-amber-700 font-bold">
            <span>Items Running Low</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-700 tabular-nums tracking-tight">
            {lowStockCount} items
          </div>
          <p className="text-[11px] text-stone-400 font-medium">Below minimum safety amount</p>
        </div>

        {/* Critical Depleted */}
        <div className="p-4 bg-white border border-rose-200 rounded-3xl space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-rose-700 font-bold">
            <span>Out of Stock</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-rose-700 tabular-nums tracking-tight">
            {criticalCount} items
          </div>
          <p className="text-[11px] text-stone-400 font-medium">Order today to avoid delay</p>
        </div>

        {/* Today's Consumption */}
        <div className="p-4 bg-white border border-emerald-200 rounded-3xl space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-emerald-700 font-bold">
            <span>Today&apos;s Used Stock</span>
            <TrendingDown className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-700 tabular-nums tracking-tight">
            ₹{todayDepletionCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <p className="text-[11px] text-stone-400 font-medium">Ingredients cooked today</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-stone-200 rounded-3xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search chicken, paneer, tomatoes, rice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2 pl-9 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1 p-1 bg-stone-50 border border-stone-200 rounded-2xl overflow-x-auto">
            {(['All', 'Chicken & Meat', 'Vegetables & Herbs', 'Dairy & Ghee', 'Rice & Spices', 'Drinks & Bar'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap font-semibold ${
                  selectedCategory === cat
                    ? 'bg-white text-stone-900 font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as StockStatus | 'all')}
            className="px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Running Low</option>
            <option value="critical">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Table in Light Mode */}
      <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/80 text-stone-500 uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-4">Item Name / Code</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">In Kitchen</th>
                <th className="py-3 px-4 min-w-[140px]">Stock Gauge</th>
                <th className="py-3 px-4 text-right">Cost / Unit (₹)</th>
                <th className="py-3 px-4 text-right">Total Value (₹)</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-stone-400">
                    No items found matching your filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const percentOfOptimal = Math.min(100, Math.round((item.currentStock / item.optimalLevel) * 100));
                  const itemTotalVal = item.currentStock * item.unitCost;

                  return (
                    <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-stone-900 block text-xs">{item.name}</span>
                        <span className="text-[10px] font-mono text-stone-400">{item.sku}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-extrabold text-stone-900 tabular-nums text-xs">
                        {item.currentStock} {item.unit}
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
                            <span>Min: {item.parLevel}{item.unit}</span>
                            <span>Full: {item.optimalLevel}{item.unit}</span>
                          </div>
                          <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden border border-stone-200">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                item.status === 'critical'
                                  ? 'bg-rose-500'
                                  : item.status === 'low_stock'
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.max(6, percentOfOptimal)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-stone-600 tabular-nums font-medium">
                        ₹{item.unitCost.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-extrabold text-stone-900 tabular-nums">
                        ₹{itemTotalVal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>

                      <td className="py-3 px-4 text-stone-500 truncate max-w-[150px] font-medium">
                        {item.supplier}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            item.status === 'critical'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : item.status === 'low_stock'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {item.status === 'critical' ? 'Out of Stock' : item.status === 'low_stock' ? 'Running Low' : 'In Stock'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => adjustStock(item.id, -1, 'Chef Kitchen Usage')}
                            title="Remove 1 unit"
                            className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => adjustStock(item.id, 1, 'Delivery received')}
                            title="Add 1 unit"
                            className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setAdjustingItem(item);
                              setNewStockValue(item.currentStock);
                            }}
                            title="Count and set exact stock"
                            className="px-2 py-0.5 text-[10px] font-mono text-stone-600 hover:text-orange-600 hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors font-bold"
                          >
                            Set
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Movements */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-stone-900">Live Stock Changes &amp; Logs</h3>
            <p className="text-xs text-stone-500 mt-0.5">Every dish cooked, delivery received, and reported waste</p>
          </div>
          <span className="text-[11px] font-mono text-stone-400 font-medium">
            {movementLogs.length} updates logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Item</th>
                <th className="py-2.5 px-3 text-right">Change</th>
                <th className="py-2.5 px-3 text-right">Cost (₹)</th>
                <th className="py-2.5 px-3">Reason</th>
                <th className="py-2.5 px-3">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono">
              {movementLogs.slice(0, 8).map((log) => (
                <tr key={log.id} className="hover:bg-stone-50/60">
                  <td className="py-2.5 px-3 text-stone-500 tabular-nums">{log.timestamp}</td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      log.type === 'depletion' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                      log.type === 'restock' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      log.type === 'waste' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'text-stone-700'
                    }`}>
                      {log.type === 'depletion' ? 'Cooked' : log.type === 'restock' ? 'Restocked' : log.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-stone-900 font-bold">{log.itemName}</td>
                  <td className={`py-2.5 px-3 text-right font-extrabold tabular-nums ${
                    log.delta < 0 ? 'text-orange-600' : 'text-emerald-600'
                  }`}>
                    {log.delta > 0 ? `+${log.delta}` : log.delta} {log.unit}
                  </td>
                  <td className="py-2.5 px-3 text-right text-stone-800 font-bold tabular-nums">
                    ₹{log.costImpact.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-stone-500 truncate max-w-[200px]">{log.reason}</td>
                  <td className="py-2.5 px-3 font-sans text-stone-400">{log.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Order Sheet */}
      {showPOModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white border border-stone-200 rounded-3xl p-6 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <span className="text-[10px] font-mono text-orange-600 font-bold uppercase tracking-wider">
                  Quick Stock Reorder
                </span>
                <h3 className="text-base font-extrabold text-stone-900 mt-0.5">Order Delivery Sheet: {poNumber}</h3>
              </div>
              <button onClick={() => setShowPOModal(false)} className="text-stone-400 hover:text-stone-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-stone-600 font-medium">
              Below are items that need reordering to keep the kitchen fully stocked:
            </p>

            <div className="max-h-72 overflow-y-auto border border-stone-200 rounded-2xl bg-stone-50">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-100 text-stone-500 uppercase text-[10px] font-bold">
                    <th className="py-2 px-3">Item Name</th>
                    <th className="py-2 px-3">Vendor</th>
                    <th className="py-2 px-3 text-right">In Kitchen</th>
                    <th className="py-2 px-3 text-right">Order Qty</th>
                    <th className="py-2 px-3 text-right">Est. Cost (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 font-mono">
                  {poItems.map((p) => (
                    <tr key={p.itemId}>
                      <td className="py-2.5 px-3 font-sans font-bold text-stone-900">{p.name}</td>
                      <td className="py-2.5 px-3 font-sans text-stone-500">{p.supplier}</td>
                      <td className="py-2.5 px-3 text-right text-stone-600 tabular-nums font-semibold">
                        {p.currentStock} {p.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-orange-600 tabular-nums">
                        +{p.orderQuantity} {p.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right text-stone-900 font-bold tabular-nums">
                        ₹{p.totalCost.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-stone-500 text-xs font-medium">Total Order Bill Estimate:</span>
                <span className="text-xl font-mono font-extrabold text-orange-600 block tabular-nums">
                  ₹{totalPOCost.toFixed(2)}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPOModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApprovePO}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>Receive Stock Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Report Waste */}
      {showWasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border border-stone-200 rounded-3xl p-6 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h3 className="text-sm font-bold text-stone-900">Report Waste or Spoiled Item</h3>
              <button onClick={() => setShowWasteModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleWasteSubmit} className="space-y-4">
              <div>
                <label className="block text-stone-600 font-medium mb-1">Select Item</label>
                <select
                  value={wasteItemId}
                  onChange={(e) => setWasteItemId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                >
                  {inventory.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name} ({inv.currentStock} {inv.unit} in kitchen)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Quantity to Discard</label>
                <input
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={wasteQty}
                  onChange={(e) => setWasteQty(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono font-medium focus:bg-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Reason</label>
                <select
                  value={wasteReason}
                  onChange={(e) => setWasteReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                >
                  <option value="Expired / Past Best Before">Expired / Past Best Before</option>
                  <option value="Trimming & Prep Waste">Trimming &amp; Prep Waste</option>
                  <option value="Accidental Kitchen Spill">Accidental Kitchen Spill</option>
                  <option value="Damaged in transit">Damaged in transit</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWasteModal(false)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Record Waste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Count Check */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border border-stone-200 rounded-3xl p-6 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h3 className="text-sm font-bold text-stone-900">Update Stock Count</h3>
              <button onClick={() => setAdjustingItem(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="font-bold text-stone-900 text-sm">{adjustingItem.name}</p>
              <p className="text-stone-500 text-[11px] font-medium">Unit: {adjustingItem.unit}</p>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-stone-600 font-medium mb-1">Actual Measured Quantity</label>
                <input
                  type="number"
                  step={0.01}
                  min={0}
                  value={newStockValue}
                  onChange={(e) => setNewStockValue(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono text-base font-bold focus:bg-white focus:outline-none focus:border-orange-500"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingItem(null)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Count
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
