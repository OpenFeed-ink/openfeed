"use client"
import { Environments, initializePaddle, Paddle } from "@paddle/paddle-js";
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
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
      } catch (error) {
        console.error("[BUG]: ❌ Paddle initialization failed")

      }
    };

    loadPaddleScript();
  }, []);

  const openStarterCheckout = () => {
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
  };

  const openGrowthCheckout = () => {
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
  };

  const openScaleCheckout = () => {
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
  };


  const paddlePay = (plan: Plan) => {
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
  }

  const contextValue = useMemo(
    () => ({
      paddlePay
    }),
    [paddle],
  );

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
