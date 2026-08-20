const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    meal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meal',
      required: [true, 'Meal is required'],
      index: true,
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester is required'],
      index: true,
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Donor is required'],
    },
    status: {
      type: String,
      enum: {
        values: [
          'pending',
          'approved',
          'rejected',
          'pickup_scheduled',
          'ready_for_pickup',
          'collected',
          'completed',
          'cancelled',
        ],
        message: 'Status {VALUE} is not valid',
      },
      default: 'pending',
      index: true,
    },
    pickupCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    pickupTime: {
      type: Date,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

requestSchema.index({ requester: 1, status: 1 });
requestSchema.index({ donor: 1, status: 1 });

module.exports = mongoose.model('Request', requestSchema);
