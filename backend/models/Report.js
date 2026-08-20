const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter is required'],
    },
    targetType: {
      type: String,
      required: [true, 'Target type is required'],
      enum: {
        values: ['meal', 'user', 'message'],
        message: 'Target type must be meal, user, or message',
      },
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Target ID is required'],
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      enum: {
        values: [
          'fake_meal',
          'expired_food',
          'wrong_location',
          'inappropriate',
          'suspicious',
          'abuse',
          'other',
        ],
        message: 'Reason {VALUE} is not valid',
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['open', 'investigating', 'resolved', 'dismissed'],
        message: 'Status {VALUE} is not valid',
      },
      default: 'open',
    },
    adminNotes: {
      type: String,
      trim: true,
    },
    resolvedAt: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

reportSchema.index({ targetType: 1, targetId: 1 });
reportSchema.index({ status: 1 });

module.exports = mongoose.model('Report', reportSchema);
