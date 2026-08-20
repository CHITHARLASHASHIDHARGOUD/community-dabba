const Feedback = require('../models/Feedback');
const Request = require('../models/Request');
const User = require('../models/User');

const createFeedback = async (req, res, next) => {
  try {
    const { requestId, rating, comment } = req.body;

    if (!requestId || !rating) {
      return res.status(400).json({ message: 'requestId and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed requests' });
    }

    const reviewerId = req.user.id;
    const donorId = request.donor.toString();
    const requesterId = request.requester.toString();

    if (reviewerId !== donorId && reviewerId !== requesterId) {
      return res.status(403).json({ message: 'Not authorized to rate this request' });
    }

    const revieweeId = reviewerId === donorId ? requesterId : donorId;

    const existingFeedback = await Feedback.findOne({
      transaction: requestId,
      reviewer: reviewerId,
    });

    if (existingFeedback) {
      return res.status(400).json({ message: 'You have already rated this request' });
    }

    const feedback = await Feedback.create({
      transaction: requestId,
      reviewer: reviewerId,
      reviewee: revieweeId,
      rating,
      comment,
    });

    const allFeedback = await Feedback.find({ reviewee: revieweeId });
    const avgRating =
      allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length;

    await User.findByIdAndUpdate(revieweeId, {
      averageRating: Math.round(avgRating * 10) / 10,
      totalRatings: allFeedback.length,
    });

    res.status(201).json(feedback);
  } catch (error) {
    next(error);
  }
};

const getFeedbackForUser = async (req, res, next) => {
  try {
    const feedback = await Feedback.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();

    res.json(feedback);
  } catch (error) {
    next(error);
  }
};

const getMyFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find({ reviewer: req.user.id })
      .populate('reviewee', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();

    res.json(feedback);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFeedback,
  getFeedbackForUser,
  getMyFeedback,
};
