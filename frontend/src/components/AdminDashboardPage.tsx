import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, TrendingUp, Trophy, PieChart as PieIcon, BarChart2 } from 'lucide-react';
import { DashboardSummaryDto } from '../types';
import { api } from '../api/client';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get<DashboardSummaryDto>('/admin/dashboard/summary');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!data) return null;

  // Prepare chart data
  const statusChartData = Object.entries(data.ordersByStatus).map(([status, count]) => ({
    name: status,
    count,
  }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#eab308', '#10b981', '#06b6d4', '#f43f5e'];

  const topItemsChartData = data.topSellingItems.map((item) => ({
    name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
    quantity: item.totalQuantity,
    sales: item.totalSales,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">Sales & Revenue Analytics</h1>
        <p className="text-sm text-slate-400 mt-1">
          Server-side SQL aggregation metrics for order volume, status breakdown, and top sellers.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="metric-card">
          <div className="flex justify-between items-center mb-2">
            <span className="metric-label">Today's Revenue</span>
            <div className="metric-icon-bg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="metric-value">${data.todayRevenue.toFixed(2)}</div>
          <span className="metric-sub">Calculated via SQL aggregate</span>
        </div>

        <div className="metric-card">
          <div className="flex justify-between items-center mb-2">
            <span className="metric-label">Today's Orders</span>
            <div className="metric-icon-bg bg-blue-500/10 text-blue-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="metric-value">{data.todayOrderCount}</div>
          <span className="metric-sub">Orders placed today</span>
        </div>

        <div className="metric-card">
          <div className="flex justify-between items-center mb-2">
            <span className="metric-label">7-Day Revenue</span>
            <div className="metric-icon-bg bg-amber-500/10 text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="metric-value">${data.last7DaysRevenue.toFixed(2)}</div>
          <span className="metric-sub">Past 7 days total</span>
        </div>

        <div className="metric-card">
          <div className="flex justify-between items-center mb-2">
            <span className="metric-label">7-Day Orders</span>
            <div className="metric-icon-bg bg-purple-500/10 text-purple-400">
              <BarChart2 className="w-5 h-5" />
            </div>
          </div>
          <div className="metric-value">{data.last7DaysOrderCount}</div>
          <span className="metric-sub">Past 7 days order count</span>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Orders by Status Chart */}
        <div className="chart-card">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-slate-200">Orders by Status</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Quantity Bar Chart */}
        <div className="chart-card">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-slate-200">Top 5 Selling Items (Volume)</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topItemsChartData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                />
                <Bar dataKey="quantity" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top 5 Leaderboard Table */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-slate-200">Top Performing Dishes</h3>
        </div>

        {data.topSellingItems.length === 0 ? (
          <p className="text-sm text-slate-400">No completed sales yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Dish Name</th>
                <th>Units Sold</th>
                <th>Total Revenue Generated</th>
              </tr>
            </thead>
            <tbody>
              {data.topSellingItems.map((item, index) => (
                <tr key={item.menuItemId}>
                  <td className="font-bold text-amber-400">#{index + 1}</td>
                  <td className="font-semibold text-slate-200">{item.name}</td>
                  <td>{item.totalQuantity} units</td>
                  <td className="font-bold text-emerald-400">${item.totalSales.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
