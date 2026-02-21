import {
    Controller,
    Post,
    Body,
    Headers,
    BadRequestException,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { PaymentService } from '../../finance/payment.service';
import { WebhookPaymentDto } from '../dto/webhook-payment.dto';

/**
 * WebhookController handles incoming webhooks from external payment providers
 * 
 * Security: HMAC signature verification
 */
@Controller('api/v1/webhooks')
export class WebhookController {
    private readonly webhookSecret: string;

    constructor(
        private paymentService: PaymentService,
        private configService: ConfigService,
    ) {
        this.webhookSecret = this.configService.get('WEBHOOK_SECRET', 'dev-secret');
    }

    /**
     * Handle incoming payment webhook
     * 
     * SECURITY:
     * 1. Verify HMAC signature
     * 2. Validate payload
     * 3. Process payment
     * 
     * @returns Acknowledgment
     */
    @Post('payment')
    async handlePaymentWebhook(
        @Body() payload: WebhookPaymentDto,
        @Headers('x-webhook-signature') signature: string,
    ) {
        // 1. Verify HMAC signature
        if (!this.verifySignature(payload, signature)) {
            throw new UnauthorizedException('Invalid webhook signature');
        }

        // 2. Validate status
        if (payload.status !== 'success') {
            console.log(`⚠️ [Webhook] Payment not successful: ${payload.status}`);
            return { received: true, processed: false };
        }

        // 3. Find invoice by reference
        const invoiceId = payload.invoice_reference;

        try {
            // 4. Record payment
            const payment = await this.paymentService.recordPayment(
                invoiceId,
                payload.amount,
                payload.payment_method,
                payload.transaction_id,
                `External payment via ${payload.provider}`,
            );

            console.log(
                `✅ [Webhook] Payment processed: ${payment.id} for invoice ${invoiceId}`,
            );

            return {
                received: true,
                processed: true,
                payment_id: payment.id,
            };
        } catch (error) {
            console.error(`❌ [Webhook] Payment processing failed:`, error.message);
            throw new BadRequestException(
                `Failed to process payment: ${error.message}`,
            );
        }
    }

    /**
     * Handle Stripe webhook
     * Stripe sends signature in 'stripe-signature' header
     */
    @Post('stripe')
    async handleStripeWebhook(
        @Body() rawBody: any,
        @Headers('stripe-signature') signature: string,
    ) {
        // In production, use Stripe SDK to verify signature:
        // const event = stripe.webhooks.constructEvent(
        //   rawBody,
        //   signature,
        //   this.webhookSecret
        // );
        //
        // if (event.type === 'payment_intent.succeeded') {
        //   const paymentIntent = event.data.object;
        //   // Process payment
        // }

        console.log(`🔔 [Stripe] Webhook received: ${rawBody.type || 'unknown'}`);

        return { received: true };
    }

    /**
     * Handle PayPal webhook
     */
    @Post('paypal')
    async handlePayPalWebhook(
        @Body() payload: any,
        @Headers('paypal-transmission-sig') signature: string,
    ) {
        // In production, verify PayPal signature
        console.log(`🔔 [PayPal] Webhook received: ${payload.event_type || 'unknown'}`);

        return { received: true };
    }

    /**
     * Verify HMAC signature
     * 
     * @param payload Webhook payload
     * @param receivedSignature Signature from header
     * @returns True if valid
     */
    private verifySignature(payload: any, receivedSignature: string): boolean {
        if (!receivedSignature) {
            console.warn('⚠️ [Webhook] No signature provided');
            return false;
        }

        // Create HMAC using webhook secret
        const payloadString = JSON.stringify(payload);
        const expectedSignature = createHmac('sha256', this.webhookSecret)
            .update(payloadString)
            .digest('hex');

        // Compare signatures (constant-time comparison to prevent timing attacks)
        const isValid = this.constantTimeCompare(receivedSignature, expectedSignature);

        if (!isValid) {
            console.warn('⚠️ [Webhook] Signature verification failed');
        }

        return isValid;
    }

    /**
     * Constant-time string comparison
     * Prevents timing attacks
     */
    private constantTimeCompare(a: string, b: string): boolean {
        if (a.length !== b.length) {
            return false;
        }

        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }

        return result === 0;
    }
}
