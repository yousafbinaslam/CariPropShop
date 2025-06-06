// Mock payment gateway integration
// In production, integrate with actual payment providers

export const processPayment = async ({ amount, method, transaction_id, description }) => {
  try {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock payment gateway responses
    const mockResponses = {
      bank_transfer: {
        success: true,
        data: {
          gateway_transaction_id: `BT-${Date.now()}`,
          gateway_status: 'completed',
          gateway_response: 'Payment successful'
        }
      },
      e_wallet: {
        success: Math.random() > 0.1, // 90% success rate
        data: {
          gateway_transaction_id: `EW-${Date.now()}`,
          gateway_status: 'completed',
          gateway_response: 'Payment successful'
        },
        error: 'Insufficient balance'
      },
      credit_card: {
        success: Math.random() > 0.05, // 95% success rate
        data: {
          gateway_transaction_id: `CC-${Date.now()}`,
          gateway_status: 'completed',
          gateway_response: 'Payment successful'
        },
        error: 'Card declined'
      },
      qris: {
        success: Math.random() > 0.15, // 85% success rate
        data: {
          gateway_transaction_id: `QR-${Date.now()}`,
          gateway_status: 'completed',
          gateway_response: 'Payment successful'
        },
        error: 'QR code expired'
      }
    };

    const response = mockResponses[method] || mockResponses.bank_transfer;
    
    if (response.success) {
      return {
        success: true,
        data: response.data
      };
    } else {
      return {
        success: false,
        error: response.error || 'Payment failed'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const refundPayment = async ({ transaction_id, amount, reason }) => {
  try {
    // Simulate refund processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock refund success (90% success rate)
    const success = Math.random() > 0.1;

    if (success) {
      return {
        success: true,
        data: {
          refund_id: `REF-${Date.now()}`,
          refund_status: 'completed',
          refund_amount: amount,
          refund_reason: reason
        }
      };
    } else {
      return {
        success: false,
        error: 'Refund processing failed'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const getPaymentMethods = () => {
  return [
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      description: 'Transfer to our bank account',
      icon: 'building2',
      fee: 0,
      processing_time: '1-2 business days'
    },
    {
      id: 'e_wallet',
      name: 'E-Wallet',
      description: 'GoPay, OVO, DANA',
      icon: 'wallet',
      fee: 0.005, // 0.5%
      processing_time: 'Instant'
    },
    {
      id: 'credit_card',
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard, JCB',
      icon: 'credit-card',
      fee: 0.029, // 2.9%
      processing_time: 'Instant'
    },
    {
      id: 'qris',
      name: 'QRIS',
      description: 'Scan QR code to pay',
      icon: 'qr-code',
      fee: 0.007, // 0.7%
      processing_time: 'Instant'
    }
  ];
};