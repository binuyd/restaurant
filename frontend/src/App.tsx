import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { MenuPage } from './components/MenuPage';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { MyOrdersPage } from './components/MyOrdersPage';
import { ReservationPage } from './components/ReservationPage';
import { KitchenKdsPage } from './components/KitchenKdsPage';
import { AdminOrdersBoard } from './components/AdminOrdersBoard';
import { AdminReservationsPage } from './components/AdminReservationsPage';
import { AdminMenuPage } from './components/AdminMenuPage';
import { AdminDashboardPage } from './components/AdminDashboardPage';
import './App.css';

const MainContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('menu');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin && ['menu', 'reservations', 'my-orders'].includes(currentTab)) {
      setCurrentTab('admin-dashboard');
    } else if (!isAuthenticated && ['my-orders', 'kitchen-kds', 'admin-orders', 'admin-reservations', 'admin-menu', 'admin-dashboard'].includes(currentTab)) {
      setCurrentTab('menu');
    }
  }, [isAdmin, isAuthenticated, currentTab]);

  const handleOrderPlaced = () => {
    setCurrentTab('my-orders');
  };

  return (
    <div className="app-shell">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <main className="app-main">
        {currentTab === 'menu' && (
          <MenuPage onNavigateToReservation={() => setCurrentTab('reservations')} />
        )}
        {currentTab === 'reservations' && <ReservationPage />}
        {currentTab === 'my-orders' && isAuthenticated && <MyOrdersPage />}
        {currentTab === 'kitchen-kds' && isAdmin && <KitchenKdsPage />}
        {currentTab === 'admin-orders' && isAdmin && <AdminOrdersBoard />}
        {currentTab === 'admin-reservations' && isAdmin && <AdminReservationsPage />}
        {currentTab === 'admin-menu' && isAdmin && <AdminMenuPage />}
        {currentTab === 'admin-dashboard' && isAdmin && <AdminDashboardPage />}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="app-footer-inner">
          <p>© 2026 Gourmet Haven Full Restaurant Management Platform. All rights reserved.</p>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderPlaced={handleOrderPlaced}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
