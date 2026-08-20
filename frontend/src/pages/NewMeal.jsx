import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Upload, Loader2, X, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { createMeal } from '../api/meals';

const mealSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  quantity: z.string().min(1, 'Quantity is required'),
  servings: z.coerce.number().min(1, 'At least 1 serving'),
  foodType: z.enum(['vegetarian', 'non-vegetarian', 'vegan'], { errorMap: () => ({ message: 'Select food type' }) }),
  preparedAt: z.string().optional(),
  availableUntil: z.string().min(1, 'Expiry time is required'),
  location: z.object({ address: z.string().min(1, 'Pickup location is required') }),
  pickupInstructions: z.string().optional(),
  contactPreference: z.enum(['chat', 'phone', 'both']).default('chat'),
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

export default function NewMeal() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(mealSchema),
    defaultValues: { contactPreference: 'chat', dietaryInfo: [], servings: 1, location: { address: '' } },
  });

  const selectedDietary = watch('dietaryInfo') || [];
  const selectedCategory = watch('category');
  const selectedFoodType = watch('foodType');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUseLocation = () => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue('location.address', `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        toast.success('Location captured');
        setLocationLoading(false);
      },
      () => { toast.error('Unable to get location'); setLocationLoading(false); }
    );
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
      await createMeal(formData);
      toast.success('Meal added successfully!');
      navigate('/donor/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create meal');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        <Link to="/donor/dashboard" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Add New Food</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Share food with your community</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Food Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
              <input {...register('title')} placeholder="e.g., Homemade Veg Biryani"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea {...register('description')} rows={3} placeholder="Describe the food..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                <select {...register('category')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none">
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity *</label>
                <input {...register('quantity')} placeholder="e.g., 5 kg"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" />
                {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Servings *</label>
                <input {...register('servings')} type="number" min={1}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" />
                {errors.servings && <p className="text-red-500 text-sm mt-1">{errors.servings.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Food Type *</label>
                <div className="flex gap-2 mt-1">
                  {[{ v: 'vegetarian', l: 'Veg', c: 'green' }, { v: 'non-vegetarian', l: 'Non-Veg', c: 'red' }, { v: 'vegan', l: 'Vegan', c: 'emerald' }].map(t => (
                    <label key={t.v} className={`flex-1 text-center py-2.5 rounded-xl border-2 cursor-pointer text-sm font-medium transition ${selectedFoodType === t.v ? `border-${t.c}-500 bg-${t.c}-50 dark:bg-${t.c}-900/20 text-${t.c}-700 dark:text-${t.c}-400` : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}>
                      <input type="radio" {...register('foodType')} value={t.v} className="sr-only" />{t.l}
                    </label>
                  ))}
                </div>
                {errors.foodType && <p className="text-red-500 text-sm mt-1">{errors.foodType.message}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Timing</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prepared At</label>
                <input {...register('preparedAt')} type="datetime-local"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Available Until *</label>
                <input {...register('availableUntil')} type="datetime-local"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" />
                {errors.availableUntil && <p className="text-red-500 text-sm mt-1">{errors.availableUntil.message}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pickup Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pickup Location *</label>
              <div className="flex gap-2">
                <input {...register('location.address')} placeholder="Address or landmark"
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" />
                <button type="button" onClick={handleUseLocation} disabled={locationLoading}
                  className="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                  <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              {errors.location?.address && <p className="text-red-500 text-sm mt-1">{errors.location.address.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pickup Instructions</label>
              <textarea {...register('pickupInstructions')} rows={2} placeholder="Ring the bell, ask for Ravi..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Preference</label>
              <div className="flex gap-3">
                {[{ v: 'chat', l: 'Chat' }, { v: 'phone', l: 'Phone' }, { v: 'both', l: 'Both' }].map(p => (
                  <label key={p.v} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" {...register('contactPreference')} value={p.v} className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{p.l}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dietary Information</h2>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map(item => (
                <button key={item} type="button" onClick={() => toggleDietary(item)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition ${selectedDietary.includes(item) ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'}`}>
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
                <button type="button" onClick={() => { setImage(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-green-500 transition">
                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Click to upload image</span>
                <span className="text-xs text-gray-400">Max 5MB</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
              </label>
            )}
          </div>

          <div className="flex gap-4">
            <Link to="/donor/dashboard" className="flex-1 py-3 text-center border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium">Cancel</Link>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add Food'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
