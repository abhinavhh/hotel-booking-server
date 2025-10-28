// utils/otpHelper.ts
import nodemailer from "nodemailer";

/**
 * Generate a 6-digit OTP
 */
export const generateOTP = (): number => {
  return Math.floor(100000 + Math.random() * 900000);
};

/**
 * Send OTP via email
 */
export const sendOTPEmail = async (
  email: string,
  otp: number,
  userName: string = 'User'
): Promise<void> => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email template
    const mailOptions = {
      from: `"Hotel Booking" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset OTP - Hotel Booking',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .otp-box {
              background: white;
              border: 2px solid #667eea;
              border-radius: 10px;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
            }
            .otp-code {
              font-size: 32px;
              font-weight: bold;
              color: #667eea;
              letter-spacing: 5px;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>You recently requested to reset your password for your Hotel Booking account. Use the OTP below to complete the process:</p>
              
              <div class="otp-box">
                <p style="margin: 0; font-size: 14px; color: #666;">Your OTP Code</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Valid for 10 minutes</p>
              </div>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                • This OTP will expire in 10 minutes<br>
                • Never share this OTP with anyone<br>
                • If you didn't request this, please ignore this email
              </div>

              <p>If you're having trouble, contact our support team.</p>
              
              <p>Best regards,<br>Hotel Booking Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} Hotel Booking. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hi ${userName},

        You recently requested to reset your password for your Hotel Booking account.

        Your OTP Code: ${otp}
        
        This OTP will expire in 10 minutes.

        Security Notice:
        - Never share this OTP with anyone
        - If you didn't request this, please ignore this email

        Best regards,
        Hotel Booking Team
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

/**
 * Validate OTP format
 */
export const validateOTPFormat = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};

/**
 * Check if OTP is expired
 */
export const isOTPExpired = (otpExpires: Date | null): boolean => {
  if (!otpExpires) return true;
  return new Date() > otpExpires;
};