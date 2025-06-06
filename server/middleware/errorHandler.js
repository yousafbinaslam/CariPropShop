export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large',
      error: 'Maximum file size is 10MB'
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      message: 'Too many files',
      error: 'Maximum 10 files allowed'
    });
  }

  // Supabase errors
  if (err.code === 'PGRST116') {
    return res.status(404).json({
      success: false,
      message: 'Resource not found',
      error: err.message
    });
  }

  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry',
      error: 'Resource already exists'
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Foreign key constraint violation',
      error: 'Referenced resource does not exist'
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: err.message
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: 'Authentication failed'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      error: 'Please login again'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : 'Something went wrong'
  });
};