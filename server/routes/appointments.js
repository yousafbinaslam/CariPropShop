import express from 'express';
import { dbHelpers } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateAppointment } from '../middleware/validation.js';
import { broadcast } from '../index.js';
import { sendNotification } from '../services/notification.js';

const router = express.Router();

// Get all appointments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      status,
      type,
      date,
      client_id,
      property_id,
      page = 1,
      limit = 10
    } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (type) filters.type = type;
    if (date) filters.date = date;
    if (client_id) filters.client_id = client_id;
    if (property_id) filters.property_id = property_id;

    const options = {
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      orderBy: 'date',
      ascending: true
    };

    const appointments = await dbHelpers.read('appointments', filters, options);

    // Enrich with client and property data
    const enrichedAppointments = await Promise.all(
      appointments.map(async (appointment) => {
        const client = await dbHelpers.read('clients', { id: appointment.client_id });
        let property = null;
        if (appointment.property_id) {
          const properties = await dbHelpers.read('properties', { id: appointment.property_id });
          property = properties[0] || null;
        }

        return {
          ...appointment,
          client: client[0] || null,
          property
        };
      })
    );

    res.json({
      success: true,
      data: enrichedAppointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: appointments.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
});

// Get single appointment
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const appointments = await dbHelpers.read('appointments', { id: req.params.id });
    const appointment = appointments[0];

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Get related client and property data
    const client = await dbHelpers.read('clients', { id: appointment.client_id });
    let property = null;
    if (appointment.property_id) {
      const properties = await dbHelpers.read('properties', { id: appointment.property_id });
      property = properties[0] || null;
    }

    res.json({
      success: true,
      data: {
        ...appointment,
        client: client[0] || null,
        property
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment',
      error: error.message
    });
  }
});

// Create new appointment
router.post('/', authenticateToken, validateAppointment, async (req, res) => {
  try {
    const appointment = await dbHelpers.create('appointments', req.body);

    // Get client data for notification
    const client = await dbHelpers.read('clients', { id: appointment.client_id });
    const clientData = client[0];

    // Send notification
    if (clientData) {
      await sendNotification({
        type: 'appointment_created',
        recipient: clientData.email,
        data: {
          client_name: clientData.name,
          appointment_date: appointment.date,
          appointment_time: appointment.time,
          appointment_type: appointment.type
        }
      });
    }

    // Broadcast real-time event
    broadcast({
      type: 'real-time-event',
      event: {
        id: Date.now().toString(),
        type: 'appointment',
        timestamp: new Date().toISOString(),
        data: {
          message: `New appointment scheduled for ${appointment.date}`,
          action: 'appointment_created',
          appointment_id: appointment.id
        },
        severity: 'info',
        source: 'admin'
      }
    });

    res.status(201).json({
      success: true,
      data: appointment,
      message: 'Appointment created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create appointment',
      error: error.message
    });
  }
});

// Update appointment status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const appointment = await dbHelpers.update('appointments', req.params.id, { status });

    // Get client data for notification
    const client = await dbHelpers.read('clients', { id: appointment.client_id });
    const clientData = client[0];

    // Send status update notification
    if (clientData) {
      await sendNotification({
        type: 'appointment_status_updated',
        recipient: clientData.email,
        data: {
          client_name: clientData.name,
          appointment_date: appointment.date,
          appointment_time: appointment.time,
          new_status: status
        }
      });
    }

    // Broadcast real-time event
    broadcast({
      type: 'real-time-event',
      event: {
        id: Date.now().toString(),
        type: 'appointment',
        timestamp: new Date().toISOString(),
        data: {
          message: `Appointment status updated to ${status}`,
          action: 'appointment_status_updated',
          appointment_id: appointment.id,
          new_status: status
        },
        severity: 'info',
        source: 'admin'
      }
    });

    res.json({
      success: true,
      data: appointment,
      message: 'Appointment status updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment status',
      error: error.message
    });
  }
});

// Update appointment
router.put('/:id', authenticateToken, validateAppointment, async (req, res) => {
  try {
    const appointment = await dbHelpers.update('appointments', req.params.id, req.body);

    res.json({
      success: true,
      data: appointment,
      message: 'Appointment updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment',
      error: error.message
    });
  }
});

// Delete appointment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await dbHelpers.delete('appointments', req.params.id);

    res.json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete appointment',
      error: error.message
    });
  }
});

export default router;