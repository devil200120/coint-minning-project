const express = require('express');
const router = express.Router();
const { protectAdmin, checkPermission } = require('../../middleware/adminAuth');
const {
  getAllSettings,
  updateAppSettings,
  updateSocialLinks,
  getSocialLinks,
  updateWithdrawalSettings,
  updateKYCSettings,
  updateTransferSettings,
  updateCheckinSettings,
  toggleMaintenance,
  bulkUpdateSettings,
} = require('../../controllers/admin/adminSettingsController');

router.use(protectAdmin);

router.get('/', getAllSettings);
router.put('/bulk', checkPermission('manage_settings'), bulkUpdateSettings);

router.get('/social', getSocialLinks);
router.put('/social', checkPermission('manage_settings'), updateSocialLinks);

router.put('/app', checkPermission('manage_settings'), updateAppSettings);
router.put('/withdrawal', checkPermission('manage_settings'), updateWithdrawalSettings);
router.put('/kyc', checkPermission('manage_settings'), updateKYCSettings);
router.put('/transfer', checkPermission('manage_settings'), updateTransferSettings);
router.put('/checkin', checkPermission('manage_settings'), updateCheckinSettings);
router.put('/maintenance', checkPermission('manage_settings'), toggleMaintenance);

module.exports = router;
