const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  // Coin balance
  coinBalance: {
    type: Number,
    default: 0,
  },
  // Fiat balance (for purchases/withdrawals)
  fiatBalance: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    enum: ['USD', 'INR', 'EUR'],
    default: 'USD',
  },
  // Locked coins (pending withdrawal or transfer)
  lockedCoins: {
    type: Number,
    default: 0,
  },
  // Total earned (lifetime)
  totalEarned: {
    type: Number,
    default: 0,
  },
  // Total withdrawn (lifetime)
  totalWithdrawn: {
    type: Number,
    default: 0,
  },
  // Total purchased (lifetime)
  totalPurchased: {
    type: Number,
    default: 0,
  },
  // Withdrawal settings
  withdrawalAddress: {
    upiId: String,
    bankAccount: String,
    bankIfsc: String,
    bankName: String,
    accountHolderName: String,
    cryptoAddress: String,
    cryptoNetwork: String,
  },
  // Minimum withdrawal
  minWithdrawal: {
    type: Number,
    default: 100,
  },
  // Last withdrawal
  lastWithdrawalAt: {
    type: Date,
  },
  // Withdrawal cooldown (hours)
  withdrawalCooldown: {
    type: Number,
    default: 24,
  },
  // Status
  status: {
    type: String,
    enum: ['active', 'frozen', 'suspended'],
    default: 'active',
  },
  frozenReason: {
    type: String,
  },
}, {
  timestamps: true,
});

// Virtual for available balance
walletSchema.virtual('availableCoins').get(function() {
  return this.coinBalance - this.lockedCoins;
});

// Method to add coins
walletSchema.methods.addCoins = async function(amount, source = 'system') {
  this.coinBalance += amount;
  this.totalEarned += amount;
  await this.save();
  return this;
};

// Method to deduct coins
walletSchema.methods.deductCoins = async function(amount) {
  if (this.availableCoins < amount) {
    throw new Error('Insufficient balance');
  }
  this.coinBalance -= amount;
  await this.save();
  return this;
};

// Method to lock coins
walletSchema.methods.lockCoins = async function(amount) {
  if (this.availableCoins < amount) {
    throw new Error('Insufficient balance');
  }
  this.lockedCoins += amount;
  await this.save();
  return this;
};

// Method to unlock coins
walletSchema.methods.unlockCoins = async function(amount) {
  this.lockedCoins = Math.max(0, this.lockedCoins - amount);
  await this.save();
  return this;
};

// Method to check if can withdraw
walletSchema.methods.canWithdraw = function() {
  if (this.status !== 'active') return { canWithdraw: false, reason: 'Wallet is ' + this.status };
  if (this.availableCoins < this.minWithdrawal) {
    return { canWithdraw: false, reason: `Minimum withdrawal is ${this.minWithdrawal} coins` };
  }
  if (this.lastWithdrawalAt) {
    const hoursSinceLastWithdrawal = (Date.now() - new Date(this.lastWithdrawalAt)) / (1000 * 60 * 60);
    if (hoursSinceLastWithdrawal < this.withdrawalCooldown) {
      const hoursRemaining = Math.ceil(this.withdrawalCooldown - hoursSinceLastWithdrawal);
      return { canWithdraw: false, reason: `Please wait ${hoursRemaining} hours before next withdrawal` };
    }
  }
  return { canWithdraw: true };
};

// Index
walletSchema.index({ user: 1 });

module.exports = mongoose.model('Wallet', walletSchema);
