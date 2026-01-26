import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../utils/constants.dart';

class MiningHistoryScreen extends StatefulWidget {
  const MiningHistoryScreen({super.key});

  @override
  State<MiningHistoryScreen> createState() => _MiningHistoryScreenState();
}

class _MiningHistoryScreenState extends State<MiningHistoryScreen> {
  List<dynamic> _sessions = [];
  Map<String, dynamic>? _pagination;
  Map<String, dynamic>? _summary;
  bool _isLoading = true;
  bool _isLoadingMore = false;
  int _currentPage = 1;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _loadHistory();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      _loadMore();
    }
  }

  Future<void> _loadHistory() async {
    setState(() => _isLoading = true);
    try {
      final result = await ApiService.getMiningHistory(page: 1);
      setState(() {
        _sessions = result['sessions'] ?? [];
        _pagination = result['pagination'];
        _summary = result['summary'];
        _currentPage = 1;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      _showSnackBar('Error: $e', isError: true);
    }
  }

  Future<void> _loadMore() async {
    if (_isLoadingMore) return;
    if (_pagination == null) return;
    // Backend returns 'pages' not 'totalPages'
    if (_currentPage >=
        (_pagination!['pages'] ?? _pagination!['totalPages'] ?? 1)) return;

    setState(() => _isLoadingMore = true);
    try {
      final result = await ApiService.getMiningHistory(page: _currentPage + 1);
      setState(() {
        _sessions.addAll(result['sessions'] ?? []);
        _pagination = result['pagination'];
        _currentPage++;
        _isLoadingMore = false;
      });
    } catch (e) {
      setState(() => _isLoadingMore = false);
    }
  }

  void _showSnackBar(String message, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? AppColors.error : AppColors.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.cardDark,
        title:
            const Text('Mining History', style: TextStyle(color: Colors.white)),
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadHistory,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary))
          : RefreshIndicator(
              onRefresh: _loadHistory,
              color: AppColors.primary,
              child: _sessions.isEmpty
                  ? _buildEmptyState()
                  : Column(
                      children: [
                        // Stats Summary
                        _buildStatsSummary(),

                        // Sessions List
                        Expanded(
                          child: ListView.builder(
                            controller: _scrollController,
                            padding: const EdgeInsets.all(16),
                            itemCount:
                                _sessions.length + (_isLoadingMore ? 1 : 0),
                            itemBuilder: (context, index) {
                              if (index == _sessions.length) {
                                return const Center(
                                  child: Padding(
                                    padding: EdgeInsets.all(16),
                                    child: CircularProgressIndicator(
                                        color: AppColors.primary),
                                  ),
                                );
                              }
                              return _buildSessionCard(_sessions[index]);
                            },
                          ),
                        ),
                      ],
                    ),
            ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.memory, color: AppColors.primary, size: 40),
          ),
          const SizedBox(height: 16),
          const Text(
            'No Mining History',
            style: TextStyle(
                color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          const Text(
            'Start mining to see your history here',
            style: TextStyle(color: Colors.grey),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsSummary() {
    // Use summary from backend API response
    final totalSessions =
        _summary?['totalSessions'] ?? _pagination?['total'] ?? _sessions.length;
    final totalMined = (_summary?['totalCoins'] ??
            _sessions.fold<double>(0,
                (sum, s) => sum + ((s['coinsEarned'] ?? 0) as num).toDouble()))
        .toDouble();

    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primary.withOpacity(0.2), AppColors.cardDark],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primary.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Expanded(
            child: _buildStatItem(
              'Total Sessions',
              totalSessions.toString(),
              Icons.history,
            ),
          ),
          Container(width: 1, height: 40, color: Colors.grey.withOpacity(0.3)),
          Expanded(
            child: _buildStatItem(
              'Total Mined',
              '${totalMined.toStringAsFixed(2)} CM',
              Icons.currency_bitcoin,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: AppColors.primary, size: 24),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
      ],
    );
  }

  Widget _buildSessionCard(Map<String, dynamic> session) {
    final startTime =
        DateTime.tryParse(session['startTime'] ?? '') ?? DateTime.now();
    final endTime = session['endTime'] != null
        ? DateTime.tryParse(session['endTime'])
        : null;

    // For completed sessions use coinsEarned, for active use expectedCoins
    final status = session['status'] ?? 'completed';
    final coins = status == 'active' ||
            status == 'completed' &&
                (session['coinsEarned'] == null || session['coinsEarned'] == 0)
        ? ((session['expectedCoins'] ?? session['coinsEarned'] ?? 0) as num)
            .toDouble()
        : ((session['coinsEarned'] ?? 0) as num).toDouble();

    // Calculate duration from startTime and endTime (in minutes)
    int duration = 0;
    if (endTime != null) {
      duration = endTime.difference(startTime).inMinutes;
    } else if (session['duration'] != null) {
      duration = session['duration'] as int;
    } else {
      // For active sessions, calculate from now
      duration = DateTime.now().difference(startTime).inMinutes;
    }

    Color statusColor;
    IconData statusIcon;
    switch (status.toLowerCase()) {
      case 'active':
        statusColor = AppColors.warning;
        statusIcon = Icons.play_circle;
        break;
      case 'completed':
        statusColor = AppColors.success;
        statusIcon = Icons.check_circle;
        break;
      case 'claimed':
        statusColor = AppColors.primary;
        statusIcon = Icons.verified;
        break;
      default:
        statusColor = Colors.grey;
        statusIcon = Icons.circle;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: statusColor.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 45,
                height: 45,
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(Icons.memory, color: statusColor, size: 24),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      DateFormat('MMM dd, yyyy').format(startTime),
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      DateFormat('hh:mm a').format(startTime),
                      style: const TextStyle(color: Colors.grey, fontSize: 12),
                    ),
                  ],
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(statusIcon, color: statusColor, size: 14),
                    const SizedBox(width: 4),
                    Text(
                      status.toUpperCase(),
                      style: TextStyle(
                          color: statusColor,
                          fontSize: 11,
                          fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(height: 1, color: Colors.grey.withOpacity(0.2)),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _buildDetailItem('Duration', _formatDuration(duration)),
              ),
              Expanded(
                child: _buildDetailItem(
                    status == 'active' ? 'Expected' : 'Earned',
                    '+${coins.toStringAsFixed(2)} CM'),
              ),
              Expanded(
                child: _buildDetailItem('Rate',
                    '${((session['totalRate'] ?? 0) as num).toStringAsFixed(2)}/hr'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDetailItem(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 11)),
        const SizedBox(height: 4),
        Text(
          value,
          style:
              const TextStyle(color: Colors.white, fontWeight: FontWeight.w500),
        ),
      ],
    );
  }

  String _formatDuration(int minutes) {
    if (minutes < 60) return '$minutes min';
    final hours = minutes ~/ 60;
    final mins = minutes % 60;
    if (mins == 0) return '$hours hr';
    return '$hours hr $mins min';
  }
}
