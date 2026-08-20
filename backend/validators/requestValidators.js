const { z } = require('zod');

const createRequestSchema = z.object({
  mealId: z.string().min(1, 'Meal ID is required'),
  message: z
    .string()
    .trim()
    .max(500, 'Message cannot exceed 500 characters')
    .optional(),
});

const updateRequestStatusSchema = z.object({
  status: z.enum(
    ['approved', 'rejected', 'pickup_scheduled', 'ready_for_pickup', 'collected', 'completed'],
    { errorMap: () => ({ message: 'Invalid status' }) }
  ),
  pickupTime: z.coerce.date().optional(),
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
  createRequestSchema,
  updateRequestStatusSchema,
  validate,
};
