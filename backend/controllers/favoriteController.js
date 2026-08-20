const Favorite = require('../models/Favorite');

const toggleFavorite = async (req, res, next) => {
  try {
    const { mealId } = req.params;

    const existing = await Favorite.findOne({
      user: req.user.id,
      meal: mealId,
    });

    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      return res.json({ favorited: false, message: 'Removed from favorites' });
    }

    await Favorite.create({
      user: req.user.id,
      meal: mealId,
    });

    res.json({ favorited: true, message: 'Added to favorites' });
  } catch (error) {
    next(error);
  }
};

const getMyFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id })
      .populate({
        path: 'meal',
        populate: { path: 'donor', select: 'name avatar' },
      })
      .sort({ createdAt: -1 })
      .lean();

    const meals = favorites.map((f) => f.meal).filter(Boolean);

    res.json(meals);
  } catch (error) {
    next(error);
  }
};

const isFavorited = async (req, res, next) => {
  try {
    const { mealId } = req.params;

    const favorite = await Favorite.findOne({
      user: req.user.id,
      meal: mealId,
    });

    res.json({ favorited: !!favorite });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  toggleFavorite,
  getMyFavorites,
  isFavorited,
};
