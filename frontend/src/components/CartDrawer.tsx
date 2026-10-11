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
      <div className="drawer-content">
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title">
            <ShoppingBag className="drawer-title-icon" />
            <div>
              <h2>Your Dining Order</h2>
              <span>{cart.length} {cart.length === 1 ? 'dish' : 'dishes'} selected</span>
            </div>
          </div>
          <button onClick={onClose} className="drawer-close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          {error && (
            <div className="cart-error">
              <AlertCircle className="cart-message-icon" />
              <span>{error}</span>
            </div>
          )}

          {cart.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag className="cart-empty-icon" />
              <h3>Your cart is empty</h3>
              <p>Add a dish from the menu to begin your order.</p>
            </div>
          ) : (
            <>
              {/* Order Mode Switcher */}
              <div className="order-type-section">
                <span className="section-kicker">
                  Service / Dining Mode
                </span>
                <div className="order-type-buttons">
                  <button
                    type="button"
                    onClick={() => setOrderType('DINE_IN')}
                    className={`order-type-btn ${orderType === 'DINE_IN' ? 'selected' : ''}`}
                  >
                    <Utensils className="order-type-icon" />
                    <span>Dine-In</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderType('TAKEAWAY')}
                    className={`order-type-btn ${orderType === 'TAKEAWAY' ? 'selected' : ''}`}
                  >
                    <PackageCheck className="order-type-icon" />
                    <span>Takeaway</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderType('DELIVERY')}
                    className={`order-type-btn ${orderType === 'DELIVERY' ? 'selected' : ''}`}
                  >
                    <Bike className="order-type-icon" />
                    <span>Delivery</span>
                  </button>
                </div>

                {/* Conditional Fields based on Order Type */}
                {orderType === 'DINE_IN' && (
                  <div className="order-fields">
                    <label>
                      Select Table Number:
                    </label>
                    <select
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="cart-input"
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
                  <div className="order-fields">
                    <label>
                      Contact Phone for Pickup:
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 019-2834"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="cart-input"
                    />
                  </div>
                )}

                {orderType === 'DELIVERY' && (
                  <div className="order-fields">
                    <div>
                      <label>
                        Delivery Street Address:
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 742 Evergreen Terrace, Apt 3B"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="cart-input"
                      />
                    </div>
                    <div>
                      <label>
                        Delivery Contact Phone:
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+1 (555) 234-5678"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="cart-input"
                      />
                    </div>
                  </div>
                )}

                {/* Special Kitchen Notes */}
                <div className="order-fields">
                  <label>
                    Special Kitchen Instructions / Allergies:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Extra spicy, dressing on side, no peanuts..."
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    className="cart-input"
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="cart-items-section">
                <span className="section-kicker">
                  Ordered Dishes ({cart.length})
                </span>
                {cart.map((item) => (
                  <div key={item.menuItem.id} className="cart-item-card">
                    <img
                      src={item.menuItem.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80'}
                      alt={item.menuItem.name}
                      className="cart-item-img"
                    />

                    <div className="cart-item-details">
                      <h4>{item.menuItem.name}</h4>
                      <p className="cart-item-price">
                        ${item.menuItem.price.toFixed(2)} each
                      </p>

                      <div className="item-qty-row">
                        <div className="qty-control-small">
                          <button
                            onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                            aria-label={`Decrease ${item.menuItem.name} quantity`}
                          >
                            <Minus className="qty-icon" />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                            aria-label={`Increase ${item.menuItem.name} quantity`}
                          >
                            <Plus className="qty-icon" />
                          </button>
                        </div>

                        <span className="item-total">
                          ${(item.menuItem.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.menuItem.id)}
                      className="remove-item-btn"
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
          <div className="drawer-footer">
            {/* Payment Method Notice (No payment system needed) */}
            <div className="payment-notice">
              <Banknote className="cart-message-icon" />
              <span>
                <strong>Payment: In-Person / Cash / At Counter</strong> (No online card required. Order confirms immediately).
              </span>
            </div>

            <div className="subtotal-row">
              <span>Estimated Total:</span>
              <span>${totalCartAmount.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="checkout-button"
            >
              <span>{loading ? 'Submitting Order...' : isAuthenticated ? 'Place Order (Pay In-Person)' : 'Sign In to Confirm Order'}</span>
              <ArrowRight className="checkout-icon" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
