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

// Email content interface - UPDATED with document URLs
interface EmailCredentials {
  to: string;
  firstName: string;
  lastName: string;
  unitNumber: string;
  username: string;
  password: string;
  rulesDocumentUrl?: string; // Add document URLs
  contractDocumentUrl?: string; // Add document URLs
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

// Function to download PDF from URL
const downloadPDF = async (url: string): Promise<Buffer> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};

// Send tenant credentials email - UPDATED with document attachments
export const sendTenantCredentials = async (credentials: EmailCredentials): Promise<{ success: boolean; error?: string }> => {
  try {
    const transporter = createTransporter();

    // Prepare attachments
    const attachments = [];
    
    // Download and attach rules document
    if (credentials.rulesDocumentUrl) {
      try {
        const rulesPDF = await downloadPDF(credentials.rulesDocumentUrl);
        attachments.push({
          filename: `Panuntunan_at_Regulasyon_${credentials.firstName}_${credentials.lastName}.pdf`,
          content: rulesPDF,
          contentType: 'application/pdf'
        });
      } catch (error) {
        console.error('Error downloading rules PDF:', error);
        // Continue without the attachment rather than failing the entire email
      }
    }

    // Download and attach contract document
    if (credentials.contractDocumentUrl) {
      try {
        const contractPDF = await downloadPDF(credentials.contractDocumentUrl);
        attachments.push({
          filename: `Kasunduan_sa_Paupa_${credentials.firstName}_${credentials.lastName}.pdf`,
          content: contractPDF,
          contentType: 'application/pdf'
        });
      } catch (error) {
        console.error('Error downloading contract PDF:', error);
        // Continue without the attachment rather than failing the entire email
      }
    }

    // Generate email template with document information
    const hasDocuments = attachments.length > 0;
    
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
        .documents { background: #e0f2fe; border: 1px solid #0ea5e9; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Rodriguez Properties!</h1>
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

            ${hasDocuments ? `
            <div class="documents">
                <strong>📎 Important Documents Attached:</strong>
                <p>Your signed tenancy documents are attached to this email:</p>
                <ul>
                    ${credentials.rulesDocumentUrl ? '<li>• <strong>Panuntunan at Regulasyon</strong> (Rules and Regulations)</li>' : ''}
                    ${credentials.contractDocumentUrl ? '<li>• <strong>Kasunduan sa Paupa</strong> (Lease Agreement)</li>' : ''}
                </ul>
                <p>Please save these documents for your records and reference.</p>
            </div>
            ` : ''}

            <div class="warning">
                <strong>Important Security Notice:</strong>
                <p>For your security, please change your password immediately after logging in for the first time.</p>
            </div>

            <p>You can access your account through our Rodriguez Properties application.</p>
            
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
        name: process.env.EMAIL_FROM_NAME || 'Rodriguez Properties Management',
        address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER!,
      },
      to: credentials.to,
      subject: `Your Tenant Account Credentials - Unit ${credentials.unitNumber}`,
      html: emailTemplate,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', {
      to: credentials.to,
      messageId: result.messageId,
      attachments: attachments.length,
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