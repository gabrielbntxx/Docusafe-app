"use client";

import { useState, useEffect } from "react";
import { ProfessionModal } from "./profession-modal";

type Props = {
  planType: string;
  profession: string | null;
};

export function ProfessionModalTrigger({ planType, profession }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show popup only to BUSINESS users who haven't set their profession yet
    if (planType === "BUSINESS" && !profession) {
      // Small delay so the dashboard loads first
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, [planType, profession]);

  const handleClose = (saved: boolean) => {
    setIsOpen(false);
    if (saved) {
      // Refresh to pick up new profession in AI context
      window.location.reload();
    }
  };

  return <ProfessionModal isOpen={isOpen} onClose={handleClose} />;
}
