const User = require('../../models/User');
const Wallet = require('../../models/Wallet');
const MiningSession = require('../../models/MiningSession');
const Transaction = require('../../models/Transaction');
const Notification = require('../../models/Notification');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      kycStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc' 
    } = req.query;

    // Build query
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { referralCode: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (kycStatus) {
      query.kycStatus = kycStatus;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await User.find(query)
      .select('-password -referralChain')
      .populate('referredBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single user details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('referredBy', 'name email referralCode')
      .populate('referralStats.directReferrals', 'name email status createdAt')
      .populate('referralStats.indirectReferrals', 'name email status createdAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get wallet info
    const wallet = await Wallet.findOne({ user: user._id });

    // Get recent mining sessions
    const recentMiningSessions = await MiningSession.find({ user: user._id })
      .sort('-startTime')
      .limit(5);

    // Get recent transactions
    const recentTransactions = await Transaction.find({ user: user._id })
      .sort('-createdAt')
      .limit(10);

    res.status(200).json({
      success: true,
      user,
      wallet,
      recentMiningSessions,
      recentTransactions,
    });
  } catch (error) {
    console.error('Get User By ID Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone, status, kycStatus } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, status, kycStatus },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Ban/Suspend user
// @route   PUT /api/admin/users/:id/ban
// @access  Private/Admin
exports.banUser = async (req, res) => {
  try {
    const { reason } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'suspended' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Send notification to user
    await Notification.create({
      user: user._id,
      title: 'Account Suspended',
      message: reason || 'Your account has been suspended. Please contact support.',
      type: 'system',
    });

    res.status(200).json({
      success: true,
      message: 'User has been suspended',
      user,
    });
  } catch (error) {
    console.error('Ban User Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Unban user
// @route   PUT /api/admin/users/:id/unban
// @access  Private/Admin
exports.unbanUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Send notification to user
    await Notification.create({
      user: user._id,
      title: 'Account Reactivated',
      message: 'Your account has been reactivated. Welcome back!',
      type: 'system',
    });

    res.status(200).json({
      success: true,
      message: 'User has been reactivated',
      user,
    });
  } catch (error) {
    console.error('Unban User Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Soft delete - mark as deleted
    user.status = 'deleted';
    user.email = `deleted_${user._id}_${user.email}`;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User has been deleted',
    });
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Add coins to user
// @route   POST /api/admin/users/:id/add-coins
// @access  Private/Admin
exports.addCoins = async (req, res) => {
  try {
    const { amount, reason } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update wallet
    let wallet = await Wallet.findOne({ user: user._id });
    if (!wallet) {
      wallet = await Wallet.create({
        user: user._id,
        coinBalance: 0,
      });
    }

    wallet.coinBalance += amount;
    await wallet.save();

    // Create transaction record
    await Transaction.create({
      user: user._id,
      type: 'bonus',
      amount,
      status: 'completed',
      description: reason || 'Admin added coins',
    });

    // Notify user
    await Notification.create({
      user: user._id,
      title: 'Coins Added',
      message: `${amount} coins have been added to your wallet. ${reason || ''}`,
      type: 'reward',
    });

    res.status(200).json({
      success: true,
      message: `${amount} coins added successfully`,
      newBalance: wallet.coinBalance,
    });
  } catch (error) {
    console.error('Add Coins Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Deduct coins from user
// @route   POST /api/admin/users/:id/deduct-coins
// @access  Private/Admin
exports.deductCoins = async (req, res) => {
  try {
    const { amount, reason } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const wallet = await Wallet.findOne({ user: user._id });
    if (!wallet || wallet.coinBalance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance',
      });
    }

    wallet.coinBalance -= amount;
    await wallet.save();

    // Create transaction record
    await Transaction.create({
      user: user._id,
      type: 'deduction',
      amount: -amount,
      status: 'completed',
      description: reason || 'Admin deducted coins',
    });

    // Notify user
    await Notification.create({
      user: user._id,
      title: 'Coins Deducted',
      message: `${amount} coins have been deducted from your wallet. ${reason || ''}`,
      type: 'system',
    });

    res.status(200).json({
      success: true,
      message: `${amount} coins deducted successfully`,
      newBalance: wallet.coinBalance,
    });
  } catch (error) {
    console.error('Deduct Coins Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get user statistics
// @route   GET /api/admin/users/stats
// @access  Private/Admin
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });
    const kycPending = await User.countDocuments({ kycStatus: 'pending' });
    const kycApproved = await User.countDocuments({ kycStatus: 'approved' });

    // Users by registration date
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: last7Days },
    });

    res.status(200).json({
      success: true,
      stats: {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers,
        kycPending,
        kycApproved,
        newThisWeek: newUsersThisWeek,
      },
    });
  } catch (error) {
    console.error('User Stats Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Export users data
// @route   GET /api/admin/users/export
// @access  Private/Admin
exports.exportUsers = async (req, res) => {
  try {
    const { status, kycStatus, startDate, endDate } = req.query;

    const query = {};
    if (status) query.status = status;
    if (kycStatus) query.kycStatus = kycStatus;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const users = await User.find(query)
      .select('name email phone status kycStatus referralCode miningStats referralStats createdAt')
      .lean();

    // Transform for export
    const exportData = users.map(user => ({
      Name: user.name,
      Email: user.email,
      Phone: user.phone || 'N/A',
      Status: user.status,
      KYC: user.kycStatus,
      ReferralCode: user.referralCode,
      TotalMined: user.miningStats?.totalMined || 0,
      TotalReferrals: user.referralStats?.totalCount || 0,
      JoinedAt: user.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: exportData,
    });
  } catch (error) {
    console.error('Export Users Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
