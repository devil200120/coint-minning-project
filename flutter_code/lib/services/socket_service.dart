import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:shared_preferences/shared_preferences.dart';

class MiningData {
  final String status; // 'idle', 'mining', 'complete'
  final double coinsEarned;
  final int timeRemaining; // seconds
  final double progress;
  final Map<String, dynamic>? currentSession;

  MiningData({
    required this.status,
    required this.coinsEarned,
    required this.timeRemaining,
    required this.progress,
    this.currentSession,
  });

  factory MiningData.fromJson(Map<String, dynamic> json) {
    return MiningData(
      status: json['status'] ?? 'idle',
      coinsEarned: (json['coinsEarned'] ?? 0).toDouble(),
      timeRemaining: json['timeRemaining'] ?? 0,
      progress: (json['progress'] ?? 0).toDouble(),
      currentSession: json['currentSession'],
    );
  }

  factory MiningData.idle() {
    return MiningData(
      status: 'idle',
      coinsEarned: 0,
      timeRemaining: 0,
      progress: 0,
    );
  }
}

class SocketService {
  static SocketService? _instance;
  static SocketService get instance => _instance ??= SocketService._();

  IO.Socket? _socket;
  bool _isConnected = false;
  bool _isAuthenticated = false;
  String? _currentUserId; // Track current user to detect account switches

  // Stream controllers for broadcasting updates
  StreamController<MiningData> _miningUpdateController =
      StreamController<MiningData>.broadcast();
  StreamController<bool> _connectionController =
      StreamController<bool>.broadcast();
  StreamController<Map<String, dynamic>> _walletUpdateController =
      StreamController<Map<String, dynamic>>.broadcast();

  Stream<MiningData> get miningUpdates => _miningUpdateController.stream;
  Stream<bool> get connectionStatus => _connectionController.stream;
  Stream<Map<String, dynamic>> get walletUpdates =>
      _walletUpdateController.stream;

  bool get isConnected => _isConnected;
  bool get isAuthenticated => _isAuthenticated;

  SocketService._();

  /// Initialize and connect to socket server
  Future<void> connect() async {
    if (_socket != null && _isConnected) {
      print('Socket already connected');
      return;
    }

    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');

    if (token == null) {
      print('No auth token, cannot connect socket');
      return;
    }

    // Server URL - same as API but without /api
    const serverUrl = 'http://72.62.167.180:5002';

    _socket = IO.io(
      serverUrl,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .enableReconnection()
          .setReconnectionAttempts(10)
          .setReconnectionDelay(1000)
          .build(),
    );

    _setupEventListeners(token);
    _socket!.connect();
  }

  void _setupEventListeners(String token) {
    _socket!.onConnect((_) {
      print('Socket connected');
      _isConnected = true;
      _connectionController.add(true);

      // Authenticate with token
      _socket!.emit('authenticate', token);
    });

    _socket!.onDisconnect((_) {
      print('Socket disconnected');
      _isConnected = false;
      _isAuthenticated = false;
      _connectionController.add(false);
    });

    _socket!.onConnectError((error) {
      print('Socket connection error: $error');
      _isConnected = false;
      _connectionController.add(false);
    });

    _socket!.onError((error) {
      print('Socket error: $error');
    });

    // Authentication response
    _socket!.on('auth-error', (data) {
      print('Socket auth error: $data');
      _isAuthenticated = false;
    });

    // Initial mining status after auth
    _socket!.on('mining-status', (data) {
      print('Received mining status: $data');
      _isAuthenticated = true;
      if (data != null) {
        final miningData = MiningData.fromJson(Map<String, dynamic>.from(data));
        _miningUpdateController.add(miningData);
      }
    });

    // Real-time mining updates (every second)
    _socket!.on('mining-update', (data) {
      if (data != null) {
        final miningData = MiningData.fromJson(Map<String, dynamic>.from(data));
        _miningUpdateController.add(miningData);
      }
    });

    // Mining complete event
    _socket!.on('mining-complete', (data) {
      print('Mining complete!');
      if (data != null) {
        final miningData = MiningData.fromJson(Map<String, dynamic>.from(data));
        _miningUpdateController.add(miningData);
      }
    });

    // Wallet update event (for when coins are claimed or spent)
    _socket!.on('wallet-update', (data) {
      print('Wallet updated: $data');
      if (data != null) {
        _walletUpdateController.add(Map<String, dynamic>.from(data));
      }
    });
  }

  /// Request current mining status
  void requestMiningStatus() {
    if (_isConnected && _isAuthenticated) {
      _socket!.emit('get-mining-status');
    }
  }

  /// Disconnect from socket server and clear all cached data
  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _isConnected = false;
    _isAuthenticated = false;
    _currentUserId = null;
    _connectionController.add(false);

    // Send idle status to clear any cached mining data in listeners
    _miningUpdateController.add(MiningData.idle());
  }

  /// Full reset - call this on logout to clear everything
  void reset() {
    print('SocketService: Full reset for logout');
    disconnect();

    // Close old controllers and create new ones to clear all listeners' cached data
    _miningUpdateController.close();
    _connectionController.close();
    _walletUpdateController.close();

    // Create fresh controllers
    _miningUpdateController = StreamController<MiningData>.broadcast();
    _connectionController = StreamController<bool>.broadcast();
    _walletUpdateController =
        StreamController<Map<String, dynamic>>.broadcast();
  }

  /// Reconnect with new token (after login)
  Future<void> reconnect() async {
    print('SocketService: Reconnecting with new token');
    disconnect();
    await Future.delayed(const Duration(milliseconds: 500));
    await connect();
  }

  /// Dispose resources
  void dispose() {
    disconnect();
    _miningUpdateController.close();
    _connectionController.close();
    _walletUpdateController.close();
    _instance = null;
  }
}
