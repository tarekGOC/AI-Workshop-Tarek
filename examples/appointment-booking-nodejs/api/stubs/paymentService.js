// Stub payment service - logs to console and returns success

function processPayment(amount, cardDetails, description) {
  const transactionId = 'txn_' + Math.random().toString(36).substring(2, 15);
  console.log('=== PAYMENT STUB: Process Payment ===');
  console.log('Amount: $' + amount);
  console.log('Description:', description);
  console.log('Card ending:', cardDetails?.lastFour || '****');
  console.log('Transaction ID:', transactionId);
  console.log('Status: SUCCESS');
  console.log('=====================================');
  return {
    success: true,
    transactionId: transactionId,
    amount: amount,
    status: 'completed',
    processedAt: new Date().toISOString()
  };
}

function processRefund(transactionId, amount, reason) {
  const refundId = 'ref_' + Math.random().toString(36).substring(2, 15);
  console.log('=== PAYMENT STUB: Process Refund ===');
  console.log('Original Transaction:', transactionId);
  console.log('Refund Amount: $' + amount);
  console.log('Reason:', reason);
  console.log('Refund ID:', refundId);
  console.log('Status: SUCCESS');
  console.log('====================================');
  return {
    success: true,
    refundId: refundId,
    amount: amount,
    status: 'refunded',
    processedAt: new Date().toISOString()
  };
}

module.exports = { processPayment, processRefund };
