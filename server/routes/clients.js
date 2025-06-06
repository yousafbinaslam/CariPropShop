import express from 'express';
import { dbHelpers } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateClient } from '../middleware/validation.js';
import { broadcast } from '../index.js';

const router = express.Router();

// Get all clients
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = 10,
      search
    } = req.query;

    const filters = {};
    if (status) filters.status = status;

    const options = {
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      orderBy: 'created_at',
      ascending: false
    };

    let clients;
    if (search) {
      clients = await dbHelpers.search('clients', search, ['name', 'email', 'phone', 'location']);
    } else {
      clients = await dbHelpers.read('clients', filters, options);
    }

    res.json({
      success: true,
      data: clients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: clients.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clients',
      error: error.message
    });
  }
});

// Get single client
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const clients = await dbHelpers.read('clients', { id: req.params.id });
    const client = clients[0];

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Get client's appointments and payments
    const appointments = await dbHelpers.read('appointments', { client_id: req.params.id });
    const payments = await dbHelpers.read('payments', { client_id: req.params.id });

    res.json({
      success: true,
      data: {
        ...client,
        appointments,
        payments,
        totalAppointments: appointments.length,
        totalPayments: payments.reduce((sum, p) => sum + p.amount, 0)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client',
      error: error.message
    });
  }
});

// Create new client
router.post('/', authenticateToken, validateClient, async (req, res) => {
  try {
    const client = await dbHelpers.create('clients', req.body);

    // Broadcast real-time event
    broadcast({
      type: 'real-time-event',
      event: {
        id: Date.now().toString(),
        type: 'client',
        timestamp: new Date().toISOString(),
        data: {
          message: `New client registered: ${client.name}`,
          action: 'client_created',
          client_id: client.id
        },
        severity: 'info',
        source: 'admin'
      }
    });

    res.status(201).json({
      success: true,
      data: client,
      message: 'Client created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create client',
      error: error.message
    });
  }
});

// Update client
router.put('/:id', authenticateToken, validateClient, async (req, res) => {
  try {
    const client = await dbHelpers.update('clients', req.params.id, req.body);

    res.json({
      success: true,
      data: client,
      message: 'Client updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update client',
      error: error.message
    });
  }
});

// Delete client
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await dbHelpers.delete('clients', req.params.id);

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete client',
      error: error.message
    });
  }
});

// Get client analytics
router.get('/:id/analytics', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointments = await dbHelpers.read('appointments', { client_id: id });
    const payments = await dbHelpers.read('payments', { client_id: id });

    const analytics = {
      totalAppointments: appointments.length,
      completedAppointments: appointments.filter(a => a.status === 'completed').length,
      totalPayments: payments.reduce((sum, p) => sum + p.amount, 0),
      completedPayments: payments.filter(p => p.status === 'completed').length,
      averagePayment: payments.length ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length : 0,
      lastActivity: appointments.length ? appointments[0].created_at : null
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client analytics',
      error: error.message
    });
  }
});

export default router;