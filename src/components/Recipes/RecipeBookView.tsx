/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { MenuItem, RecipeIngredient } from '../../types/restaurant';
import {
  Plus,
  X,
} from 'lucide-react';

export const RecipeBookView: React.FC = () => {
  const { menuItems, inventory, addMenuItem } = useRestaurant();

  const [selectedDish, setSelectedDish] = useState<MenuItem>(menuItems[0]);
  const [showNewDishModal, setShowNewDishModal] = useState(false);

  // New Dish Form
  const [dishName, setDishName] = useState('');
  const [dishCategory, setDishCategory] = useState<'Starter' | 'Main' | 'Dessert' | 'Beverage'>('Main');
  const [dishPrice, setDishPrice] = useState(350);
  const [dishDesc, setDishDesc] = useState('');
  const [dishPrepTime, setDishPrepTime] = useState(15);
  const [dishIngredients, setDishIngredients] = useState<RecipeIngredient[]>([]);
  const [selectedInvId, setSelectedInvId] = useState(inventory[0]?.id || '');
  const [ingredientQty, setIngredientQty] = useState(0.2);

  const calculateDishCost = (dish: MenuItem) => {
    let cost = 0;
    dish.recipeIngredients.forEach((r) => {
      const inv = inventory.find((i) => i.id === r.inventoryItemId);
      if (inv) {
        cost += r.quantity * inv.unitCost;
      }
    });
    return cost;
  };

  const calculatePortionsAvailable = (dish: MenuItem) => {
    let minPortions = Infinity;
    dish.recipeIngredients.forEach((r) => {
      const inv = inventory.find((i) => i.id === r.inventoryItemId);
      if (inv && r.quantity > 0) {
        const possible = Math.floor(inv.currentStock / r.quantity);
        if (possible < minPortions) {
          minPortions = possible;
        }
      }
    });
    return minPortions === Infinity ? 0 : minPortions;
  };

  const handleAddIngredientToDish = () => {
    const inv = inventory.find((i) => i.id === selectedInvId);
    if (!inv || ingredientQty <= 0) return;

    if (dishIngredients.some((i) => i.inventoryItemId === inv.id)) return;

    setDishIngredients((prev) => [
      ...prev,
      {
        inventoryItemId: inv.id,
        ingredientName: inv.name,
        quantity: ingredientQty,
        unit: inv.unit,
      },
    ]);
  };

  const handleCreateDishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim() || dishIngredients.length === 0) return;

    addMenuItem({
      name: dishName.trim(),
      category: dishCategory,
      price: dishPrice,
      description: dishDesc.trim(),
      prepTimeMins: dishPrepTime,
      recipeIngredients: dishIngredients,
    });

    setShowNewDishModal(false);
    setDishName('');
    setDishDesc('');
    setDishIngredients([]);
  };

  const activeCost = calculateDishCost(selectedDish);
  const grossProfit = selectedDish.price - activeCost;
  const grossMargin = selectedDish.price > 0 ? (grossProfit / selectedDish.price) * 100 : 0;
  const portionsReady = calculatePortionsAvailable(selectedDish);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">Menu Dishes &amp; Food Recipes</h2>
          <div className="flex items-center gap-2 text-xs text-stone-500 mt-1 font-medium">
            <span>{menuItems.length} Signature Dishes</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>Food Making Cost &amp; Profit</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>All Prices in Rupees (₹)</span>
          </div>
        </div>

        <button
          onClick={() => setShowNewDishModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Dish</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Dish List */}
        <div className="lg:col-span-5 space-y-2">
          <span className="text-xs uppercase font-mono font-bold tracking-wider text-stone-500 px-1 block mb-2">
            Restaurant Menu List
          </span>

          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {menuItems.map((dish) => {
              const isSelected = selectedDish.id === dish.id;
              const cost = calculateDishCost(dish);
              const margin = dish.price > 0 ? ((dish.price - cost) / dish.price) * 100 : 0;
              const portions = calculatePortionsAvailable(dish);

              return (
                <button
                  key={dish.id}
                  onClick={() => setSelectedDish(dish)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-orange-50/60 border-orange-500 shadow-sm ring-1 ring-orange-500/30'
                      : 'bg-white border-stone-200 hover:bg-stone-50 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-xs font-extrabold text-stone-900 leading-snug">{dish.name}</span>
                    <span className="text-xs font-mono font-extrabold text-orange-600 tabular-nums shrink-0">
                      ₹{dish.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
                    <span>{dish.category} · {dish.prepTimeMins}m prep</span>
                    <span className="tabular-nums text-emerald-700 font-bold">{margin.toFixed(0)}% Profit</span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                    <span className="text-stone-400 font-mono">Making Cost: ₹{cost.toFixed(2)}</span>
                    <span className={`font-mono font-bold ${portions <= 5 ? 'text-orange-600' : 'text-stone-700'}`}>
                      Can cook {portions} orders
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Selected Dish Details */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-6">
            
            <div>
              <div className="flex items-center gap-2 text-xs text-orange-600 font-mono uppercase tracking-wider mb-1 font-bold">
                <span>{selectedDish.category}</span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span>{selectedDish.prepTimeMins} MINS COOK TIME</span>
              </div>
              <h3 className="text-xl font-extrabold text-stone-900 tracking-tight">{selectedDish.name}</h3>
              <p className="text-xs text-stone-600 mt-1.5 leading-relaxed font-normal">{selectedDish.description}</p>
            </div>

            {selectedDish.image && (
              <div className="rounded-2xl overflow-hidden h-48 w-full border border-stone-200 relative">
                <img
                  src={selectedDish.image}
                  alt={selectedDish.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-4 text-xs font-bold text-white">
                  Kitchen Serving Presentation
                </span>
              </div>
            )}

            {/* Financials Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
                <span className="text-stone-500 block text-[10px] uppercase font-mono font-bold">Selling Price</span>
                <span className="font-mono font-extrabold text-base text-orange-600 tabular-nums">
                  ₹{selectedDish.price.toFixed(2)}
                </span>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
                <span className="text-stone-500 block text-[10px] uppercase font-mono font-bold">Making Cost</span>
                <span className="font-mono font-bold text-base text-stone-700 tabular-nums">
                  ₹{activeCost.toFixed(2)}
                </span>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
                <span className="text-stone-500 block text-[10px] uppercase font-mono font-bold">Profit Margin</span>
                <span className="font-mono font-extrabold text-base text-emerald-700 tabular-nums">
                  {grossMargin.toFixed(1)}%
                </span>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
                <span className="text-stone-500 block text-[10px] uppercase font-mono font-bold">Can Cook Now</span>
                <span className="font-mono font-extrabold text-base text-amber-700 tabular-nums">
                  {portionsReady} plates
                </span>
              </div>
            </div>

            {/* Ingredients Table */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider font-mono">
                  Ingredients Needed per Plate
                </h4>
                <span className="text-[11px] text-stone-400 font-mono font-medium">
                  {selectedDish.recipeIngredients.length} ingredients
                </span>
              </div>

              <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50 text-stone-500 uppercase text-[10px] font-bold">
                      <th className="py-2.5 px-3">Ingredient</th>
                      <th className="py-2.5 px-3 text-right">Recipe Amount</th>
                      <th className="py-2.5 px-3 text-right">Rate / Unit (₹)</th>
                      <th className="py-2.5 px-3 text-right">Cost (₹)</th>
                      <th className="py-2.5 px-3 text-right">In Kitchen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-mono">
                    {selectedDish.recipeIngredients.map((r, i) => {
                      const inv = inventory.find((invItem) => invItem.id === r.inventoryItemId);
                      const unitCost = inv?.unitCost || 0;
                      const portionCost = r.quantity * unitCost;
                      const stockAvailable = inv?.currentStock || 0;
                      const isLow = inv ? inv.currentStock < inv.parLevel : false;

                      return (
                        <tr key={i} className="hover:bg-stone-50/60">
                          <td className="py-2.5 px-3 font-sans font-bold text-stone-900">
                            {r.ingredientName}
                          </td>
                          <td className="py-2.5 px-3 text-right text-orange-600 font-extrabold tabular-nums">
                            {r.quantity} {r.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right text-stone-500 tabular-nums">
                            ₹{unitCost.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-stone-900 font-bold tabular-nums">
                            ₹{portionCost.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums">
                            <span className={isLow ? 'text-amber-700 font-extrabold' : 'text-stone-600'}>
                              {stockAvailable} {r.unit}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Modal: Add New Recipe */}
      {showNewDishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white border border-stone-200 rounded-3xl p-6 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900">Add New Dish to Menu</h3>
              <button onClick={() => setShowNewDishModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDishSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">Dish Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kadai Chicken"
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-medium mb-1">Menu Category</label>
                  <select
                    value={dishCategory}
                    onChange={(e) => setDishCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                  >
                    <option value="Starter">Starter</option>
                    <option value="Main">Main Course</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Beverage">Beverage &amp; Drinks</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    min={10}
                    step={10}
                    value={dishPrice}
                    onChange={(e) => setDishPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono focus:bg-white focus:outline-none focus:border-orange-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-medium mb-1">Cook Time (Minutes)</label>
                  <input
                    type="number"
                    min={1}
                    value={dishPrepTime}
                    onChange={(e) => setDishPrepTime(parseInt(e.target.value) || 10)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Food Description</label>
                <textarea
                  rows={2}
                  placeholder="Fresh ingredients, flavor profile..."
                  value={dishDesc}
                  onChange={(e) => setDishDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:border-orange-500 resize-none text-xs"
                />
              </div>

              {/* Add Ingredients */}
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <span className="text-xs font-bold text-stone-900 block">Add Ingredients from Stock</span>
                
                <div className="flex gap-2">
                  <select
                    value={selectedInvId}
                    onChange={(e) => setSelectedInvId(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 text-xs focus:outline-none focus:border-orange-500 font-medium"
                  >
                    {inventory.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.name} ({inv.unit})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    step={0.01}
                    min={0.01}
                    value={ingredientQty}
                    onChange={(e) => setIngredientQty(parseFloat(e.target.value) || 0)}
                    className="w-24 px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 font-mono text-xs focus:outline-none focus:border-orange-500 font-bold"
                  />

                  <button
                    type="button"
                    onClick={handleAddIngredientToDish}
                    className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5">
                  {dishIngredients.map((d, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-xl border border-stone-200 text-xs">
                      <span className="text-stone-800 font-medium">{d.ingredientName}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-orange-600 font-bold">{d.quantity} {d.unit}</span>
                        <button
                          type="button"
                          onClick={() => setDishIngredients(dishIngredients.filter((_, i) => i !== idx))}
                          className="text-stone-400 hover:text-rose-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewDishModal(false)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dishIngredients.length === 0}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl disabled:opacity-50 shadow-sm"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
