import React, { useState, useEffect } from 'react';
import { Calendar, Users, MapPin, CheckCircle, XCircle, Search, RefreshCw, UserCheck, Plus, AlertCircle } from 'lucide-react';
import type { ReservationDto, ReservationStatus } from '../types';
import { api } from '../api/client';
import './AdminReservationsPage.css';

export const AdminReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<ReservationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL'); // ALL, TODAY, TOMORROW
  const [search, setSearch] = useState('');
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);

  // Walk-in form state
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [partySize, setPartySize] = useState<number>(2);
  const [seatingArea, setSeatingArea] = useState('MAIN_DINING');
  const [walkInTime, setWalkInTime] = useState('19:00');
  const [walkInError, setWalkInError] = useState('');

  const fetchReservations = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get<ReservationDto[]>('/admin/reservations');
      setReservations(res.data);
    } catch (err) {
      console.error('Failed to load reservations', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
    const interval = setInterval(() => fetchReservations(true), 12000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (id: number, newStatus: ReservationStatus) => {
    try {
      await api.patch(`/admin/reservations/${id}/status`, { status: newStatus });
      fetchReservations(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update reservation');
    }
  };

  const handleCreateWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalkInError('');
    try {
      const today = new Date().toISOString().split('T')[0];
      await api.post('/reservations', {
        guestName,
        guestEmail: guestEmail || 'walkin@restaurant.guest',
        guestPhone,
        reservationDate: today,
        reservationTime: walkInTime,
        partySize: Number(partySize),
        seatingArea,
        specialOccasion: 'WALK_IN',
        specialRequests: 'Walk-in guest registered by host staff.',
      });
      setIsWalkInModalOpen(false);
      setGuestName('');
      setGuestPhone('');
      fetchReservations(true);
    } catch (err: any) {
      setWalkInError(err.response?.data?.message || 'Failed to book walk-in table.');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const filteredReservations = reservations.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (dateFilter === 'TODAY' && r.reservationDate !== todayStr) return false;
    if (dateFilter === 'TOMORROW' && r.reservationDate !== tomorrowStr) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.guestName.toLowerCase().includes(q) ||
        r.guestPhone.toLowerCase().includes(q) ||
        r.guestEmail.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="admin-reservations-page max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="admin-reservations-header flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Table Reservations Management</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsWalkInModalOpen(true)}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Walk-in Booking</span>
          </button>

          <button
            onClick={() => fetchReservations()}
            className="btn-secondary text-xs flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="reservation-filter-bar glass-card p-4 mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search guest by name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 py-2 text-xs"
          />
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Date:</span>
          <div className="inline-flex rounded-lg bg-slate-900 border border-slate-800 p-0.5">
            {['ALL', 'TODAY', 'TOMORROW'].map((df) => (
              <button
                key={df}
                onClick={() => setDateFilter(df)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  dateFilter === df
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {df}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field py-1.5 px-3 text-xs bg-slate-900 w-auto"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="SEATED">Seated</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Reservations Table / Cards */}
      {loading && reservations.length === 0 ? (
        <div className="flex justify-center py-20">
          <div className="spinner"></div>
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="glass-card p-8 text-center py-16">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-200">No Reservations Found</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReservations.map((res) => {
            const isToday = res.reservationDate === todayStr;
            return (
              <div
                key={res.id}
                className={`reservation-row glass-card p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 border ${
                  isToday ? 'border-amber-500/40 bg-amber-950/10' : 'border-slate-800'
                }`}
              >
                {/* Guest Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="font-extrabold text-slate-100 text-base">{res.guestName}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        res.status === 'CONFIRMED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : res.status === 'SEATED'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                          : res.status === 'COMPLETED'
                          ? 'bg-slate-500/20 text-slate-400'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {res.status}
                    </span>
                    {isToday && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500 text-slate-950">
                        TODAY
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-slate-200 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      {res.reservationDate} at {res.reservationTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      {res.partySize} Guests
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      Area: {res.seatingArea}
                    </span>
                    <span>📞 {res.guestPhone}</span>
                    <span>✉️ {res.guestEmail}</span>
                  </div>

                  {res.specialRequests && (
                    <div className="mt-2 text-xs text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                      <strong>Special Request:</strong> {res.specialRequests}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {res.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleStatusChange(res.id, 'SEATED')}
                      className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Seat Guests</span>
                    </button>
                  )}

                  {res.status === 'SEATED' && (
                    <button
                      onClick={() => handleStatusChange(res.id, 'COMPLETED')}
                      className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Complete Table</span>
                    </button>
                  )}

                  {res.status !== 'CANCELLED' && res.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleStatusChange(res.id, 'CANCELLED')}
                      className="btn-secondary text-xs py-1.5 px-3 text-rose-400 border-rose-500/30 hover:bg-rose-500/10 flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Walk-in Booking Modal */}
      {isWalkInModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsWalkInModalOpen(false)}>
          <div className="modal-card max-w-md w-full">
            <h2 className="text-xl font-bold text-slate-100 mb-4">Register Walk-in Guest Table</h2>
            {walkInError && (
              <div className="error-banner mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{walkInError}</span>
              </div>
            )}
            <form onSubmit={handleCreateWalkIn} className="space-y-4">
              <div>
                <label className="input-label">Guest Name</label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Marcus Aurelius"
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">Email (Optional)</label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="e.g. guest@example.com"
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Phone</label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+1 555-0192"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="input-label">Party Size</label>
                  <select
                    value={partySize}
                    onChange={(e) => setPartySize(Number(e.target.value))}
                    className="input-field bg-slate-900"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                      <option key={n} value={n}>
                        {n} Guests
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Time Slot</label>
                  <input
                    type="time"
                    required
                    value={walkInTime}
                    onChange={(e) => setWalkInTime(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="input-label">Seating Area</label>
                  <select
                    value={seatingArea}
                    onChange={(e) => setSeatingArea(e.target.value)}
                    className="input-field bg-slate-900"
                  >
                    <option value="MAIN_DINING">Main Dining</option>
                    <option value="WINDOW">Window View</option>
                    <option value="OUTDOOR">Outdoor Terrace</option>
                    <option value="VIP">VIP Lounge</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsWalkInModalOpen(false)}
                  className="flex-1 btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary text-sm">
                  Seat / Confirm Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
