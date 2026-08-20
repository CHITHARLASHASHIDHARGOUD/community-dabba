const { z } = require('zod');

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please provide a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s-]{7,15}$/, 'Please provide a valid phone number')
    .optional()
    .or(z.literal('')),
  role: z
    .enum(['donor', 'receiver'], {
      errorMap: () => ({ message: 'Role must be donor or receiver' }),
    }),
  location: z
    .object({
      type: z.literal('Point').optional().default('Point'),
      coordinates: z.array(z.number()).length(2, 'Coordinates must be [longitude, latitude]').optional(),
      address: z.string().trim().optional(),
    })
    .optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please provide a valid email'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name cannot be empty')
    .max(100, 'Name cannot exceed 100 characters')
    .optional(),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s-]{7,15}$/, 'Please provide a valid phone number')
    .optional()
    .or(z.literal('')),
  location: z
    .object({
      type: z.literal('Point').optional().default('Point'),
      coordinates: z.array(z.number()).length(2, 'Coordinates must be [longitude, latitude]').optional(),
      address: z.string().trim().optional(),
    })
    .optional(),
});

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
  registerSchema,
  loginSchema,
  updateProfileSchema,
  validate,
};
