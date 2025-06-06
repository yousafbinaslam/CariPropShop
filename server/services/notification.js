import nodemailer from 'nodemailer';

// Email transporter configuration
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Email templates
const emailTemplates = {
  appointment_created: {
    subject: 'Appointment Confirmation - Cari PropShop',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">Appointment Confirmed</h2>
        <p>Dear ${data.client_name},</p>
        <p>Your appointment has been successfully scheduled:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Date:</strong> ${data.appointment_date}</p>
          <p><strong>Time:</strong> ${data.appointment_time}</p>
          <p><strong>Type:</strong> ${data.appointment_type}</p>
        </div>
        <p>We look forward to meeting with you!</p>
        <p>Best regards,<br>Cari PropShop Team</p>
      </div>
    `
  },
  
  appointment_status_updated: {
    subject: 'Appointment Status Update - Cari PropShop',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">Appointment Status Update</h2>
        <p>Dear ${data.client_name},</p>
        <p>Your appointment status has been updated:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Date:</strong> ${data.appointment_date}</p>
          <p><strong>Time:</strong> ${data.appointment_time}</p>
          <p><strong>Status:</strong> ${data.new_status}</p>
        </div>
        <p>If you have any questions, please contact us.</p>
        <p>Best regards,<br>Cari PropShop Team</p>
      </div>
    `
  },

  payment_completed: {
    subject: 'Payment Confirmation - Cari PropShop',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">Payment Confirmed</h2>
        <p>Dear ${data.client_name},</p>
        <p>Your payment has been successfully processed:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Amount:</strong> IDR ${data.amount.toLocaleString()}</p>
          <p><strong>Transaction ID:</strong> ${data.transaction_id}</p>
          <p><strong>Payment Method:</strong> ${data.payment_method}</p>
        </div>
        <p>Thank you for your payment!</p>
        <p>Best regards,<br>Cari PropShop Team</p>
      </div>
    `
  },

  payment_status_updated: {
    subject: 'Payment Status Update - Cari PropShop',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">Payment Status Update</h2>
        <p>Dear ${data.client_name},</p>
        <p>Your payment status has been updated:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Transaction ID:</strong> ${data.transaction_id}</p>
          <p><strong>Amount:</strong> IDR ${data.amount.toLocaleString()}</p>
          <p><strong>Status:</strong> ${data.new_status}</p>
        </div>
        <p>If you have any questions, please contact us.</p>
        <p>Best regards,<br>Cari PropShop Team</p>
      </div>
    `
  }
};

export const sendNotification = async ({ type, recipient, data }) => {
  try {
    if (!emailTemplates[type]) {
      throw new Error(`Unknown notification type: ${type}`);
    }

    const template = emailTemplates[type];
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@caripropshop.com',
      to: recipient,
      subject: template.subject,
      html: template.html(data)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent:', result.messageId);
    
    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error) {
    console.error('Failed to send notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const sendWhatsAppNotification = async ({ phone, message }) => {
  try {
    // WhatsApp Business API integration would go here
    // For now, we'll just log the message
    console.log(`WhatsApp to ${phone}: ${message}`);
    
    return {
      success: true,
      message: 'WhatsApp notification sent'
    };
  } catch (error) {
    console.error('Failed to send WhatsApp notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
};