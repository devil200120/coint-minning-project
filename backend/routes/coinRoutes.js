const express = require('express');
const router = express.Router();
const {
  getCoinPackages,
  getCoinRate,
  purchaseCoins,
  submitPaymentProof,
  cancelPurchase,
  getPurchaseHistory,
  transferCoins,
  getCoinBalance,
} = require('../controllers/coinController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Public routes
router.get('/packages', getCoinPackages);
router.get('/rate', getCoinRate);

// Protected routes
router.use(protect);

router.get('/balance', getCoinBalance);
router.post('/purchase', purchaseCoins);
router.post('/purchase/:transactionId/proof', upload.single('paymentProof'), submitPaymentProof);
router.post('/purchase/:transactionId/cancel', cancelPurchase);
router.get('/purchases', getPurchaseHistory);
router.post('/transfer', transferCoins);

module.exports = router;
