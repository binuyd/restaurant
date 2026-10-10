import React from 'react';
import { ShoppingBag, Utensils, LayoutDashboard, ListOrdered, Menu as MenuIcon, LogIn, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenCart: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenCart, onOpenAuth }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

  const navigate = (tab: string) => {
    setCurrentTab(tab);
    setIsMobileNavOpen(false);
  };

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="brand" onClick={() => navigate('menu')}>
          <div className="brand-logo">
            <Utensils className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <span className="brand-title">GOURMET</span>
            <span className="brand-subtitle">HAVEN</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <button
          type="button"
          className="mobile-nav-toggle"
          onClick={() => setIsMobileNavOpen((open) => !open)}
          aria-label={isMobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMobileNavOpen}
        >
          {isMobileNavOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>

        <nav className={`nav-links ${isMobileNavOpen ? 'open' : ''}`}>
          <button
            onClick={() => navigate('menu')}
            className={`nav-btn ${currentTab === 'menu' ? 'active' : ''}`}
          >
            <MenuIcon className="w-4 h-4 mr-2 inline" />
            Menu
          </button>

          {isAuthenticated && (
            <button
              onClick={() => navigate('my-orders')}
              className={`nav-btn ${currentTab === 'my-orders' ? 'active' : ''}`}
            >
              <ListOrdered className="w-4 h-4 mr-2 inline" />
              My Orders
            </button>
          )}

          {isAdmin && (
            <>
              <button
                onClick={() => navigate('admin-orders')}
                className={`nav-btn admin ${currentTab === 'admin-orders' ? 'active' : ''}`}
              >
                <ListOrdered className="w-4 h-4 mr-2 inline" />
                Orders Board
              </button>
              <button
                onClick={() => navigate('admin-menu')}
                className={`nav-btn admin ${currentTab === 'admin-menu' ? 'active' : ''}`}
              >
                <MenuIcon className="w-4 h-4 mr-2 inline" />
                Menu Management
              </button>
              <button
                onClick={() => navigate('admin-dashboard')}
                className={`nav-btn admin ${currentTab === 'admin-dashboard' ? 'active' : ''}`}
              >
                <LayoutDashboard className="w-4 h-4 mr-2 inline" />
                Dashboard
              </button>
            </>
          )}
        </nav>

        {/* Right Actions: Cart & Auth */}
        <div className="navbar-actions flex items-center gap-3">
          {/* Cart Button */}
          <button onClick={onOpenCart} className="cart-btn">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <span className="hidden sm:inline font-medium text-sm">Cart</span>
            {totalItemsCount > 0 && (
              <span className="cart-badge">{totalItemsCount}</span>
            )}
          </button>

          {/* Auth Button */}
          {isAuthenticated ? (
            <div className="user-profile">
              <div className="user-info">
                <span className="user-name">{user?.name}</span>
                <span className={`role-badge ${user?.role.toLowerCase()}`}>
                  {user?.role}
                </span>
              </div>
              <button onClick={logout} className="logout-btn" title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth} className="btn-primary flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
