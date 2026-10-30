/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Lock, KeyRound, ShieldAlert, UserCheck, ArrowLeft, Check } from 'lucide-react';

export const AdminLockedGate: React.FC = () => {
  const { authenticateStaff, allStaff, setActiveTab, currentUser, isAdminUnlocked } = useRestaurant();
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState(false);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    const success = authenticateStaff(pinInput);
    if (!success) {
      setError(true);
    } else {
      setError(false);
      setPinInput('');
    }
  };

  const handleQuickLogin = (pin: string) => {
    const success = authenticateStaff(pin);
    if (success) {
      setError(false);
      setPinInput('');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-lg bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xl text-stone-900 relative">
        
        {/* Lock Icon Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 p-1 mx-auto shadow-lg shadow-orange-500/20 mb-4">
            <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center text-orange-600">
              <Lock className="w-8 h-8 stroke-[2.2]" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Staff &amp; Admin Access Only</span>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-stone-900">
            Sign In Required
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-sm mx-auto leading-relaxed">
            Customers cannot view the floor plan, kitchen stock, or POS billing. Please enter your staff PIN to proceed.
          </p>
        </div>

        {/* PIN Entry Form */}
        <form onSubmit={handlePinSubmit} className="mb-6">
          <label className="block text-xs font-bold text-stone-700 mb-2 text-center">
            Enter 4-Digit Staff PIN (e.g. 1234)
          </label>
          <div className="flex gap-2 max-w-xs mx-auto">
            <div className="relative flex-1">
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setError(false);
                }}
                placeholder="••••"
                className={`w-full px-4 py-3 bg-stone-50 border rounded-2xl font-mono text-center text-2xl tracking-widest text-stone-900 focus:bg-white focus:outline-none focus:ring-2 ${
                  error
                    ? 'border-rose-500 focus:ring-rose-200'
                    : 'border-stone-200 focus:border-orange-500 focus:ring-orange-200'
                }`}
                autoFocus
              />
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-4 pointer-events-none" />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm rounded-2xl transition-all shadow-md shadow-orange-500/20 whitespace-nowrap"
            >
              Sign In
            </button>
          </div>
          {error && (
            <p className="text-xs text-rose-600 mt-2 font-bold text-center">
              Invalid PIN. Use 1234 or choose a staff profile below.
            </p>
          )}
        </form>

        {/* Demo One-Click Staff Login */}
        <div className="pt-5 border-t border-stone-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold tracking-wide uppercase text-stone-500">
              Select Staff Member (One-Click)
            </span>
            <span className="text-[11px] text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-md">
              Demo Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {allStaff.map((staff) => (
              <button
                key={staff.id}
                type="button"
                onClick={() => handleQuickLogin(staff.pin)}
                className="p-3 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-orange-50 hover:border-orange-300 text-left transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-white border border-stone-200 group-hover:border-orange-300 text-stone-700 group-hover:text-orange-700 flex items-center justify-center text-xs font-bold transition-colors">
                    {staff.name.charAt(0)}
                  </div>
                  <span className="text-[10px] font-mono text-orange-700 font-bold bg-orange-100/80 px-1.5 py-0.5 rounded">
                    PIN: {staff.pin}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-900 block group-hover:text-orange-950">
                    {staff.name}
                  </span>
                  <span className="text-[10px] text-stone-500 block truncate">
                    {staff.title}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Back to Customer Page Link */}
        <div className="mt-6 pt-5 border-t border-stone-100 flex items-center justify-between">
          <button
            onClick={() => setActiveTab('guest_portal')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Customer Table Booking</span>
          </button>

          <span className="text-[11px] text-stone-400">
            Spice &amp; Sizzle Security
          </span>
        </div>

      </div>
    </div>
  );
};
