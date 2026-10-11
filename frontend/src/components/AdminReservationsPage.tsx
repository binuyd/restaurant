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
    <div className="admin-reservations-page">
      {/* Header */}
      <div className="admin-reservations-header">
        <div>
          <p className="admin-reservations-eyebrow">Front of house</p>
          <h1>Table Reservations Management</h1>
          <p className="admin-reservations-subtitle">Review arrivals, seat guests, and keep tonight's service moving.</p>
        </div>

        <div className="admin-reservations-header-actions">
          <button
            onClick={() => setIsWalkInModalOpen(true)}
            className="reservation-button reservation-button-primary"
          >
            <Plus className="reservation-button-icon" />
            <span>New Walk-in Booking</span>
          </button>

          <button
            onClick={() => fetchReservations()}
            className="reservation-button reservation-button-secondary"
          >
            <RefreshCw className={`reservation-button-icon ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-reservations-filter reservation-filter-bar">
        {/* Search */}
        <div className="reservation-search">
          <Search className="reservation-search-icon" />
          <input
            type="text"
            placeholder="Search guest by name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="reservation-input reservation-search-input"
          />
        </div>

        {/* Date Filters */}
        <div className="reservation-filter-group">
          <span className="reservation-filter-label">Date</span>
          <div className="reservation-segmented-control">
            {['ALL', 'TODAY', 'TOMORROW'].map((df) => (
              <button
                key={df}
                onClick={() => setDateFilter(df)}
                className={dateFilter === df ? 'is-active' : ''}
              >
                {df}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filters */}
        <label className="reservation-filter-group reservation-status-group">
          <span className="reservation-filter-label">Status</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="reservation-input reservation-status-select"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="SEATED">Seated</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </label>
      </div>

      {/* Reservations Table / Cards */}
      {loading && reservations.length === 0 ? (
        <div className="flex justify-center py-20">
          <div className="spinner"></div>
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="reservation-empty-state">
          <Calendar className="reservation-empty-icon" />
          <h3>No Reservations Found</h3>
          <p>Try changing the date, status, or search filters.</p>
        </div>
      ) : (
        <div className="reservation-list">
          {filteredReservations.map((res) => {
            const isToday = res.reservationDate === todayStr;
            return (
              <div
                key={res.id}
                className={`admin-reservation-card reservation-row ${
                  isToday ? 'border-amber-500/40 bg-amber-950/10' : 'border-slate-800'
                }`}
              >
                {/* Guest Details */}
                <div className="reservation-card-content">
                  <div className="reservation-card-heading">
                    <span className="reservation-guest-name">{res.guestName}</span>
                    <span
                      className={`reservation-status-badge ${
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
                      <span className="reservation-today-badge">
                        TODAY
                      </span>
                    )}
                  </div>

                  <div className="reservation-meta">
                    <span className="reservation-meta-item reservation-meta-primary">
                      <Calendar className="reservation-meta-icon" />
                      {res.reservationDate} at {res.reservationTime}
                    </span>
                    <span className="reservation-meta-item">
                      <Users className="reservation-meta-icon" />
                      {res.partySize} Guests
                    </span>
                    <span className="reservation-meta-item">
                      <MapPin className="reservation-meta-icon" />
                      Area: {res.seatingArea}
                    </span>
                    <span className="reservation-meta-item">{res.guestPhone}</span>
                    <span className="reservation-meta-item">{res.guestEmail}</span>
                  </div>

                  {res.specialRequests && (
                    <div className="reservation-special-request">
                      <strong>Special Request:</strong> {res.specialRequests}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="admin-reservation-actions">
                  {res.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleStatusChange(res.id, 'SEATED')}
                      className="reservation-action reservation-action-seat"
                    >
                      <UserCheck className="reservation-action-icon" />
                      <span>Seat Guests</span>
                    </button>
                  )}

                  {res.status === 'SEATED' && (
                    <button
                      onClick={() => handleStatusChange(res.id, 'COMPLETED')}
                      className="reservation-action reservation-action-complete"
                    >
                      <CheckCircle className="reservation-action-icon" />
                      <span>Complete Table</span>
                    </button>
                  )}

                  {res.status !== 'CANCELLED' && res.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleStatusChange(res.id, 'CANCELLED')}
                      className="reservation-action reservation-action-cancel"
                    >
                      <XCircle className="reservation-action-icon" />
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
        <div className="walk-in-modal modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsWalkInModalOpen(false)}>
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
