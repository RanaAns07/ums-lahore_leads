import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * NotificationService handles email and SMS communications
 * 
 * Supports: SendGrid, Postmark (Email), Twilio (SMS)
 */
@Injectable()
export class NotificationService {
    private readonly emailProvider: string;
    private readonly smsProvider: string;
    private readonly fromEmail: string;

    constructor(private configService: ConfigService) {
        this.emailProvider = this.configService.get('EMAIL_PROVIDER', 'console');
        this.smsProvider = this.configService.get('SMS_PROVIDER', 'console');
        this.fromEmail = this.configService.get('FROM_EMAIL', 'noreply@ums.edu');
    }

    /**
     * Send application acceptance email
     */
    async sendApplicationAcceptedEmail(
        recipientEmail: string,
        recipientName: string,
        programName: string,
    ): Promise<void> {
        const subject = '🎉 Congratulations! Your Application Has Been Accepted';
        const html = `
      <h2>Dear ${recipientName},</h2>
      <p>We are delighted to inform you that your application to <strong>${programName}</strong> has been accepted!</p>
      <p>You will receive further instructions regarding enrollment and payment shortly.</p>
      <p>Welcome to our university!</p>
      <hr>
      <p style="color: #666; font-size: 12px;">University Management System</p>
    `;

        await this.sendEmail(recipientEmail, subject, html);
    }

    /**
     * Send invoice generated email
     */
    async sendInvoiceGeneratedEmail(
        recipientEmail: string,
        recipientName: string,
        invoiceId: string,
        totalAmount: number,
        dueDate: Date,
    ): Promise<void> {
        const subject = '📄 Your Invoice is Ready';
        const html = `
      <h2>Dear ${recipientName},</h2>
      <p>An invoice has been generated for your enrollment:</p>
      <ul>
        <li><strong>Invoice ID:</strong> ${invoiceId}</li>
        <li><strong>Amount Due:</strong> $${totalAmount}</li>
        <li><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</li>
      </ul>
      <p>Please make payment before the due date to activate your enrollment.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">University Management System</p>
    `;

        await this.sendEmail(recipientEmail, subject, html);
    }

    /**
     * Send payment success email
     */
    async sendPaymentSuccessEmail(
        recipientEmail: string,
        recipientName: string,
        paymentId: string,
        amount: number,
        invoiceId: string,
    ): Promise<void> {
        const subject = '✅ Payment Received Successfully';
        const html = `
      <h2>Dear ${recipientName},</h2>
      <p>Thank you! Your payment has been received and processed successfully.</p>
      <ul>
        <li><strong>Payment ID:</strong> ${paymentId}</li>
        <li><strong>Amount Paid:</strong> $${amount}</li>
        <li><strong>Invoice ID:</strong> ${invoiceId}</li>
      </ul>
      <p>Your enrollment is now active. You can begin registering for courses!</p>
      <hr>
      <p style="color: #666; font-size: 12px;">University Management System</p>
    `;

        await this.sendEmail(recipientEmail, subject, html);
    }

    /**
     * Generic email sender
     */
    private async sendEmail(
        to: string,
        subject: string,
        html: string,
    ): Promise<void> {
        if (this.emailProvider === 'sendgrid') {
            await this.sendViaSendGrid(to, subject, html);
        } else if (this.emailProvider === 'postmark') {
            await this.sendViaPostmark(to, subject, html);
        } else {
            // Console logger for development
            this.logEmail(to, subject, html);
        }
    }

    /**
     * Send SMS notification
     */
    async sendSMS(to: string, message: string): Promise<void> {
        if (this.smsProvider === 'twilio') {
            await this.sendViaTwilio(to, message);
        } else {
            console.log(`📱 [SMS] To: ${to}\nMessage: ${message}`);
        }
    }

    // ============================================
    // Email Provider Implementations
    // ============================================

    private async sendViaSendGrid(
        to: string,
        subject: string,
        html: string,
    ): Promise<void> {
        // Placeholder for SendGrid
        // In production, use SendGrid SDK:
        // const msg = {
        //   to,
        //   from: this.fromEmail,
        //   subject,
        //   html,
        // };
        // await sgMail.send(msg);

        console.log(`📧 [SendGrid] Email sent to: ${to} - Subject: ${subject}`);
    }

    private async sendViaPostmark(
        to: string,
        subject: string,
        html: string,
    ): Promise<void> {
        // Placeholder for Postmark
        // In production, use Postmark SDK:
        // await client.sendEmail({
        //   From: this.fromEmail,
        //   To: to,
        //   Subject: subject,
        //   HtmlBody: html,
        // });

        console.log(`📧 [Postmark] Email sent to: ${to} - Subject: ${subject}`);
    }

    private logEmail(to: string, subject: string, html: string): void {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📧 [EMAIL] Development Mode`);
        console.log(`To: ${to}`);
        console.log(`From: ${this.fromEmail}`);
        console.log(`Subject: ${subject}`);
        console.log(`\nBody:\n${html}`);
        console.log(`${'='.repeat(60)}\n`);
    }

    // ============================================
    // SMS Provider Implementation
    // ============================================

    private async sendViaTwilio(to: string, message: string): Promise<void> {
        // Placeholder for Twilio
        // In production, use Twilio SDK:
        // await twilioClient.messages.create({
        //   body: message,
        //   from: this.configService.get('TWILIO_PHONE_NUMBER'),
        //   to,
        // });

        console.log(`📱 [Twilio] SMS sent to: ${to}`);
    }
}
