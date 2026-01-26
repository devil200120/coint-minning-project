import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:math' as math;
import 'dart:async';
import '../services/auth_service.dart';
import '../services/api_service.dart';
import '../services/socket_service.dart';
import '../utils/constants.dart';
import 'login_screen.dart';
import 'wallet_screen.dart';
import 'referral_screen.dart';
import 'profile_screen.dart';
import 'coin_purchase_screen.dart';
import 'leaderboard_screen.dart';
import 'notifications_screen.dart';
import 'transaction_history_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with TickerProviderStateMixin {
  final AuthService _authService = AuthService();
  Map<String, dynamic>? _dashboardData;
  Map<String, dynamic>? _miningStatus;
  bool _isLoading = true;
  int _currentIndex = 0;

  // Socket service for real-time updates
  final SocketService _socketService = SocketService.instance;
  StreamSubscription<MiningData>? _miningSubscription;
  StreamSubscription<bool>? _connectionSubscription;

  // Real-time mining data from socket
  MiningData? _realTimeMiningData;
  bool _isSocketConnected = false;

  // Animation controllers
  late AnimationController _pulseController;
  late AnimationController _rotationController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _initAnimations();
    _initSocket();
    _loadData();
  }

  void _initSocket() {
    // Clear any stale data and connect fresh
    _realTimeMiningData = null;

    // Connect to socket (will get fresh data for current user)
    _socketService.connect();

    // Listen for mining updates
    _miningSubscription = _socketService.miningUpdates.listen((data) {
      if (mounted) {
        setState(() {
          _realTimeMiningData = data;
        });
      }
    });

    // Listen for connection status
    _connectionSubscription =
        _socketService.connectionStatus.listen((connected) {
      if (mounted) {
        setState(() {
          _isSocketConnected = connected;
        });
      }
    });
  }

  void _initAnimations() {
    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.1).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _rotationController = AnimationController(
      duration: const Duration(seconds: 10),
      vsync: this,
    )..repeat();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _rotationController.dispose();
    _miningSubscription?.cancel();
    _connectionSubscription?.cancel();
    super.dispose();
  }

  Future<void> _loadData({bool showLoading = true}) async {
    if (showLoading) {
      setState(() => _isLoading = true);
    }
    try {
      final dashboard = await ApiService.getDashboard();
      final mining = await ApiService.getMiningStatus();
      if (mounted) {
        setState(() {
          // Dashboard data is nested inside 'dashboard' key from API response
          _dashboardData = dashboard['dashboard'] ?? dashboard;
          _miningStatus = mining;
          _isLoading = false;
        });
      }
      // Request socket update
      _socketService.requestMiningStatus();
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        _showSnackBar('Error loading data: $e', isError: true);
      }
    }
  }

  // Silent background refresh - no loading indicator
  Future<void> _refreshInBackground() async {
    try {
      final dashboard = await ApiService.getDashboard();
      final mining = await ApiService.getMiningStatus();
      if (mounted) {
        setState(() {
          _dashboardData = dashboard['dashboard'] ?? dashboard;
          _miningStatus = mining;
        });
      }
      _socketService.requestMiningStatus();
    } catch (e) {
      // Silent fail for background refresh
      print('Background refresh error: $e');
    }
  }

  void _showSnackBar(String message,
      {bool isError = false, bool isSuccess = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              isError
                  ? Icons.error
                  : isSuccess
                      ? Icons.check_circle
                      : Icons.info,
              color: Colors.white,
            ),
            const SizedBox(width: 12),
            Expanded(child: Text(message)),
          ],
        ),
        backgroundColor: isError
            ? const Color(0xFFFF4757)
            : isSuccess
                ? const Color(0xFF00D4AA)
                : const Color(0xFF3D5AFE),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  Future<void> _handleMining() async {
    HapticFeedback.mediumImpact();

    // Use socket data first (real-time), then fallback to API data
    final socketStatus = _realTimeMiningData?.status;
    final apiStatus = _miningStatus?['status'] ?? 'idle';
    final status = socketStatus ?? apiStatus;

    print(
        'Mining action - Socket status: $socketStatus, API status: $apiStatus, Using: $status');

    if (status == 'idle') {
      // Optimistic UI - immediately show mining state
      setState(() {
        _miningStatus = {...?_miningStatus, 'status': 'mining'};
        _realTimeMiningData = MiningData(
          status: 'mining',
          coinsEarned: 0,
          timeRemaining: 86400,
          progress: 0,
        );
      });

      try {
        await ApiService.startMining();
        _showSnackBar('Mining started! ⛏️', isSuccess: true);
        // Refresh in background without loading
        _refreshInBackground();
      } catch (e) {
        // Revert on error
        setState(() {
          _miningStatus = {...?_miningStatus, 'status': 'idle'};
          _realTimeMiningData = MiningData.idle();
        });
        _showSnackBar('Error: $e', isError: true);
      }
    } else if (status == 'complete') {
      // Optimistic UI - immediately show idle state with coins added
      final coinsEarned = _realTimeMiningData?.coinsEarned ?? 0;
      setState(() {
        _miningStatus = {...?_miningStatus, 'status': 'idle'};
        _realTimeMiningData = MiningData.idle();
      });

      try {
        final result = await ApiService.claimMining();
        _showSnackBar('🎉 +${coinsEarned.toStringAsFixed(2)} coins claimed!',
            isSuccess: true);
        // Refresh in background without loading
        _refreshInBackground();
      } catch (e) {
        // Revert on error
        setState(() {
          _miningStatus = {...?_miningStatus, 'status': 'complete'};
        });
        _showSnackBar('Error: $e', isError: true);
      }
    } else {
      _showSnackBar('Mining in progress...');
    }
  }

  Future<void> _handleStopMining() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1D1F33),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title:
            const Text('Stop Mining?', style: TextStyle(color: Colors.white)),
        content: const Text(
          'Are you sure you want to stop mining? You will lose any unclaimed progress.',
          style: TextStyle(color: Colors.grey),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFF4757),
            ),
            child: const Text('Stop', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      HapticFeedback.mediumImpact();

      // Optimistic UI - immediately show idle
      setState(() {
        _miningStatus = {...?_miningStatus, 'status': 'idle'};
        _realTimeMiningData = MiningData.idle();
      });

      try {
        await ApiService.cancelMining();
        _showSnackBar('Mining stopped', isSuccess: true);
        _refreshInBackground();
      } catch (e) {
        // Revert on error
        setState(() {
          _miningStatus = {...?_miningStatus, 'status': 'mining'};
        });
        _showSnackBar('Error: $e', isError: true);
      }
    }
  }

  Future<void> _handleBoostMining(String boostType) async {
    final boostName = boostType == 'speed'
        ? 'Speed Boost (1.5x rate)'
        : 'Time Boost (-4 hours)';
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1D1F33),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title:
            const Text('Boost Mining?', style: TextStyle(color: Colors.white)),
        content: Text(
          'Apply $boostName for 50 coins?',
          style: const TextStyle(color: Colors.grey),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFFD700),
            ),
            child: const Text('Boost!', style: TextStyle(color: Colors.black)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      HapticFeedback.mediumImpact();

      // Show immediate feedback
      _showSnackBar('⚡ Applying boost...', isSuccess: true);

      try {
        final result = await ApiService.boostMining(boostType: boostType);
        final boostMsg = boostType == 'speed'
            ? '🚀 Speed boosted 1.5x!'
            : '⏰ Time reduced by 4 hours!';
        _showSnackBar(boostMsg, isSuccess: true);
        _refreshInBackground();
      } catch (e) {
        _showSnackBar('Error: $e', isError: true);
      }
    }
  }

  Future<void> _handleDailyCheckIn() async {
    HapticFeedback.mediumImpact();

    // Optimistic UI - immediately show as checked in
    final currentStreak = _dashboardData?['checkin']?['streak'] ??
        _dashboardData?['user']?['dailyCheckIn']?['streak'] ??
        0;

    setState(() {
      if (_dashboardData != null) {
        _dashboardData!['checkin'] = {
          ...?_dashboardData!['checkin'],
          'hasCheckedIn': true,
          'streak': currentStreak + 1,
        };
      }
    });

    try {
      final result = await ApiService.dailyCheckIn();
      final bonus = result['bonus'] ?? 1;
      _showSnackBar('🔥 Day ${currentStreak + 1} streak! +$bonus coins',
          isSuccess: true);
      // Refresh in background
      _refreshInBackground();
    } catch (e) {
      // Revert on error
      setState(() {
        if (_dashboardData != null) {
          _dashboardData!['checkin'] = {
            ...?_dashboardData!['checkin'],
            'hasCheckedIn': false,
            'streak': currentStreak,
          };
        }
      });
      _showSnackBar('Error: $e', isError: true);
    }
  }

  Future<void> _handleLogout() async {
    final confirm = await showModalBottomSheet<bool>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Color(0xFF1D1F33),
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[600],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFFF4757).withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child:
                  const Icon(Icons.logout, color: Color(0xFFFF4757), size: 32),
            ),
            const SizedBox(height: 16),
            const Text(
              'Logout',
              style: TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Are you sure you want to logout?',
              style: TextStyle(color: Colors.grey, fontSize: 14),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: TextButton(
                    onPressed: () => Navigator.pop(context, false),
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: const BorderSide(color: Colors.grey),
                      ),
                    ),
                    child: const Text('Cancel',
                        style: TextStyle(color: Colors.grey)),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context, true),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFFF4757),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text('Logout',
                        style: TextStyle(color: Colors.white)),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );

    if (confirm == true) {
      await _authService.signOut();
      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const LoginScreen()),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: IndexedStack(
        index: _currentIndex,
        children: [
          _buildHomeContent(),
          WalletScreen(key: WalletScreen.globalKey),
          ReferralScreen(key: ReferralScreen.globalKey),
          ProfileScreen(key: ProfileScreen.globalKey),
        ],
      ),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  Widget _buildHomeContent() {
    return _isLoading
        ? _buildLoadingState()
        : RefreshIndicator(
            onRefresh: _loadData,
            color: AppColors.primary,
            backgroundColor: AppColors.cardDark,
            child: CustomScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              slivers: [
                _buildAppBar(),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        _buildMiningSection(),
                        const SizedBox(height: 20),
                        _buildQuickActions(),
                        const SizedBox(height: 20),
                        _buildStatsSection(),
                        const SizedBox(height: 20),
                        _buildDailyRewards(),
                        const SizedBox(height: 100),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          AnimatedBuilder(
            animation: _rotationController,
            builder: (context, child) {
              return Transform.rotate(
                angle: _rotationController.value * 2 * math.pi,
                child: Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: const LinearGradient(
                      colors: [Color(0xFFFFD700), Color(0xFFFF8C00)],
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFFFFD700).withOpacity(0.4),
                        blurRadius: 20,
                        spreadRadius: 5,
                      ),
                    ],
                  ),
                  child: const Icon(Icons.currency_bitcoin,
                      color: Colors.white, size: 40),
                ),
              );
            },
          ),
          const SizedBox(height: 24),
          const Text(
            'Loading...',
            style: TextStyle(color: Colors.white70, fontSize: 16),
          ),
        ],
      ),
    );
  }

  Widget _buildAppBar() {
    final user = _dashboardData?['user'];
    final name = user?['name'] ?? 'User';
    final avatar = user?['avatar'];

    return SliverAppBar(
      expandedHeight: 120,
      floating: true,
      pinned: true,
      backgroundColor: const Color(0xFF0A0E21),
      flexibleSpace: FlexibleSpaceBar(
        background: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFF1D1F33), Color(0xFF0A0E21)],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
          ),
        ),
      ),
      title: Row(
        children: [
          Container(
            width: 45,
            height: 45,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: const LinearGradient(
                colors: [Color(0xFFFFD700), Color(0xFFFF8C00)],
              ),
              border: Border.all(color: const Color(0xFFFFD700), width: 2),
            ),
            child: avatar != null && avatar.toString().isNotEmpty
                ? ClipOval(
                    child: Image.network(
                      avatar,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => const Icon(
                        Icons.person,
                        color: Colors.white,
                        size: 24,
                      ),
                    ),
                  )
                : Center(
                    child: Text(
                      name.substring(0, 1).toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                  ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'Welcome back,',
                  style: TextStyle(color: Colors.grey, fontSize: 12),
                ),
                Text(
                  name,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
      actions: [
        IconButton(
          onPressed: _loadData,
          icon: const Icon(Icons.refresh_rounded, color: Colors.white),
        ),
        IconButton(
          onPressed: () {
            Navigator.push(context,
                MaterialPageRoute(builder: (_) => const NotificationsScreen()));
          },
          icon: Stack(
            children: [
              const Icon(Icons.notifications_none_rounded, color: Colors.white),
              Positioned(
                right: 0,
                top: 0,
                child: Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: AppColors.error,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 8),
      ],
    );
  }

  Widget _buildBalanceCard() {
    // Use the wallets object from dashboard which has accurate wallet data
    final wallets = _dashboardData?['wallets'];
    final balance = wallets?['total']?['balance'] ??
        _dashboardData?['user']?['totalCoins'] ??
        0;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF2D2F45), Color(0xFF1D1F33)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: const Color(0xFFFFD700).withOpacity(0.3),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFFFD700).withOpacity(0.1),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Total Balance',
                style: TextStyle(color: Colors.grey, fontSize: 14),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF00D4AA).withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.trending_up, color: Color(0xFF00D4AA), size: 14),
                    SizedBox(width: 4),
                    Text(
                      '+12.5%',
                      style: TextStyle(color: Color(0xFF00D4AA), fontSize: 12),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              AnimatedBuilder(
                animation: _pulseAnimation,
                builder: (context, child) {
                  return Transform.scale(
                    scale: _pulseAnimation.value,
                    child: Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: const LinearGradient(
                          colors: [Color(0xFFFFD700), Color(0xFFFF8C00)],
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFFFFD700).withOpacity(0.5),
                            blurRadius: 15,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.currency_bitcoin,
                        color: Colors.white,
                        size: 28,
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _formatNumber(balance),
                      style: const TextStyle(
                        color: Color(0xFFFFD700),
                        fontSize: 36,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1,
                      ),
                    ),
                    const Text(
                      'CM Coins',
                      style: TextStyle(color: Colors.grey, fontSize: 14),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Container(height: 1, color: Colors.grey.withOpacity(0.2)),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildBalanceItem(
                'Mining',
                _formatNumber(_dashboardData?['wallets']?['mining']
                        ?['balance'] ??
                    _dashboardData?['stats']?['totalMined'] ??
                    0),
                Icons.memory,
              ),
              Container(
                  width: 1, height: 30, color: Colors.grey.withOpacity(0.2)),
              _buildBalanceItem(
                'Referral',
                _formatNumber(_dashboardData?['wallets']?['referral']
                        ?['balance'] ??
                    _dashboardData?['referrals']?['totalEarned'] ??
                    0),
                Icons.people,
              ),
              Container(
                  width: 1, height: 30, color: Colors.grey.withOpacity(0.2)),
              _buildBalanceItem(
                'Purchase',
                _formatNumber(
                    _dashboardData?['wallets']?['purchase']?['balance'] ?? 0),
                Icons.shopping_cart,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBalanceItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: const Color(0xFFFFD700), size: 20),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 11)),
      ],
    );
  }

  Widget _buildMiningSection() {
    // Use real-time socket data if available, otherwise fallback to API data
    final socketData = _realTimeMiningData;

    // Determine status from socket or API
    final status = socketData?.status ?? _miningStatus?['status'] ?? 'idle';
    final isActive = status == 'mining';
    final canClaim = status == 'complete';

    // Get real-time values from socket
    double progress = socketData?.progress ?? 0.0;
    double coinsEarned = socketData?.coinsEarned ?? 0.0;
    int timeRemaining = socketData?.timeRemaining ?? 0;

    // Fallback calculation if socket not connected
    if (socketData == null && _miningStatus != null) {
      final currentSession = _miningStatus?['currentSession'];
      if (isActive && currentSession != null) {
        final startTime = DateTime.tryParse(currentSession['startTime'] ?? '');
        final endTime = DateTime.tryParse(currentSession['endTime'] ?? '');
        final expectedCoins =
            ((currentSession['expectedCoins'] ?? 0) as num).toDouble();

        if (startTime != null && endTime != null) {
          final totalDuration = endTime.difference(startTime).inSeconds;
          final elapsed = DateTime.now().difference(startTime).inSeconds;
          progress = (elapsed / totalDuration * 100).clamp(0.0, 100.0);
          coinsEarned = (progress / 100) * expectedCoins;
          timeRemaining = (endTime.difference(DateTime.now()).inSeconds)
              .clamp(0, totalDuration);
        }
      } else if (canClaim && currentSession != null) {
        coinsEarned =
            ((currentSession['expectedCoins'] ?? 0) as num).toDouble();
        progress = 100;
      }
    }

    final nextRates = _miningStatus?['nextSessionRates'] ?? {};
    final coinsPerHour = ((nextRates['totalRate'] ?? 0.25) as num).toDouble();

    // Format time remaining
    final hours = (timeRemaining ~/ 3600);
    final minutes = ((timeRemaining % 3600) ~/ 60);
    final seconds = (timeRemaining % 60);
    final timeString =
        '${hours.toString().padLeft(2, '0')}:${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isActive
              ? [
                  const Color(0xFF00D4AA).withOpacity(0.2),
                  const Color(0xFF1D1F33)
                ]
              : [const Color(0xFF1D1F33), const Color(0xFF252A3D)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: isActive
              ? const Color(0xFF00D4AA).withOpacity(0.3)
              : Colors.transparent,
        ),
      ),
      child: Column(
        children: [
          // Connection status indicator
          if (_isSocketConnected) ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: Color(0xFF00D4AA),
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 6),
                const Text(
                  'LIVE',
                  style: TextStyle(
                    color: Color(0xFF00D4AA),
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
          ],
          // Header with Activity Balance when mining
          if (isActive || canClaim) ...[
            const Text(
              'Activity Balance',
              style: TextStyle(color: Colors.grey, fontSize: 14),
            ),
            const SizedBox(height: 8),
            // Coins earned counter (increases in real-time from server)
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              children: [
                Text(
                  coinsEarned.toStringAsFixed(0),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 48,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  '.${(coinsEarned % 1 * 10000).toInt().toString().padLeft(4, '0')}',
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Progress Speed: ${coinsPerHour.toStringAsFixed(2)}/hr',
              style: const TextStyle(color: Colors.grey, fontSize: 13),
            ),
            const SizedBox(height: 12),
            // Time remaining countdown
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.black26,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.access_time,
                    color: canClaim
                        ? const Color(0xFFFFD700)
                        : const Color(0xFF00D4AA),
                    size: 18,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    canClaim ? 'Ready to claim!' : timeString,
                    style: TextStyle(
                      color: canClaim
                          ? const Color(0xFFFFD700)
                          : const Color(0xFF00D4AA),
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
          ] else ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Mining Hub',
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.grey.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.circle, color: Colors.grey, size: 8),
                      SizedBox(width: 6),
                      Text('Idle',
                          style: TextStyle(color: Colors.grey, fontSize: 12)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 30),
          ],
          // Mining control buttons row
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (isActive && !canClaim) ...[
                // Stop button when mining
                GestureDetector(
                  onTap: _handleStopMining,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFF4757).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                          color: const Color(0xFFFF4757).withOpacity(0.3)),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.stop_circle,
                            color: Color(0xFFFF4757), size: 18),
                        SizedBox(width: 6),
                        Text('Stop',
                            style: TextStyle(
                                color: Color(0xFFFF4757), fontSize: 13)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 16),
              ],
              // Main mining button
              GestureDetector(
                onTap: _handleMining,
                child: AnimatedBuilder(
                  animation: _pulseAnimation,
                  builder: (context, child) {
                    return Transform.scale(
                      scale: isActive && !canClaim
                          ? 1.0
                          : _pulseAnimation.value * 0.95 + 0.05,
                      child: Container(
                        width: canClaim ? 120 : (isActive ? 100 : 130),
                        height: canClaim ? 120 : (isActive ? 100 : 130),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: LinearGradient(
                            colors: canClaim
                                ? [
                                    const Color(0xFFFFD700),
                                    const Color(0xFFFF8C00)
                                  ]
                                : isActive
                                    ? [
                                        const Color(0xFF00D4AA),
                                        const Color(0xFF00A388)
                                      ]
                                    : [
                                        const Color(0xFF3D5AFE),
                                        const Color(0xFF304FFE)
                                      ],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: (canClaim
                                      ? const Color(0xFFFFD700)
                                      : isActive
                                          ? const Color(0xFF00D4AA)
                                          : const Color(0xFF3D5AFE))
                                  .withOpacity(0.4),
                              blurRadius: 20,
                              spreadRadius: 5,
                            ),
                          ],
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              canClaim
                                  ? Icons.redeem
                                  : isActive
                                      ? Icons.memory
                                      : Icons.play_arrow_rounded,
                              color: Colors.white,
                              size: canClaim ? 40 : (isActive ? 32 : 40),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              canClaim
                                  ? 'CLAIM'
                                  : (isActive ? 'Mining' : 'START'),
                              style: TextStyle(
                                  color: Colors.white,
                                  fontSize: canClaim ? 16 : 14,
                                  fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
          // Boost buttons - only show when mining is active
          if (isActive && !canClaim) ...[
            const SizedBox(height: 24),
            const Text(
              '⚡ BOOST OPTIONS',
              style: TextStyle(
                color: Color(0xFFFFD700),
                fontSize: 12,
                fontWeight: FontWeight.bold,
                letterSpacing: 1,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Expanded(
                  child: _buildBoostButton(
                    'Speed 1.5x',
                    Icons.flash_on,
                    const Color(0xFFFF8C00),
                    () => _handleBoostMining('speed'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildBoostButton(
                    'Time -4hr',
                    Icons.timer_off,
                    const Color(0xFF3D5AFE),
                    () => _handleBoostMining('duration'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            const Text(
              'Cost: 50 coins per boost',
              style: TextStyle(color: Colors.grey, fontSize: 11),
            ),
          ],
          // Show mining rate when idle
          if (!isActive && !canClaim) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.05),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.speed, color: Color(0xFFFFD700), size: 18),
                  const SizedBox(width: 8),
                  Text(
                    'Mining Rate: ${coinsPerHour.toStringAsFixed(2)} CM/hr',
                    style: const TextStyle(color: Colors.white70, fontSize: 13),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildBoostButton(
      String label, IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [color.withOpacity(0.3), color.withOpacity(0.1)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.5)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 18),
            const SizedBox(width: 4),
            Flexible(
              child: Text(
                label,
                style: TextStyle(
                  color: color,
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActions() {
    return Row(
      children: [
        Expanded(
            child: _buildActionCard(
                'Buy Coins', Icons.shopping_cart, AppColors.primary, () {
          Navigator.push(context,
              MaterialPageRoute(builder: (_) => const CoinPurchaseScreen()));
        })),
        const SizedBox(width: 12),
        Expanded(
            child: _buildActionCard(
                'Leaderboard', Icons.leaderboard, AppColors.warning, () {
          Navigator.push(context,
              MaterialPageRoute(builder: (_) => const LeaderboardScreen()));
        })),
        const SizedBox(width: 12),
        Expanded(
            child: _buildActionCard('History', Icons.history, AppColors.success,
                () {
          Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (_) => const TransactionHistoryScreen()));
        })),
      ],
    );
  }

  Widget _buildActionCard(
      String title, IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          color: const Color(0xFF1D1F33),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                  color: color.withOpacity(0.15), shape: BoxShape.circle),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(height: 10),
            Text(title,
                style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsSection() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
          color: const Color(0xFF1D1F33),
          borderRadius: BorderRadius.circular(20)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Your Stats',
              style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold)),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                  child: _buildStatCard(
                      'Total Mined',
                      _formatNumber(_dashboardData?['wallets']?['mining']
                              ?['totalMined'] ??
                          _dashboardData?['user']?['totalMined'] ??
                          0),
                      Icons.memory,
                      const Color(0xFF00D4AA))),
              const SizedBox(width: 12),
              Expanded(
                  child: _buildStatCard(
                      'Referrals',
                      '${_dashboardData?['referrals']?['total'] ?? 0}',
                      Icons.people,
                      const Color(0xFFFF8C00))),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                  child: _buildStatCard(
                      'Check-in Streak',
                      '${_dashboardData?['checkin']?['streak'] ?? 0} days',
                      Icons.local_fire_department,
                      const Color(0xFFFF4757))),
              const SizedBox(width: 12),
              Expanded(
                  child: _buildStatCard(
                      'Mining Sessions',
                      '${_dashboardData?['user']?['level'] ?? 1}',
                      Icons.trending_up,
                      const Color(0xFF3D5AFE))),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(
      String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 12),
          Text(value,
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
        ],
      ),
    );
  }

  Widget _buildDailyRewards() {
    final hasCheckedIn = _dashboardData?['checkin']?['hasCheckedIn'] ??
        _dashboardData?['user']?['dailyCheckIn']?['hasCheckedInToday'] ??
        false;
    final streak = _dashboardData?['checkin']?['streak'] ??
        _dashboardData?['user']?['dailyCheckIn']?['streak'] ??
        0;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: hasCheckedIn
              ? [const Color(0xFF1D1F33), const Color(0xFF1D1F33)]
              : [
                  const Color(0xFFFFD700).withOpacity(0.15),
                  const Color(0xFF1D1F33)
                ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: hasCheckedIn
              ? const Color(0xFF00D4AA).withOpacity(0.3)
              : const Color(0xFFFFD700).withOpacity(0.3),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: hasCheckedIn
                    ? [const Color(0xFF00D4AA), const Color(0xFF00A388)]
                    : [const Color(0xFFFFD700), const Color(0xFFFF8C00)],
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(hasCheckedIn ? Icons.check_circle : Icons.card_giftcard,
                color: Colors.white, size: 30),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Daily Reward',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(
                  hasCheckedIn
                      ? 'Claimed! Streak: $streak days 🔥'
                      : 'Claim your daily bonus now!',
                  style: const TextStyle(color: Colors.grey, fontSize: 13),
                ),
              ],
            ),
          ),
          if (!hasCheckedIn)
            ElevatedButton(
              onPressed: _handleDailyCheckIn,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFFFD700),
                foregroundColor: Colors.black,
                padding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Claim',
                  style: TextStyle(fontWeight: FontWeight.bold)),
            )
          else
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF00D4AA).withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Row(
                children: [
                  Icon(Icons.check, color: Color(0xFF00D4AA), size: 18),
                  SizedBox(width: 4),
                  Text('Done',
                      style: TextStyle(
                          color: Color(0xFF00D4AA),
                          fontWeight: FontWeight.bold)),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildBottomNav() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1D1F33),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.3),
              blurRadius: 20,
              offset: const Offset(0, -5))
        ],
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(0, Icons.home_rounded, 'Home'),
              _buildNavItem(1, Icons.account_balance_wallet_rounded, 'Wallet'),
              _buildNavItem(2, Icons.people_rounded, 'Referral'),
              _buildNavItem(3, Icons.person_rounded, 'Profile'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label) {
    final isSelected = _currentIndex == index;
    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();

        // Refresh the target screen when switching tabs (silent refresh)
        if (_currentIndex != index) {
          switch (index) {
            case 1: // Wallet
              WalletScreen.globalKey.currentState?.refreshWallet();
              break;
            case 2: // Referral
              ReferralScreen.globalKey.currentState?.refreshReferrals();
              break;
            case 3: // Profile
              ProfileScreen.globalKey.currentState?.refreshProfile();
              break;
          }
        }

        setState(() => _currentIndex = index);
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary.withOpacity(0.15)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon,
                color: isSelected ? AppColors.primary : Colors.grey, size: 26),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? AppColors.primary : Colors.grey,
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatNumber(dynamic number) {
    if (number == null) return '0';
    final num = double.tryParse(number.toString()) ?? 0;
    if (num >= 1000000) return '${(num / 1000000).toStringAsFixed(2)}M';
    if (num >= 1000) return '${(num / 1000).toStringAsFixed(2)}K';
    return num.toStringAsFixed(2);
  }
}
