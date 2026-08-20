const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
      minlength: [6, 'Password must be at least 6 characters'],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s-]{7,15}$/, 'Please provide a valid phone number'],
    },
    role: {
      type: String,
      enum: {
        values: ['donor', 'receiver', 'admin'],
        message: 'Role must be donor, receiver, or admin',
      },
    },
    avatar: {
      type: String,
      default: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"%3E%3Crect width="128" height="128" rx="64" fill="%2322c55e"/%3E%3Ctext x="64" y="64" dy=".35em" font-family="Arial,sans-serif" font-size="48" font-weight="600" fill="white" text-anchor="middle"%3EU%3C/text%3E%3C/svg%3E',
    },
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
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
    },
    totalRatings: {
      type: Number,
      default: 0,
      min: [0, 'Total ratings cannot be negative'],
    },
    mealsDonated: {
      type: Number,
      default: 0,
      min: [0, 'Meals donated cannot be negative'],
    },
    mealsReceived: {
      type: Number,
      default: 0,
      min: [0, 'Meals received cannot be negative'],
    },
    badges: [
      {
        name: { type: String, required: true },
        earnedAt: { type: Date, default: Date.now },
      },
    ],
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ location: '2dsphere' });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    avatar: this.avatar,
    location: this.location,
    isVerified: this.isVerified,
    isActive: this.isActive,
    rating: this.rating,
    totalRatings: this.totalRatings,
    mealsDonated: this.mealsDonated,
    mealsReceived: this.mealsReceived,
    badges: this.badges,
    organization: this.organization,
    lastActive: this.lastActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('User', userSchema);
