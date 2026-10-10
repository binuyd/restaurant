import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Utensils, Bike, PackageCheck, AlertCircle, Banknote } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import type { OrderType } from '../types';
import { api } from '../api/client';
import './CartDrawer.css';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced: () => void;
  onOpenAuth: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onOrderPlaced,
  onOpenAuth,
}) => {
  const { cart, removeFromCart, updateQuantity, clearCart, totalCartAmount } = useCart();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Order Fulfillment State
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN');
  const [tableNumber, setTableNumber] = useState('Table 4');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');

  if (!isOpen) return null;

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      onClose();
      onOpenAuth();
      return;
    }

    if (cart.length === 0) return;

    if (orderType === 'DELIVERY' && (!deliveryAddress.trim() || !customerPhone.trim())) {
      setError('Please provide a delivery address and contact phone number.');
      return;
    }

    if (orderType === 'TAKEAWAY' && !customerPhone.trim()) {
      setError('Please provide a contact phone number for pickup confirmation.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        orderType,
        tableNumber: orderType === 'DINE_IN' ? tableNumber : undefined,
        customerPhone: customerPhone.trim() || undefined,
        deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress.trim() : undefined,
        specialNotes: specialNotes.trim() || undefined,
        items: cart.map((item) => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
        })),
      };

      await api.post('/orders', payload);
      clearCart();
      onClose();
      onOrderPlaced();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="drawer-overlay cart-drawer">
      <div className="drawer-content flex flex-col h-full max-w-md w-full">
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-slate-100">Your Dining Order</h2>
          </div>
          <button onClick={onClose} className="drawer-close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="error-banner flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {cart.length === 0 ? (
            <div className="empty-cart-state py-12 text-center">
              <ShoppingBag className="w-16 h-16 text-slate-600 mb-4 mx-auto" />
              <p className="text-slate-300 font-medium">Your cart is empty</p>
            </div>
          ) : (
            <>
              {/* Order Mode Switcher */}
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Service / Dining Mode
                </span>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setOrderType('DINE_IN')}
                    className={`py-2 px-1 rounded-md font-semibold flex flex-col items-center gap-1 transition-all ${
                      orderType === 'DINE_IN'
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Dine-In</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderType('TAKEAWAY')}
                    className={`py-2 px-1 rounded-md font-semibold flex flex-col items-center gap-1 transition-all ${
                      orderType === 'TAKEAWAY'
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span>Takeaway</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderType('DELIVERY')}
                    className={`py-2 px-1 rounded-md font-semibold flex flex-col items-center gap-1 transition-all ${
                      orderType === 'DELIVERY'
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Bike className="w-3.5 h-3.5" />
                    <span>Delivery</span>
                  </button>
                </div>

                {/* Conditional Fields based on Order Type */}
                {orderType === 'DINE_IN' && (
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Select Table Number:
                    </label>
                    <select
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="input-field text-xs bg-slate-900 py-1.5"
                    >
                      {Array.from({ length: 20 }, (_, i) => `Table ${i + 1}`).map((tbl) => (
                        <option key={tbl} value={tbl}>
                          {tbl} {tbl === 'Table 4' ? '(Center Hall)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {orderType === 'TAKEAWAY' && (
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Contact Phone for Pickup:
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 019-2834"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="input-field text-xs py-1.5"
                    />
                  </div>
                )}

                {orderType === 'DELIVERY' && (
                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Delivery Street Address:
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 742 Evergreen Terrace, Apt 3B"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="input-field text-xs py-1.5"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Delivery Contact Phone:
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+1 (555) 234-5678"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="input-field text-xs py-1.5"
                      />
                    </div>
                  </div>
                )}

                {/* Special Kitchen Notes */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Special Kitchen Instructions / Allergies:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Extra spicy, dressing on side, no peanuts..."
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    className="input-field text-xs py-1.5"
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Ordered Dishes ({cart.length})
                </span>
                {cart.map((item) => (
                  <div key={item.menuItem.id} className="cart-item-card">
                    <img
                      src={item.menuItem.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80'}
                      alt={item.menuItem.name}
                      className="cart-item-img"
                    />

                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-200 text-sm">{item.menuItem.name}</h4>
                      <p className="text-xs text-amber-400 font-medium mt-0.5">
                        ${item.menuItem.price.toFixed(2)} each
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <div className="qty-control small">
                          <button
                            onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                            className="qty-btn"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="qty-number">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                            className="qty-btn"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-bold text-slate-100 text-sm">
                          ${(item.menuItem.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.menuItem.id)}
                      className="text-slate-400 hover:text-rose-400 p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div className="drawer-footer border-t border-slate-800 p-4 bg-slate-950/80">
            {/* Payment Method Notice (No payment system needed) */}
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2 mb-3">
              <Banknote className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                <strong>Payment: In-Person / Cash / At Counter</strong> (No online card required. Order confirms immediately).
              </span>
            </div>

            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-400 text-sm">Estimated Total:</span>
              <span className="text-2xl font-bold text-amber-400">${totalCartAmount.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full btn-primary py-3.5 text-base font-semibold flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Submitting Order...' : isAuthenticated ? 'Place Order (Pay In-Person)' : 'Sign In to Confirm Order'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
