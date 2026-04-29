/**
 * Frontend payment utility for Razorpay integration
 */

export interface RazorpayCheckoutOptions {
  key: string;
  orderId: string;
  amount: number;
  currency: string;
  email: string;
  phone: string;
  appointmentId: number;
  patientName: string;
  onSuccess: (data: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) => void;
  onFailure: (error: any) => void;
}

/**
 * Open Razorpay checkout modal
 */
export function openRazorpayCheckout(options: RazorpayCheckoutOptions): void {
  const { Razorpay } = window as any;

  if (!Razorpay) {
    console.error("Razorpay script not loaded");
    options.onFailure(new Error("Razorpay not available"));
    return;
  }

  const razorpayOptions = {
    key: options.key,
    order_id: options.orderId,
    amount: options.amount,
    currency: options.currency,
    name: "Clinicians Unchained",
    description: "Appointment Consultation Fee",
    customer_details: {
      name: options.patientName,
      email: options.email,
      contact: options.phone,
    },
    handler: function (response: any) {
      options.onSuccess({
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      });
    },
    prefill: {
      name: options.patientName,
      email: options.email,
      contact: options.phone,
    },
    theme: {
      color: "#3b82f6", // Blue color matching your design
    },
    modal: {
      ondismiss: function () {
        options.onFailure(new Error("Payment cancelled by user"));
      },
    },
  };

  const checkoutInstance = new Razorpay(razorpayOptions);
  checkoutInstance.open();
}

/**
 * Declare Razorpay type for TypeScript
 */
declare global {
  interface Window {
    Razorpay: any;
  }
}
