import React, { useState } from 'react';
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

const MainContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('menu');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const { isAuthenticated, isAdmin } = useAuth();

  const handleOrderPlaced = () => {
    setCurrentTab('my-orders');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <main className="flex-1">
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
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
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
