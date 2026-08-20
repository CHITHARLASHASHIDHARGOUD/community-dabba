const Report = require('../models/Report');

const VALID_TARGET_TYPES = ['meal', 'user', 'message'];
const VALID_REASONS = ['fake_meal', 'expired_food', 'wrong_location', 'inappropriate', 'suspicious', 'abuse', 'other'];
const VALID_STATUSES = ['open', 'investigating', 'resolved', 'dismissed'];

const createReport = async (req, res, next) => {
  try {
    const { targetType, targetId, reason, description } = req.body;

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ message: 'targetType, targetId, and reason are required' });
    }

    if (!VALID_TARGET_TYPES.includes(targetType)) {
      return res.status(400).json({ message: 'Invalid targetType' });
    }

    if (!VALID_REASONS.includes(reason)) {
      return res.status(400).json({ message: 'Invalid reason' });
    }

    const report = await Report.create({
      reporter: req.user.id,
      targetType,
      targetId,
      reason,
      description,
      status: 'open',
    });

    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
};

const getMyReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ reporter: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.json(reports);
  } catch (error) {
    next(error);
  }
};

const getAllReports = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status && VALID_STATUSES.includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const reports = await Report.find(filter)
      .populate('reporter', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Report.countDocuments(filter);

    res.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateReportStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Valid status is required' });
    }

    const update = { status };
    if (adminNotes !== undefined) {
      update.adminNotes = adminNotes;
    }
    if (status === 'resolved' || status === 'dismissed') {
      update.resolvedAt = new Date();
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
  getMyReports,
  getAllReports,
  updateReportStatus,
};
