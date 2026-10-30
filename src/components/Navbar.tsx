/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Flame, ShieldCheck, Lock, Play, Pause, Bell, X, CheckCircle2, AlertTriangle } from 'lucide-react';

interface NavbarProps {
  onOpenAdminAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAdminAuth }) => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    isAdminUnlocked,
    lockAdmin,
    isSimulating,
    toggleSimulation,
    notifications,
    dismissNotification,
  } = useRestaurant();

  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-stone-200 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          
          {/* Brand with colorful flame */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setActiveTab('floor_plan')} 
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 p-0.5 shadow-md shadow-orange-500/20">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-orange-500 group-hover:scale-105 transition-transform">
                  <Flame className="w-5 h-5 fill-orange-500 text-orange-600" />
                </div>
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-stone-900 block leading-none">
                  Spice &amp; Sizzle
                </span>
                <span className="text-[11px] text-orange-600 font-bold block tracking-normal mt-0.5">
                  Restaurant &amp; Kitchen Bar
                </span>
              </div>
            </button>
          </div>

          {/* View Mode Switcher & Navigation Tabs */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Quick Segmented Mode Selector */}
            <div className="bg-stone-100 p-1 rounded-2xl flex items-center border border-stone-200">
              <button
                onClick={() => setActiveTab('guest_portal')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'guest_portal'
                    ? 'bg-white text-orange-600 shadow-xs border border-stone-200/80'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>👤 Customer Page</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-orange-100 text-orange-700 font-medium">Guest</span>
              </button>

              <button
                onClick={() => {
                  if (!isAdminUnlocked) {
                    setActiveTab('floor_plan');
                    onOpenAdminAuth();
                  } else {
                    setActiveTab('floor_plan');
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab !== 'guest_portal'
                    ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>{isAdminUnlocked ? '🛡️ Admin Suite' : '🔒 Staff Login'}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-medium ${
                  isAdminUnlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {isAdminUnlocked ? 'Staff' : 'PIN Required'}
                </span>
              </button>
            </div>

            {/* Admin Subtabs - only accessible when logged in */}
            {activeTab !== 'guest_portal' && isAdminUnlocked && (
              <nav className="flex items-center gap-1 text-xs font-semibold pl-2 border-l border-stone-200 animate-in fade-in duration-150">
                <button
                  onClick={() => setActiveTab('floor_plan')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === 'floor_plan'
                      ? 'text-cyan-700 bg-cyan-50 font-bold border border-cyan-200 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  Tables &amp; Floor
                </button>

                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === 'inventory'
                      ? 'text-emerald-700 bg-emerald-50 font-bold border border-emerald-200 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  Food Stock
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === 'orders'
                      ? 'text-rose-700 bg-rose-50 font-bold border border-rose-200 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  Kitchen Orders
                </button>

                <button
                  onClick={() => setActiveTab('recipes')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === 'recipes'
                      ? 'text-violet-700 bg-violet-50 font-bold border border-violet-200 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  Menu &amp; Recipes
                </button>
              </nav>
            )}

            {activeTab !== 'guest_portal' && !isAdminUnlocked && (
              <button
                onClick={onOpenAdminAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors ml-2"
              >
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Enter PIN to unlock tabs</span>
              </button>
            )}
          </div>

          {/* Medium screen tabs fallback */}
          <nav className="hidden md:flex lg:hidden items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('guest_portal')}
              className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'guest_portal'
                  ? 'text-orange-700 bg-orange-50 font-bold border border-orange-200 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              👤 Book Table
            </button>
            <button
              onClick={() => {
                setActiveTab('floor_plan');
                if (!isAdminUnlocked) onOpenAdminAuth();
              }}
              className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'floor_plan'
                  ? 'text-cyan-700 bg-cyan-50 font-bold border border-cyan-200 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Floor {!isAdminUnlocked && '🔒'}
            </button>
            <button
              onClick={() => {
                setActiveTab('inventory');
                if (!isAdminUnlocked) onOpenAdminAuth();
              }}
              className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'inventory'
                  ? 'text-emerald-700 bg-emerald-50 font-bold border border-emerald-200 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Stock {!isAdminUnlocked && '🔒'}
            </button>
            <button
              onClick={() => {
                setActiveTab('orders');
                if (!isAdminUnlocked) onOpenAdminAuth();
              }}
              className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'text-rose-700 bg-rose-50 font-bold border border-rose-200 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Orders {!isAdminUnlocked && '🔒'}
            </button>
            <button
              onClick={() => {
                setActiveTab('recipes');
                if (!isAdminUnlocked) onOpenAdminAuth();
              }}
              className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'recipes'
                  ? 'text-violet-700 bg-violet-50 font-bold border border-violet-200 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Menu {!isAdminUnlocked && '🔒'}
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Simulation Toggle - staff only */}
            {isAdminUnlocked && (
              <button
                onClick={toggleSimulation}
                title={isSimulating ? 'Stop auto-simulated orders' : 'Start live auto-simulated orders'}
                className={`hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all whitespace-nowrap shrink-0 ${
                  isSimulating
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-400/20 shadow-xs'
                    : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                }`}
              >
                {isSimulating ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Live Service ON</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-orange-600" />
                    <span>Simulate Service</span>
                  </>
                )}
              </button>
            )}

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
                title="Alerts"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-orange-500 rounded-full ring-2 ring-white" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-stone-200 rounded-2xl shadow-xl p-4 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <span className="text-xs font-bold text-stone-900">Recent Updates</span>
                    <button onClick={() => setShowNotifications(false)} className="text-stone-400 hover:text-stone-700 p-1">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-stone-100 mt-1">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-stone-400">
                        No recent updates
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="py-2.5 px-1 flex items-start gap-2 text-xs">
                          {n.type === 'alert' || n.type === 'warning' ? (
                            <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-stone-900 truncate">{n.title}</span>
                              <span className="text-[10px] text-stone-400 tabular-nums ml-2 font-mono">{n.timestamp}</span>
                            </div>
                            <p className="text-stone-600 text-[11px] mt-0.5 leading-relaxed">{n.message}</p>
                          </div>
                          <button onClick={() => dismissNotification(n.id)} className="text-stone-400 hover:text-stone-600 p-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Access / Profile Button */}
            {isAdminUnlocked && currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAdminAuth}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 rounded-xl transition-colors whitespace-nowrap shrink-0"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                  <span>{currentUser.name.split(' ')[0]}</span>
                  <span className="text-stone-500 text-[11px] hidden lg:inline font-normal">({currentUser.title})</span>
                </button>
                <button
                  onClick={lockAdmin}
                  title="Lock Admin Screen"
                  className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdminAuth}
                className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-orange-600 rounded-xl transition-all whitespace-nowrap shrink-0 shadow-sm"
              >
                Staff Login
              </button>
            )}
          </div>

        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-around border-t border-stone-100 px-2 py-2 overflow-x-auto text-xs gap-1 bg-stone-50">
          <button
            onClick={() => setActiveTab('guest_portal')}
            className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap font-medium ${
              activeTab === 'guest_portal' ? 'text-orange-700 font-bold bg-orange-100' : 'text-stone-600'
            }`}
          >
            Book Table
          </button>
          <button
            onClick={() => setActiveTab('floor_plan')}
            className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap font-medium ${
              activeTab === 'floor_plan' ? 'text-cyan-700 font-bold bg-cyan-100' : 'text-stone-600'
            }`}
          >
            Floor
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap font-medium ${
              activeTab === 'inventory' ? 'text-emerald-700 font-bold bg-emerald-100' : 'text-stone-600'
            }`}
          >
            Stock
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap font-medium ${
              activeTab === 'orders' ? 'text-rose-700 font-bold bg-rose-100' : 'text-stone-600'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('recipes')}
            className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap font-medium ${
              activeTab === 'recipes' ? 'text-violet-700 font-bold bg-violet-100' : 'text-stone-600'
            }`}
          >
            Menu
          </button>
        </div>
      </header>
    </>
  );
};
