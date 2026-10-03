import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { MenuPage } from './components/MenuPage';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { MyOrdersPage } from './components/MyOrdersPage';
import { AdminOrdersBoard } from './components/AdminOrdersBoard';
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
        {currentTab === 'menu' && <MenuPage />}
        {currentTab === 'my-orders' && isAuthenticated && <MyOrdersPage />}
        {currentTab === 'admin-orders' && isAdmin && <AdminOrdersBoard />}
        {currentTab === 'admin-menu' && isAdmin && <AdminMenuPage />}
        {currentTab === 'admin-dashboard' && isAdmin && <AdminDashboardPage />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 Gourmet Haven Restaurant Ordering Platform. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Spring Boot 3.3</span>
            <span>•</span>
            <span>React + TypeScript</span>
            <span>•</span>
            <span>PostgreSQL & Flyway</span>
          </div>
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
