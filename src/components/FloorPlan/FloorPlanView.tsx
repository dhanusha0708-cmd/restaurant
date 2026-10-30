/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Table, TableZone, TableStatus } from '../../types/restaurant';
import {
  Users,
  CheckCircle,
  Plus,
  RefreshCw,
  Search,
  Receipt,
  UserPlus,
  X,
} from 'lucide-react';

export const FloorPlanView: React.FC = () => {
  const {
    tables,
    reservations,
    waitlist,
    updateTableStatus,
    seatWalkIn,
    seatReservation,
    markTableCleaned,
    freeTable,
    addToWaitlist,
    seatWaitlistParty,
    removeWaitlistParty,
    exportReservationsCSV,
    setActiveTab,
  } = useRestaurant();

  const [selectedZone, setSelectedZone] = useState<TableZone | 'all'>('all');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPartySize, setWalkInPartySize] = useState(2);
  const [walkInServer, setWalkInServer] = useState('Amit Kumar');

  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [wlName, setWlName] = useState('');
  const [wlPhone, setWlPhone] = useState('');
  const [wlSize, setWlSize] = useState(2);
  const [wlZone, setWlZone] = useState<TableZone | 'any'>('any');
  const [wlMins, setWlMins] = useState(15);

  const [resSearch, setResSearch] = useState('');
  const [activeTabMode, setActiveTabMode] = useState<'map' | 'reservations' | 'waitlist'>('map');

  const filteredTables = tables.filter((t) =>
    selectedZone === 'all' ? true : t.zone === selectedZone
  );

  const availableCount = tables.filter((t) => t.status === 'available').length;
  const seatedCount = tables.filter((t) => t.status === 'seated').length;
  const reservedCount = tables.filter((t) => t.status === 'reserved').length;
  const bussingCount = tables.filter((t) => t.status === 'bussing').length;

  const currentTable = tables.find((t) => t.id === selectedTable?.id) || selectedTable;

  const handleSeatWalkInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTable || !walkInName.trim()) return;
    seatWalkIn(currentTable.id, walkInName.trim(), walkInPartySize, walkInServer);
    setShowWalkInModal(false);
    setWalkInName('');
    setSelectedTable(null);
  };

  const handleAddWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wlName.trim() || !wlPhone.trim()) return;
    addToWaitlist({
      name: wlName.trim(),
      phone: wlPhone.trim(),
      partySize: wlSize,
      areaPreference: wlZone,
      quotedMins: wlMins,
    });
    setShowWaitlistModal(false);
    setWlName('');
    setWlPhone('');
  };

  const calculateDwellMinutes = (seatedAt?: string) => {
    if (!seatedAt) return 0;
    const diff = Date.now() - new Date(seatedAt).getTime();
    return Math.max(1, Math.floor(diff / 60000));
  };

  const getTableStatusStyle = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return 'border-emerald-300 bg-emerald-50 text-emerald-950 hover:border-emerald-500 shadow-xs';
      case 'seated':
        return 'border-amber-300 bg-amber-50 text-amber-950 hover:border-amber-500 shadow-xs';
      case 'reserved':
        return 'border-sky-300 bg-sky-50 text-sky-950 hover:border-sky-500 shadow-xs';
      case 'bussing':
        return 'border-rose-300 bg-rose-50 text-rose-950 hover:border-rose-500 shadow-xs';
      default:
        return 'border-stone-200 bg-white text-stone-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">Tables &amp; Seating Layout</h2>
          <div className="flex items-center gap-2 text-xs text-stone-500 mt-1 font-medium">
            <span>{tables.length} Total Tables</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="text-emerald-700 font-bold">{availableCount} Free to Seat</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="text-amber-700 font-bold">{seatedCount} Eating Now</span>
          </div>
        </div>

        {/* View Switcher and Action */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-stone-100 border border-stone-200 rounded-2xl">
            <button
              onClick={() => setActiveTabMode('map')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTabMode === 'map'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Table Map
            </button>
            <button
              onClick={() => setActiveTabMode('reservations')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTabMode === 'reservations'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Bookings ({reservations.filter(r => r.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setActiveTabMode('waitlist')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTabMode === 'waitlist'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Waitlist ({waitlist.filter(w => w.status === 'waiting').length})
            </button>
          </div>

          <button
            onClick={() => setShowWaitlistModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl transition-all shadow-sm whitespace-nowrap"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add to Waitlist</span>
          </button>
        </div>
      </div>

      {/* Colorful Status KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 bg-white border border-emerald-200 rounded-3xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
            <span className="text-stone-700 font-bold">Available</span>
          </div>
          <span className="font-mono font-extrabold text-emerald-700 text-base tabular-nums">{availableCount} tables</span>
        </div>

        <div className="p-4 bg-white border border-amber-200 rounded-3xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-amber-500 ring-4 ring-amber-100" />
            <span className="text-stone-700 font-bold">Occupied</span>
          </div>
          <span className="font-mono font-extrabold text-amber-700 text-base tabular-nums">{seatedCount} tables</span>
        </div>

        <div className="p-4 bg-white border border-sky-200 rounded-3xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-sky-500 ring-4 ring-sky-100" />
            <span className="text-stone-700 font-bold">Booked</span>
          </div>
          <span className="font-mono font-extrabold text-sky-700 text-base tabular-nums">{reservedCount} tables</span>
        </div>

        <div className="p-4 bg-white border border-rose-200 rounded-3xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-rose-500 ring-4 ring-rose-100" />
            <span className="text-stone-700 font-bold">Needs Cleaning</span>
          </div>
          <span className="font-mono font-extrabold text-rose-700 text-base tabular-nums">{bussingCount} tables</span>
        </div>
      </div>

      {activeTabMode === 'map' && (
        <div className="space-y-4">
          {/* Section Selector */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 p-1 bg-white border border-stone-200 rounded-2xl text-xs shadow-xs">
              <button
                onClick={() => setSelectedZone('all')}
                className={`px-3 py-1.5 rounded-xl transition-colors font-semibold ${
                  selectedZone === 'all' ? 'bg-stone-900 text-white font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All Sections ({tables.length})
              </button>
              <button
                onClick={() => setSelectedZone('main')}
                className={`px-3 py-1.5 rounded-xl transition-colors font-semibold ${
                  selectedZone === 'main' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Main Family Hall ({tables.filter(t => t.zone === 'main').length})
              </button>
              <button
                onClick={() => setSelectedZone('garden')}
                className={`px-3 py-1.5 rounded-xl transition-colors font-semibold ${
                  selectedZone === 'garden' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Open Garden Patio ({tables.filter(t => t.zone === 'garden').length})
              </button>
              <button
                onClick={() => setSelectedZone('ac_hall')}
                className={`px-3 py-1.5 rounded-xl transition-colors font-semibold ${
                  selectedZone === 'ac_hall' ? 'bg-sky-100 text-sky-900 font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                AC Dining Room ({tables.filter(t => t.zone === 'ac_hall').length})
              </button>
              <button
                onClick={() => setSelectedZone('lounge')}
                className={`px-3 py-1.5 rounded-xl transition-colors font-semibold ${
                  selectedZone === 'lounge' ? 'bg-rose-100 text-rose-900 font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Front Lounge ({tables.filter(t => t.zone === 'lounge').length})
              </button>
            </div>

            <span className="text-[11px] text-stone-500 font-medium">
              Click any table to seat guests, view bill, or mark cleaned
            </span>
          </div>

          {/* Table Cards Layout */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 relative overflow-hidden min-h-[460px] shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 py-2 relative z-10">
              {filteredTables.map((table) => {
                const isSelected = selectedTable?.id === table.id;
                const dwell = calculateDwellMinutes(table.seatedAt);

                return (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTable(table)}
                    className={`relative p-4 rounded-2xl border text-left transition-all ${getTableStatusStyle(
                      table.status
                    )} ${isSelected ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-white scale-[1.02]' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-extrabold text-stone-900">{table.name}</span>
                        <span className="text-[10px] text-stone-500 font-medium">({table.zone})</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-mono text-stone-600">
                        <Users className="w-3 h-3 text-stone-400" />
                        <span className="tabular-nums font-bold">{table.capacity}p</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-stone-500 capitalize mb-2 font-medium">
                      {table.shape} · {table.status}
                    </div>

                    {table.status === 'seated' && (
                      <div className="pt-2 border-t border-amber-200/80 text-xs space-y-1">
                        <p className="font-bold text-stone-900 truncate">{table.currentGuestName}</p>
                        <div className="flex items-center justify-between text-[11px] text-amber-800 font-mono">
                          <span>{table.serverName || 'Staff'}</span>
                          <span className="tabular-nums font-bold">{dwell}m eating</span>
                        </div>
                        {table.activeOrderTotal !== undefined && (
                          <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-amber-900 font-extrabold">
                            <span>Bill Tab:</span>
                            <span className="tabular-nums">₹{table.activeOrderTotal.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {table.status === 'reserved' && (
                      <div className="pt-2 border-t border-sky-200 text-xs">
                        <p className="font-bold text-sky-900 truncate">
                          {table.currentGuestName || 'Reserved'}
                        </p>
                        <span className="text-[11px] text-sky-700 mt-0.5 block font-medium">Ready for guest</span>
                      </div>
                    )}

                    {table.status === 'bussing' && (
                      <div className="pt-2 border-t border-rose-200 text-xs flex items-center justify-between text-rose-700 font-bold">
                        <span>Needs Cleaning</span>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                      </div>
                    )}

                    {table.status === 'available' && (
                      <div className="pt-2 border-t border-emerald-200 text-[11px] text-emerald-700 font-bold flex items-center justify-between">
                        <span>Ready to Seat</span>
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Reservations Ledger */}
      {activeTabMode === 'reservations' && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="text-base font-bold text-stone-900">Bookings &amp; Guest List</h3>
              <p className="text-xs text-stone-500 mt-0.5">Upcoming dining bookings for today and tomorrow</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search guest or code..."
                  value={resSearch}
                  onChange={(e) => setResSearch(e.target.value)}
                  className="px-3.5 py-2 pl-9 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              </div>
              <button
                onClick={exportReservationsCSV}
                className="px-3.5 py-2 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors whitespace-nowrap"
              >
                Download CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/80 text-stone-500 uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-3 px-3">Booking Code</th>
                  <th className="py-3 px-3">Guest Name</th>
                  <th className="py-3 px-3">Date &amp; Time</th>
                  <th className="py-3 px-3 text-right">Guests</th>
                  <th className="py-3 px-3">Section / Table</th>
                  <th className="py-3 px-3">Preferences</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {reservations
                  .filter((r) =>
                    resSearch
                      ? r.guestName.toLowerCase().includes(resSearch.toLowerCase()) ||
                        r.referenceCode.toLowerCase().includes(resSearch.toLowerCase())
                      : true
                  )
                  .map((res) => (
                    <tr key={res.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-orange-600">{res.referenceCode}</td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-stone-900 block">{res.guestName}</span>
                        <span className="text-[11px] text-stone-400 font-mono">{res.guestPhone}</span>
                      </td>
                      <td className="py-3 px-3 font-mono tabular-nums text-stone-700 font-medium">
                        {res.date} · {res.timeSlot}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-stone-900 font-bold">
                        {res.partySize}p
                      </td>
                      <td className="py-3 px-3 capitalize text-stone-700 font-medium">
                        {res.tableNumber ? `Table ${res.tableNumber}` : res.areaPreference}
                      </td>
                      <td className="py-3 px-3 text-stone-600">
                        <span>{res.occasion || 'Dining'}</span>
                        {res.dietaryNotes && res.dietaryNotes.length > 0 && (
                          <span className="block text-[10px] text-emerald-700 font-bold">{res.dietaryNotes.join(', ')}</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          res.status === 'confirmed' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                          res.status === 'seated' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          res.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-stone-500'
                        }`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {res.status === 'confirmed' && (
                          <button
                            onClick={() => {
                              const availTable = res.tableId 
                                ? tables.find(t => t.id === res.tableId) 
                                : tables.find(t => t.status === 'available' && t.capacity >= res.partySize);
                              if (availTable) {
                                seatReservation(res.id, availTable.id);
                              }
                            }}
                            className="px-3 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors"
                          >
                            Seat Now
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mode 3: Waitlist */}
      {activeTabMode === 'waitlist' && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-stone-900">Walk-in Waiting List</h3>
              <p className="text-xs text-stone-500 mt-0.5">Seat walk-in parties when tables become ready</p>
            </div>
            <button
              onClick={() => setShowWaitlistModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Walk-in</span>
            </button>
          </div>

          <div className="space-y-3">
            {waitlist.filter((w) => w.status === 'waiting').length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-400">
                No guests currently waiting. All tables are ready or seated.
              </div>
            ) : (
              waitlist
                .filter((w) => w.status === 'waiting')
                .map((entry) => {
                  const elapsedMins = Math.floor((Date.now() - new Date(entry.addedAt).getTime()) / 60000);
                  const matchingAvailable = tables.filter(
                    (t) => t.status === 'available' && t.capacity >= entry.partySize
                  );

                  return (
                    <div
                      key={entry.id}
                      className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-stone-900">{entry.name}</span>
                          <span className="text-xs text-orange-600 font-bold">({entry.partySize} People)</span>
                          <span className="text-xs text-stone-500 font-mono">{entry.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
                          <span>Waiting {elapsedMins} mins</span>
                          <span aria-hidden="true" className="text-stone-300">·</span>
                          <span>Est. wait ~{entry.quotedMins} mins</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {matchingAvailable.length > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-stone-600 font-medium">Seat at:</span>
                            {matchingAvailable.slice(0, 2).map((t) => (
                              <button
                                key={t.id}
                                onClick={() => seatWaitlistParty(entry.id, t.id, 'Amit Kumar')}
                                className="px-3 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors"
                              >
                                {t.name}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-stone-400 italic">No free table yet</span>
                        )}

                        <button
                          onClick={() => removeWaitlistParty(entry.id)}
                          className="text-stone-400 hover:text-rose-600 p-1.5 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* Drawer: Table Details */}
      {currentTable && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-stone-200 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-5">
              <div>
                <span className="text-xs uppercase tracking-wider text-orange-600 font-extrabold font-mono">
                  {currentTable.zone.toUpperCase()} SECTION
                </span>
                <h3 className="text-xl font-extrabold text-stone-900 tracking-tight">{currentTable.name}</h3>
              </div>
              <button onClick={() => setSelectedTable(null)} className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 mb-5 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-stone-500 block text-[11px] font-medium">Seating Capacity</span>
                <span className="font-bold text-stone-900 tabular-nums">{currentTable.capacity} Guests</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[11px] font-medium">Table Style</span>
                <span className="font-bold text-stone-900 capitalize">{currentTable.shape} Table</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[11px] font-medium">Current Status</span>
                <span className={`font-bold capitalize ${
                  currentTable.status === 'available' ? 'text-emerald-700' :
                  currentTable.status === 'seated' ? 'text-amber-700' :
                  currentTable.status === 'reserved' ? 'text-sky-700' : 'text-rose-700'
                }`}>
                  {currentTable.status}
                </span>
              </div>
              <div>
                <span className="text-stone-500 block text-[11px] font-medium">Server on Duty</span>
                <span className="font-bold text-stone-900">{currentTable.serverName || 'Amit Kumar'}</span>
              </div>
            </div>

            {currentTable.status === 'seated' && (
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-900 font-bold">Active Dining Guests</span>
                    <span className="font-mono text-amber-800 tabular-nums font-bold">
                      {calculateDwellMinutes(currentTable.seatedAt)}m elapsed
                    </span>
                  </div>
                  <p className="text-stone-900 font-extrabold text-sm">{currentTable.currentGuestName}</p>
                  
                  {currentTable.activeOrderTotal !== undefined && (
                    <div className="pt-2 border-t border-amber-200 flex items-center justify-between text-amber-900">
                      <span className="font-medium">Current Order Bill</span>
                      <span className="font-mono font-extrabold text-base text-stone-900 tabular-nums">
                        ₹{currentTable.activeOrderTotal.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => {
                      setSelectedTable(null);
                      setActiveTab('orders');
                    }}
                    className="py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>View / Add Items</span>
                  </button>

                  <button
                    onClick={() => {
                      freeTable(currentTable.id);
                      setSelectedTable(null);
                    }}
                    className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Clear &amp; Clean</span>
                  </button>
                </div>
              </div>
            )}

            {currentTable.status === 'reserved' && (
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl text-xs space-y-2">
                  <span className="text-sky-800 font-bold">Guest Booking</span>
                  <p className="text-stone-900 font-bold text-sm">{currentTable.currentGuestName || 'Booked'}</p>
                </div>

                <button
                  onClick={() => {
                    updateTableStatus(currentTable.id, 'seated', {
                      seatedAt: new Date().toISOString(),
                      serverName: 'Amit Kumar',
                      activeOrderTotal: 0,
                    });
                    setSelectedTable(null);
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Check In &amp; Seat Guests
                </button>
              </div>
            )}

            {currentTable.status === 'bussing' && (
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs">
                  <span className="text-rose-800 font-bold">Table Needs Quick Cleaning</span>
                  <p className="text-stone-600 mt-1">Clear dishes and set fresh water glasses</p>
                </div>

                <button
                  onClick={() => {
                    markTableCleaned(currentTable.id);
                    setSelectedTable(null);
                  }}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark Clean &amp; Ready</span>
                </button>
              </div>
            )}

            {currentTable.status === 'available' && (
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setShowWalkInModal(true)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20"
                >
                  Seat Walk-In Guests
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-stone-200 text-[11px] text-stone-500 flex items-center justify-between font-medium">
            <span>Table: {currentTable.name}</span>
            <span>Section: {currentTable.zone}</span>
          </div>
        </div>
      )}

      {/* Modal: Seat Walk-In */}
      {showWalkInModal && currentTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border border-stone-200 rounded-3xl p-6 shadow-2xl text-xs">
            <h3 className="text-sm font-bold text-stone-900 mb-1">Seat Walk-In: {currentTable.name}</h3>
            <p className="text-stone-500 mb-4 font-medium">Max capacity: {currentTable.capacity} people</p>

            <form onSubmit={handleSeatWalkInSubmit} className="space-y-4">
              <div>
                <label className="block text-stone-600 font-medium mb-1">Guest / Family Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Verma Family"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">How many people?</label>
                <input
                  type="number"
                  min={1}
                  max={currentTable.capacity}
                  value={walkInPartySize}
                  onChange={(e) => setWalkInPartySize(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono font-medium focus:bg-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Table Waiter / Server</label>
                <select
                  value={walkInServer}
                  onChange={(e) => setWalkInServer(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                >
                  <option value="Amit Kumar">Amit Kumar (Supervisor)</option>
                  <option value="Rahul">Rahul (Table Server)</option>
                  <option value="Suresh">Suresh (Table Server)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="flex-1 py-2.5 px-3 bg-stone-100 text-stone-700 rounded-xl font-bold hover:bg-stone-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-xs"
                >
                  Confirm &amp; Seat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add to Waitlist */}
      {showWaitlistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border border-stone-200 rounded-3xl p-6 shadow-2xl text-xs">
            <h3 className="text-sm font-bold text-stone-900 mb-1">Add to Table Waitlist</h3>
            <p className="text-stone-500 mb-4 font-medium">Record walk-in guest details and wait time</p>

            <form onSubmit={handleAddWaitlistSubmit} className="space-y-4">
              <div>
                <label className="block text-stone-600 font-medium mb-1">Guest Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kunal Kapoor"
                  value={wlName}
                  onChange={(e) => setWlName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 00112"
                  value={wlPhone}
                  onChange={(e) => setWlPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">People</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={wlSize}
                    onChange={(e) => setWlSize(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-medium mb-1">Wait (Mins)</label>
                  <input
                    type="number"
                    min={5}
                    step={5}
                    value={wlMins}
                    onChange={(e) => setWlMins(parseInt(e.target.value) || 15)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWaitlistModal(false)}
                  className="flex-1 py-2.5 px-3 bg-stone-100 text-stone-700 rounded-xl font-bold hover:bg-stone-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-xs"
                >
                  Add to List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
