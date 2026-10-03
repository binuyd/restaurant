import React from 'react';
import { ShoppingBag, Utensils, LayoutDashboard, ListOrdered, Menu as MenuIcon, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenCart: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenCart, onOpenAuth }) => {
  const { user, isAuthenticated, isAdmin, logout, quickLogin } = useAuth();
  const { totalItemsCount } = useCart();

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="brand" onClick={() => setCurrentTab('menu')}>
          <div className="brand-logo">
            <Utensils className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <span className="brand-title">GOURMET</span>
            <span className="brand-subtitle">HAVEN</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-links">
          <button
            onClick={() => setCurrentTab('menu')}
            className={`nav-btn ${currentTab === 'menu' ? 'active' : ''}`}
          >
            <MenuIcon className="w-4 h-4 mr-2 inline" />
            Menu
          </button>

          {isAuthenticated && (
            <button
              onClick={() => setCurrentTab('my-orders')}
              className={`nav-btn ${currentTab === 'my-orders' ? 'active' : ''}`}
            >
              <ListOrdered className="w-4 h-4 mr-2 inline" />
              My Orders
            </button>
          )}

          {isAdmin && (
            <>
              <button
                onClick={() => setCurrentTab('admin-orders')}
                className={`nav-btn admin ${currentTab === 'admin-orders' ? 'active' : ''}`}
              >
                <ListOrdered className="w-4 h-4 mr-2 inline" />
                Orders Board
              </button>
              <button
                onClick={() => setCurrentTab('admin-menu')}
                className={`nav-btn admin ${currentTab === 'admin-menu' ? 'active' : ''}`}
              >
                <MenuIcon className="w-4 h-4 mr-2 inline" />
                Menu Management
              </button>
              <button
                onClick={() => setCurrentTab('admin-dashboard')}
                className={`nav-btn admin ${currentTab === 'admin-dashboard' ? 'active' : ''}`}
              >
                <LayoutDashboard className="w-4 h-4 mr-2 inline" />
                Dashboard
              </button>
            </>
          )}
        </nav>

        {/* Right Actions: Cart & Auth */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Switcher */}
          {!isAuthenticated && (
            <div className="demo-pills hidden md:flex items-center gap-2 mr-2">
              <button
                onClick={() => quickLogin('CUSTOMER')}
                className="btn-demo customer"
                title="Quick login as Customer"
              >
                Demo Customer
              </button>
              <button
                onClick={() => quickLogin('ADMIN')}
                className="btn-demo admin"
                title="Quick login as Admin"
              >
                Demo Admin
              </button>
            </div>
          )}

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
