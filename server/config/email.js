const nodemailer = require("nodemailer");

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email templates
const emailTemplates = {
  verification: (data) => ({
    subject: "Verify Your Global-Eats Email Address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Welcome to Global-Eats!</h2>
        <p style="color: #555; font-size: 16px;">Please verify your email address to complete your registration.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.link}" style="background-color: #e74c3c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
            Verify My Email
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:</p>
        <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px; word-break: break-all; font-family: monospace;">
          ${data.link}
        </div>
        
        <hr style="border: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">This link expires in 24 hours. If you didn't create an account with Global-Eats, please ignore this email.</p>
      </div>
    `,
  }),
  passwordReset: (data) => ({
    subject: "Reset Your Global-Eats Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
        <p style="color: #555; font-size: 16px;">We received a request to reset your password. Click the button below to create a new password.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.link}" style="background-color: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
            Reset My Password
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:</p>
        <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px; word-break: break-all; font-family: monospace;">
          ${data.link}
        </div>
        
        <hr style="border: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">This link expires in 1 hour. If you didn't request this reset, please ignore this email.</p>
      </div>
    `,
  }),
};

// Send email function
const sendEmail = async (to, template, data) => {
  const { subject, html } = emailTemplates[template](data);

  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"Global-Eats" <noreply@global-eats.com>',
    to,
    subject,
    html,
  });
};

module.exports = { sendEmail };
