const CoinPackage = require('../../models/CoinPackage');

// @desc    Get all coin packages
// @route   GET /api/admin/coins/packages
// @access  Private/Admin
exports.getAllPackages = async (req, res) => {
  try {
    const { includeInactive = 'true' } = req.query;

    const query = {};
    if (includeInactive === 'false') {
      query.isActive = true;
    }

    const packages = await CoinPackage.find(query).sort('sortOrder');

    res.status(200).json({
      success: true,
      packages,
    });
  } catch (error) {
    console.error('Get All Packages Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single coin package
// @route   GET /api/admin/coins/packages/:id
// @access  Private/Admin
exports.getPackageById = async (req, res) => {
  try {
    const package_ = await CoinPackage.findById(req.params.id);

    if (!package_) {
      return res.status(404).json({
        success: false,
        message: 'Package not found',
      });
    }

    res.status(200).json({
      success: true,
      package: package_,
    });
  } catch (error) {
    console.error('Get Package By ID Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create coin package
// @route   POST /api/admin/coins/packages
// @access  Private/Admin
exports.createPackage = async (req, res) => {
  try {
    const {
      name,
      description,
      coins,
      bonusCoins,
      price,
      currency,
      originalPrice,
      discountPercent,
      badge,
      isFeatured,
      isActive,
      sortOrder,
      icon,
      purchaseLimit,
      dailyLimit,
      validFrom,
      validTo,
    } = req.body;

    const package_ = await CoinPackage.create({
      name,
      description,
      coins,
      bonusCoins: bonusCoins || 0,
      price,
      currency: currency || 'INR',
      originalPrice,
      discountPercent: discountPercent || 0,
      badge,
      isFeatured: isFeatured || false,
      isActive: isActive !== false,
      sortOrder: sortOrder || 0,
      icon,
      purchaseLimit: purchaseLimit || 0,
      dailyLimit: dailyLimit || 0,
      validFrom,
      validTo,
    });

    res.status(201).json({
      success: true,
      message: 'Package created successfully',
      package: package_,
    });
  } catch (error) {
    console.error('Create Package Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update coin package
// @route   PUT /api/admin/coins/packages/:id
// @access  Private/Admin
exports.updatePackage = async (req, res) => {
  try {
    const {
      name,
      description,
      coins,
      bonusCoins,
      price,
      currency,
      originalPrice,
      discountPercent,
      badge,
      isFeatured,
      isActive,
      sortOrder,
      icon,
      purchaseLimit,
      dailyLimit,
      validFrom,
      validTo,
    } = req.body;

    const package_ = await CoinPackage.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        coins,
        bonusCoins,
        price,
        currency,
        originalPrice,
        discountPercent,
        badge,
        isFeatured,
        isActive,
        sortOrder,
        icon,
        purchaseLimit,
        dailyLimit,
        validFrom,
        validTo,
      },
      { new: true, runValidators: true }
    );

    if (!package_) {
      return res.status(404).json({
        success: false,
        message: 'Package not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Package updated successfully',
      package: package_,
    });
  } catch (error) {
    console.error('Update Package Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete coin package
// @route   DELETE /api/admin/coins/packages/:id
// @access  Private/Admin
exports.deletePackage = async (req, res) => {
  try {
    const package_ = await CoinPackage.findByIdAndDelete(req.params.id);

    if (!package_) {
      return res.status(404).json({
        success: false,
        message: 'Package not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Package deleted successfully',
    });
  } catch (error) {
    console.error('Delete Package Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Toggle package status
// @route   PUT /api/admin/coins/packages/:id/toggle
// @access  Private/Admin
exports.togglePackageStatus = async (req, res) => {
  try {
    const package_ = await CoinPackage.findById(req.params.id);

    if (!package_) {
      return res.status(404).json({
        success: false,
        message: 'Package not found',
      });
    }

    package_.isActive = !package_.isActive;
    await package_.save();

    res.status(200).json({
      success: true,
      message: `Package ${package_.isActive ? 'activated' : 'deactivated'}`,
      package: package_,
    });
  } catch (error) {
    console.error('Toggle Package Status Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Reorder packages
// @route   PUT /api/admin/coins/packages/reorder
// @access  Private/Admin
exports.reorderPackages = async (req, res) => {
  try {
    const { orders } = req.body; // Array of { id, order }

    if (!orders || !Array.isArray(orders)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide order array',
      });
    }

    // Update each package's order
    await Promise.all(
      orders.map(({ id, order }) =>
        CoinPackage.findByIdAndUpdate(id, { sortOrder: order })
      )
    );

    res.status(200).json({
      success: true,
      message: 'Packages reordered successfully',
    });
  } catch (error) {
    console.error('Reorder Packages Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
