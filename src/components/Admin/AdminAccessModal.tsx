/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Shield, KeyRound, Check, X, UserCheck, Lock } from 'lucide-react';

interface AdminAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminAccessModal: React.FC<AdminAccessModalProps> = ({ isOpen, onClose }) => {
  const { allStaff, authenticateStaff, currentUser, isAdminUnlocked, lockAdmin } = useRestaurant();
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = authenticateStaff(pinInput);
    if (success) {
      setPinInput('');
      setError(false);
      onClose();
    } else {
      setError(true);
    }
  };

  const handleQuickLogin = (pin: string) => {
    const success = authenticateStaff(pin);
    if (success) {
      setPinInput('');
      setError(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white border border-stone-200 rounded-3xl p-6 shadow-2xl relative text-stone-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold shadow-md shadow-orange-500/20">
            <Shield className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-stone-900 tracking-tight">Staff &amp; Admin Sign In</h3>
            <p className="text-xs text-stone-500 mt-0.5 font-medium">Manage tables, stock, and orders</p>
          </div>
        </div>

        {isAdminUnlocked && currentUser && (
          <div className="mb-5 p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 font-extrabold text-xs flex items-center justify-center">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900">{currentUser.name}</p>
                <p className="text-[11px] text-stone-500">{currentUser.title}</p>
              </div>
            </div>
            <button
              onClick={() => {
                lockAdmin();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* PIN Entry */}
        <form onSubmit={handlePinSubmit} className="mb-6">
          <label className="block text-xs font-bold text-stone-700 mb-2">
            Enter 4-Digit Staff PIN
          </label>
          <div className="flex gap-2">
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
                className={`w-full px-4 py-2.5 bg-stone-50 border rounded-2xl font-mono text-center text-xl tracking-widest text-stone-900 focus:bg-white focus:outline-none focus:ring-2 ${
                  error
                    ? 'border-rose-500 focus:ring-rose-200'
                    : 'border-stone-200 focus:border-orange-500 focus:ring-orange-200'
                }`}
                autoFocus
              />
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-3.5 pointer-events-none" />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md shadow-orange-500/20 whitespace-nowrap"
            >
              Unlock
            </button>
          </div>
          {error && (
            <p className="text-xs text-rose-600 mt-2 font-bold">
              Wrong PIN. Try 1234 or click a staff profile below.
            </p>
          )}
        </form>

        {/* Quick Profiles */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold tracking-wide uppercase text-stone-500">
              One-Click Staff Profiles
            </span>
            <span className="text-[11px] text-orange-600 font-bold">Demo Ready</span>
          </div>

          <div className="space-y-2">
            {allStaff.map((staff) => (
              <button
                key={staff.id}
                type="button"
                onClick={() => handleQuickLogin(staff.pin)}
                className="w-full p-3 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-stone-100 hover:border-orange-300 text-left flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-stone-200 group-hover:border-orange-300 group-hover:bg-orange-50 text-stone-700 group-hover:text-orange-700 flex items-center justify-center text-xs font-bold transition-colors">
                    {staff.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900">{staff.name}</span>
                      <span className="text-[10px] font-mono text-orange-700 bg-orange-100 border border-orange-200 px-1.5 py-0.5 rounded-md font-bold">
                        PIN: {staff.pin}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-500 block mt-0.5">{staff.title}</span>
                  </div>
                </div>
                {currentUser?.id === staff.id && isAdminUnlocked ? (
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                ) : (
                  <UserCheck className="w-4 h-4 text-stone-400 group-hover:text-orange-600 transition-colors" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-medium">
          <span>Terminal: Main Counter</span>
          <span className="text-emerald-600 font-bold">Ready</span>
        </div>
      </div>
    </div>
  );
};
