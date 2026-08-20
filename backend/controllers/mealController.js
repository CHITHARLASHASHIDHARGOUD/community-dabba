const Meal = require('../models/Meal');

const processUploadedFiles = (files) => {
  if (!files || files.length === 0) return [];
  return files.map((file) => ({
    url: `/uploads/meals/${file.filename}`,
    publicId: file.filename,
  }));
};

exports.createMeal = async (req, res, next) => {
  try {
    const files = req.file ? [req.file] : [];
    const images = processUploadedFiles(files);

    const allowedFields = [
      'title', 'description', 'category', 'quantity', 'servings', 'foodType',
      'preparedAt', 'availableUntil', 'location', 'pickupInstructions',
      'contactPreference', 'dietaryInfo',
    ];
    const filtered = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        filtered[field] = req.body[field];
      }
    }

    const meal = await Meal.create({
      ...filtered,
      donor: req.user.id,
      images,
    });

    res.status(201).json({
      success: true,
      data: { meal },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMeals = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = { status: { $in: ['active', 'expiring_soon'] } };

    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.foodType) {
      filter.foodType = req.query.foodType;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.search) {
      const escapedSearch = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: escapedSearch, $options: 'i' } },
        { description: { $regex: escapedSearch, $options: 'i' } },
      ];
    }
    if (req.query.lng && req.query.lat) {
      const lng = parseFloat(req.query.lng);
      const lat = parseFloat(req.query.lat);
      const maxDistance = parseInt(req.query.maxDistance, 10) || 10000;
      filter.location = {
        $geoWithin: {
          $centerSphere: [[lng, lat], maxDistance / 6378100],
        },
      };
    }

    let sort = { createdAt: -1 };
    if (req.query.sort === 'expiring_soon') {
      sort = { availableUntil: 1 };
    }

    const [meals, total] = await Promise.all([
      Meal.find(filter).sort(sort).skip(skip).limit(limit).populate('donor', 'name avatar'),
      Meal.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        meals,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMealById = async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id).populate(
      'donor',
      'name avatar phone location role'
    );

    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }

    res.json({
      success: true,
      data: { meal },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }

    if (meal.donor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this meal' });
    }

    if (meal.status !== 'active' && meal.status !== 'expiring_soon') {
      return res.status(400).json({ success: false, message: 'Cannot update a meal that is not active' });
    }

    const allowedUpdates = [
      'title', 'description', 'category', 'quantity', 'servings', 'foodType',
      'images', 'location', 'pickupInstructions', 'contactPreference',
      'dietaryInfo', 'availableUntil', 'preparedAt',
    ];
    const updates = {};
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (req.file) {
      const newImages = processUploadedFiles([req.file]);
      updates.images = newImages;
    }

    const updatedMeal = await Meal.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: { meal: updatedMeal },
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }

    if (meal.donor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this meal' });
    }

    meal.status = 'cancelled';
    await meal.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Meal cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyMeals = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = { donor: req.user.id };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [meals, total] = await Promise.all([
      Meal.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Meal.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        meals,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.markExpired = async (_req, res, next) => {
  try {
    const result = await Meal.updateMany(
      {
        status: { $in: ['active', 'expiring_soon'] },
        availableUntil: { $lt: new Date() },
      },
      { $set: { status: 'expired' } }
    );

    res.json({
      success: true,
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (error) {
    next(error);
  }
};
