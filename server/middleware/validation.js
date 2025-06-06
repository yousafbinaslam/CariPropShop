export const validateProperty = (req, res, next) => {
  const { title, description, price, location, type, area } = req.body;
  const errors = [];

  if (!title || title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  }

  if (!description || description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long');
  }

  if (!price || price <= 0) {
    errors.push('Price must be a positive number');
  }

  if (!location || location.trim().length < 3) {
    errors.push('Location must be at least 3 characters long');
  }

  if (!type || !['residential', 'commercial', 'industrial', 'land'].includes(type)) {
    errors.push('Type must be residential, commercial, industrial, or land');
  }

  if (!area || area <= 0) {
    errors.push('Area must be a positive number');
  }

  if (req.body.bedrooms !== undefined && req.body.bedrooms < 0) {
    errors.push('Bedrooms cannot be negative');
  }

  if (req.body.bathrooms !== undefined && req.body.bathrooms < 0) {
    errors.push('Bathrooms cannot be negative');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

export const validateClient = (req, res, next) => {
  const { name, email, phone, location } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email is required');
  }

  if (!phone || phone.trim().length < 10) {
    errors.push('Phone number must be at least 10 characters long');
  }

  if (!location || location.trim().length < 3) {
    errors.push('Location must be at least 3 characters long');
  }

  if (req.body.status && !['active', 'inactive', 'vip'].includes(req.body.status)) {
    errors.push('Status must be active, inactive, or vip');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

export const validateAppointment = (req, res, next) => {
  const { client_id, date, time, type } = req.body;
  const errors = [];

  if (!client_id) {
    errors.push('Client ID is required');
  }

  if (!date) {
    errors.push('Date is required');
  } else {
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (appointmentDate < today) {
      errors.push('Appointment date cannot be in the past');
    }
  }

  if (!time) {
    errors.push('Time is required');
  }

  if (!type || !['viewing', 'consultation', 'signing'].includes(type)) {
    errors.push('Type must be viewing, consultation, or signing');
  }

  if (req.body.status && !['pending', 'confirmed', 'completed', 'cancelled'].includes(req.body.status)) {
    errors.push('Status must be pending, confirmed, completed, or cancelled');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

export const validatePayment = (req, res, next) => {
  const { client_id, amount, method, description } = req.body;
  const errors = [];

  if (!client_id) {
    errors.push('Client ID is required');
  }

  if (!amount || amount <= 0) {
    errors.push('Amount must be a positive number');
  }

  if (!method || !['bank_transfer', 'e_wallet', 'credit_card', 'qris'].includes(method)) {
    errors.push('Method must be bank_transfer, e_wallet, credit_card, or qris');
  }

  if (!description || description.trim().length < 5) {
    errors.push('Description must be at least 5 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};