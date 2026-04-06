import { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

/**
 * useRazorpay — Custom hook for Razorpay payment flow
 *
 * Usage:
 *   const { pay, loading } = useRazorpay();
 *   await pay({ amount, userId, eventId, userName, userEmail, onSuccess, onFailure });
 */
export default function useRazorpay() {
  const [loading, setLoading] = useState(false);

  const pay = async ({
    amount,
    userId,
    eventId,
    userName,
    userEmail,
    onSuccess,
    onFailure,
  }) => {
    setLoading(true);

    try {
      // 1️⃣ Create order on backend
      const { data } = await axios.post(`${API}/api/payment/create-order`, {
        amount,
        userId,
        eventId,
      });

      if (!data.success) {
        throw new Error(data.message || "Could not create order");
      }

      // 2️⃣ Open Razorpay Checkout
      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Fiestura",
        description: "Event Registration Fee",
        order_id: data.order.id,
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: {
          color: "#ff6b6b",
        },
        handler: async (response) => {
          // 3️⃣ Verify payment on backend
          try {
            const verifyRes = await axios.post(`${API}/api/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              onSuccess?.(verifyRes.data);
            } else {
              onFailure?.(verifyRes.data.message || "Verification failed");
            }
          } catch (err) {
            onFailure?.(err.response?.data?.message || "Verification error");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            onFailure?.("Payment cancelled");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        setLoading(false);
        onFailure?.(response.error?.description || "Payment failed");
      });
      rzp.open();
    } catch (err) {
      setLoading(false);
      const msg =
        err.response?.data?.message || err.message || "Payment error";
      onFailure?.(msg);
    }
  };

  return { pay, loading };
}
