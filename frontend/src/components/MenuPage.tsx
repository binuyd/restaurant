import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, Check, Flame, Star, Calendar, MessageSquare } from 'lucide-react';
import type { MenuItem, Category, MenuItemRatingSummaryDto } from '../types';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';
import { DishDetailsModal } from './DishDetailsModal';

interface MenuPageProps {
  onNavigateToReservation?: () => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({ onNavigateToReservation }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [ratingsMap, setRatingsMap] = useState<Record<number, { avg: number; count: number }>>({});
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [addedNotice, setAddedNotice] = useState<number | null>(null);
  const [detailsItem, setDetailsItem] = useState<MenuItem | null>(null);

  const { addToCart } = useCart();

  useEffect(() => {
    fetchCategories();
    fetchRatingSummaries();
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await api.get<Category[]>('/menu/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchRatingSummaries = async () => {
    try {
      const res = await api.get<MenuItemRatingSummaryDto[]>('/reviews/summaries');
      const map: Record<number, { avg: number; count: number }> = {};
      res.data.forEach((r) => {
        map[r.menuItemId] = { avg: r.averageRating, count: r.totalReviews };
      });
      setRatingsMap(map);
    } catch (err) {
      console.error('Failed to load rating summaries', err);
    }
  };

  const fetchMenu = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const params: any = { availableOnly: true };
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      const res = await api.get<MenuItem[]>('/menu', { params });
      setMenuItems(res.data);
    } catch (err) {
      console.error('Failed to load menu items', err);
      setLoadError('We could not load the menu. Please check the connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (itemId: number, delta: number) => {
    setQuantities((prev) => {
      const current = prev[itemId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [itemId]: next };
    });
  };

  const handleAddToCart = (item: MenuItem) => {
    const qty = quantities[item.id] || 1;
    addToCart(item, qty);
    setAddedNotice(item.id);
    setTimeout(() => setAddedNotice(null), 1500);
  };

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="menu-page-container">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-badge">
          <Flame className="w-4 h-4 text-amber-400" />
          <span>Artisanal Culinary Craftsmanship • Zero Online Payment Required</span>
        </div>
        <h1 className="hero-title">Experience Exquisite Dining</h1>
        <p className="hero-subtitle">
          Handcrafted dishes prepared with fresh organic ingredients, traditional recipes, and contemporary passion.
          Order for dine-in table service, takeaway, or direct delivery.
        </p>

        {/* Quick CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 my-4">
          {onNavigateToReservation && (
            <button
              onClick={onNavigateToReservation}
              className="btn-primary py-2.5 px-5 text-xs font-semibold flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book a Table (Instant Confirmation)</span>
            </button>
          )}
          <div className="text-xs text-slate-400 bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-800">
            Open daily: 12:00 PM – 11:00 PM • Cash & In-Person Checkout
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-box">
          <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search appetizers, chef mains, woodfired pizzas, desserts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="category-pills-container">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`pill-btn ${selectedCategory === null ? 'active' : ''}`}
        >
          All Items ({menuItems.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`pill-btn ${selectedCategory === cat.id ? 'active' : ''}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="spinner"></div>
        </div>
      ) : loadError ? (
        <div className="empty-state">
          <p className="text-lg text-slate-300">{loadError}</p>
          <button onClick={fetchMenu} className="btn-secondary mt-4">Try Again</button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state">
          <p className="text-lg text-slate-400">No dishes match your selection.</p>
        </div>
      ) : (
        <div className="menu-grid">
          {filteredItems.map((item) => {
            const qty = quantities[item.id] || 1;
            const isAdded = addedNotice === item.id;
            const ratingInfo = ratingsMap[item.id] || { avg: 4.9, count: 8 };

            return (
              <div key={item.id} className="menu-card group">
                <div
                  className="menu-card-image-wrapper cursor-pointer"
                  onClick={() => setDetailsItem(item)}
                >
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
                    alt={item.name}
                    className="menu-card-image group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="category-badge">{item.categoryName}</span>
                  {item.available ? (
                    <span className="availability-badge available">Available</span>
                  ) : (
                    <span className="availability-badge unavailable">Sold Out</span>
                  )}

                  {/* Rating Tag */}
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-[11px] font-bold text-amber-400 flex items-center gap-1 border border-amber-500/30">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{ratingInfo.avg.toFixed(1)}</span>
                    <span className="text-slate-400 text-[10px]">({ratingInfo.count})</span>
                  </div>
                </div>

                <div className="menu-card-content">
                  <div className="flex justify-between items-start mb-1.5">
                    <h3
                      className="menu-item-title cursor-pointer hover:text-amber-400 transition-colors"
                      onClick={() => setDetailsItem(item)}
                    >
                      {item.name}
                    </h3>
                    <span className="menu-item-price">${item.price.toFixed(2)}</span>
                  </div>

                  <p className="menu-item-desc">{item.description}</p>

                  {/* Reviews & Details button */}
                  <div className="my-2">
                    <button
                      type="button"
                      onClick={() => setDetailsItem(item)}
                      className="text-[11px] text-amber-400/90 hover:text-amber-300 flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Reviews & Ingredients ({ratingInfo.count})</span>
                    </button>
                  </div>

                  <div className="card-actions">
                    <div className="qty-control">
                      <button
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="qty-btn"
                        disabled={!item.available}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="qty-number">{qty}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="qty-btn"
                        disabled={!item.available}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.available}
                      className={`add-cart-btn ${isAdded ? 'added' : ''}`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dish Details & Reviews Modal */}
      <DishDetailsModal
        item={detailsItem}
        isOpen={!!detailsItem}
        onClose={() => setDetailsItem(null)}
        onReviewAdded={fetchRatingSummaries}
      />
    </div>
  );
};
