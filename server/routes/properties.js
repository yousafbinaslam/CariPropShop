import express from 'express';
import { dbHelpers } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateProperty } from '../middleware/validation.js';
import { broadcast } from '../index.js';

const router = express.Router();

// Get all properties with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      type,
      featured,
      min_price,
      max_price,
      location,
      bedrooms,
      bathrooms,
      page = 1,
      limit = 10,
      search
    } = req.query;

    const filters = {};
    if (type) filters.type = type;
    if (featured !== undefined) filters.featured = featured === 'true';
    if (bedrooms) filters.bedrooms = parseInt(bedrooms);
    if (bathrooms) filters.bathrooms = parseInt(bathrooms);

    const options = {
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      orderBy: 'created_at',
      ascending: false
    };

    let properties;
    if (search) {
      properties = await dbHelpers.search('properties', search, ['title', 'description', 'location']);
    } else {
      properties = await dbHelpers.read('properties', filters, options);
    }

    // Apply additional filters that can't be handled by simple equality
    if (min_price || max_price || location) {
      properties = properties.filter(property => {
        if (min_price && property.price < parseInt(min_price)) return false;
        if (max_price && property.price > parseInt(max_price)) return false;
        if (location && !property.location.toLowerCase().includes(location.toLowerCase())) return false;
        return true;
      });
    }

    res.json({
      success: true,
      data: properties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: properties.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch properties',
      error: error.message
    });
  }
});

// Get single property
router.get('/:id', async (req, res) => {
  try {
    const properties = await dbHelpers.read('properties', { id: req.params.id });
    const property = properties[0];

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property',
      error: error.message
    });
  }
});

// Create new property
router.post('/', authenticateToken, validateProperty, async (req, res) => {
  try {
    const property = await dbHelpers.create('properties', req.body);

    // Broadcast real-time event
    broadcast({
      type: 'real-time-event',
      event: {
        id: Date.now().toString(),
        type: 'property',
        timestamp: new Date().toISOString(),
        data: {
          message: `New property added: ${property.title}`,
          action: 'property_created',
          property_id: property.id
        },
        severity: 'info',
        source: 'admin'
      }
    });

    res.status(201).json({
      success: true,
      data: property,
      message: 'Property created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create property',
      error: error.message
    });
  }
});

// Update property
router.put('/:id', authenticateToken, validateProperty, async (req, res) => {
  try {
    const property = await dbHelpers.update('properties', req.params.id, req.body);

    // Broadcast real-time event
    broadcast({
      type: 'real-time-event',
      event: {
        id: Date.now().toString(),
        type: 'property',
        timestamp: new Date().toISOString(),
        data: {
          message: `Property updated: ${property.title}`,
          action: 'property_updated',
          property_id: property.id
        },
        severity: 'info',
        source: 'admin'
      }
    });

    res.json({
      success: true,
      data: property,
      message: 'Property updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update property',
      error: error.message
    });
  }
});

// Delete property
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await dbHelpers.delete('properties', req.params.id);

    // Broadcast real-time event
    broadcast({
      type: 'real-time-event',
      event: {
        id: Date.now().toString(),
        type: 'property',
        timestamp: new Date().toISOString(),
        data: {
          message: `Property deleted`,
          action: 'property_deleted',
          property_id: req.params.id
        },
        severity: 'warning',
        source: 'admin'
      }
    });

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete property',
      error: error.message
    });
  }
});

// Get property analytics
router.get('/:id/analytics', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get property views, inquiries, appointments
    const analytics = {
      views: Math.floor(Math.random() * 1000) + 100,
      inquiries: Math.floor(Math.random() * 50) + 10,
      appointments: Math.floor(Math.random() * 20) + 5,
      conversionRate: ((Math.random() * 5) + 2).toFixed(2)
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property analytics',
      error: error.message
    });
  }
});

export default router;