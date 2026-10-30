/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { Navbar } from './components/Navbar';
import { GuestBookingView } from './components/GuestBooking/GuestBookingView';
import { FloorPlanView } from './components/FloorPlan/FloorPlanView';
import { InventoryDashboardView } from './components/Inventory/InventoryDashboardView';
import { OrdersPOSView } from './components/OrdersPOS/OrdersPOSView';
import { RecipeBookView } from './components/Recipes/RecipeBookView';
import { AdminAccessModal } from './components/Admin/AdminAccessModal';
import { AdminLockedGate } from './components/Admin/AdminLockedGate';
import { RotateCcw, ShieldCheck, CheckCircle2, AlertTriangle, X, ArrowRight, UserCheck, LayoutDashboard, Lock } from 'lucide-react';

const AppContent: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    resetAllData, 
    notifications, 
    dismissNotification, 
    isAdminUnlocked, 
    currentUser, 
    lockAdmin 
  } = useRestaurant();
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-orange-500/20 selection:text-orange-950">
      {/* Top Bar Navigation */}
      <Navbar onOpenAdminAuth={() => setIsAdminModalOpen(true)} />

      {/* Mode Clarifier Banner */}
      <div className={`border-b transition-colors ${
        activeTab === 'guest_portal' 
          ? 'bg-orange-50/90 border-orange-200 text-orange-900' 
          : !isAdminUnlocked
          ? 'bg-amber-50/90 border-amber-200 text-amber-900'
          : 'bg-stone-100 border-stone-200 text-stone-700'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            {activeTab === 'guest_portal' ? (
              <>
                <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md bg-orange-200 text-orange-800">
                  <UserCheck className="w-3.5 h-3.5" />
                  CUSTOMER PAGE
                </span>
                <span className="text-stone-700">
                  Public table reservation portal (open to dining customers).
                </span>
              </>
            ) : !isAdminUnlocked ? (
              <>
                <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md bg-amber-200 text-amber-900">
                  <Lock className="w-3.5 h-3.5" />
                  STAFF LOGIN REQUIRED
                </span>
                <span className="text-stone-700">
                  Back-of-house area is locked. Customers cannot view internal stock or floor controls without login.
                </span>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md bg-stone-200 text-stone-800">
                  <LayoutDashboard className="w-3.5 h-3.5 text-stone-700" />
                  STAFF &amp; ADMIN ACTIVE
                </span>
                <span className="text-stone-600">
                  Logged in as <strong className="text-stone-900">{currentUser?.name}</strong> ({currentUser?.title}).
                </span>
              </>
            )}
          </div>

          <div>
            {activeTab === 'guest_portal' ? (
              <button
                onClick={() => {
                  if (!isAdminUnlocked) {
                    setIsAdminModalOpen(true);
                  } else {
                    setActiveTab('floor_plan');
                  }
                }}
                className="inline-flex items-center gap-1.5 font-bold text-orange-700 hover:text-orange-900 hover:underline"
              >
                <span>{isAdminUnlocked ? 'Open Staff Dashboard' : 'Staff Login'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : !isAdminUnlocked ? (
              <button
                onClick={() => setActiveTab('guest_portal')}
                className="inline-flex items-center gap-1.5 font-bold text-amber-800 hover:text-amber-950 hover:underline"
              >
                <span>Return to Customer Booking</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('guest_portal')}
                  className="inline-flex items-center gap-1.5 font-semibold text-stone-600 hover:text-stone-900 hover:underline"
                >
                  <span>Customer View</span>
                </button>
                <span className="text-stone-300">|</span>
                <button
                  onClick={lockAdmin}
                  className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-800 font-bold"
                >
                  <Lock className="w-3 h-3" />
                  <span>Lock &amp; Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Toast Notification Stack */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {notifications.slice(0, 3).map((notif) => (
          <div
            key={notif.id}
            className="pointer-events-auto bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xl flex items-start gap-2.5 animate-in slide-in-from-bottom-3 duration-200"
          >
            {notif.type === 'alert' || notif.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0 text-xs">
              <span className="font-bold text-stone-900 block">{notif.title}</span>
              <p className="text-stone-600 text-[11px] mt-0.5 leading-relaxed">{notif.message}</p>
            </div>
            <button
              onClick={() => dismissNotification(notif.id)}
              className="text-stone-400 hover:text-stone-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Main View Area - Protected by AdminLockedGate */}
      <main className="flex-1">
        {activeTab === 'guest_portal' ? (
          <GuestBookingView />
        ) : !isAdminUnlocked ? (
          <AdminLockedGate />
        ) : (
          <>
            {activeTab === 'floor_plan' && <FloorPlanView />}
            {activeTab === 'inventory' && <InventoryDashboardView />}
            {activeTab === 'orders' && <OrdersPOSView />}
            {activeTab === 'recipes' && <RecipeBookView />}
          </>
        )}
      </main>

      {/* Admin Authorization Modal */}
      <AdminAccessModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />

      {/* Clean Light Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 mt-12 text-xs text-stone-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-800">Spice &amp; Sizzle Restaurant</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>420 Artisan Boulevard</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>Timing: 12:00 PM – 11:00 PM</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="hover:text-orange-600 transition-colors flex items-center gap-1.5 font-semibold text-stone-700"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
              <span>Staff Login</span>
            </button>

            <button
              onClick={resetAllData}
              title="Reset application to initial demo baseline"
              className="hover:text-stone-900 transition-colors flex items-center gap-1 font-medium text-stone-500"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <RestaurantProvider>
      <AppContent />
    </RestaurantProvider>
  );
}
