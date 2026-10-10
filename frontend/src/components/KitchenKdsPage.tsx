import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, AlertTriangle, CheckCircle2, Play, Check, RefreshCw, Volume2, VolumeX, Eye } from 'lucide-react';
import type { OrderDto, OrderStatus } from '../types';
import { api } from '../api/client';
import { OrderReceiptModal } from './OrderReceiptModal';
import './KitchenKdsPage.css';

export const KitchenKdsPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<OrderDto | null>(null);

  const fetchKitchenOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get<OrderDto[]>('/admin/orders');
      // Filter for orders that require kitchen attention: PLACED, CONFIRMED, PREPARING, READY
      const kitchenOrders = res.data.filter(
        (o) => o.status === 'PLACED' || o.status === 'CONFIRMED' || o.status === 'PREPARING' || o.status === 'READY'
      );
      setOrders(kitchenOrders);
    } catch (err) {
      console.error('Failed to fetch kitchen orders', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchenOrders();
    const interval = setInterval(() => fetchKitchenOrders(true), 8000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: number, nextStatus: OrderStatus) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: nextStatus });
      fetchKitchenOrders(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const toggleItemCheck = (orderId: number, itemId: number) => {
    const key = `${orderId}-${itemId}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const calculateMinutesElapsed = (createdAt: string) => {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    return Math.floor(diffMs / 60000);
  };

  return (
    <div className="kds-page max-w-7xl mx-auto px-4 py-8">
      {/* KDS Header */}
      <div className="kds-header flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
            <ChefHat className="w-3.5 h-3.5" />
            <span>Live Kitchen Display System (KDS)</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Chef Order Terminal</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`btn-secondary text-xs flex items-center gap-1.5 ${
              audioEnabled ? 'border-amber-500 text-amber-400' : ''
            }`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
            <span>{audioEnabled ? 'Sound Alerts ON' : 'Sound Alerts OFF'}</span>
          </button>

          <button
            onClick={() => fetchKitchenOrders()}
            className="btn-secondary text-xs flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {loading && orders.length === 0 ? (
        <div className="flex justify-center py-20">
          <div className="spinner"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card p-8 text-center py-20">
          <ChefHat className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-200">Kitchen Queue is Clear!</h3>
        </div>
      ) : (
        <div className="kds-order-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {orders.map((order) => {
            const elapsed = calculateMinutesElapsed(order.createdAt);
            const isUrgent = elapsed > 20;
            const isWarning = elapsed > 10 && !isUrgent;

            return (
              <div
                key={order.id}
                className={`kds-order-card glass-card flex flex-col justify-between transition-all border ${
                  isUrgent
                    ? 'border-rose-500/70 bg-rose-950/10'
                    : isWarning
                    ? 'border-amber-500/60 bg-amber-950/10'
                    : 'border-slate-800'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-3 pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-extrabold text-slate-100">
                          #{order.id.toString().padStart(4, '0')}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            order.status === 'PREPARING'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : order.status === 'READY'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium mt-0.5 block">
                        Customer: {order.customerName}
                      </span>
                    </div>

                    <div className="text-right">
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${
                          isUrgent
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                            : isWarning
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{elapsed}m elapsed</span>
                      </div>
                    </div>
                  </div>

                  {/* Mode Banner */}
                  <div className="mb-3">
                    <span className="inline-block px-2.5 py-1 rounded bg-slate-800 text-[11px] font-bold tracking-wider text-amber-400 uppercase">
                      {order.orderType === 'DINE_IN'
                        ? `🍽️ DINE-IN: ${order.tableNumber || 'Table Auto'}`
                        : order.orderType === 'TAKEAWAY'
                        ? '🛍️ TAKEAWAY / PICKUP'
                        : '🛵 HOME DELIVERY'}
                    </span>
                  </div>

                  {/* Kitchen Special Notes */}
                  {order.specialNotes && (
                    <div className="mb-3 p-2 rounded bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                      <div className="flex items-center gap-1 font-semibold mb-0.5 text-amber-400">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Kitchen Special Instructions:</span>
                      </div>
                      <p className="font-mono text-[11px]">{order.specialNotes}</p>
                    </div>
                  )}

                  {/* Items Prep Checklist */}
                  <div className="space-y-2 mb-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                      Dishes to Prepare ({order.items.reduce((s, i) => s + i.quantity, 0)} items):
                    </span>
                    {order.items.map((item) => {
                      const isChecked = checkedItems[`${order.id}-${item.id}`];
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleItemCheck(order.id, item.id)}
                          className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer select-none transition-all ${
                            isChecked
                              ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-500 line-through'
                              : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center ${
                                isChecked
                                  ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                                  : 'border-slate-600'
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="font-semibold text-xs">{item.menuItemName}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-bold text-xs">
                            x{item.quantity}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
                  <div className="flex gap-2">
                    {order.status === 'PLACED' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                        className="flex-1 btn-primary text-xs py-2"
                      >
                        Accept Order
                      </button>
                    )}

                    {(order.status === 'PLACED' || order.status === 'CONFIRMED') && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                        className="flex-1 btn-primary text-xs py-2 bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-3 h-3" />
                        <span>Start Cooking</span>
                      </button>
                    )}

                    {order.status === 'PREPARING' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'READY')}
                        className="flex-1 btn-primary text-xs py-2 bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Ready</span>
                      </button>
                    )}

                    {order.status === 'READY' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                        className="flex-1 btn-secondary text-xs py-2 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      >
                        Complete / Hand Off
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedReceiptOrder(order)}
                    className="w-full text-center text-xs text-slate-400 hover:text-slate-200 py-1 flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View Order Receipt</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Printable Receipt Modal */}
      <OrderReceiptModal
        order={selectedReceiptOrder}
        isOpen={!!selectedReceiptOrder}
        onClose={() => setSelectedReceiptOrder(null)}
      />
    </div>
  );
};
