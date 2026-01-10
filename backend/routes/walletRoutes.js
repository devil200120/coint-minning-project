const express = require('express');
const router = express.Router();
const {
  getWallet,
  syncWallet,
  updateWithdrawalAddress,
  requestWithdrawal,
  getTransactions,
  getTransaction,
  getWalletSummary,
} = require('../controllers/walletController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/', getWallet);
router.post('/sync', syncWallet);
router.put('/withdrawal-address', updateWithdrawalAddress);
router.post('/withdraw', requestWithdrawal);
router.get('/transactions', getTransactions);
router.get('/transactions/:id', getTransaction);
router.get('/summary', getWalletSummary);

module.exports = router;
