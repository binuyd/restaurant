import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, CheckCircle2, XCircle, Search } from 'lucide-react';
import { MenuItem, Category } from '../types';
import { api } from '../api/client';

export const AdminMenuPage: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form fields
  const [categoryId, setCategoryId] = useState<number>(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [available, setAvailable] = useState(true);
  const [formError, setFormError] = useState('');

  const fetchMenuAndCategories = async () => {
    setLoading(true);
    try {
      const [menuRes, catRes] = await Promise.all([
        api.get<MenuItem[]>('/menu', { params: { availableOnly: false } }),
        api.get<Category[]>('/menu/categories'),
      ]);
      setItems(menuRes.data);
      setCategories(catRes.data);
      if (catRes.data.length > 0) setCategoryId(catRes.data[0].id);
    } catch (err) {
      console.error('Failed to fetch admin menu', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuAndCategories();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setName('');
    setDescription('');
    setPrice('');
    setImageUrl('');
    setAvailable(true);
    if (categories.length > 0) setCategoryId(categories[0].id);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setCategoryId(item.categoryId);
    setName(item.name);
    setDescription(item.description || '');
    setPrice(item.price.toString());
    setImageUrl(item.imageUrl || '');
    setAvailable(item.available);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const payload = {
      categoryId: Number(categoryId),
      name,
      description,
      price: parseFloat(price),
      imageUrl,
      available,
    };

    try {
      if (editingItem) {
        await api.put(`/admin/menu-items/${editingItem.id}`, payload);
      } else {
        await api.post('/admin/menu-items', payload);
      }
      setIsModalOpen(false);
      fetchMenuAndCategories();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save menu item');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await api.delete(`/admin/menu-items/${id}`);
      fetchMenuAndCategories();
    } catch (err: any) {
      alert('Failed to delete item.');
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      await api.put(`/admin/menu-items/${item.id}`, { available: !item.available });
      fetchMenuAndCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Menu Management</h1>
          <p className="text-sm text-slate-400 mt-1">
            Create, update, toggle availability, or delete items from the restaurant menu.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Add New Menu Item</span>
        </button>
      </div>

      {/* Filter search */}
      <div className="mb-6 max-w-md">
        <div className="search-box">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Search menu items by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80'}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <div className="font-semibold text-slate-200 text-sm">{item.name}</div>
                        <div className="text-xs text-slate-400 truncate max-w-xs">{item.description}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="category-pill">{item.categoryName}</span>
                  </td>
                  <td className="font-bold text-amber-400">${item.price.toFixed(2)}</td>
                  <td>
                    <button
                      onClick={() => toggleAvailability(item)}
                      className={`toggle-avail-btn ${item.available ? 'active' : ''}`}
                    >
                      {item.available ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Available</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>Unavailable</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800"
                        title="Edit Item"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2 className="text-xl font-bold text-slate-100 mb-4">
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h2>

            {formError && (
              <div className="error-banner mb-4">
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="input-label">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  className="input-field"
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="input-label">Item Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Wagyu Truffle Burger"
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ingredients and preparation details..."
                  className="input-field h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="19.99"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="input-label">Availability</label>
                  <select
                    value={available ? 'true' : 'false'}
                    onChange={(e) => setAvailable(e.target.value === 'true')}
                    className="input-field"
                  >
                    <option value="true">Available</option>
                    <option value="false">Unavailable / Sold Out</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="input-label">Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="input-field"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
