"use client"
import { Environments, initializePaddle, Paddle } from "@paddle/paddle-js";
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from 'next/navigation'

type Plan = "Starter" | "Growth" | "Scale"

type PaymentContextType = {
  paddlePay: (plan: Plan) => void;
};

const PaymentContext = createContext<PaymentContextType | null>(null);

export const PaymentProvider = ({ redirectTo, children }: { redirectTo?: string, children: ReactNode }) => {
  const [paddle, setPaddle] = useState<Paddle>();
  const { push } = useRouter()

  // Download and initialize Paddle instance from CDN
  useEffect(() => {
    const loadPaddleScript = async () => {
      if (typeof window === "undefined") return;
      return await initializePaddleInstance();
    };

    const initializePaddleInstance = async () => {
      try {
        const paddleInstance = await initializePaddle({
          environment: process.env.NEXT_PUBLIC_PADDLE_ENV as Environments,
          token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
        });
        setPaddle(paddleInstance);
      } catch {
        console.error("[BUG]: ❌ Paddle initialization failed")

      }
    };

    loadPaddleScript();
  }, []);

  const openStarterCheckout = useCallback(() => {
    paddle?.Checkout.open({
      items: [
        {
          priceId: process.env.NEXT_PUBLIC_PADDLE_STARTER_PRICE_ID,
          quantity: 1,
        },
      ],
      settings: {
        successUrl: process.env.NEXT_PUBLIC_PADDLE_SUCCESSURL
      }
    });
  }, [paddle]);

  const openGrowthCheckout = useCallback(() => {
    paddle?.Checkout.open({
      items: [
        {
          priceId: process.env.NEXT_PUBLIC_PADDLE_GROWTH_PRICE_ID,
          quantity: 1,
        },
      ],
      settings: {
        successUrl: process.env.NEXT_PUBLIC_PADDLE_SUCCESSURL!
      }
    });
  }, [paddle]);

  const openScaleCheckout = useCallback(() => {
    paddle?.Checkout.open({
      items: [
        {
          priceId: process.env.NEXT_PUBLIC_PADDLE_SCALE_PRICE_ID,
          quantity: 1,
        },
      ],
      settings: {
        successUrl: process.env.NEXT_PUBLIC_PADDLE_SUCCESSURL!
      }
    });
  }, [paddle]);

  const paddlePay = useCallback((plan: Plan) => {
    if (redirectTo) return push(redirectTo)
    switch (plan) {
      case 'Starter':
        return openStarterCheckout()
      case "Growth":
        return openGrowthCheckout()
      case "Scale":
        return openScaleCheckout()
      default:
        break;
    }
  }, [redirectTo, push, openStarterCheckout, openGrowthCheckout, openScaleCheckout]);

  const contextValue = useMemo(() => ({ paddlePay }), [paddlePay]);

  return (
    <PaymentContext.Provider value={contextValue}>
      {children}
    </PaymentContext.Provider>)
}

export const usePay = () => {
  const context = useContext(PaymentContext);

  if (!context) {
    throw new Error(
      "usePay must be used within a PaymentContext",
    );
  }
  return context
}
