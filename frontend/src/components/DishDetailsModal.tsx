import React, { useState, useEffect } from 'react';
import { X, Star, MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import type { MenuItem, ReviewDto } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface DishDetailsModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onReviewAdded?: () => void;
}

export const DishDetailsModal: React.FC<DishDetailsModalProps> = ({
  item,
  isOpen,
  onClose,
  onReviewAdded,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (user?.name && !customerName) {
      setCustomerName(user.name);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && item) {
      fetchReviews();
      setReviewSuccess(false);
      setReviewError('');
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await api.get<ReviewDto[]>(`/reviews/item/${item.id}`);
      setReviews(res.data);
    } catch (err) {
      console.error('Failed to load dish reviews', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setReviewError('Please sign in to leave a dish review.');
      return;
    }
    setReviewError('');
    setSubmittingReview(true);

    try {
      await api.post(`/reviews/item/${item.id}`, {
        customerName: customerName || user?.name || 'Customer',
        rating: newRating,
        comment: newComment.trim(),
      });
      setReviewSuccess(true);
      setNewComment('');
      fetchReviews();
      if (onReviewAdded) onReviewAdded();
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err: any) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="modal-overlay">
      <div className="modal-card max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header Image */}
        <div className="relative h-64 w-full overflow-hidden bg-slate-900">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 drawer-close-btn bg-slate-950/80 backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
            <div>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider">
                {item.categoryName || 'Chef Choice'}
              </span>
              <h2 className="text-2xl font-bold text-white mt-1.5">{item.name}</h2>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-amber-400">${item.price.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Description</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{item.description}</p>
          </div>

          {/* Rating Summary Bar */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-1.5">
              <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
              <span className="text-2xl font-extrabold text-slate-100">{avgRating}</span>
              <span className="text-xs text-slate-500">/ 5.0</span>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div>
              <span className="text-sm font-semibold text-slate-200">
                {reviews.length} Verified Customer {reviews.length === 1 ? 'Review' : 'Reviews'}
              </span>
              <p className="text-xs text-slate-400">Authentic feedback from diners</p>
            </div>
          </div>

          {/* Customer Reviews List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>Customer Reviews ({reviews.length})</span>
            </h3>

            {loadingReviews ? (
              <div className="py-6 flex justify-center">
                <div className="spinner"></div>
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 italic">Be the first to leave a review for this dish!</p>
            ) : (
              <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {reviews.map((r) => (
                  <div key={r.id} className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-200">{r.customerName}</span>
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < r.rating ? 'fill-amber-400' : 'text-slate-700'}`}
                          />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-slate-300 mt-1">{r.comment}</p>}
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Review Form */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Leave Your Rating & Review</h4>
            {reviewError && (
              <div className="error-banner mb-3 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{reviewError}</span>
              </div>
            )}
            {reviewSuccess && (
              <div className="mb-3 text-xs text-emerald-400 bg-emerald-500/10 p-2 rounded border border-emerald-500/20 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Thank you! Your review has been submitted.</span>
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Your Rating:</span>
                <div className="flex gap-1 cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="text-amber-400 p-0.5 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-5 h-5 ${star <= newRating ? 'fill-amber-400' : 'text-slate-700'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={2}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share what you loved about the taste, presentation, or pairing..."
                className="input-field text-xs resize-none"
              />

              <button
                type="submit"
                disabled={submittingReview}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
              >
                <Send className="w-3 h-3" />
                <span>{submittingReview ? 'Submitting...' : 'Post Dish Review'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
