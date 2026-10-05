import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, Check, Flame } from 'lucide-react';
import type { MenuItem, Category } from '../types';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';

export const MenuPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [addedNotice, setAddedNotice] = useState<number | null>(null);

  const { addToCart } = useCart();

  useEffect(() => {
    fetchCategories();
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

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const params: any = { availableOnly: true };
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      const res = await api.get<MenuItem[]>('/menu', { params });
      setMenuItems(res.data);
    } catch (err) {
      console.error('Failed to load menu items', err);
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
          <span>Artisanal Culinary Craftsmanship</span>
        </div>
        <h1 className="hero-title">Experience Exquisite Dining</h1>
        <p className="hero-subtitle">
          Handcrafted dishes prepared with fresh organic ingredients, traditional recipes, and contemporary passion.
        </p>

        {/* Search Bar */}
        <div className="search-box">
          <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search our gourmet menu items..."
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
          All Items
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
      ) : filteredItems.length === 0 ? (
        <div className="empty-state">
          <p className="text-lg text-slate-400">No dishes match your selection.</p>
        </div>
      ) : (
        <div className="menu-grid">
          {filteredItems.map((item) => {
            const qty = quantities[item.id] || 1;
            const isAdded = addedNotice === item.id;

            return (
              <div key={item.id} className="menu-card group">
                <div className="menu-card-image-wrapper">
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
                    alt={item.name}
                    className="menu-card-image"
                  />
                  <span className="category-badge">{item.categoryName}</span>
                  {item.available ? (
                    <span className="availability-badge available">Available</span>
                  ) : (
                    <span className="availability-badge unavailable">Sold Out</span>
                  )}
                </div>

                <div className="menu-card-content">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="menu-item-title">{item.name}</h3>
                    <span className="menu-item-price">${item.price.toFixed(2)}</span>
                  </div>

                  <p className="menu-item-desc">{item.description}</p>

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
    </div>
  );
};
