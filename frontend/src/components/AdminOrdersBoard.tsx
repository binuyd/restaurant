import React, { useState, useEffect } from 'react';
import { ArrowRight, AlertTriangle, RefreshCw, ShieldAlert, CheckCircle } from 'lucide-react';
import { OrderDto, OrderStatus } from '../types';
import { api } from '../api/client';

export const AdminOrdersBoard: React.FC = () => {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  const statuses: OrderStatus[] = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

  const fetchAllOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get<OrderDto[]>('/admin/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
    const interval = setInterval(() => fetchAllOrders(true), 10000);
    return () => clearInterval(interval);
  }, []);

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    switch (current) {
      case 'PLACED': return 'CONFIRMED';
      case 'CONFIRMED': return 'PREPARING';
      case 'PREPARING': return 'READY';
      case 'READY': return 'COMPLETED';
      default: return null;
    }
  };

  const handleStatusUpdate = async (orderId: number, nextStatus: OrderStatus) => {
    setActionError(null);
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: nextStatus });
      fetchAllOrders(true);
    } catch (err: any) {
      setActionError(
        err.response?.data?.message || 'Failed to update order status. Valid state machine transition required.'
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Admin Orders Board</h1>
          <p className="text-sm text-slate-400 mt-1">
            Enforce validated order lifecycle transitions & optimistic locking.
          </p>
        </div>

        <button
          onClick={() => fetchAllOrders()}
          className="btn-secondary text-sm flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Kanban Board</span>
        </button>
      </div>

      {actionError && (
        <div className="error-banner mb-6 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1">{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-xs underline">Dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="kanban-grid">
          {statuses.map((colStatus) => {
            const columnOrders = orders.filter((o) => o.status === colStatus);

            return (
              <div key={colStatus} className="kanban-column">
                <div className={`kanban-col-header ${colStatus.toLowerCase()}`}>
                  <span className="font-bold text-sm">{colStatus}</span>
                  <span className="col-count">{columnOrders.length}</span>
                </div>

                <div className="kanban-col-body space-y-4">
                  {columnOrders.length === 0 ? (
                    <div className="empty-col">No {colStatus.toLowerCase()} orders</div>
                  ) : (
                    columnOrders.map((order) => {
                      const next = getNextStatus(order.status);
                      const canCancel = order.status === 'PLACED' || order.status === 'CONFIRMED';

                      return (
                        <div key={order.id} className="kanban-card">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-slate-200 text-sm">#{order.id}</span>
                            <span className="version-pill" title="Optimistic Lock Version">
                              v{order.version}
                            </span>
                          </div>

                          <div className="text-xs text-slate-300 font-semibold mb-1">
                            {order.customerName}
                          </div>
                          <div className="text-[11px] text-slate-400 mb-3 truncate">
                            {order.customerEmail}
                          </div>

                          <div className="border-t border-slate-700/50 pt-2 mb-3 space-y-1">
                            {order.items.map((item) => (
                              <div key={item.id} className="text-xs flex justify-between text-slate-300">
                                <span>{item.quantity}x {item.menuItemName}</span>
                                <span className="font-mono text-slate-400">${item.subtotal.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
                            <span className="text-sm font-bold text-amber-400">
                              ${order.totalAmount.toFixed(2)}
                            </span>

                            <div className="flex items-center gap-1">
                              {canCancel && (
                                <button
                                  onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}
                                  className="btn-kanban-cancel"
                                  title="Cancel Order"
                                >
                                  Cancel
                                </button>
                              )}

                              {next && (
                                <button
                                  onClick={() => handleStatusUpdate(order.id, next)}
                                  className="btn-kanban-next"
                                >
                                  <span>{next}</span>
                                  <ArrowRight className="w-3 h-3 ml-1 inline" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
