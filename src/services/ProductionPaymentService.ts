
interface PaymentGateway {
  name: string;
  type: 'square' | 'flutterwave' | 'selar' | 'zenithpay' | 'paystack';
  apiKey: string;
  secretKey?: string;
  merchantId?: string;
  environment: 'sandbox' | 'production';
  enabled: boolean;
}

interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  customerEmail?: string;
  customerName?: string;
  orderId?: string;
  metadata?: Record<string, any>;
}

interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  error?: string;
  gateway: string;
}

class ProductionPaymentService {
  private gateways: Map<string, PaymentGateway> = new Map();
  private defaultGateway: string | null = null;

  constructor() {
    this.loadGatewayConfigurations();
  }

  private loadGatewayConfigurations(): void {
    // Load from environment or database
    const storedGateways = localStorage.getItem('paymentGateways');
    if (storedGateways) {
      const gateways = JSON.parse(storedGateways);
      gateways.forEach((gateway: PaymentGateway) => {
        this.gateways.set(gateway.name, gateway);
      });
    }
  }

  addGateway(gateway: PaymentGateway): void {
    this.gateways.set(gateway.name, gateway);
    this.saveGatewayConfigurations();
    
    if (!this.defaultGateway && gateway.enabled) {
      this.defaultGateway = gateway.name;
    }
  }

  removeGateway(gatewayName: string): void {
    this.gateways.delete(gatewayName);
    this.saveGatewayConfigurations();
    
    if (this.defaultGateway === gatewayName) {
      const enabledGateways = Array.from(this.gateways.values()).filter(g => g.enabled);
      this.defaultGateway = enabledGateways.length > 0 ? enabledGateways[0].name : null;
    }
  }

  updateGateway(gatewayName: string, updates: Partial<PaymentGateway>): void {
    const gateway = this.gateways.get(gatewayName);
    if (gateway) {
      Object.assign(gateway, updates);
      this.saveGatewayConfigurations();
    }
  }

  private saveGatewayConfigurations(): void {
    const gateways = Array.from(this.gateways.values());
    localStorage.setItem('paymentGateways', JSON.stringify(gateways));
  }

  async processPayment(
    request: PaymentRequest,
    gatewayName?: string
  ): Promise<PaymentResponse> {
    const gateway = gatewayName 
      ? this.gateways.get(gatewayName)
      : this.gateways.get(this.defaultGateway || '');

    if (!gateway) {
      return {
        success: false,
        error: 'No payment gateway available',
        gateway: gatewayName || 'none'
      };
    }

    if (!gateway.enabled) {
      return {
        success: false,
        error: 'Payment gateway is disabled',
        gateway: gateway.name
      };
    }

    try {
      switch (gateway.type) {
        case 'square':
          return await this.processSquarePayment(gateway, request);
        case 'flutterwave':
          return await this.processFlutterwavePayment(gateway, request);
        case 'selar':
          return await this.processSelarPayment(gateway, request);
        case 'zenithpay':
          return await this.processZenithPayPayment(gateway, request);
        case 'paystack':
          return await this.processPaystackPayment(gateway, request);
        default:
          return {
            success: false,
            error: 'Unsupported payment gateway',
            gateway: gateway.name
          };
      }
    } catch (error) {
      console.error(`Payment processing error with ${gateway.name}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
        gateway: gateway.name
      };
    }
  }

  private async processSquarePayment(
    gateway: PaymentGateway,
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    const response = await fetch('/api/payments/square', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${gateway.apiKey}`
      },
      body: JSON.stringify({
        amount: request.amount,
        currency: request.currency,
        description: request.description,
        customer_email: request.customerEmail,
        order_id: request.orderId,
        environment: gateway.environment
      })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      return {
        success: true,
        transactionId: data.transaction_id,
        paymentUrl: data.payment_url,
        gateway: gateway.name
      };
    } else {
      return {
        success: false,
        error: data.error || 'Square payment failed',
        gateway: gateway.name
      };
    }
  }

  private async processFlutterwavePayment(
    gateway: PaymentGateway,
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    const response = await fetch('/api/payments/flutterwave', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${gateway.secretKey}`
      },
      body: JSON.stringify({
        tx_ref: `tx_${Date.now()}`,
        amount: request.amount,
        currency: request.currency,
        redirect_url: `${window.location.origin}/payment/success`,
        customer: {
          email: request.customerEmail,
          name: request.customerName
        },
        customizations: {
          title: request.description,
          logo: `${window.location.origin}/logo.png`
        }
      })
    });

    const data = await response.json();
    
    if (response.ok && data.status === 'success') {
      return {
        success: true,
        transactionId: data.data.tx_ref,
        paymentUrl: data.data.link,
        gateway: gateway.name
      };
    } else {
      return {
        success: false,
        error: data.message || 'Flutterwave payment failed',
        gateway: gateway.name
      };
    }
  }

  private async processSelarPayment(
    gateway: PaymentGateway,
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    const response = await fetch('/api/payments/selar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': gateway.apiKey
      },
      body: JSON.stringify({
        amount: request.amount,
        currency: request.currency,
        description: request.description,
        customer_email: request.customerEmail,
        redirect_url: `${window.location.origin}/payment/success`
      })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      return {
        success: true,
        transactionId: data.reference,
        paymentUrl: data.payment_url,
        gateway: gateway.name
      };
    } else {
      return {
        success: false,
        error: data.message || 'Selar payment failed',
        gateway: gateway.name
      };
    }
  }

  private async processZenithPayPayment(
    gateway: PaymentGateway,
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    const response = await fetch('/api/payments/zenithpay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${gateway.apiKey}`
      },
      body: JSON.stringify({
        amount: request.amount,
        currency: request.currency,
        description: request.description,
        customer_email: request.customerEmail,
        merchant_id: gateway.merchantId,
        callback_url: `${window.location.origin}/payment/success`
      })
    });

    const data = await response.json();
    
    if (response.ok && data.status === 'success') {
      return {
        success: true,
        transactionId: data.transaction_id,
        paymentUrl: data.checkout_url,
        gateway: gateway.name
      };
    } else {
      return {
        success: false,
        error: data.message || 'ZenithPay payment failed',
        gateway: gateway.name
      };
    }
  }

  private async processPaystackPayment(
    gateway: PaymentGateway,
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    const response = await fetch('/api/payments/paystack', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${gateway.secretKey}`
      },
      body: JSON.stringify({
        amount: request.amount * 100, // Paystack uses kobo
        currency: request.currency,
        email: request.customerEmail,
        reference: `ref_${Date.now()}`,
        callback_url: `${window.location.origin}/payment/success`
      })
    });

    const data = await response.json();
    
    if (response.ok && data.status) {
      return {
        success: true,
        transactionId: data.data.reference,
        paymentUrl: data.data.authorization_url,
        gateway: gateway.name
      };
    } else {
      return {
        success: false,
        error: data.message || 'Paystack payment failed',
        gateway: gateway.name
      };
    }
  }

  getAvailableGateways(): PaymentGateway[] {
    return Array.from(this.gateways.values()).filter(g => g.enabled);
  }

  getGateway(name: string): PaymentGateway | undefined {
    return this.gateways.get(name);
  }

  setDefaultGateway(gatewayName: string): void {
    const gateway = this.gateways.get(gatewayName);
    if (gateway && gateway.enabled) {
      this.defaultGateway = gatewayName;
    }
  }

  async verifyPayment(transactionId: string, gatewayName: string): Promise<boolean> {
    const gateway = this.gateways.get(gatewayName);
    if (!gateway) return false;

    try {
      const response = await fetch(`/api/payments/${gateway.type}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${gateway.secretKey || gateway.apiKey}`
        },
        body: JSON.stringify({ transaction_id: transactionId })
      });

      const data = await response.json();
      return response.ok && data.verified;
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }
}

export const productionPaymentService = new ProductionPaymentService();
export default productionPaymentService;
export type { PaymentGateway, PaymentRequest, PaymentResponse };
