const { z } = require('zod');

const createMealSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .trim()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional(),
  category: z.enum(
    ['meals', 'rice', 'biryani', 'bakery', 'fruits', 'vegetables', 'snacks', 'dairy', 'packed_food', 'other'],
    { errorMap: () => ({ message: 'Invalid category' }) }
  ),
  quantity: z.string().trim().optional(),
  servings: z.number().int().min(1, 'Servings must be at least 1'),
  foodType: z.enum(['vegetarian', 'non-vegetarian', 'vegan'], {
    errorMap: () => ({ message: 'Food type must be vegetarian, non-vegetarian, or vegan' }),
  }),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        publicId: z.string().min(1),
      })
    )
    .optional(),
  location: z.object({
    type: z.literal('Point').optional().default('Point'),
    coordinates: z
      .array(z.number())
      .length(2, 'Coordinates must be [longitude, latitude]')
      .optional()
      .default([0, 0]),
    address: z.string().trim().min(1, 'Location address is required'),
  }),
  pickupInstructions: z
    .string()
    .trim()
    .max(500, 'Pickup instructions cannot exceed 500 characters')
    .optional(),
  contactPreference: z.enum(['chat', 'phone', 'both'], {
    errorMap: () => ({ message: 'Contact preference must be chat, phone, or both' }),
  }),
  dietaryInfo: z.array(z.string().trim()).optional(),
  availableUntil: z.coerce.date().refine((date) => date > new Date(), {
    message: 'Available until date must be in the future',
  }),
  preparedAt: z.coerce.date().optional(),
});

const updateMealSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title cannot exceed 200 characters')
    .optional(),
  description: z
    .string()
    .trim()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional(),
  category: z
    .enum(
      ['meals', 'rice', 'biryani', 'bakery', 'fruits', 'vegetables', 'snacks', 'dairy', 'packed_food', 'other'],
      { errorMap: () => ({ message: 'Invalid category' }) }
    )
    .optional(),
  quantity: z.string().trim().optional(),
  servings: z.number().int().min(1, 'Servings must be at least 1').optional(),
  foodType: z
    .enum(['vegetarian', 'non-vegetarian', 'vegan'], {
      errorMap: () => ({ message: 'Food type must be vegetarian, non-vegetarian, or vegan' }),
    })
    .optional(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        publicId: z.string().min(1),
      })
    )
    .optional(),
  location: z
    .object({
      type: z.literal('Point').optional().default('Point'),
      coordinates: z
        .array(z.number())
        .length(2, 'Coordinates must be [longitude, latitude]')
        .optional()
        .default([0, 0]),
      address: z.string().trim().optional(),
    })
    .optional(),
  pickupInstructions: z
    .string()
    .trim()
    .max(500, 'Pickup instructions cannot exceed 500 characters')
    .optional(),
  contactPreference: z
    .enum(['chat', 'phone', 'both'], {
      errorMap: () => ({ message: 'Contact preference must be chat, phone, or both' }),
    })
    .optional(),
  dietaryInfo: z.array(z.string().trim()).optional(),
  availableUntil: z.coerce.date().optional(),
  preparedAt: z.coerce.date().optional(),
});

const parseFormData = (req, _res, next) => {
  if (!req.body) return next();
  const b = req.body;
  if (b.servings !== undefined && typeof b.servings === 'string') {
    b.servings = parseInt(b.servings, 10);
  }
  if (b.location !== undefined && typeof b.location === 'string') {
    try {
      const parsed = JSON.parse(b.location);
      b.location = {
        type: parsed.type || 'Point',
        coordinates: parsed.coordinates || [0, 0],
        address: parsed.address || '',
      };
    } catch {
      b.location = { type: 'Point', coordinates: [0, 0], address: '' };
    }
  }
  if (b.dietaryInfo !== undefined && typeof b.dietaryInfo === 'string') {
    try { b.dietaryInfo = JSON.parse(b.dietaryInfo); } catch {}
  }
  next();
};

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const message = result.error.errors.map((e) => e.message).join('. ');
    return res.status(400).json({ success: false, message });
  }
  req.body = result.data;
  next();
};

module.exports = {
  createMealSchema,
  updateMealSchema,
  validate,
  parseFormData,
};
