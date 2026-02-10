"use client";

import { createContext, useContext } from "react";

type SubscriptionContextType = {
  isRestricted: boolean;
  planType: string;
};

const SubscriptionContext = createContext<SubscriptionContextType>({
  isRestricted: false,
  planType: "FREE",
});

export function SubscriptionProvider({
  children,
  isRestricted,
  planType,
}: {
  children: React.ReactNode;
  isRestricted: boolean;
  planType: string;
}) {
  return (
    <SubscriptionContext.Provider value={{ isRestricted, planType }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
