import React from 'react';
import { X, Printer, Utensils, CheckCircle } from 'lucide-react';
import type { OrderDto } from '../types';

interface OrderReceiptModalProps {
  order: OrderDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderReceiptModal: React.FC<OrderReceiptModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = new Date(order.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const subtotal = order.totalAmount;
  const tax = Number((subtotal * 0.08).toFixed(2));
  const grandTotal = Number((subtotal + tax).toFixed(2));

  return (
    <div className="receipt-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="receipt-modal-wrapper">
        {/* Action bar for non-print view */}
        <div className="receipt-actions-bar">
          <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
            <Printer className="w-4 h-4" />
            <span>Print Official Receipt</span>
          </button>
          <button onClick={onClose} className="drawer-close-btn ml-2" title="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Paper */}
        <div className="printable-receipt" id="printable-receipt-card">
          <div className="receipt-header text-center">
            <div className="receipt-logo flex items-center justify-center gap-2 mb-1">
              <Utensils className="w-6 h-6 text-amber-500" />
              <span className="font-extrabold text-xl tracking-wider text-slate-900">GOURMET HAVEN</span>
            </div>
            <p className="text-xs text-slate-500">Fine Dining & Artisanal Kitchen</p>
            <p className="text-xs text-slate-500">124 Grand Avenue, Suite 10, Downtown</p>
            <p className="text-xs text-slate-500">Tel: +1 (555) 019-2834 • VAT: US-928374-GH</p>
          </div>

          <div className="receipt-divider my-3"></div>

          <div className="receipt-meta text-xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span className="font-medium text-slate-500">Order Ref:</span>
              <span className="font-bold text-slate-900">#{order.id.toString().padStart(5, '0')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date & Time:</span>
              <span>{formattedDate} {formattedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-semibold text-slate-800">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Service Mode:</span>
              <span className="font-bold uppercase tracking-wider text-amber-700">
                {order.orderType === 'DINE_IN' ? `Dine-In (${order.tableNumber || 'Table Auto'})` : order.orderType}
              </span>
            </div>
            {order.customerPhone && (
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span>{order.customerPhone}</span>
              </div>
            )}
            {order.deliveryAddress && (
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery Address:</span>
                <span className="text-right max-w-[200px]">{order.deliveryAddress}</span>
              </div>
            )}
            {order.specialNotes && (
              <div className="flex justify-between bg-amber-50 p-1.5 rounded text-amber-900 mt-1">
                <span className="font-semibold">Notes:</span>
                <span>{order.specialNotes}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-1">
              <span className="text-slate-500">Order Status:</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                <CheckCircle className="w-3 h-3" />
                {order.status}
              </span>
            </div>
          </div>

          <div className="receipt-divider my-3"></div>

          {/* Itemized Table */}
          <table className="w-full text-xs receipt-items-table">
            <thead>
              <tr className="border-b border-slate-300 text-slate-500">
                <th className="text-left pb-1 font-semibold">Item</th>
                <th className="text-center pb-1 font-semibold w-10">Qty</th>
                <th className="text-right pb-1 font-semibold w-16">Price</th>
                <th className="text-right pb-1 font-semibold w-16">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {order.items.map((item) => (
                <tr key={item.id} className="py-1">
                  <td className="py-1.5 font-medium">{item.menuItemName}</td>
                  <td className="py-1.5 text-center text-slate-600">{item.quantity}</td>
                  <td className="py-1.5 text-right text-slate-600">${item.unitPrice.toFixed(2)}</td>
                  <td className="py-1.5 text-right font-semibold">${item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="receipt-divider my-3"></div>

          {/* Totals */}
          <div className="text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>State & Local Tax (8%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Payment Method:</span>
              <span className="font-semibold text-slate-900">Cash / Pay at Counter</span>
            </div>
            <div className="receipt-divider my-2"></div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1">
              <span>Total Amount:</span>
              <span className="text-amber-600">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="receipt-footer text-center mt-6 text-[11px] text-slate-500 space-y-1">
            <p className="font-medium text-slate-700">Thank you for dining with Gourmet Haven!</p>
            <p>Please present this receipt when settling your bill at the counter or to your server.</p>
            <p className="pt-2 text-[10px] text-slate-400">Powered by Gourmet Haven Restaurant OS</p>
          </div>
        </div>
      </div>
    </div>
  );
};
