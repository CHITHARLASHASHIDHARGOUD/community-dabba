const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  createReport,
  getMyReports,
  getAllReports,
  updateReportStatus,
} = require('../controllers/reportController');

router.post('/', protect, createReport);
router.get('/my', protect, getMyReports);
router.get('/admin', protect, admin, getAllReports);
router.patch('/admin/:id', protect, admin, updateReportStatus);

module.exports = router;
