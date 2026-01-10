const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const cron = require('node-cron');
const { checkMiningCycles, sendInactiveReminders, updateOwnershipProgress, updateReferralStatus } = require('./utils/cronJobs');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// User Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/mining', require('./routes/miningRoutes'));
app.use('/api/referrals', require('./routes/referralRoutes'));
app.use('/api/kyc', require('./routes/kycRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/coins', require('./routes/coinRoutes'));

// Admin Routes
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mining App API is running' });
});

// Error handler
app.use(errorHandler);

// Cron Jobs
// Check mining cycles every hour
cron.schedule('0 * * * *', () => {
  console.log('Running mining cycle check...');
  checkMiningCycles();
});

// Send inactive user reminders every 12 hours
cron.schedule('0 */12 * * *', () => {
  console.log('Sending inactive reminders...');
  sendInactiveReminders();
});

// Update ownership progress daily at midnight
cron.schedule('0 0 * * *', () => {
  console.log('Updating ownership progress...');
  updateOwnershipProgress();
});

// Update referral status every 6 hours
cron.schedule('0 */6 * * *', () => {
  console.log('Updating referral status...');
  updateReferralStatus();
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
