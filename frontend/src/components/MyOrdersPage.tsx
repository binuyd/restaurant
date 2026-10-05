import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, XCircle, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, History } from 'lucide-react';
import type { OrderDto, OrderStatus } from '../types';
import { api } from '../api/client';

export const MyOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [cancelLoading, setCancelLoading] = useState<number | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchMyOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get<OrderDto[]>('/orders/my');
      setOrders(res.data);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // 10-second Polling for Live Order Status Updates (per Section 5 of Spec)
  useEffect(() => {
    fetchMyOrders();
    const interval = setInterval(() => {
      fetchMyOrders(true);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCancel = async (orderId: number) => {
    setCancelLoading(orderId);
    try {
      await api.patch(`/orders/${orderId}/cancel`);
      fetchMyOrders(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancelLoading(null);
    }
  };

  const getStatusStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'PLACED': return 0;
      case 'CONFIRMED': return 1;
      case 'PREPARING': return 2;
      case 'READY': return 3;
      case 'COMPLETED': return 4;
      case 'CANCELLED': return -1;
      default: return 0;
    }
  };

  const steps: OrderStatus[] = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED'];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">My Orders History</h1>
          <p className="text-sm text-slate-400 mt-1">
            Track your order lifecycle in real-time. (Auto-refreshes every 10s)
          </p>
        </div>

        <button
          onClick={() => fetchMyOrders()}
          className="btn-secondary text-sm flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Last updated {lastRefreshed.toLocaleTimeString()}</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="spinner"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card text-center py-16 px-4">
          <Clock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-200">No Orders Placed Yet</h3>
          <p className="text-sm text-slate-400 mt-1">Visit our menu to place your first gourmet order!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const currentStepIdx = getStatusStepIndex(order.status);
            const isCancelled = order.status === 'CANCELLED';
            const canCancel = order.status === 'PLACED' || order.status === 'CONFIRMED';
            const isExpanded = expandedOrder === order.id;

            return (
              <div key={order.id} className="order-card-container">
                {/* Header */}
                <div className="order-card-header">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="order-id">Order #{order.id}</span>
                      <span className={`status-pill ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Placed on {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Total Amount</span>
                      <span className="text-xl font-bold text-amber-400">
                        ${order.totalAmount.toFixed(2)}
                      </span>
                    </div>

                    {canCancel && (
                      <button
                        onClick={() => handleCancel(order.id)}
                        disabled={cancelLoading === order.id}
                        className="btn-cancel text-xs"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1 inline" />
                        {cancelLoading === order.id ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar State Machine Diagram */}
                {!isCancelled ? (
                  <div className="progress-bar-container">
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(currentStepIdx / (steps.length - 1)) * 100}%`,
                        }}
                      ></div>
                    </div>

                    <div className="progress-steps">
                      {steps.map((step, idx) => {
                        const isDone = idx <= currentStepIdx;
                        const isCurrent = idx === currentStepIdx;

                        return (
                          <div key={step} className="step-item">
                            <div
                              className={`step-circle ${
                                isDone ? 'completed' : ''
                              } ${isCurrent ? 'current' : ''}`}
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <span className="text-xs">{idx + 1}</span>
                              )}
                            </div>
                            <span className={`step-label ${isCurrent ? 'font-bold text-amber-400' : ''}`}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="cancelled-banner">
                    <AlertCircle className="w-5 h-5 text-rose-400" />
                    <span>This order was cancelled prior to food preparation.</span>
                  </div>
                )}

                {/* Item List & Snapshot Verification */}
                <div className="order-items-preview">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    Order Items (Unit Price Snapshot)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="order-item-row">
                        <span className="text-slate-200 text-sm font-medium">
                          {item.quantity}x {item.menuItemName}
                        </span>
                        <span className="text-slate-400 text-xs font-mono">
                          ${item.unitPrice.toFixed(2)} ea = ${item.subtotal.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* History Accordion Toggle */}
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="history-toggle-btn"
                >
                  <History className="w-4 h-4 text-amber-400" />
                  <span>View Status History & Audit Trail</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {/* Status History Timeline */}
                {isExpanded && (
                  <div className="audit-trail-container">
                    <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                      Audit Trail
                    </h5>
                    <div className="space-y-2">
                      {order.statusHistory.map((hist) => (
                        <div key={hist.id} className="audit-row">
                          <div className="audit-dot"></div>
                          <div className="text-xs">
                            <span className="font-semibold text-slate-200">
                              {hist.fromStatus ? `${hist.fromStatus} → ` : ''}
                              {hist.toStatus}
                            </span>
                            <span className="text-slate-400 ml-2">by {hist.changedBy}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono ml-auto">
                            {new Date(hist.changedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
