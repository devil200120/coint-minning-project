// Admin API Service
const API_BASE_URL = 'http://72.62.167.180:5002/api/admin';

class AdminApi {
  static getToken() {
    return localStorage.getItem('adminToken');
  }

  static getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // ==================== AUTH ====================
  
  static async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Login failed');
    }
    return data;
  }

  static async getMe() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to get admin info');
    }
    return data;
  }

  static async logout() {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
    } finally {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    }
  }

  static async changePassword(currentPassword, newPassword) {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to change password');
    }
    return data;
  }

  // ==================== DASHBOARD ====================
  
  static async getDashboardStats(period = 'week') {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats?period=${period}`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to get dashboard stats');
    }
    return data;
  }

  static async getSystemHealth() {
    const response = await fetch(`${API_BASE_URL}/dashboard/health`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to get system health');
    }
    return data;
  }

  // ==================== USERS ====================
  
  static async getUsers(params = {}) {
    // Filter out undefined/null values to avoid sending "undefined" as string
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const query = new URLSearchParams(cleanParams).toString();
    const response = await fetch(`${API_BASE_URL}/users${query ? `?${query}` : ''}`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to get users');
    }
    return data;
  }

  static async getUserStats() {
    const response = await fetch(`${API_BASE_URL}/users/stats`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to get user stats');
    }
    return data;
  }

  static async createUser(userData) {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to create user');
    }
    return data;
  }

  static async getUser(id) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to get user');
    }
    return data;
  }

  static async updateUser(id, userData) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to update user');
    }
    return data;
  }

  static async suspendUser(id, reason) {
    const response = await fetch(`${API_BASE_URL}/users/${id}/suspend`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ reason }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to suspend user');
    }
    return data;
  }

  static async activateUser(id) {
    const response = await fetch(`${API_BASE_URL}/users/${id}/activate`, {
      method: 'PUT',
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to activate user');
    }
    return data;
  }

  static async adjustUserCoins(id, amount, walletType, reason) {
    const response = await fetch(`${API_BASE_URL}/users/${id}/adjust-coins`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ amount, walletType, reason }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to adjust coins');
    }
    return data;
  }

  static async deleteUser(id) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to delete user');
    }
    return data;
  }

  static async updateUserCoins(id, { amount, action, reason }) {
    const endpoint = action === 'add' ? 'add-coins' : 'deduct-coins';
    const response = await fetch(`${API_BASE_URL}/users/${id}/${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ amount, reason }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to update user coins');
    }
    return data;
  }

  // ==================== KYC ====================
  
  static async getKYCStats() {
    const response = await fetch(`${API_BASE_URL}/kyc/stats`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to get KYC stats');
    }
    return data;
  }

  static async getKYCList(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/kyc?${query}`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to get KYC list');
    }
    return data;
  }

  static async getKYC(id) {
    const response = await fetch(`${API_BASE_URL}/kyc/${id}`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to get KYC');
    }
    return data;
  }

  static async approveKYC(id) {
    const response = await fetch(`${API_BASE_URL}/kyc/${id}/approve`, {
      method: 'PUT',
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to approve KYC');
    }
    return data;
  }

  static async rejectKYC(id, reason) {
    const response = await fetch(`${API_BASE_URL}/kyc/${id}/reject`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ reason }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to reject KYC');
    }
    return data;
  }

  // ==================== MINING ====================
  
  static async getMiningSessions(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/mining/sessions?${query}`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to get mining sessions');
    }
    return data;
  }

  static async getMiningStats() {
    const response = await fetch(`${API_BASE_URL}/mining/stats`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to get mining stats');
    }
    return data;
  }

  static async getMiningSettings() {
    const response = await fetch(`${API_BASE_URL}/mining/settings`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to get mining settings');
    }
    return data;
  }

  static async updateMiningSettings(settings) {
    const response = await fetch(`${API_BASE_URL}/mining/settings`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(settings),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to update mining settings');
    }
    return data;
  }

  static async cancelMiningSession(sessionId, reason) {
    const response = await fetch(`${API_BASE_URL}/mining/sessions/${sessionId}/cancel`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ reason }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to cancel mining session');
    }
    return data;
  }

  // ==================== TRANSACTIONS ====================
  
  static async getTransactions(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/transactions?${query}`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to get transactions');
    }
    return data;
  }

  static async getTransaction(id) {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to get transaction');
    }
    return data;
  }

  // ==================== PAYMENTS ====================
  
  static async getPaymentStats() {
    const response = await fetch(`${API_BASE_URL}/payments/stats`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to get payment stats');
    }
    return data;
  }

  static async getPayments(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/payments?${query}`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to get payments');
    }
    return data;
  }

  static async approvePayment(id) {
    const response = await fetch(`${API_BASE_URL}/payments/${id}/approve`, {
      method: 'PUT',
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to approve payment');
    }
    return data;
  }

  static async rejectPayment(id, reason) {
    const response = await fetch(`${API_BASE_URL}/payments/${id}/reject`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ reason }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to reject payment');
    }
    return data;
  }

  // ==================== COIN PACKAGES ====================
  
  static async getCoinStats() {
    const response = await fetch(`${API_BASE_URL}/coins/stats`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to get coin stats');
    }
    return data;
  }

  static async getCoinPackages() {
    const response = await fetch(`${API_BASE_URL}/coins/packages`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to get coin packages');
    }
    return data;
  }

  static async createCoinPackage(packageData) {
    const response = await fetch(`${API_BASE_URL}/coins/packages`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(packageData),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to create coin package');
    }
    return data;
  }

  static async updateCoinPackage(id, packageData) {
    const response = await fetch(`${API_BASE_URL}/coins/packages/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(packageData),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to update coin package');
    }
    return data;
  }

  static async deleteCoinPackage(id) {
    const response = await fetch(`${API_BASE_URL}/coins/packages/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to delete coin package');
    }
    return data;
  }

  // ==================== BANNERS ====================
  
  static async getBanners() {
    const response = await fetch(`${API_BASE_URL}/banners`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to get banners');
    }
    return data;
  }

  static async createBanner(formData) {
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/banners`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to create banner');
    }
    return data;
  }

  static async updateBanner(id, formData) {
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/banners/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to update banner');
    }
    return data;
  }

  static async deleteBanner(id) {
    const response = await fetch(`${API_BASE_URL}/banners/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to delete banner');
    }
    return data;
  }

  // ==================== REFERRALS ====================
  
  static async getReferrals(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/referrals?${query}`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to get referrals');
    }
    return data;
  }

  static async getReferralStats() {
    const response = await fetch(`${API_BASE_URL}/referrals/stats`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to get referral stats');
    }
    return data;
  }

  static async getReferralSettings() {
    const response = await fetch(`${API_BASE_URL}/referrals/settings`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to get referral settings');
    }
    return data;
  }

  static async updateReferralSettings(settingsData) {
    const response = await fetch(`${API_BASE_URL}/referrals/settings`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(settingsData),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to update referral settings');
    }
    return data;
  }

  static async getUserReferralTree(userId) {
    const response = await fetch(`${API_BASE_URL}/referrals/user/${userId}/tree`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to get user referral tree');
    }
    return data;
  }

  // ==================== NOTIFICATIONS ====================
  
  static async getNotifications(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/notifications?${query}`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to get notifications');
    }
    return data;
  }

  static async getNotificationStats() {
    const response = await fetch(`${API_BASE_URL}/notifications/stats`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to get notification stats');
    }
    return data;
  }

  static async getNotificationTemplates() {
    const response = await fetch(`${API_BASE_URL}/notifications/templates`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to get notification templates');
    }
    return data;
  }

  static async deleteNotification(id) {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to delete notification');
    }
    return data;
  }

  static async sendNotification(notificationData) {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(notificationData),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to send notification');
    }
    return data;
  }

  static async sendBulkNotification(notificationData) {
    const response = await fetch(`${API_BASE_URL}/notifications/bulk`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(notificationData),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to send bulk notification');
    }
    return data;
  }

  // ==================== SETTINGS ====================
  
  static async getSettings() {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to get settings');
    }
    return data;
  }

  static async updateSettings(data) {
    const response = await fetch(`${API_BASE_URL}/settings/bulk`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to update settings');
    }
    return result;
  }

  static async getSocialLinks() {
    const response = await fetch(`${API_BASE_URL}/settings/social`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to get social links');
    }
    return data;
  }

  static async updateSocialLinks(links) {
    const response = await fetch(`${API_BASE_URL}/settings/social`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(links),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to update social links');
    }
    return data;
  }

  static async getPaymentSettings() {
    const response = await fetch(`${API_BASE_URL}/payments/settings`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to get payment settings');
    }
    return data;
  }

  static async updatePaymentSettings(settings) {
    const response = await fetch(`${API_BASE_URL}/payments/settings`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(settings),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to update payment settings');
    }
    return data;
  }

  static async uploadQRCode(formData) {
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/payments/upload-qr`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to upload QR code');
    }
    return data;
  }

  // ==================== PROMO CODES ====================
  
  static async getPromoCodes(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/settings/promo-codes?${query}`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to get promo codes');
    }
    return data;
  }

  static async getPromoCodeStats() {
    const response = await fetch(`${API_BASE_URL}/settings/promo-codes/stats`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to get promo code stats');
    }
    return data;
  }

  static async createPromoCode(promoData) {
    const response = await fetch(`${API_BASE_URL}/settings/promo-codes`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(promoData),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to create promo code');
    }
    return data;
  }

  static async updatePromoCode(id, promoData) {
    const response = await fetch(`${API_BASE_URL}/settings/promo-codes/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(promoData),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to update promo code');
    }
    return data;
  }

  static async togglePromoCodeStatus(id) {
    const response = await fetch(`${API_BASE_URL}/settings/promo-codes/${id}/toggle-status`, {
      method: 'PUT',
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to toggle promo code status');
    }
    return data;
  }

  static async deletePromoCode(id) {
    const response = await fetch(`${API_BASE_URL}/settings/promo-codes/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to delete promo code');
    }
    return data;
  }
}

export default AdminApi;
