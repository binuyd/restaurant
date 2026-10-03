import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

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

  if (!isOpen) return null;

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      onClose();
      onOpenAuth();
      return;
    }

    if (cart.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const payload = {
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
    <div className="drawer-overlay">
      <div className="drawer-content">
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-slate-100">Your Order Cart</h2>
          </div>
          <button onClick={onClose} className="drawer-close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="drawer-body">
          {error && (
            <div className="error-banner mb-4">
              <span>{error}</span>
            </div>
          )}

          {cart.length === 0 ? (
            <div className="empty-cart-state">
              <ShoppingBag className="w-16 h-16 text-slate-600 mb-4" />
              <p className="text-slate-300 font-medium">Your cart is empty</p>
              <p className="text-xs text-slate-400 mt-1">Browse our menu and add delicious items!</p>
            </div>
          ) : (
            <div className="space-y-4">
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
          )}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div className="drawer-footer">
            <div className="security-note flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Prices verified on server with price-snapshot guarantee</span>
            </div>

            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-400">Total Amount:</span>
              <span className="text-2xl font-bold text-amber-400">${totalCartAmount.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full btn-primary py-3.5 text-base font-semibold flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Submitting Order...' : isAuthenticated ? 'Place Order Now' : 'Sign In to Order'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
