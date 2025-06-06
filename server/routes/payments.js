import express from 'express';
import { dbHelpers } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { validatePayment } from '../middleware/validation.js';
import { broadcast } from '../index.js';
import { processPayment } from '../services/payment.js';
import { sendNotification } from '../services/notification.js';

const router = express.Router();

// Get all payments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      status,
      method,
      client_id,
      property_id,
      page = 1,
      limit = 10
    } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (method) filters.method = method;
    if (client_id) filters.client_id = client_id;
    if (property_id) filters.property_id = property_id;

    const options = {
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      orderBy: 'created_at',
      ascending: false
    };

    const payments = await dbHelpers.read('payments', filters, options);

    // Enrich with client and property data
    const enrichedPayments = await Promise.all(
      payments.map(async (payment) => {
        const client = await dbHelpers.read('clients', { id: payment.client_id });
        let property = null;
        if (payment.property_id) {
          const properties = await dbHelpers.read('properties', { id: payment.property_id });
          property = properties[0] || null;
        }

        return {
          ...payment,
          client: client[0] || null,
          property
        };
      })
    );

    res.json({
      success: true,
      data: enrichedPayments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: payments.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
});

// Get single payment
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const payments = await dbHelpers.read('payments', { id: req.params.id });
    const payment = payments[0];

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Get related client and property data
    const client = await dbHelpers.read('clients', { id: payment.client_id });
    let property = null;
    if (payment.property_id) {
      const properties = await dbHelpers.read('properties', { id: payment.property_id });
      property = properties[0] || null;
    }

    res.json({
      success: true,
      data: {
        ...payment,
        client: client[0] || null,
        property
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment',
      error: error.message
    });
  }
});

// Create new payment
router.post('/', authenticateToken, validatePayment, async (req, res) => {
  try {
    // Generate transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const paymentData = {
      ...req.body,
      transaction_id: transactionId,
      status: 'pending'
    };

    const payment = await dbHelpers.create('payments', paymentData);

    // Process payment through payment gateway
    const paymentResult = await processPayment({
      amount: payment.amount,
      method: payment.method,
      transaction_id: payment.transaction_id,
      description: payment.description
    });

    // Update payment status based on processing result
    let updatedPayment = payment;
    if (paymentResult.success) {
      updatedPayment = await dbHelpers.update('payments', payment.id, {
        status: 'completed',
        ...paymentResult.data
      });
    } else {
      updatedPayment = await dbHelpers.update('payments', payment.id, {
        status: 'failed',
        error_message: paymentResult.error
      });
    }

    // Get client data for notification
    const client = await dbHelpers.read('clients', { id: payment.client_id });
    const clientData = client[0];

    // Send payment confirmation
    if (clientData && paymentResult.success) {
      await sendNotification({
        type: 'payment_completed',
        recipient: clientData.email,
        data: {
          client_name: clientData.name,
          amount: payment.amount,
          transaction_id: payment.transaction_id,
          payment_method: payment.method
        }
      });
    }

    // Broadcast real-time event
    broadcast({
      type: 'real-time-event',
      event: {
        id: Date.now().toString(),
        type: 'payment',
        timestamp: new Date().toISOString(),
        data: {
          message: `Payment ${paymentResult.success ? 'completed' : 'failed'}: ${payment.transaction_id}`,
          action: paymentResult.success ? 'payment_completed' : 'payment_failed',
          payment_id: payment.id,
          amount: payment.amount
        },
        severity: paymentResult.success ? 'info' : 'warning',
        source: 'payment_gateway'
      }
    });

    res.status(201).json({
      success: true,
      data: updatedPayment,
      message: paymentResult.success ? 'Payment processed successfully' : 'Payment processing failed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create payment',
      error: error.message
    });
  }
});

// Update payment status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const payment = await dbHelpers.update('payments', req.params.id, { status });

    // Get client data for notification
    const client = await dbHelpers.read('clients', { id: payment.client_id });
    const clientData = client[0];

    // Send status update notification
    if (clientData) {
      await sendNotification({
        type: 'payment_status_updated',
        recipient: clientData.email,
        data: {
          client_name: clientData.name,
          transaction_id: payment.transaction_id,
          new_status: status,
          amount: payment.amount
        }
      });
    }

    res.json({
      success: true,
      data: payment,
      message: 'Payment status updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
});

// Get payment analytics
router.get('/analytics/summary', authenticateToken, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const payments = await dbHelpers.read('payments', {});
    
    const analytics = {
      totalRevenue: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
      totalTransactions: payments.length,
      completedTransactions: payments.filter(p => p.status === 'completed').length,
      pendingTransactions: payments.filter(p => p.status === 'pending').length,
      failedTransactions: payments.filter(p => p.status === 'failed').length,
      averageTransactionValue: payments.length ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length : 0,
      methodBreakdown: {
        bank_transfer: payments.filter(p => p.method === 'bank_transfer').length,
        e_wallet: payments.filter(p => p.method === 'e_wallet').length,
        credit_card: payments.filter(p => p.method === 'credit_card').length,
        qris: payments.filter(p => p.method === 'qris').length
      }
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment analytics',
      error: error.message
    });
  }
});

export default router;