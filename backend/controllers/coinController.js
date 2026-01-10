const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const CoinPackage = require('../models/CoinPackage');
const Notification = require('../models/Notification');
const Settings = require('../models/Settings');
const { parsePagination } = require('../utils/helpers');

// @desc    Get available coin packages
// @route   GET /api/coins/packages
// @access  Public
const getCoinPackages = async (req, res) => {
  try {
    const packages = await CoinPackage.find({ isActive: true })
      .sort({ sortOrder: 1 });

    // Filter out expired packages
    const availablePackages = packages.filter(pkg => pkg.isAvailable());

    res.status(200).json({
      success: true,
      packages: availablePackages.map(pkg => ({
        id: pkg._id,
        name: pkg.name,
        description: pkg.description,
        coins: pkg.coins,
        bonusCoins: pkg.bonusCoins,
        totalCoins: pkg.totalCoins,
        price: pkg.price,
        originalPrice: pkg.originalPrice,
        discountPercent: pkg.discountPercent,
        currency: pkg.currency,
        badge: pkg.badge,
        isFeatured: pkg.isFeatured,
        icon: pkg.icon,
      })),
    });
  } catch (error) {
    console.error('Get Coin Packages Error:', error);
    res.status(500).json({ success: false, message: 'Failed to get coin packages' });
  }
};

// @desc    Get coin exchange rate
// @route   GET /api/coins/rate
// @access  Public
const getCoinRate = async (req, res) => {
  try {
    const settings = await Settings.getSettings();

    res.status(200).json({
      success: true,
      rate: {
        coinValue: settings.coinValue || 0.01,
        currency: 'USD',
        lastUpdated: new Date(),
      },
    });
  } catch (error) {
    console.error('Get Coin Rate Error:', error);
    res.status(500).json({ success: false, message: 'Failed to get coin rate' });
  }
};

// @desc    Purchase coins (initiate)
// @route   POST /api/coins/purchase
// @access  Private
const purchaseCoins = async (req, res) => {
  try {
    const { packageId, paymentMethod } = req.body;

    if (!packageId) {
      return res.status(400).json({ success: false, message: 'Package ID is required' });
    }

    const coinPackage = await CoinPackage.findById(packageId);
    if (!coinPackage || !coinPackage.isAvailable()) {
      return res.status(404).json({ success: false, message: 'Package not available' });
    }

    // Check purchase limits
    if (coinPackage.purchaseLimit > 0) {
      const purchaseCount = await Transaction.countDocuments({
        user: req.user._id,
        type: 'purchase',
        'metadata.packageId': packageId,
        status: 'completed',
      });
      if (purchaseCount >= coinPackage.purchaseLimit) {
        return res.status(400).json({ 
          success: false, 
          message: 'You have reached the purchase limit for this package' 
        });
      }
    }

    // Create pending transaction
    const transaction = await Transaction.create({
      user: req.user._id,
      type: 'purchase',
      amount: coinPackage.price,
      coins: coinPackage.totalCoins,
      currency: coinPackage.currency,
      status: 'pending',
      paymentMethod: paymentMethod || 'upi',
      description: `Purchase of ${coinPackage.name} - ${coinPackage.totalCoins} coins`,
    });

    res.status(200).json({
      success: true,
      message: 'Purchase initiated',
      transaction: {
        id: transaction._id,
        transactionId: transaction.transactionId,
        amount: transaction.amount,
        coins: transaction.coins,
        currency: transaction.currency,
        status: transaction.status,
      },
      package: {
        name: coinPackage.name,
        coins: coinPackage.coins,
        bonusCoins: coinPackage.bonusCoins,
        totalCoins: coinPackage.totalCoins,
        price: coinPackage.price,
      },
      paymentInfo: {
        // This would be your payment gateway info
        upiId: process.env.PAYMENT_UPI_ID || 'payments@miningapp',
        bankDetails: {
          accountName: process.env.PAYMENT_ACCOUNT_NAME || 'Mining App Pvt Ltd',
          accountNumber: process.env.PAYMENT_ACCOUNT_NUMBER,
          ifscCode: process.env.PAYMENT_IFSC_CODE,
          bankName: process.env.PAYMENT_BANK_NAME,
        },
      },
    });
  } catch (error) {
    console.error('Purchase Coins Error:', error);
    res.status(500).json({ success: false, message: 'Failed to initiate purchase' });
  }
};

// @desc    Submit payment proof
// @route   POST /api/coins/purchase/:transactionId/proof
// @access  Private
const submitPaymentProof = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findOne({
      _id: transactionId,
      user: req.user._id,
      type: 'purchase',
      status: 'pending',
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found or already processed' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload payment screenshot' });
    }

    transaction.paymentProof = req.file.path;
    transaction.status = 'processing';
    await transaction.save();

    // Notify admin (you could implement admin notification here)

    res.status(200).json({
      success: true,
      message: 'Payment proof submitted. Your purchase will be verified shortly.',
      transaction: {
        id: transaction._id,
        transactionId: transaction.transactionId,
        status: transaction.status,
      },
    });
  } catch (error) {
    console.error('Submit Payment Proof Error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit payment proof' });
  }
};

// @desc    Cancel purchase
// @route   POST /api/coins/purchase/:transactionId/cancel
// @access  Private
const cancelPurchase = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findOne({
      _id: transactionId,
      user: req.user._id,
      type: 'purchase',
      status: 'pending',
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found or cannot be cancelled' });
    }

    transaction.status = 'cancelled';
    await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Purchase cancelled',
    });
  } catch (error) {
    console.error('Cancel Purchase Error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel purchase' });
  }
};

// @desc    Get purchase history
// @route   GET /api/coins/purchases
// @access  Private
const getPurchaseHistory = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const purchases = await Transaction.find({
      user: req.user._id,
      type: 'purchase',
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments({
      user: req.user._id,
      type: 'purchase',
    });

    // Summary
    const summary = await Transaction.aggregate([
      { $match: { user: req.user._id, type: 'purchase', status: 'completed' } },
      {
        $group: {
          _id: null,
          totalPurchases: { $sum: 1 },
          totalCoins: { $sum: '$coins' },
          totalSpent: { $sum: '$amount' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      purchases,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      summary: summary[0] || { totalPurchases: 0, totalCoins: 0, totalSpent: 0 },
    });
  } catch (error) {
    console.error('Get Purchase History Error:', error);
    res.status(500).json({ success: false, message: 'Failed to get purchase history' });
  }
};

// @desc    Transfer coins to another user
// @route   POST /api/coins/transfer
// @access  Private
const transferCoins = async (req, res) => {
  try {
    const { recipientEmail, amount, note } = req.body;

    if (!recipientEmail || !amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid transfer details' });
    }

    // Find recipient
    const recipient = await User.findOne({ email: recipientEmail.toLowerCase() });
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient not found' });
    }

    if (recipient._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot transfer to yourself' });
    }

    // Check sender wallet
    const senderWallet = await Wallet.findOne({ user: req.user._id });
    if (!senderWallet || senderWallet.availableCoins < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    // Get or create recipient wallet
    let recipientWallet = await Wallet.findOne({ user: recipient._id });
    if (!recipientWallet) {
      recipientWallet = await Wallet.create({
        user: recipient._id,
        coinBalance: recipient.miningStats?.totalCoins || 0,
      });
    }

    // Deduct from sender
    await senderWallet.deductCoins(amount);

    // Add to recipient
    await recipientWallet.addCoins(amount, 'transfer');

    // Update user model coins too
    const sender = await User.findById(req.user._id);
    sender.miningStats.totalCoins -= amount;
    await sender.save();

    recipient.miningStats.totalCoins += amount;
    await recipient.save();

    // Create transactions
    const senderTransaction = await Transaction.create({
      user: req.user._id,
      type: 'transfer',
      amount: -amount,
      coins: -amount,
      currency: 'COIN',
      status: 'completed',
      description: `Transfer to ${recipient.name} (${recipientEmail})`,
      balanceAfter: senderWallet.coinBalance,
    });

    const recipientTransaction = await Transaction.create({
      user: recipient._id,
      type: 'transfer',
      amount: amount,
      coins: amount,
      currency: 'COIN',
      status: 'completed',
      description: `Transfer from ${sender.name}${note ? `: ${note}` : ''}`,
      balanceAfter: recipientWallet.coinBalance,
    });

    // Notify recipient
    await Notification.create({
      user: recipient._id,
      type: 'reward',
      title: 'Coins Received! 🎁',
      message: `${sender.name} sent you ${amount} coins!${note ? ` Note: ${note}` : ''}`,
    });

    res.status(200).json({
      success: true,
      message: `Successfully transferred ${amount} coins to ${recipient.name}`,
      transaction: {
        id: senderTransaction._id,
        transactionId: senderTransaction.transactionId,
        coins: amount,
        recipient: recipient.name,
      },
      newBalance: senderWallet.coinBalance,
    });
  } catch (error) {
    console.error('Transfer Coins Error:', error);
    res.status(500).json({ success: false, message: 'Failed to transfer coins' });
  }
};

// @desc    Get coin balance
// @route   GET /api/coins/balance
// @access  Private
const getCoinBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const wallet = await Wallet.findOne({ user: req.user._id });
    const settings = await Settings.getSettings();

    res.status(200).json({
      success: true,
      balance: {
        coins: user.miningStats?.totalCoins || 0,
        walletCoins: wallet?.coinBalance || 0,
        availableCoins: wallet?.availableCoins || 0,
        lockedCoins: wallet?.lockedCoins || 0,
        fiatValue: (user.miningStats?.totalCoins || 0) * (settings.coinValue || 0.01),
        currency: 'USD',
      },
    });
  } catch (error) {
    console.error('Get Coin Balance Error:', error);
    res.status(500).json({ success: false, message: 'Failed to get balance' });
  }
};

module.exports = {
  getCoinPackages,
  getCoinRate,
  purchaseCoins,
  submitPaymentProof,
  cancelPurchase,
  getPurchaseHistory,
  transferCoins,
  getCoinBalance,
};
