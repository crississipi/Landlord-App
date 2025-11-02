// lib/email.ts
import nodemailer from 'nodemailer';

// Email configuration interface
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Email content interface
interface EmailCredentials {
  to: string;
  firstName: string;
  lastName: string;
  unitNumber: string;
  username: string;
  password: string;
}

// Create transporter function
const createTransporter = () => {
  const config: EmailConfig = {
    host: process.env.EMAIL_HOST!,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASSWORD!,
    },
  };

  return nodemailer.createTransport(config);
};

// Send tenant credentials email
export const sendTenantCredentials = async (credentials: EmailCredentials): Promise<{ success: boolean; error?: string }> => {
  try {
    const transporter = createTransporter();

    const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .credentials { background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #4f46e5; margin: 20px 0; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #4f46e5; display: block; margin-bottom: 5px; }
        .value { font-family: monospace; background: #f3f4f6; padding: 8px 12px; border-radius: 4px; display: inline-block; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Co-Living!</h1>
        </div>
        <div class="content">
            <p>Hello ${credentials.firstName} ${credentials.lastName},</p>
            <p>Your tenant account has been successfully created. Here are your login credentials:</p>
            
            <div class="credentials">
                <div class="field">
                    <span class="label">Username/Email:</span>
                    <span class="value">${credentials.username}</span>
                </div>
                <div class="field">
                    <span class="label">Password:</span>
                    <span class="value">${credentials.password}</span>
                </div>
                <div class="field">
                    <span class="label">Unit Number:</span>
                    <span class="value">${credentials.unitNumber}</span>
                </div>
            </div>

            <div class="warning">
                <strong>Important Security Notice:</strong>
                <p>For your security, please change your password immediately after logging in for the first time.</p>
            </div>

            <p>You can access your account through our Co-Living application.</p>
            
            <div class="footer">
                <p>If you have any questions, please contact the property management.</p>
                <p>This is an automated message, please do not reply to this email.</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'Co-Living Management',
        address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER!,
      },
      to: credentials.to,
      subject: `Your Co-Living Account Credentials - Unit ${credentials.unitNumber}`,
      html: emailTemplate,
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', {
      to: credentials.to,
      messageId: result.messageId,
    });

    return { success: true };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred while sending email' 
    };
  }
};

// Verify email configuration
export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return false;
  }
};