import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart' as http_parser;

class ApiService {
  // Production server URL
  static const String baseUrl = 'http://72.62.167.180:5002/api';

  static String? _authToken;

  // Set auth token after login
  static void setAuthToken(String token) {
    _authToken = token;
  }

  // Clear auth token on logout
  static void clearAuthToken() {
    _authToken = null;
  }

  // Get headers with auth token
  static Map<String, String> get _headers {
    final headers = {'Content-Type': 'application/json'};
    if (_authToken != null) {
      headers['Authorization'] = 'Bearer $_authToken';
    }
    return headers;
  }

  // ==================== AUTH APIs ====================

  // Google Sign In
  static Future<Map<String, dynamic>> googleSignIn({
    required String idToken,
    String? referralCode,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/google'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'idToken': idToken,
        if (referralCode != null && referralCode.isNotEmpty)
          'referralCode': referralCode,
      }),
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      setAuthToken(data['token']);
      return data;
    } else {
      throw Exception(data['message'] ?? 'Google sign in failed');
    }
  }

  // Get current user profile
  static Future<Map<String, dynamic>> getCurrentUser() async {
    final response = await http.get(
      Uri.parse('$baseUrl/auth/me'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to get user');
    }
  }

  // Logout
  static Future<void> logout() async {
    try {
      await http.post(
        Uri.parse('$baseUrl/auth/logout'),
        headers: _headers,
      );
    } finally {
      clearAuthToken();
    }
  }

  // ==================== USER APIs ====================

  // Get user profile
  static Future<Map<String, dynamic>> getProfile() async {
    final response = await http.get(
      Uri.parse('$baseUrl/users/profile'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to get profile');
    }
  }

  // Update user profile
  static Future<Map<String, dynamic>> updateProfile({
    String? name,
    String? phone,
  }) async {
    final response = await http.put(
      Uri.parse('$baseUrl/users/profile'),
      headers: _headers,
      body: jsonEncode({
        if (name != null) 'name': name,
        if (phone != null) 'phone': phone,
      }),
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to update profile');
    }
  }

  // Upload avatar
  static Future<Map<String, dynamic>> uploadAvatar(File imageFile) async {
    try {
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('$baseUrl/user/avatar'),
      );

      request.headers['Authorization'] = 'Bearer $_authToken';

      // Get file extension
      final extension = imageFile.path.split('.').last.toLowerCase();
      final mimeType = extension == 'png' ? 'image/png' : 'image/jpeg';

      request.files.add(await http.MultipartFile.fromPath(
        'avatar',
        imageFile.path,
        contentType: http_parser.MediaType.parse(mimeType),
      ));

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);
      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        return data;
      } else {
        throw Exception(data['message'] ?? 'Failed to upload avatar');
      }
    } catch (e) {
      throw Exception('Upload failed: $e');
    }
  }

  // Get user dashboard
  static Future<Map<String, dynamic>> getDashboard() async {
    final response = await http.get(
      Uri.parse('$baseUrl/users/dashboard'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to get dashboard');
    }
  }

  // Get user stats
  static Future<Map<String, dynamic>> getStats() async {
    final response = await http.get(
      Uri.parse('$baseUrl/users/stats'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to get stats');
    }
  }

  // Get user activity
  static Future<Map<String, dynamic>> getActivity({int page = 1}) async {
    final response = await http.get(
      Uri.parse('$baseUrl/users/activity?page=$page'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to get activity');
    }
  }

  // Daily check-in status
  static Future<Map<String, dynamic>> getCheckinStatus() async {
    final response = await http.get(
      Uri.parse('$baseUrl/users/daily-checkin'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to get check-in status');
    }
  }

  // Daily check-in
  static Future<Map<String, dynamic>> dailyCheckIn() async {
    final response = await http.post(
      Uri.parse('$baseUrl/users/daily-checkin'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Check-in failed');
    }
  }

  // Redeem promo code
  static Future<Map<String, dynamic>> redeemPromoCode(String code) async {
    final response = await http.post(
      Uri.parse('$baseUrl/users/redeem-code'),
      headers: _headers,
      body: jsonEncode({'code': code}),
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to redeem promo code');
    }
  }

  // Change password
  static Future<Map<String, dynamic>> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    final response = await http.put(
      Uri.parse('$baseUrl/users/password'),
      headers: _headers,
      body: jsonEncode({
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      }),
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to change password');
    }
  }

  // Delete account
  static Future<Map<String, dynamic>> deleteAccount() async {
    final response = await http.delete(
      Uri.parse('$baseUrl/users/account'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      clearAuthToken();
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to delete account');
    }
  }

  // ==================== MINING APIs ====================

  // Get mining status
  static Future<Map<String, dynamic>> getMiningStatus() async {
    final response = await http.get(
      Uri.parse('$baseUrl/mining/status'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to get mining status');
    }
  }

  // Start mining
  static Future<Map<String, dynamic>> startMining() async {
    final response = await http.post(
      Uri.parse('$baseUrl/mining/start'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to start mining');
    }
  }

  // Claim mining rewards
  static Future<Map<String, dynamic>> claimMining() async {
    final response = await http.post(
      Uri.parse('$baseUrl/mining/claim'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to claim rewards');
    }
  }

  // Cancel mining
  static Future<Map<String, dynamic>> cancelMining() async {
    final response = await http.post(
      Uri.parse('$baseUrl/mining/cancel'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to cancel mining');
    }
  }

  // Get mining history
  static Future<Map<String, dynamic>> getMiningHistory({int page = 1}) async {
    final response = await http.get(
      Uri.parse('$baseUrl/mining/history?page=$page'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to get mining history');
    }
  }

  // Get mining leaderboard
  static Future<Map<String, dynamic>> getMiningLeaderboard() async {
    final response = await http.get(
      Uri.parse('$baseUrl/mining/leaderboard'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to get leaderboard');
    }
  }

  // Boost mining
  static Future<Map<String, dynamic>> boostMining(
      {String boostType = 'speed'}) async {
    final response = await http.post(
      Uri.parse('$baseUrl/mining/boost'),
      headers: _headers,
      body: jsonEncode({'boostType': boostType}),
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to boost mining');
    }
  }

  // Get rewards breakdown
  static Future<Map<String, dynamic>> getRewardsBreakdown() async {
    final response = await http.get(
      Uri.parse('$baseUrl/mining/rewards'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to get rewards breakdown');
    }
  }

  // ==================== WALLET APIs ====================

  // Get wallet (all wallets combined)
  static Future<Map<String, dynamic>> getWallet() async {
    final response = await http.get(
      Uri.parse('$baseUrl/wallet'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to get wallet');
    }
  }

  // Get mining wallet only
  static Future<Map<String, dynamic>> getMiningWallet() async {
    final response = await http.get(
      Uri.parse('$baseUrl/wallet/mining'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to get mining wallet');
    }
  }

  // Get purchase wallet only
  static Future<Map<String, dynamic>> getPurchaseWallet() async {
    final response = await http.get(
      Uri.parse('$baseUrl/wallet/purchase'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to get purchase wallet');
    }
  }

  // Get wallet summary
  static Future<Map<String, dynamic>> getWalletSummary() async {
    final response = await http.get(
      Uri.parse('$baseUrl/wallet/summary'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to get wallet summary');
    }
  }

  // Internal transfer between wallets
  static Future<Map<String, dynamic>> internalTransfer({
    required String fromWallet,
    required String toWallet,
    required double amount,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/wallet/internal-transfer'),
      headers: _headers,
      body: jsonEncode({
        'fromWallet': fromWallet,
        'toWallet': toWallet,
        'amount': amount,
      }),
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Transfer failed');
    }
  }

  // Update withdrawal address
  static Future<Map<String, dynamic>> updateWithdrawalAddress({
    required String network,
    required String address,
  }) async {
    final response = await http.put(
      Uri.parse('$baseUrl/wallet/withdrawal-address'),
      headers: _headers,
      body: jsonEncode({
        'network': network,
        'address': address,
      }),
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to update address');
    }
  }

  // Request withdrawal
  static Future<Map<String, dynamic>> requestWithdrawal({
    required double amount,
    required String network,
    required String address,
    String walletType = 'auto', // 'mining', 'purchase', or 'auto'
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/wallet/withdraw'),
      headers: _headers,
      body: jsonEncode({
        'amount': amount,
        'network': network,
        'address': address,
        'walletType': walletType,
      }),
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Withdrawal request failed');
    }
  }

  // Get transactions
  static Future<Map<String, dynamic>> getTransactions({
    int page = 1,
    String? type,
    String? status,
  }) async {
    String url = '$baseUrl/wallet/transactions?page=$page';
    if (type != null) url += '&type=$type';
    if (status != null) url += '&status=$status';

    final response = await http.get(
      Uri.parse(url),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to get transactions');
    }
  }

  // Get single transaction
  static Future<Map<String, dynamic>> getTransaction(String id) async {
    final response = await http.get(
      Uri.parse('$baseUrl/wallet/transactions/$id'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to get transaction');
    }
  }

  // ==================== COIN APIs ====================

  // Get coin packages
  static Future<Map<String, dynamic>> getCoinPackages() async {
    final response = await http.get(
      Uri.parse('$baseUrl/coins/packages'),
      headers: {'Content-Type': 'application/json'},
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to get coin packages');
    }
  }

  // Get coin rate
  static Future<Map<String, dynamic>> getCoinRate() async {
    final response = await http.get(
      Uri.parse('$baseUrl/coins/rate'),
      headers: {'Content-Type': 'application/json'},
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to get coin rate');
    }
  }

  // Get coin balance
  static Future<Map<String, dynamic>> getCoinBalance() async {
    final response = await http.get(
      Uri.parse('$baseUrl/coins/balance'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to get coin balance');
    }
  }

  // Purchase coins
  static Future<Map<String, dynamic>> purchaseCoins({
    required String packageId,
    required String paymentMethod,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/coins/purchase'),
      headers: _headers,
      body: jsonEncode({
        'packageId': packageId,
        'paymentMethod': paymentMethod,
      }),
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Purchase failed');
    }
  }

  // Submit payment proof
  static Future<Map<String, dynamic>> submitPaymentProof({
    required String transactionId,
    required File proofImage,
  }) async {
    final request = http.MultipartRequest(
      'POST',
      Uri.parse('$baseUrl/coins/purchase/$transactionId/proof'),
    );

    request.headers['Authorization'] = 'Bearer $_authToken';
    request.files.add(
        await http.MultipartFile.fromPath('paymentProof', proofImage.path));

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);
    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to submit payment proof');
    }
  }

  // Cancel purchase
  static Future<Map<String, dynamic>> cancelPurchase(
      String transactionId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/coins/purchase/$transactionId/cancel'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to cancel purchase');
    }
  }

  // Get purchase history
  static Future<Map<String, dynamic>> getPurchaseHistory({int page = 1}) async {
    final response = await http.get(
      Uri.parse('$baseUrl/coins/purchases?page=$page'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to get purchase history');
    }
  }

  // Transfer coins
  static Future<Map<String, dynamic>> transferCoins({
    required String recipientEmail,
    required double amount,
    String walletType = 'purchase', // 'mining' or 'purchase'
    String? note,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/coins/transfer'),
      headers: _headers,
      body: jsonEncode({
        'recipientEmail': recipientEmail,
        'amount': amount,
        'walletType': walletType,
        if (note != null) 'note': note,
      }),
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Transfer failed');
    }
  }

  // Get payment info (QR code, UPI ID, etc.)
  static Future<Map<String, dynamic>> getPaymentInfo() async {
    final response = await http.get(
      Uri.parse('$baseUrl/coins/payment-info'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to get payment info');
    }
  }

  // Submit UPI transaction ID for coin purchase
  static Future<Map<String, dynamic>> submitUpiTransaction({
    required String transactionId,
    required double amount,
    String? upiApp,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/coins/submit-transaction'),
      headers: _headers,
      body: jsonEncode({
        'transactionId': transactionId,
        'amount': amount,
        if (upiApp != null) 'upiApp': upiApp,
      }),
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to submit transaction');
    }
  }

  // ==================== REFERRAL APIs ====================

  // Get referrals
  static Future<Map<String, dynamic>> getReferrals() async {
    final response = await http.get(
      Uri.parse('$baseUrl/referrals'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to get referrals');
    }
  }

  // Get referral share link
  static Future<Map<String, dynamic>> getShareLink() async {
    final response = await http.get(
      Uri.parse('$baseUrl/referrals/share'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to get share link');
    }
  }

  // Get referral earnings
  static Future<Map<String, dynamic>> getReferralEarnings() async {
    final response = await http.get(
      Uri.parse('$baseUrl/referrals/earnings'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to get referral earnings');
    }
  }

  // Ping inactive referrals
  static Future<Map<String, dynamic>> pingInactiveReferrals() async {
    final response = await http.post(
      Uri.parse('$baseUrl/referrals/ping'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to ping referrals');
    }
  }

  // Validate referral code
  static Future<Map<String, dynamic>> validateReferralCode(String code) async {
    final response = await http.get(
      Uri.parse('$baseUrl/referrals/validate/$code'),
      headers: {'Content-Type': 'application/json'},
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Invalid referral code');
    }
  }

  // ==================== NOTIFICATION APIs ====================

  // Get notifications
  static Future<Map<String, dynamic>> getNotifications({int page = 1}) async {
    final response = await http.get(
      Uri.parse('$baseUrl/notifications?page=$page&limit=20'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to get notifications');
    }
  }

  // Get unread notification count
  static Future<Map<String, dynamic>> getUnreadNotificationCount() async {
    final response = await http.get(
      Uri.parse('$baseUrl/notifications/unread-count'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to get unread count');
    }
  }

  // Mark notification as read
  static Future<Map<String, dynamic>> markNotificationAsRead(String id) async {
    final response = await http.put(
      Uri.parse('$baseUrl/notifications/$id/read'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to mark as read');
    }
  }

  // Mark all notifications as read
  static Future<Map<String, dynamic>> markAllNotificationsAsRead() async {
    final response = await http.put(
      Uri.parse('$baseUrl/notifications/read-all'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to mark all as read');
    }
  }

  // Delete notification
  static Future<Map<String, dynamic>> deleteNotification(String id) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/notifications/$id'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to delete notification');
    }
  }

  // ==================== SETTINGS APIs ====================

  // Get app settings
  static Future<Map<String, dynamic>> getSettings() async {
    final response = await http.get(
      Uri.parse('$baseUrl/settings'),
      headers: {'Content-Type': 'application/json'},
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to get settings');
    }
  }

  // Get social links
  static Future<Map<String, dynamic>> getSocialLinks() async {
    final response = await http.get(
      Uri.parse('$baseUrl/settings/social'),
      headers: {'Content-Type': 'application/json'},
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to get social links');
    }
  }

  // Check maintenance mode
  static Future<Map<String, dynamic>> checkMaintenance() async {
    final response = await http.get(
      Uri.parse('$baseUrl/settings/maintenance'),
      headers: {'Content-Type': 'application/json'},
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to check maintenance');
    }
  }
}
