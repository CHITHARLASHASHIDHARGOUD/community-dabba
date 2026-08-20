const User = require('../models/User');
const Meal = require('../models/Meal');
const Request = require('../models/Request');

const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const donors = await User.countDocuments({ role: 'donor' });
    const receivers = await User.countDocuments({ role: 'receiver' });
    const totalMeals = await Meal.countDocuments();
    const activeMeals = await Meal.countDocuments({ status: 'active' });
    const completedRequests = await Request.countDocuments({ status: 'completed' });
    const pendingRequests = await Request.countDocuments({ status: 'pending' });

    const completedMeals = await Meal.countDocuments({ status: 'completed' });
    const foodSavedEstimate = completedMeals * 0.5;
    const peopleHelped = completedRequests;

    const ratingResult = await User.aggregate([
      { $match: { totalRatings: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);
    const avgRating = ratingResult.length > 0 ? ratingResult[0].avg : 0;

    const verifiedDonors = await User.countDocuments({ role: 'donor', isVerified: true });

    res.json({
      totalUsers,
      donors,
      receivers,
      totalMeals,
      activeMeals,
      completedRequests,
      pendingRequests,
      foodSavedEstimate: `${foodSavedEstimate} kg`,
      peopleHelped,
      avgRating,
      verifiedDonors,
    });
  } catch (error) {
    next(error);
  }
};

const getPublicStats = async (req, res, next) => {
  try {
    const totalMeals = await Meal.countDocuments();
    const completedMeals = await Meal.countDocuments({ status: 'completed' });
    const activeDonors = await User.countDocuments({ role: 'donor', isActive: true });
    const completedRequests = await Request.countDocuments({ status: 'completed' });

    res.json({
      mealsDonated: totalMeals,
      peopleHelped: completedRequests,
      foodSaved: Math.round(completedMeals * 0.5),
      activeDonors,
    });
  } catch (error) {
    next(error);
  }
};

const getUsersOverTime = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    const now = new Date();
    let startDate;

    if (period === '7d') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === '30d') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (period === '90d') {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }

    const users = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(users);
  } catch (error) {
    next(error);
  }
};

const getMealsOverTime = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    const now = new Date();
    let startDate;

    if (period === '7d') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === '30d') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (period === '90d') {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }

    const meals = await Meal.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(meals);
  } catch (error) {
    next(error);
  }
};

const getRequestStats = async (req, res, next) => {
  try {
    const stats = await Request.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(stats);
  } catch (error) {
    next(error);
  }
};

const getCategoryStats = async (req, res, next) => {
  try {
    const stats = await Meal.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json(stats);
  } catch (error) {
    next(error);
  }
};

const getTopDonors = async (req, res, next) => {
  try {
    const topDonors = await Meal.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$donor',
          mealsDonated: { $sum: 1 },
        },
      },
      { $sort: { mealsDonated: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          mealsDonated: 1,
          name: '$user.name',
          avatar: '$user.avatar',
          averageRating: '$user.averageRating',
        },
      },
    ]);

    res.json(topDonors);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getPublicStats,
  getUsersOverTime,
  getMealsOverTime,
  getRequestStats,
  getCategoryStats,
  getTopDonors,
};
