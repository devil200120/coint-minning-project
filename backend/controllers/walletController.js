const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Settings = require('../models/Settings');
const Notification = require('../models/Notification');
const { parsePagination } = require('../utils/helpers');

// @desc    Get wallet details
// @route   GET /api/wallet
// @access  Private
const getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user._id });
    
    // Create wallet if doesn't exist
    if (!wallet) {
      const user = await User.findById(req.user._id);
      wallet = await Wallet.create({
        user: req.user._id,
        coinBalance: user.miningStats?.totalCoins || 0,
      });
    }

    const settings = await Settings.getSettings();

    res.status(200).json({
      success: true,
      wallet: {
        coinBalance: wallet.coinBalance,
        fiatBalance: wallet.fiatBalance,
        lockedCoins: wallet.lockedCoins,
        availableCoins: wallet.availableCoins,
        totalEarned: wallet.totalEarned,
        totalWithdrawn: wallet.totalWithdrawn,
        totalPurchased: wallet.totalPurchased,
        currency: wallet.currency,
        status: wallet.status,
        withdrawalAddress: wallet.withdrawalAddress,
        canWithdraw: wallet.canWithdraw(),
        minWithdrawal: wallet.minWithdrawal,
        coinValue: settings.coinValue || 0.01,
      },
    });
  } catch (error) {
    console.error('Get Wallet Error:', error);
    res.status(500).json({ success: false, message: 'Failed to get wallet' });
  }
};

// @desc    Sync wallet with user coins
// @route   POST /api/wallet/sync
// @access  Private
const syncWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      wallet = await Wallet.create({
        user: req.user._id,
        coinBalance: user.miningStats?.totalCoins || 0,
        totalEarned: user.miningStats?.totalMined || 0,
      });
    } else {
      // Sync only if user has more coins (from mining)
      if (user.miningStats?.totalCoins > wallet.coinBalance) {
        const diff = user.miningStats.totalCoins - wallet.coinBalance;
        wallet.coinBalance = user.miningStats.totalCoins;
        wallet.totalEarned += diff;
        await wallet.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Wallet synced successfully',
      coinBalance: wallet.coinBalance,
    });
  } catch (error) {
    console.error('Sync Wallet Error:', error);
    res.status(500).json({ success: false, message: 'Failed to sync wallet' });
  }
};

// @desc    Update withdrawal address
// @route   PUT /api/wallet/withdrawal-address
// @access  Private
const updateWithdrawalAddress = async (req, res) => {
  try {
    const { upiId, bankAccount, bankIfsc, bankName, accountHolderName, cryptoAddress, cryptoNetwork } = req.body;

    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user._id });
    }

    wallet.withdrawalAddress = {
      upiId,
      bankAccount,
      bankIfsc,
      bankName,
      accountHolderName,
      cryptoAddress,
      cryptoNetwork,
    };
    await wallet.save();

    res.status(200).json({
      success: true,
      message: 'Withdrawal address updated successfully',
      withdrawalAddress: wallet.withdrawalAddress,
    });
  } catch (error) {
    console.error('Update Withdrawal Address Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update withdrawal address' });
  }
};

// @desc    Request withdrawal
// @route   POST /api/wallet/withdraw
// @access  Private
const requestWithdrawal = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid withdrawal amount' });
    }

    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }

    // Check if can withdraw
    const canWithdraw = wallet.canWithdraw();
    if (!canWithdraw.canWithdraw) {
      return res.status(400).json({ success: false, message: canWithdraw.reason });
    }

    // Check balance
    if (wallet.availableCoins < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    // Check minimum withdrawal
    if (amount < wallet.minWithdrawal) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum withdrawal is ${wallet.minWithdrawal} coins` 
      });
    }

    // Lock coins
    await wallet.lockCoins(amount);

    // Get settings for coin value
    const settings = await Settings.getSettings();
    const fiatAmount = amount * (settings.coinValue || 0.01);

    // Create transaction
    const transaction = await Transaction.create({
      user: req.user._id,
      type: 'withdrawal',
      amount: fiatAmount,
      coins: amount,
      currency: wallet.currency,
      status: 'pending',
      paymentMethod: paymentMethod || 'upi',
      paymentDetails: wallet.withdrawalAddress,
      description: `Withdrawal of ${amount} coins`,
      balanceAfter: wallet.coinBalance - amount,
    });

    // Send notification
    await Notification.create({
      user: req.user._id,
      type: 'system',
      title: 'Withdrawal Requested',
      message: `Your withdrawal request for ${amount} coins ($${fiatAmount.toFixed(2)}) is being processed.`,
    });

    res.status(200).json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      transaction: {
        id: transaction._id,
        transactionId: transaction.transactionId,
        coins: transaction.coins,
        amount: transaction.amount,
        status: transaction.status,
      },
    });
  } catch (error) {
    console.error('Request Withdrawal Error:', error);
    res.status(500).json({ success: false, message: 'Failed to process withdrawal' });
  }
};

// @desc    Get transaction history
// @route   GET /api/wallet/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { type, status } = req.query;

    let query = { user: req.user._id };
    if (type) query.type = type;
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get Transactions Error:', error);
    res.status(500).json({ success: false, message: 'Failed to get transactions' });
  }
};

// @desc    Get single transaction
// @route   GET /api/wallet/transactions/:id
// @access  Private
const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error('Get Transaction Error:', error);
    res.status(500).json({ success: false, message: 'Failed to get transaction' });
  }
};

// @desc    Get wallet summary
// @route   GET /api/wallet/summary
// @access  Private
const getWalletSummary = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id });
    
    // Get transaction summary
    const summary = await Transaction.aggregate([
      { $match: { user: req.user._id, status: 'completed' } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalCoins: { $sum: '$coins' },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    // Recent transactions
    const recentTransactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      balance: {
        coins: wallet?.coinBalance || 0,
        available: wallet?.availableCoins || 0,
        locked: wallet?.lockedCoins || 0,
      },
      summary,
      recentTransactions,
    });
  } catch (error) {
    console.error('Get Wallet Summary Error:', error);
    res.status(500).json({ success: false, message: 'Failed to get wallet summary' });
  }
};

module.exports = {
  getWallet,
  syncWallet,
  updateWithdrawalAddress,
  requestWithdrawal,
  getTransactions,
  getTransaction,
  getWalletSummary,
};
