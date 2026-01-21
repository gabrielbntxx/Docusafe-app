"use client";

import { useState } from "react";
import { Lock, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type PinModalProps = {
  folderName: string;
  onVerify: (pin: string) => Promise<boolean>;
  onClose: () => void;
};

export function PinModal({ folderName, onVerify, onClose }: PinModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (pin.length !== 4) {
      setError("Le PIN doit contenir 4 chiffres");
      return;
    }

    setIsVerifying(true);
    setError("");

    const isValid = await onVerify(pin);

    if (isValid) {
      onClose();
    } else {
      setError("Code PIN incorrect");
      setPin("");
      setIsVerifying(false);
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setPin(value);
    setError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-2xl dark:border-neutral-700 dark:bg-neutral-800">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
          <Lock className="h-8 w-8 text-primary-600 dark:text-primary-400" />
        </div>

        {/* Title */}
        <h2 className="mt-6 text-center text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Dossier protégé
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-500 dark:text-neutral-400">
          {`"${folderName}" est protégé par un code PIN`}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Code PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={handlePinChange}
              placeholder="••••"
              maxLength={4}
              autoFocus
              className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-center text-2xl font-bold tracking-widest transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
            />
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isVerifying}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={pin.length !== 4 || isVerifying}
              className="flex-1"
            >
              {isVerifying ? "Vérification..." : "Déverrouiller"}
            </Button>
          </div>
        </form>

        <p className="mt-4 text-center text-xs text-neutral-400 dark:text-neutral-500">
          Entrez le code PIN à 4 chiffres pour accéder au contenu
        </p>
      </div>
    </div>
  );
}
