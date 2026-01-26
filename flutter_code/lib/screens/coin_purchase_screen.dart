import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/api_service.dart';
import '../utils/constants.dart';

class CoinPurchaseScreen extends StatefulWidget {
  const CoinPurchaseScreen({super.key});

  @override
  State<CoinPurchaseScreen> createState() => _CoinPurchaseScreenState();
}

class _CoinPurchaseScreenState extends State<CoinPurchaseScreen> {
  Map<String, dynamic>? _paymentInfo;
  bool _isLoading = true;
  final TextEditingController _amountController = TextEditingController();
  final TextEditingController _transactionIdController =
      TextEditingController();
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _loadPaymentInfo();
  }

  @override
  void dispose() {
    _amountController.dispose();
    _transactionIdController.dispose();
    super.dispose();
  }

  Future<void> _loadPaymentInfo() async {
    setState(() => _isLoading = true);
    try {
      final result = await ApiService.getPaymentInfo();
      setState(() {
        _paymentInfo = result['paymentInfo'];
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      _showSnackBar('Error: $e', isError: true);
    }
  }

  void _showSnackBar(String message,
      {bool isError = false, bool isSuccess = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError
            ? AppColors.error
            : isSuccess
                ? AppColors.success
                : AppColors.primary,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  Future<void> _submitTransaction() async {
    final amountText = _amountController.text.trim();
    final transactionId = _transactionIdController.text.trim();

    if (amountText.isEmpty) {
      _showSnackBar('Please enter amount', isError: true);
      return;
    }

    final amount = double.tryParse(amountText);
    if (amount == null || amount <= 0) {
      _showSnackBar('Please enter valid amount', isError: true);
      return;
    }

    if (transactionId.isEmpty) {
      _showSnackBar('Please enter UPI Transaction ID', isError: true);
      return;
    }

    if (transactionId.length < 6) {
      _showSnackBar('Invalid Transaction ID', isError: true);
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final result = await ApiService.submitUpiTransaction(
        transactionId: transactionId,
        amount: amount,
      );

      _showSnackBar(result['message'] ?? 'Transaction submitted!',
          isSuccess: true);
      _amountController.clear();
      _transactionIdController.clear();
      _showSuccessDialog(result);
    } catch (e) {
      _showSnackBar('Error: $e', isError: true);
    } finally {
      setState(() => _isSubmitting = false);
    }
  }

  void _showSuccessDialog(Map<String, dynamic> result) {
    final transaction = result['transaction'];
    final coins = transaction?['coins'] ?? 0;

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.cardDark,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.success.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_circle,
                  color: AppColors.success, size: 48),
            ),
            const SizedBox(height: 20),
            const Text('Transaction Submitted!',
                style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Text('You will receive $coins coins after admin verification.',
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.grey)),
            const SizedBox(height: 8),
            const Text('Usually verified within 24 hours',
                style: TextStyle(color: Colors.grey, fontSize: 12)),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.success,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('OK',
                    style: TextStyle(
                        color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final coinPricePerDollar = _paymentInfo?['coinPricePerDollar'] ?? 10;
    final upiId = _paymentInfo?['upiId'] ?? '';
    final qrCodeUrl = _paymentInfo?['qrCodeUrl'] ?? '';

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.cardDark,
        title: const Text('Buy Coins', style: TextStyle(color: Colors.white)),
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            tooltip: 'Purchase History',
            onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (_) => const PurchaseHistoryScreen())),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary))
          : RefreshIndicator(
              onRefresh: _loadPaymentInfo,
              color: AppColors.primary,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildCoinRateCard(coinPricePerDollar),
                    const SizedBox(height: 24),
                    _buildQrCodeSection(qrCodeUrl, upiId),
                    const SizedBox(height: 24),
                    _buildPaymentForm(coinPricePerDollar),
                    const SizedBox(height: 24),
                    _buildHowItWorks(),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildCoinRateCard(int coinPricePerDollar) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
              color: AppColors.primary.withOpacity(0.3),
              blurRadius: 20,
              offset: const Offset(0, 10))
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(16)),
            child: const Icon(Icons.currency_exchange,
                color: Colors.white, size: 40),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Exchange Rate',
                    style: TextStyle(color: Colors.white70, fontSize: 14)),
                const SizedBox(height: 4),
                Text('\$1 = $coinPricePerDollar CM',
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQrCodeSection(String qrCodeUrl, String upiId) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primary.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          const Text('Scan QR Code to Pay',
              style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Text('Pay using any UPI app',
              style: TextStyle(color: Colors.grey, fontSize: 13)),
          const SizedBox(height: 20),
          Container(
            width: 200,
            height: 200,
            decoration: BoxDecoration(
                color: Colors.white, borderRadius: BorderRadius.circular(16)),
            child: qrCodeUrl.isNotEmpty
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: Image.network(
                      qrCodeUrl,
                      fit: BoxFit.cover,
                      loadingBuilder: (context, child, loadingProgress) {
                        if (loadingProgress == null) return child;
                        return const Center(
                            child: CircularProgressIndicator(
                                color: AppColors.primary));
                      },
                      errorBuilder: (context, error, stackTrace) =>
                          const Center(
                        child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.qr_code, size: 80, color: Colors.grey),
                              SizedBox(height: 8),
                              Text('QR not set',
                                  style: TextStyle(color: Colors.grey)),
                            ]),
                      ),
                    ),
                  )
                : const Center(
                    child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.qr_code_2, size: 80, color: Colors.grey),
                          SizedBox(height: 8),
                          Text('QR Code', style: TextStyle(color: Colors.grey)),
                        ]),
                  ),
          ),
          const SizedBox(height: 20),
          if (upiId.isNotEmpty) ...[
            const Text('Or pay to UPI ID:',
                style: TextStyle(color: Colors.grey, fontSize: 13)),
            const SizedBox(height: 8),
            GestureDetector(
              onTap: () {
                Clipboard.setData(ClipboardData(text: upiId));
                _showSnackBar('UPI ID copied!', isSuccess: true);
              },
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: AppColors.cardLight,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.primary.withOpacity(0.5)),
                ),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  Text(upiId,
                      style: const TextStyle(
                          color: AppColors.primary,
                          fontSize: 16,
                          fontWeight: FontWeight.bold)),
                  const SizedBox(width: 8),
                  const Icon(Icons.copy, color: AppColors.primary, size: 18),
                ]),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildPaymentForm(int coinPricePerDollar) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
          color: AppColors.cardDark, borderRadius: BorderRadius.circular(20)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Enter Payment Details',
              style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold)),
          const SizedBox(height: 20),
          const Text('Amount (USD)',
              style: TextStyle(color: Colors.grey, fontSize: 13)),
          const SizedBox(height: 8),
          TextField(
            controller: _amountController,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            style: const TextStyle(color: Colors.white, fontSize: 18),
            decoration: InputDecoration(
              hintText: 'Enter amount (e.g., 10)',
              hintStyle: const TextStyle(color: Colors.grey),
              prefixIcon:
                  const Icon(Icons.attach_money, color: AppColors.primary),
              filled: true,
              fillColor: AppColors.cardLight,
              border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none),
              suffixText: 'USD',
              suffixStyle: const TextStyle(color: AppColors.primary),
            ),
            onChanged: (value) => setState(() {}),
          ),
          const SizedBox(height: 8),
          Builder(builder: (context) {
            final amount = double.tryParse(_amountController.text) ?? 0;
            final coins = (amount * coinPricePerDollar).toInt();
            return Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10)),
              child:
                  Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                const Icon(Icons.currency_bitcoin,
                    color: AppColors.primary, size: 20),
                const SizedBox(width: 8),
                Text('You will receive: $coins CM',
                    style: const TextStyle(
                        color: AppColors.primary, fontWeight: FontWeight.bold)),
              ]),
            );
          }),
          const SizedBox(height: 20),
          const Text('UPI Transaction ID',
              style: TextStyle(color: Colors.grey, fontSize: 13)),
          const SizedBox(height: 8),
          TextField(
            controller: _transactionIdController,
            style: const TextStyle(color: Colors.white, fontSize: 16),
            decoration: InputDecoration(
              hintText: 'Enter 12-digit UPI Ref No.',
              hintStyle: const TextStyle(color: Colors.grey),
              prefixIcon:
                  const Icon(Icons.receipt_long, color: AppColors.success),
              filled: true,
              fillColor: AppColors.cardLight,
              border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none),
            ),
          ),
          const SizedBox(height: 8),
          const Text('* Find Transaction ID in your UPI app payment history',
              style: TextStyle(color: Colors.grey, fontSize: 11)),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isSubmitting ? null : _submitTransaction,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.success,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              child: _isSubmitting
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2))
                  : const Text('Submit Transaction',
                      style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 16)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHowItWorks() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
          color: AppColors.cardDark, borderRadius: BorderRadius.circular(16)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(children: [
            Icon(Icons.info_outline, color: Colors.grey, size: 20),
            SizedBox(width: 8),
            Text('How it works',
                style: TextStyle(
                    color: Colors.white, fontWeight: FontWeight.w600)),
          ]),
          const SizedBox(height: 16),
          _buildStep('1', 'Scan QR code with any UPI app'),
          _buildStep('2', 'Pay the amount in USD'),
          _buildStep('3', 'Copy Transaction ID from UPI app'),
          _buildStep('4', 'Enter amount & Transaction ID above'),
          _buildStep('5', 'Coins credited after verification'),
        ],
      ),
    );
  }

  Widget _buildStep(String number, String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(children: [
        Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.15),
              borderRadius: BorderRadius.circular(8)),
          child: Center(
              child: Text(number,
                  style: const TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                      fontSize: 14))),
        ),
        const SizedBox(width: 12),
        Expanded(
            child: Text(text,
                style: const TextStyle(color: Colors.grey, fontSize: 13))),
      ]),
    );
  }
}

// Purchase History Screen
class PurchaseHistoryScreen extends StatefulWidget {
  const PurchaseHistoryScreen({super.key});

  @override
  State<PurchaseHistoryScreen> createState() => _PurchaseHistoryScreenState();
}

class _PurchaseHistoryScreenState extends State<PurchaseHistoryScreen> {
  List<dynamic> _purchases = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPurchases();
  }

  Future<void> _loadPurchases() async {
    setState(() => _isLoading = true);
    try {
      final result = await ApiService.getPurchaseHistory();
      setState(() {
        _purchases = result['purchases'] ?? [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.cardDark,
        title: const Text('Purchase History',
            style: TextStyle(color: Colors.white)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary))
          : _purchases.isEmpty
              ? const Center(
                  child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.shopping_cart_outlined,
                            color: Colors.grey, size: 64),
                        SizedBox(height: 16),
                        Text('No purchases yet',
                            style: TextStyle(color: Colors.grey, fontSize: 16)),
                      ]),
                )
              : RefreshIndicator(
                  onRefresh: _loadPurchases,
                  color: AppColors.primary,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _purchases.length,
                    itemBuilder: (context, index) =>
                        _buildPurchaseItem(_purchases[index]),
                  ),
                ),
    );
  }

  Widget _buildPurchaseItem(Map<String, dynamic> purchase) {
    final coins = (purchase['coins'] ?? 0).toDouble();
    final amount = (purchase['amount'] ?? 0).toDouble();
    final status = purchase['status'] ?? 'pending';
    final createdAt = purchase['createdAt'] ?? '';
    final upiTransactionId = purchase['metadata']?['upiTransactionId'] ?? '';

    Color statusColor;
    String statusText;
    switch (status) {
      case 'completed':
        statusColor = AppColors.success;
        statusText = 'COMPLETED';
        break;
      case 'pending':
        statusColor = AppColors.warning;
        statusText = 'PENDING';
        break;
      case 'processing':
        statusColor = const Color(0xFF3D5AFE);
        statusText = 'VERIFYING';
        break;
      default:
        statusColor = AppColors.error;
        statusText = 'REJECTED';
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
          color: AppColors.cardDark, borderRadius: BorderRadius.circular(12)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                  color: const Color(0xFF3D5AFE).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(10)),
              child: const Icon(Icons.shopping_cart,
                  color: Color(0xFF3D5AFE), size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('${coins.toStringAsFixed(0)} CM',
                        style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 16)),
                    Text('\$${amount.toStringAsFixed(2)}',
                        style:
                            const TextStyle(color: Colors.grey, fontSize: 13)),
                  ]),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(8)),
              child: Text(statusText,
                  style: TextStyle(
                      color: statusColor,
                      fontSize: 10,
                      fontWeight: FontWeight.bold)),
            ),
          ]),
          if (upiTransactionId.isNotEmpty) ...[
            const SizedBox(height: 12),
            Row(children: [
              const Icon(Icons.receipt, color: Colors.grey, size: 14),
              const SizedBox(width: 6),
              Text('TXN ID: $upiTransactionId',
                  style: TextStyle(color: Colors.grey[600], fontSize: 11)),
            ]),
          ],
          const SizedBox(height: 8),
          Text(_formatDate(createdAt),
              style: TextStyle(color: Colors.grey[600], fontSize: 11)),
        ],
      ),
    );
  }

  String _formatDate(String dateString) {
    if (dateString.isEmpty) return '';
    try {
      final date = DateTime.parse(dateString);
      return '${date.day}/${date.month}/${date.year} at ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return dateString;
    }
  }
}
