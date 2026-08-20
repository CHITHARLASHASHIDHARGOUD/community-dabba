import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Upload, Loader2, X, MapPin, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMealById, updateMeal, deleteMeal } from '../api/meals';

const mealSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  quantity: z.string().min(1, 'Quantity is required'),
  servings: z.coerce.number().min(1, 'At least 1 serving'),
  foodType: z.enum(['vegetarian', 'non-vegetarian', 'vegan']),
  preparedAt: z.string().optional(),
  availableUntil: z.string().min(1, 'Expiry time is required'),
  location: z.object({ address: z.string().min(1, 'Pickup location is required') }),
  pickupInstructions: z.string().optional(),
  contactPreference: z.enum(['chat', 'phone', 'both']),
  dietaryInfo: z.array(z.string()).optional(),
});

const CATEGORIES = [
  { value: 'meals', label: 'Meals', emoji: '🍛' },
  { value: 'rice', label: 'Rice', emoji: '🍚' },
  { value: 'biryani', label: 'Biryani', emoji: '🥘' },
  { value: 'bakery', label: 'Bakery', emoji: '🍞' },
  { value: 'fruits', label: 'Fruits', emoji: '🍎' },
  { value: 'vegetables', label: 'Vegetables', emoji: '🥬' },
  { value: 'snacks', label: 'Snacks', emoji: '🍿' },
  { value: 'dairy', label: 'Dairy', emoji: '🥛' },
  { value: 'packed_food', label: 'Packed Food', emoji: '📦' },
  { value: 'other', label: 'Other', emoji: '🍽️' },
];

const DIETARY_OPTIONS = ['Gluten-Free', 'Nut-Free', 'Dairy-Free', 'Vegan', 'Organic', 'Homemade'];

export default function EditMeal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(mealSchema),
  });

  const selectedDietary = watch('dietaryInfo') || [];
  const selectedCategory = watch('category');
  const selectedFoodType = watch('foodType');

  useEffect(() => {
    const fetchMeal = async () => {
      try {
        const { data } = await getMealById(id);
        const meal = data?.data?.meal || data?.data || data;
        reset({
          title: meal.title,
          description: meal.description || '',
          category: meal.category,
          quantity: meal.quantity,
          servings: meal.servings,
          foodType: meal.foodType,
          preparedAt: meal.preparedAt ? new Date(meal.preparedAt).toISOString().slice(0, 16) : '',
          availableUntil: meal.availableUntil ? new Date(meal.availableUntil).toISOString().slice(0, 16) : '',
          location: { address: meal.location?.address || '' },
          pickupInstructions: meal.pickupInstructions || '',
          contactPreference: meal.contactPreference || 'chat',
          dietaryInfo: meal.dietaryInfo || [],
        });
        if (meal.images?.length > 0) {
          const img = meal.images[0];
          setExistingImage(typeof img === 'string' ? img : img.url);
        }
      } catch {
        toast.error('Meal not found');
        navigate('/donor/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchMeal();
  }, [id, reset, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setExistingImage(null);
    }
  };

  const toggleDietary = (item) => {
    const current = selectedDietary;
    setValue('dietaryInfo', current.includes(item) ? current.filter(d => d !== item) : [...current, item]);
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, val]) => {
        if (key === 'location') formData.append('location', JSON.stringify(val));
        else if (key === 'dietaryInfo') formData.append('dietaryInfo', JSON.stringify(val || []));
        else if (val !== undefined && val !== '') formData.append(key, val);
      });
      if (image) formData.append('image', image);
      await updateMeal(id, formData);
      toast.success('Meal updated successfully!');
      navigate('/donor/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update meal');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMeal(id);
      toast.success('Meal deleted');
      navigate('/donor/dashboard');
    } catch {
      toast.error('Failed to delete meal');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-green-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        <Link to="/donor/dashboard" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Food</h1>
            <p className="text-gray-500 dark:text-gray-400">Update your food listing</p>
          </div>
          <button onClick={() => setShowDelete(true)} className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition flex items-center gap-2 text-sm font-medium">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>

        {showDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete this meal?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDelete(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">Cancel</button>
                <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition">Delete</button>
              </div>
            </motion.div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Food Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
              <input {...register('title')} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea {...register('description')} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none resize-none" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                <select {...register('category')} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none">
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity *</label>
                <input {...register('quantity')} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Servings *</label>
                <input {...register('servings')} type="number" min={1} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Food Type *</label>
                <div className="flex gap-2 mt-1">
                  {[{ v: 'vegetarian', l: 'Veg' }, { v: 'non-vegetarian', l: 'Non-Veg' }, { v: 'vegan', l: 'Vegan' }].map(t => (
                    <label key={t.v} className={`flex-1 text-center py-2.5 rounded-xl border-2 cursor-pointer text-sm font-medium transition ${selectedFoodType === t.v ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}>
                      <input type="radio" {...register('foodType')} value={t.v} className="sr-only" />{t.l}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Timing</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prepared At</label>
                <input {...register('preparedAt')} type="datetime-local" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Available Until *</label>
                <input {...register('availableUntil')} type="datetime-local" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pickup Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pickup Location *</label>
              <input {...register('location.address')} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pickup Instructions</label>
              <textarea {...register('pickupInstructions')} rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none resize-none" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dietary Info</h2>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map(item => (
                <button key={item} type="button" onClick={() => toggleDietary(item)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition ${selectedDietary.includes(item) ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}>
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Food Image</h2>
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                <button type="button" onClick={() => { setImage(null); setImagePreview(null); }} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full"><X className="w-4 h-4" /></button>
              </div>
            ) : existingImage ? (
              <div className="relative">
                <img src={existingImage} alt="Current" className="w-full h-48 object-cover rounded-xl" />
                <button type="button" onClick={() => setExistingImage(null)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-green-500 transition">
                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Click to upload</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
              </label>
            )}
          </div>

          <div className="flex gap-4">
            <Link to="/donor/dashboard" className="flex-1 py-3 text-center border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium">Cancel</Link>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
