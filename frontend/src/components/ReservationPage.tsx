import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Sparkles, MapPin, CheckCircle, AlertCircle, Heart } from 'lucide-react';
import type { ReservationDto, CreateReservationRequest } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const ReservationPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'book' | 'my-bookings'>('book');
  const [myReservations, setMyReservations] = useState<ReservationDto[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successBooking, setSuccessBooking] = useState<ReservationDto | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Form fields
  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestPhone, setGuestPhone] = useState('');
  const [reservationDate, setReservationDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [reservationTime, setReservationTime] = useState('19:00');
  const [partySize, setPartySize] = useState<number>(2);
  const [seatingArea, setSeatingArea] = useState('MAIN_DINING');
  const [specialOccasion, setSpecialOccasion] = useState('CASUAL');
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    if (user) {
      if (!guestName) setGuestName(user.name);
      if (!guestEmail) setGuestEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'my-bookings' && isAuthenticated) {
      fetchMyBookings();
    }
  }, [activeTab, isAuthenticated]);

  const fetchMyBookings = async () => {
    setLoadingBookings(true);
    try {
      const res = await api.get<ReservationDto[]>('/reservations/my');
      setMyReservations(res.data);
    } catch (err) {
      console.error('Failed to load reservations', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleCancelBooking = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      await api.patch(`/reservations/${id}/cancel`);
      fetchMyBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not cancel reservation.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    const payload: CreateReservationRequest = {
      guestName,
      guestEmail,
      guestPhone,
      reservationDate,
      reservationTime,
      partySize: Number(partySize),
      seatingArea,
      specialOccasion,
      specialRequests: specialRequests.trim() || undefined,
    };

    try {
      const res = await api.post<ReservationDto>('/reservations', payload);
      setSuccessBooking(res.data);
      if (isAuthenticated) {
        fetchMyBookings();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to place reservation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const timeSlots = [
    '12:00', '12:30', '13:00', '13:30', '14:00',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
  ];

  const seatingOptions = [
    { id: 'MAIN_DINING', label: 'Main Dining Hall', desc: 'Lively, grand chandeliers & curated music' },
    { id: 'WINDOW', label: 'Window View', desc: 'Overlooking the downtown avenue & garden' },
    { id: 'OUTDOOR', label: 'Outdoor Terrace', desc: 'Open air, evening heaters & ambient lanterns' },
    { id: 'VIP', label: 'VIP Private Lounge', desc: 'Intimate exclusive dining for parties & events' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
          Reserve a table
        </h1>

        {/* Tab switcher */}
        <div className="flex justify-center mt-6">
          <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActiveTab('book')}
              className={`px-5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'book'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Book a Table
            </button>
            {isAuthenticated && (
              <button
                onClick={() => setActiveTab('my-bookings')}
                className={`px-5 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'my-bookings'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                My Reservations ({myReservations.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {activeTab === 'book' ? (
        successBooking ? (
          <div className="glass-card max-w-lg mx-auto p-8 text-center border-amber-500/30">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100">Table Reservation Confirmed!</h2>

            <div className="bg-slate-900/80 rounded-xl p-4 my-6 text-left text-xs space-y-2 border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Booking Ref:</span>
                <span className="font-bold text-slate-200">#RES-{successBooking.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-semibold text-amber-400">{successBooking.reservationDate} at {successBooking.reservationTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Party Size:</span>
                <span className="text-slate-200">{successBooking.partySize} Guests</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Seating Area:</span>
                <span className="text-slate-200">{successBooking.seatingArea}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="text-emerald-400 font-semibold uppercase">{successBooking.status}</span>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setSuccessBooking(null);
                  setSpecialRequests('');
                }}
                className="btn-secondary text-sm"
              >
                Make Another Reservation
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => setActiveTab('my-bookings')}
                  className="btn-primary text-sm"
                >
                  View My Bookings
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-card max-w-2xl mx-auto p-6 sm:p-8">
            {errorMsg && (
              <div className="error-banner mb-6">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Reservation Date</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={reservationDate}
                    onChange={(e) => setReservationDate(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="input-label flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>Number of Guests</span>
                  </label>
                  <select
                    value={partySize}
                    onChange={(e) => setPartySize(Number(e.target.value))}
                    className="input-field bg-slate-900"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Time Slots Grid */}
              <div>
                <label className="input-label flex items-center gap-1.5 mb-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Select Time Slot</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setReservationTime(time)}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                        reservationTime === time
                          ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seating Area */}
              <div>
                <label className="input-label flex items-center gap-1.5 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Preferred Seating Area</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {seatingOptions.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => setSeatingArea(opt.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        seatingArea === opt.id
                          ? 'bg-amber-500/10 border-amber-500/60 shadow-sm'
                          : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-slate-200">{opt.label}</span>
                        {seatingArea === opt.id && <CheckCircle className="w-4 h-4 text-amber-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{opt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Occasion */}
              <div>
                <label className="input-label flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  <span>Special Occasion (Optional)</span>
                </label>
                <select
                  value={specialOccasion}
                  onChange={(e) => setSpecialOccasion(e.target.value)}
                  className="input-field bg-slate-900"
                >
                  <option value="CASUAL">Casual Dining</option>
                  <option value="BIRTHDAY">Birthday Celebration</option>
                  <option value="ANNIVERSARY">Anniversary</option>
                  <option value="ROMANTIC">Romantic Date Night</option>
                  <option value="BUSINESS">Business Dinner</option>
                  <option value="FAMILY">Family Gathering</option>
                </select>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="input-label">Your Name</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="input-label">Email Address</label>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="e.g. eleanor@example.com"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="input-label">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+1 (555) 234-5678"
                    className="input-field"
                  />
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="input-label">Dietary Restrictions or Special Requests (Optional)</label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Quiet corner table, high chair for toddler, or nut allergy alert..."
                  className="input-field resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-primary py-3.5 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{submitting ? 'Confirming Table...' : 'Confirm Table Reservation (No Payment Required)'}</span>
                </button>
                <p className="text-center text-[11px] text-slate-500 mt-2">
                  No payment required.
                </p>
              </div>
            </form>
          </div>
        )
      ) : (
        /* My Bookings List */
        <div className="space-y-4">
          {loadingBookings ? (
            <div className="flex justify-center py-16">
              <div className="spinner"></div>
            </div>
          ) : myReservations.length === 0 ? (
            <div className="glass-card text-center py-16">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-200">No Reservations Yet</h3>
              <button onClick={() => setActiveTab('book')} className="btn-primary text-xs mt-4">
                Book a Table Now
              </button>
            </div>
          ) : (
            myReservations.map((res) => {
              const isCancelled = res.status === 'CANCELLED';
              return (
                <div key={res.id} className="order-card-container">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-100 text-sm">Booking #{res.id}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            res.status === 'CONFIRMED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : res.status === 'SEATED'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : res.status === 'COMPLETED'
                              ? 'bg-slate-500/20 text-slate-400'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {res.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex flex-wrap gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          {res.reservationDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          {res.reservationTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-amber-400" />
                          {res.partySize} Guests
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          {res.seatingArea}
                        </span>
                      </div>
                      {res.specialRequests && (
                        <p className="text-xs text-amber-300/80 mt-2 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                          Request: {res.specialRequests}
                        </p>
                      )}
                    </div>

                    {!isCancelled && res.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleCancelBooking(res.id)}
                        className="btn-secondary text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                      >
                        Cancel Reservation
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
