const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { protect } = require('../middleware/auth');
const { validate, createRequestSchema, updateRequestStatusSchema } = require('../validators/requestValidators');

router.post(
  '/',
  protect,
  validate(createRequestSchema),
  requestController.createRequest
);

router.get('/my', protect, requestController.getMyRequests);

router.get('/received', protect, requestController.getReceivedRequests);

router.patch(
  '/:id/status',
  protect,
  validate(updateRequestStatusSchema),
  requestController.updateRequestStatus
);

router.patch('/:id/cancel', protect, requestController.cancelRequest);

router.post('/:id/verify-pickup', protect, requestController.verifyPickup);

router.post('/:id/complete', protect, requestController.completeRequest);

module.exports = router;
