const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Donor is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Meal title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'meals',
          'rice',
          'biryani',
          'bakery',
          'fruits',
          'vegetables',
          'snacks',
          'dairy',
          'packed_food',
          'other',
        ],
        message: 'Category {VALUE} is not valid',
      },
    },
    quantity: {
      type: String,
      trim: true,
    },
    servings: {
      type: Number,
      required: [true, 'Servings is required'],
      min: [1, 'Servings must be at least 1'],
    },
    foodType: {
      type: String,
      required: [true, 'Food type is required'],
      enum: {
        values: ['vegetarian', 'non-vegetarian', 'vegan'],
        message: 'Food type must be vegetarian, non-vegetarian, or vegan',
      },
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
      address: {
        type: String,
        trim: true,
      },
    },
    pickupInstructions: {
      type: String,
      trim: true,
      maxlength: [500, 'Pickup instructions cannot exceed 500 characters'],
    },
    contactPreference: {
      type: String,
      enum: {
        values: ['chat', 'phone', 'both'],
        message: 'Contact preference must be chat, phone, or both',
      },
    },
    dietaryInfo: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: {
        values: ['active', 'expiring_soon', 'expired', 'completed', 'cancelled'],
        message: 'Status {VALUE} is not valid',
      },
      default: 'active',
      index: true,
    },
    availableUntil: {
      type: Date,
      required: [true, 'Available until date is required'],
    },
    preparedAt: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
);

mealSchema.index({ location: '2dsphere' });
mealSchema.index({ status: 1, category: 1 });
mealSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Meal', mealSchema);
