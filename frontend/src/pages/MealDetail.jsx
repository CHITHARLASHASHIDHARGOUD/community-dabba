import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Heart,
  Share2,
  Flag,
  Clock,
  Users,
  MapPin,
  Phone,
  Calendar,
  Leaf,
  Drumstick,
  ShieldCheck,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  AlertTriangle,
  UtensilsCrossed,
  Loader2,
} from 'lucide-react';
import { getMealById } from '../api/meals';
import { toggleFavorite, checkFavorite } from '../api/favorites';
import { createRequest } from '../api/requests';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { RatingDisplay } from '../components/RatingStars';
import StatusBadge from '../components/StatusBadge';
import { REPORT_REASONS } from '../constants';
import { formatDate, calculateExpiry, formatRelativeTime } from '../utils/helpers';

function ImageGallery({ images = [] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  const normalizedImages = images.map(img => typeof img === 'string' ? img : img?.url || '').filter(Boolean);
  const allImages =
    normalizedImages.length > 0
      ? normalizedImages
      : [`https://ui-avatars.com/api/?name=Meal&background=f97316&color=fff&size=800`];

  const handlePrev = (e) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="space-y-3">
        <div
          onClick={() => setShowLightbox(true)}
          className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer group"
        >
          <img
            src={allImages[selectedIndex]}
            alt="Meal"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {allImages.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-gray-900"
              >
                <ChevronLeft className="w-5 h-5 text-gray-900 dark:text-white" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-gray-900"
              >
                <ChevronRight className="w-5 h-5 text-gray-900 dark:text-white" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                {selectedIndex + 1} / {allImages.length}
              </div>
            </>
          )}
        </div>

        {allImages.length > 1 && (
          <div className="flex space-x-2 overflow-x-auto pb-1">
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                  i === selectedIndex
                    ? 'border-green-500 ring-2 ring-green-500/20'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setShowLightbox(false)}
          >
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex((prev) =>
                      prev === 0 ? allImages.length - 1 : prev - 1
                    );
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex((prev) =>
                      prev === allImages.length - 1 ? 0 : prev + 1
                    );
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <motion.img
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={allImages[selectedIndex]}
              alt="Meal"
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function DonorCard({ donor }) {
  if (!donor) return null;

  return (
    <Link
      to={`/profile/${donor._id || donor.id}`}
      className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl hover:shadow-md transition-all group"
    >
      <img
        src={
          donor.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            donor.name || 'D'
          )}&background=22c55e&color=fff&size=128`
        }
        alt={donor.name}
        className="w-14 h-14 rounded-full object-cover ring-2 ring-green-500/20"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h4 className="font-semibold text-gray-900 dark:text-white truncate">
            {donor.name || 'Anonymous Donor'}
          </h4>
          {donor.isVerified && (
            <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
          )}
        </div>
        {donor.rating > 0 && (
          <div className="mt-1">
            <RatingDisplay rating={donor.rating} count={donor.ratingCount || 0} size="sm" />
          </div>
        )}
      </div>
      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-green-500 transition-colors" />
    </Link>
  );
}

function RequestModal({ isOpen, onClose, onSubmit, isSubmitting }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(message);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Request this meal</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message to donor (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Hi, I'd love to pick up this meal. When is a good time?"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MessageSquare className="w-4 h-4" />
                  )}
                  <span>{isSubmitting ? 'Sending...' : 'Send Request'}</span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ReportModal({ isOpen, onClose, onSubmit, isSubmitting }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason) return;
    onSubmit({ type: 'meal_report', reason, description, targetType: 'meal' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Report meal</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for reporting
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm appearance-none cursor-pointer"
                >
                  <option value="">Select a reason...</option>
                  {REPORT_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional details (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Provide any additional context..."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isSubmitting || !reason}
                  className="px-6 py-2.5 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Flag className="w-4 h-4" />
                  )}
                  <span>{isSubmitting ? 'Reporting...' : 'Submit Report'}</span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-24 mb-8" />

      <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
        <div className="lg:col-span-3 space-y-6">
          <div className="aspect-[16/10] bg-gray-200 dark:bg-gray-700 rounded-2xl" />
          <div className="flex space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            ))}
          </div>
          <div className="space-y-3 pt-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-5/6" />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-32" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-24" />
              </div>
            </div>
            <div className="space-y-3 pt-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-full" />
              ))}
            </div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function NotFoundState() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[60vh] flex items-center justify-center"
    >
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 flex items-center justify-center">
          <UtensilsCrossed className="w-16 h-16 text-orange-400 dark:text-orange-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Meal not found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
          This meal may have been claimed, removed, or the link might be incorrect.
        </p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/explore')}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Meals</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function MealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const {
    data: meal,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['meal', id],
    queryFn: async () => {
      const { data } = await getMealById(id);
      return data?.data?.meal || data?.meal || data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    checkFavorite(id)
      .then(({ data }) => setIsSaved(data.favorited || false))
      .catch(() => {});
  }, [id, isAuthenticated]);

  const favoriteMutation = useMutation({
    mutationFn: () => toggleFavorite(id),
    onSuccess: (data) => {
      setIsSaved(data.favorited);
      queryClient.invalidateQueries(['meal', id]);
      toast.success(data.favorited ? 'Added to favorites' : 'Removed from favorites');
    },
    onError: () => toast.error('Failed to update favorite'),
  });

  const requestMutation = useMutation({
    mutationFn: (message) => createRequest({ mealId: id, message }),
    onSuccess: () => {
      setShowRequestModal(false);
      queryClient.invalidateQueries(['meal', id]);
      toast.success('Request sent successfully!');
      navigate('/requests');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to send request');
    },
  });

  const reportMutation = useMutation({
    mutationFn: (data) => axios.post('/reports', { targetType: 'meal', targetId: id, reason: data.reason, description: data.description }),
    onSuccess: () => {
      setShowReportModal(false);
      toast.success('Report submitted. Thank you for helping keep our community safe.');
    },
    onError: () => toast.error('Failed to submit report'),
  });

  if (isLoading) return <DetailSkeleton />;

  if (isError || !meal) return <NotFoundState />;

  const isOwner = user && (user._id === (meal.donor?._id || meal.donor?.id) || user.id === (meal.donor?._id || meal.donor?.id));
  const isReceiver = user && (user.role === 'receiver' || user.role === 'user');
  const canRequest = isAuthenticated && isReceiver && !isOwner && (meal.status === 'active' || meal.status === 'expiring_soon');
  const expiryText = calculateExpiry(meal.availableUntil || meal.expiryTime);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: meal.title, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-950"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -4 }}
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </motion.button>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3"
          >
            <ImageGallery images={meal.images || (meal.image ? [meal.image] : [])} />

            <div className="mt-8 space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {meal.category && (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full capitalize">
                      {meal.category.replace(/_/g, ' ')}
                    </span>
                  )}
                  {meal.foodType && (
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                        meal.foodType === 'vegetarian'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : meal.foodType === 'vegan'
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                          : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                      }`}
                    >
                      {meal.foodType === 'vegetarian' && <Leaf className="w-3 h-3 inline mr-1" />}
                      {meal.foodType === 'non-vegetarian' && <Drumstick className="w-3 h-3 inline mr-1" />}
                      {meal.foodType === 'vegan' ? 'Vegan' : meal.foodType === 'vegetarian' ? 'Vegetarian' : 'Non-Veg'}
                    </span>
                  )}
                  {meal.status && <StatusBadge status={meal.status} />}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {meal.title}
                </h1>
              </div>

              {meal.description && (
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {meal.description}
                </p>
              )}

              {(meal.dietaryInfo?.length > 0 || meal.tags?.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {(meal.dietaryInfo || meal.tags || []).map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-2"
          >
            <div className="sticky top-24 space-y-5">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/50 shadow-sm">
                <DonorCard donor={meal.donor} />

                <div className="mt-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-center">
                      <Users className="w-5 h-5 mx-auto mb-1.5 text-green-500" />
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {meal.servings || meal.quantity || 1}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Servings</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-center">
                      <Clock className="w-5 h-5 mx-auto mb-1.5 text-orange-500" />
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {expiryText}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Expires</p>
                    </div>
                  </div>

                  {meal.preparedAt && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Prepared {formatRelativeTime(meal.preparedAt)}
                      </span>
                    </div>
                  )}

                  {meal.availableUntil && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Available until {formatDate(meal.availableUntil)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {meal.pickupLocation && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/50 shadow-sm">
                  <div className="flex items-center space-x-2 mb-3">
                    <MapPin className="w-4 h-4 text-green-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Pickup Location</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {typeof meal.pickupLocation === 'string'
                      ? meal.pickupLocation
                      : meal.pickupLocation.address || `${meal.pickupLocation.city || ''} ${meal.pickupLocation.area || ''}`.trim() || 'Contact donor for details'}
                  </p>
                </div>
              )}

              {meal.pickupInstructions && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/50 shadow-sm">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Pickup Instructions</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                    {meal.pickupInstructions}
                  </p>
                </div>
              )}

              {meal.contactPreference && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/50 shadow-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <Phone className="w-4 h-4 text-green-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Contact Preference</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                    {meal.contactPreference}
                  </p>
                </div>
              )}

              {canRequest && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowRequestModal(true)}
                  className="w-full py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30"
                >
                  Request Meal
                </motion.button>
              )}

              {isOwner && (
                <div className="py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  This is your meal listing
                </div>
              )}

              <div className="flex items-center space-x-2">
                {isAuthenticated && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => favoriteMutation.mutate()}
                    disabled={favoriteMutation.isLoading}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                      isSaved
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-red-300 dark:hover:border-red-700 hover:text-red-500'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${isSaved ? 'fill-red-500 text-red-500' : ''}`}
                    />
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                  </motion.button>
                )}

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-green-300 dark:hover:border-green-700 hover:text-green-500 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </motion.button>

                {isAuthenticated && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowReportModal(true)}
                    className="py-2.5 px-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 hover:text-red-500 hover:border-red-300 dark:hover:border-red-700 transition-all"
                  >
                    <Flag className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <RequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSubmit={(message) => requestMutation.mutate(message)}
        isSubmitting={requestMutation.isLoading}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={(data) => reportMutation.mutate(data)}
        isSubmitting={reportMutation.isLoading}
      />
    </motion.div>
  );
}
