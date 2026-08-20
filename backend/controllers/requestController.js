const Request = require('../models/Request');
const Meal = require('../models/Meal');
const Notification = require('../models/Notification');

const VALID_TRANSITIONS = {
  pending: ['approved', 'rejected', 'cancelled'],
  approved: ['pickup_scheduled', 'ready_for_pickup', 'collected', 'completed', 'rejected', 'cancelled'],
  pickup_scheduled: ['ready_for_pickup', 'collected', 'completed', 'cancelled'],
  ready_for_pickup: ['collected', 'completed'],
  collected: ['completed'],
  completed: [],
  rejected: [],
  cancelled: [],
};

exports.createRequest = async (req, res, next) => {
  try {
    const { mealId, message } = req.body;

    const meal = await Meal.findById(mealId);
    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }

    if (meal.status !== 'active' && meal.status !== 'expiring_soon') {
      return res.status(400).json({ success: false, message: 'Meal is no longer available' });
    }

    if (new Date(meal.availableUntil) < new Date()) {
      return res.status(400).json({ success: false, message: 'Meal has expired' });
    }

    if (meal.donor.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot request your own meal' });
    }

    const existingRequest = await Request.findOne({
      meal: mealId,
      requester: req.user.id,
      status: { $in: ['pending', 'approved', 'pickup_scheduled', 'ready_for_pickup'] },
    });
    if (existingRequest) {
      return res.status(409).json({ success: false, message: 'You already have an active request for this meal' });
    }

    const request = await Request.create({
      meal: mealId,
      requester: req.user.id,
      donor: meal.donor,
      message,
      statusHistory: [{ status: 'pending', note: 'Request created' }],
    });

    await Notification.create({
      recipient: meal.donor,
      sender: req.user.id,
      type: 'new_request',
      title: 'New Meal Request',
      message: `Someone has requested your meal "${meal.title}"`,
      data: { requestId: request._id, mealId: meal._id },
    });

    const populatedRequest = await request.populate([
      { path: 'meal', select: 'title images category' },
      { path: 'requester', select: 'name avatar' },
    ]);

    res.status(201).json({
      success: true,
      data: { request: populatedRequest },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyRequests = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = { requester: req.user.id };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [requests, total] = await Promise.all([
      Request.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('meal', 'title images category status availableUntil')
        .populate('donor', 'name avatar'),
      Request.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        requests,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getReceivedRequests = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = { donor: req.user.id };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [requests, total] = await Promise.all([
      Request.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('meal', 'title images category status')
        .populate('requester', 'name avatar phone'),
      Request.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        requests,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateRequestStatus = async (req, res, next) => {
  try {
    const { status, pickupTime } = req.body;

    const request = await Request.findById(req.params.id).populate('meal', 'title');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.donor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this request' });
    }

    const allowed = VALID_TRANSITIONS[request.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from "${request.status}" to "${status}"`,
      });
    }

    request.status = status;

    if (status === 'pickup_scheduled') {
      if (!pickupTime) {
        return res.status(400).json({ success: false, message: 'Pickup time is required when scheduling pickup' });
      }
      request.pickupTime = pickupTime;
      request.pickupCode = String(Math.floor(100000 + Math.random() * 900000));
    }

    if (status === 'collected') {
      await Meal.findByIdAndUpdate(request.meal._id, { status: 'completed' });
    }

    request.statusHistory.push({
      status,
      note: `Status updated to ${status}`,
    });

    await request.save();

    await Notification.create({
      recipient: request.requester,
      sender: req.user.id,
      type:
        status === 'approved'
          ? 'request_approved'
          : status === 'rejected'
            ? 'request_rejected'
            : status === 'pickup_scheduled'
              ? 'pickup_scheduled'
              : 'system',
      title: `Request ${status.replace(/_/g, ' ')}`,
      message: `Your request for "${request.meal.title}" has been ${status.replace(/_/g, ' ')}`,
      data: { requestId: request._id, mealId: request.meal._id },
    });

    const populatedRequest = await Request.findById(request._id)
      .populate('meal', 'title images category')
      .populate('requester', 'name avatar')
      .populate('donor', 'name avatar');

    res.json({
      success: true,
      data: { request: populatedRequest },
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.requester.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be cancelled',
      });
    }

    request.status = 'cancelled';
    request.statusHistory.push({ status: 'cancelled', note: 'Cancelled by requester' });
    await request.save();

    await Notification.create({
      recipient: request.donor,
      sender: req.user.id,
      type: 'system',
      title: 'Request Cancelled',
      message: `A request for your meal has been cancelled`,
      data: { requestId: request._id, mealId: request.meal },
    });

    res.json({
      success: true,
      message: 'Request cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyPickup = async (req, res, next) => {
  try {
    const { pickupCode } = req.body;

    const request = await Request.findById(req.params.id).populate('meal', 'title');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.donor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to verify pickup' });
    }

    if (request.status !== 'ready_for_pickup') {
      return res.status(400).json({
        success: false,
        message: 'Request is not ready for pickup',
      });
    }

    if (!request.pickupCode || request.pickupCode !== pickupCode) {
      return res.status(400).json({ success: false, message: 'Invalid pickup code' });
    }

    request.status = 'collected';
    request.statusHistory.push({ status: 'collected', note: 'Pickup verified with code' });
    await request.save();

    await Meal.findByIdAndUpdate(request.meal._id, { status: 'completed' });

    await Notification.create({
      recipient: request.requester,
      sender: req.user.id,
      type: 'pickup_completed',
      title: 'Pickup Verified',
      message: `Your pickup for "${request.meal.title}" has been verified`,
      data: { requestId: request._id, mealId: request.meal._id },
    });

    res.json({
      success: true,
      message: 'Pickup verified successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.completeRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id).populate('meal', 'title');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.donor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to complete this request' });
    }

    if (request.status !== 'collected' && request.status !== 'approved' && request.status !== 'pickup_scheduled' && request.status !== 'ready_for_pickup') {
      return res.status(400).json({
        success: false,
        message: 'Request must be in an active state to be completed',
      });
    }

    request.status = 'completed';
    request.statusHistory.push({ status: 'completed', note: 'Marked as completed' });
    await request.save();

    await Meal.findByIdAndUpdate(request.meal._id, { status: 'completed' });

    await Notification.create({
      recipient: request.requester,
      sender: req.user.id,
      type: 'system',
      title: 'Request Completed',
      message: `Your request for "${request.meal.title}" has been completed. Thank you!`,
      data: { requestId: request._id, mealId: request.meal._id },
    });

    res.json({
      success: true,
      message: 'Request completed successfully',
    });
  } catch (error) {
    next(error);
  }
};
