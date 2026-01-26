import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';
import 'socket_service.dart';

class AuthService {
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';

  // Web Client ID for backend verification (required for idToken)
  static const String _webClientId =
      '664432051190-t3h7lqq6ul4dk8rjtfi3v8adgenoet49.apps.googleusercontent.com';

  // Google Sign In instance - using standard constructor
  late final GoogleSignIn _googleSignIn;

  AuthService() {
    _googleSignIn = GoogleSignIn.standard(
      scopes: ['email', 'profile'],
      serverClientId: _webClientId,
    );
  }

  // Check if user is logged in
  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_tokenKey);
    if (token != null && token.isNotEmpty) {
      ApiService.setAuthToken(token);
      return true;
    }
    return false;
  }

  // Get stored user data
  Future<Map<String, dynamic>?> getStoredUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString(_userKey);
    if (userData != null) {
      return Map<String, dynamic>.from(
        Map.castFrom(Uri.splitQueryString(userData).map(
          (key, value) => MapEntry(key, value),
        )),
      );
    }
    return null;
  }

  // Sign in with Google
  Future<AuthResult> signInWithGoogle({String? referralCode}) async {
    try {
      // Step 1: Trigger Google Sign In flow
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();

      if (googleUser == null) {
        // User cancelled the sign-in
        return AuthResult(
          success: false,
          message: 'Sign in cancelled',
        );
      }

      // Step 2: Get authentication details
      final GoogleSignInAuthentication googleAuth =
          await googleUser.authentication;

      // Step 3: Get the idToken
      final String? idToken = googleAuth.idToken;

      if (idToken == null) {
        return AuthResult(
          success: false,
          message: 'Failed to get authentication token from Google',
        );
      }

      // Step 4: Send idToken to backend
      final response = await ApiService.googleSignIn(
        idToken: idToken,
        referralCode: referralCode,
      );

      // Step 5: Save token and user data locally
      await _saveAuthData(response['token'], response['user']);

      return AuthResult(
        success: true,
        message: response['message'],
        isNewUser: response['isNewUser'] ?? false,
        user: response['user'],
        token: response['token'],
      );
    } catch (e) {
      debugPrint('Google Sign-In Error: $e');
      return AuthResult(
        success: false,
        message: e.toString().replaceAll('Exception: ', ''),
      );
    }
  }

  // Save auth data locally
  Future<void> _saveAuthData(String token, Map<String, dynamic> user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setString(_userKey, user.toString());
    ApiService.setAuthToken(token);
  }

  // Sign out
  Future<void> signOut() async {
    try {
      // Disconnect and reset socket to clear any cached user data
      SocketService.instance.reset();

      // Sign out from Google
      await _googleSignIn.signOut();

      // Sign out from backend
      await ApiService.logout();
    } finally {
      // Clear local storage
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_tokenKey);
      await prefs.remove(_userKey);
      ApiService.clearAuthToken();
    }
  }

  // Check if Google account is signed in
  Future<bool> isGoogleSignedIn() async {
    return await _googleSignIn.isSignedIn();
  }

  // Get current Google user
  GoogleSignInAccount? getCurrentGoogleUser() {
    return _googleSignIn.currentUser;
  }
}

// Auth Result class
class AuthResult {
  final bool success;
  final String message;
  final bool isNewUser;
  final Map<String, dynamic>? user;
  final String? token;

  AuthResult({
    required this.success,
    required this.message,
    this.isNewUser = false,
    this.user,
    this.token,
  });
}
