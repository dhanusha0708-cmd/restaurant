/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { TableZone, Reservation } from '../../types/restaurant';
import {
  Calendar as CalendarIcon,
  Clock,
  Compass,
  CheckCircle2,
  Search,
  XCircle,
  FileText,
} from 'lucide-react';

const TIME_SLOTS = [
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM',
  '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM'
];

const OCCASIONS = [
  'Casual Dining',
  'Birthday Party',
  'Anniversary Celebration',
  'Family Get-Together',
  'Office Team Dinner'
];

const DIETARY_OPTIONS = [
  'Pure Vegetarian',
  'No Onion / No Garlic',
  'Jain Friendly',
  'Halal Friendly',
  'Less Spicy Food',
  'Kids Friendly'
];

export const GuestBookingView: React.FC = () => {
  const { createReservation, lookupReservation, cancelReservation, tables } = useRestaurant();

  const [mode, setMode] = useState<'new_booking' | 'lookup'>('new_booking');

  const [partySize, setPartySize] = useState<number>(4);
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().substring(0, 10);
  });
  const [timeSlot, setTimeSlot] = useState<string>('8:00 PM');
  const [areaPreference, setAreaPreference] = useState<TableZone | 'any'>('main');
  const [selectedTableId, setSelectedTableId] = useState<string | undefined>(undefined);

  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [occasion, setOccasion] = useState<string>('Family Get-Together');
  const [selectedDietary, setSelectedDietary] = useState<string[]>(['Pure Vegetarian']);
  const [specialRequests, setSpecialRequests] = useState<string>('');

  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);

  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResult, setLookupResult] = useState<Reservation | null | undefined>(undefined);

  const handleDietaryToggle = (item: string) => {
    setSelectedDietary((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  };

  const candidateTables = tables.filter((t) => {
    const zoneMatch = areaPreference === 'any' || t.zone === areaPreference;
    const capacityMatch = t.capacity >= partySize;
    return zoneMatch && capacityMatch && t.status !== 'seated';
  });

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) return;

    const finalTable = selectedTableId 
      ? tables.find((t) => t.id === selectedTableId)
      : candidateTables[0] || tables.find((t) => t.capacity >= partySize);

    const newRes = createReservation({
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim(),
      guestEmail: guestEmail.trim() || `${guestName.toLowerCase().replace(/\s+/g, '')}@guest.in`,
      date,
      timeSlot,
      partySize,
      areaPreference,
      tableId: finalTable?.id,
      tableNumber: finalTable?.number,
      occasion,
      dietaryNotes: selectedDietary,
      specialRequests: specialRequests.trim() || undefined,
    });

    setConfirmedReservation(newRes);
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const result = lookupReservation(lookupQuery);
    setLookupResult(result || null);
  };

  const generateIcsCalendar = (res: Reservation) => {
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Spice and Sizzle//Table Reservation//EN',
      'BEGIN:VEVENT',
      `SUMMARY:Dinner at Spice & Sizzle (${res.referenceCode})`,
      `DESCRIPTION:Table for ${res.partySize} under ${res.guestName}. Occasion: ${res.occasion || 'Dining'}.`,
      `DTSTART:${res.date.replace(/-/g, '')}T193000`,
      `DTEND:${res.date.replace(/-/g, '')}T213000`,
      'LOCATION:Spice & Sizzle Restaurant, 420 Artisan Boulevard',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `table_booking_${res.referenceCode}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Banner with warm ambiance */}
      <div className="relative rounded-3xl overflow-hidden mb-8 border border-stone-200 bg-white shadow-md">
        <div className="relative h-64 sm:h-80 w-full overflow-hidden">
          <img
            src="/src/assets/images/restaurant_hero_dining_1793350489519.jpg"
            alt="Spice & Sizzle Dining Hall"
            className="w-full h-full object-cover brightness-[0.75]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/40 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center gap-2 text-xs font-bold mb-2">
              <span className="text-amber-300">Fresh Tandoor &amp; Sizzlers</span>
              <span className="text-white/60" aria-hidden="true">·</span>
              <span className="text-orange-300">Rich Curries &amp; Biryani</span>
              <span className="text-white/60" aria-hidden="true">·</span>
              <span className="text-emerald-300">Cool Lassi &amp; Drinks</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Book a Table at Spice &amp; Sizzle
            </h1>
            <p className="text-sm text-stone-200 max-w-xl mt-1.5 leading-relaxed font-normal">
              Enjoy fresh sizzling paneer tikka, warm butter naan, and slow-cooked dum biryani in our warm family dining hall.
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMode('new_booking');
                setConfirmedReservation(null);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'new_booking'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              Reserve a Table
            </button>
            <button
              onClick={() => setMode('lookup')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'lookup'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              Find My Booking
            </button>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-stone-500 font-medium">
            <span className="text-emerald-600 font-bold">Free Booking</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>Instant Confirmation</span>
          </div>
        </div>
      </div>

      {/* Confirmation Screen */}
      {confirmedReservation ? (
        <div className="max-w-xl mx-auto bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="text-center mb-6">
            <span className="text-xs uppercase tracking-wider text-orange-600 font-bold">Booking Confirmed!</span>
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight mt-1">We are ready to host you</h2>
            <p className="text-xs text-stone-500 mt-1">
              Your table is reserved at Spice &amp; Sizzle
            </p>
          </div>

          <div className="bg-stone-50 rounded-2xl border border-stone-200 p-5 mb-6 space-y-3.5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <span className="text-stone-500 font-medium">Booking Number</span>
              <span className="font-mono font-extrabold text-base text-orange-600 tracking-wider">
                {confirmedReservation.referenceCode}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-stone-400 block text-[11px]">Guest Name</span>
                <span className="font-bold text-stone-800">{confirmedReservation.guestName}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Number of People</span>
                <span className="font-bold text-stone-800 tabular-nums">{confirmedReservation.partySize} Guests</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Date &amp; Time</span>
                <span className="font-bold text-stone-800 tabular-nums">
                  {confirmedReservation.date} at {confirmedReservation.timeSlot}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Table Area</span>
                <span className="font-bold text-stone-800 capitalize">
                  {confirmedReservation.areaPreference} {confirmedReservation.tableNumber ? `(Table ${confirmedReservation.tableNumber})` : ''}
                </span>
              </div>
            </div>

            {confirmedReservation.occasion && (
              <div className="pt-2 border-t border-stone-200">
                <span className="text-stone-400 block text-[11px]">Occasion</span>
                <span className="text-stone-700 font-semibold">{confirmedReservation.occasion}</span>
              </div>
            )}

            {confirmedReservation.dietaryNotes && confirmedReservation.dietaryNotes.length > 0 && (
              <div>
                <span className="text-stone-400 block text-[11px]">Food Preferences</span>
                <span className="text-emerald-700 font-bold">{confirmedReservation.dietaryNotes.join(', ')}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => generateIcsCalendar(confirmedReservation)}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2"
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Save to Phone Calendar</span>
            </button>
            <button
              onClick={() => {
                setConfirmedReservation(null);
                setGuestName('');
                setGuestPhone('');
                setGuestEmail('');
                setSpecialRequests('');
              }}
              className="py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors"
            >
              Book Another Table
            </button>
          </div>
        </div>
      ) : mode === 'new_booking' ? (
        /* Booking Form */
        <form onSubmit={handleSubmitBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: People, Date, Time */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-extrabold">1</span>
                <span>Guests &amp; Timing</span>
              </h3>

              {/* People Count */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-stone-600 mb-2">How many people?</label>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                  {[1, 2, 3, 4, 5, 6, 8, 10].map((size) => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => {
                        setPartySize(size);
                        setSelectedTableId(undefined);
                      }}
                      className={`py-2 text-xs font-bold rounded-xl transition-all tabular-nums ${
                        partySize === size
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm scale-105'
                          : 'bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date and Hall */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1.5 flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-stone-400" />
                    <span>Select Date</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    min={new Date().toISOString().substring(0, 10)}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1.5 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-stone-400" />
                    <span>Seating Section</span>
                  </label>
                  <select
                    value={areaPreference}
                    onChange={(e) => {
                      setAreaPreference(e.target.value as TableZone | 'any');
                      setSelectedTableId(undefined);
                    }}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                  >
                    <option value="main">Main Family Dining Hall</option>
                    <option value="garden">Open Garden Patio</option>
                    <option value="ac_hall">AC Dining Room</option>
                    <option value="lounge">Front Sizzler Lounge</option>
                    <option value="any">Any Available Table</option>
                  </select>
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>Choose Time</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setTimeSlot(slot)}
                      className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                        timeSlot === slot
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-xs'
                          : 'bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2: Choose Table */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-extrabold">2</span>
                  <span>Pick Table Location</span>
                </h3>
                <span className="text-[11px] text-stone-400 font-medium">Optional</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTableId(undefined)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    !selectedTableId
                      ? 'border-orange-500 bg-orange-50/80 text-orange-950 shadow-xs'
                      : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <span className="text-xs font-bold block text-orange-600">Best Table</span>
                  <span className="text-[11px] text-stone-500">Host assigns best spot</span>
                </button>

                {candidateTables.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setSelectedTableId(t.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedTableId === t.id
                        ? 'border-orange-500 bg-orange-50/80 text-orange-950 shadow-xs'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-stone-900">{t.name}</span>
                      <span className="text-[10px] text-stone-400 font-medium">Max {t.capacity}</span>
                    </div>
                    <span className="text-[11px] text-stone-500 capitalize block">
                      {t.zone} section
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Contact & Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-extrabold">3</span>
                <span>Contact &amp; Food Notes</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-medium mb-1">Mobile Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-medium mb-1">Special Occasion</label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                  >
                    {OCCASIONS.map((occ) => (
                      <option key={occ} value={occ}>{occ}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 font-medium mb-1.5">Food Preferences</label>
                  <div className="grid grid-cols-2 gap-2">
                    {DIETARY_OPTIONS.map((diet) => (
                      <label
                        key={diet}
                        className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-colors ${
                          selectedDietary.includes(diet)
                            ? 'bg-orange-50 border-orange-300 text-orange-900'
                            : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedDietary.includes(diet)}
                          onChange={() => handleDietaryToggle(diet)}
                          className="rounded border-stone-300 text-orange-500 focus:ring-0"
                        />
                        <span className="text-[11px] font-medium">{diet}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-stone-600 font-medium mb-1">Any Notes for Kitchen</label>
                  <textarea
                    rows={2}
                    placeholder="Corner seat, less spicy, high chair for toddler..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:border-orange-500 resize-none text-xs"
                  />
                </div>
              </div>

              {/* Confirm Button */}
              <div className="mt-6 pt-5 border-t border-stone-100">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-orange-500/20 active:scale-[0.99]"
                >
                  Confirm Table Booking
                </button>
                <p className="text-[11px] text-center text-stone-400 mt-2.5 font-medium">
                  No advance payment needed. Free cancellation anytime.
                </p>
              </div>
            </div>
          </div>
        </form>
      ) : (
        /* Lookup Screen */
        <div className="max-w-xl mx-auto bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="text-center mb-6">
            <FileText className="w-10 h-10 text-orange-500 mx-auto mb-2" />
            <h2 className="text-lg font-bold text-stone-900">Find Your Booking</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Enter your booking code (e.g. SS-8921) or phone number
            </p>
          </div>

          <form onSubmit={handleLookup} className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <input
                type="text"
                required
                placeholder="SS-8921 or 98765..."
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 uppercase focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
              />
              <Search className="w-4 h-4 text-stone-400 absolute right-3 top-3 pointer-events-none" />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Search
            </button>
          </form>

          {lookupResult === null && (
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-center text-xs text-stone-500 font-medium">
              No booking found for &ldquo;{lookupQuery}&rdquo;. Please check your number or code.
            </div>
          )}

          {lookupResult && (
            <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div>
                  <span className="font-mono text-sm font-bold text-orange-600">{lookupResult.referenceCode}</span>
                  <p className="text-stone-900 font-bold text-sm mt-0.5">{lookupResult.guestName}</p>
                </div>
                <span className={`text-[11px] font-bold uppercase ${
                  lookupResult.status === 'confirmed' ? 'text-emerald-600' :
                  lookupResult.status === 'seated' ? 'text-orange-600' : 'text-stone-500'
                }`}>
                  {lookupResult.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-stone-700">
                <div>
                  <span className="text-[10px] text-stone-400 block font-medium">Date &amp; Time</span>
                  <span className="font-bold">{lookupResult.date} at {lookupResult.timeSlot}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block font-medium">Guests</span>
                  <span className="font-bold">{lookupResult.partySize} People</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block font-medium">Table</span>
                  <span className="font-bold">
                    {lookupResult.tableNumber ? `Table ${lookupResult.tableNumber}` : 'Host Assigned'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block font-medium">Occasion</span>
                  <span className="font-bold">{lookupResult.occasion || 'Dining'}</span>
                </div>
              </div>

              {lookupResult.status === 'confirmed' && (
                <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                  <button
                    onClick={() => generateIcsCalendar(lookupResult)}
                    className="text-xs text-orange-600 hover:text-orange-700 font-bold"
                  >
                    Add to Calendar
                  </button>
                  <button
                    onClick={() => {
                      cancelReservation(lookupResult.id);
                      setLookupResult({ ...lookupResult, status: 'cancelled' });
                    }}
                    className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-bold"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel Booking</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
