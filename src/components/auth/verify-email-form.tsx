"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Loader2, RefreshCw, CheckCircle } from "lucide-react";

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const callbackUrl = searchParams.get("callbackUrl") || "";
  const emailFailed = searchParams.get("emailFailed") === "true";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState(
    emailFailed ? "L'email n'a pas pu être envoyé. Cliquez sur \"Renvoyer le code\" ci-dessous." : ""
  );
  const [success, setSuccess] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((d) => d !== "")) {
      handleSubmit(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i];
    }
    setCode(newCode);
    if (pasted.length === 6) {
      handleSubmit(pasted);
    } else if (pasted.length > 0) {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  const handleSubmit = async (codeStr?: string) => {
    const fullCode = codeStr || code.join("");
    if (fullCode.length !== 6) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: fullCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Une erreur est survenue");
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        setIsLoading(false);
        return;
      }

      setSuccess("Email vérifié avec succès !");
      setTimeout(() => {
        const loginUrl = callbackUrl
          ? `/login?verified=true&callbackUrl=${encodeURIComponent(callbackUrl)}`
          : "/login?verified=true";
        router.push(loginUrl);
      }, 1500);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    setError("");

    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResendCooldown(60);
      setSuccess("Un nouveau code a été envoyé !");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Impossible de renvoyer le code.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Vérifiez votre email
          </h1>
          <p className="text-gray-500 text-sm">
            Nous avons envoyé un code à 6 chiffres à
          </p>
          {email && (
            <p className="text-blue-600 font-medium text-sm mt-1">{email}</p>
          )}
        </div>

        {/* Success state */}
        {success && !error && (
          <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-600 text-sm text-center mb-6 flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {success}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm text-center mb-6">
            {error}
          </div>
        )}

        {/* 6 digit inputs */}
        <div className="flex gap-3 justify-center mb-8">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              disabled={isLoading || !!success}
              className="w-12 h-14 text-center text-2xl font-bold bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          ))}
        </div>

        {/* Verify button */}
        <button
          onClick={() => handleSubmit()}
          disabled={isLoading || code.some((d) => d === "") || !!success}
          className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Vérification...
            </>
          ) : (
            "Vérifier"
          )}
        </button>

        {/* Resend link */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm mb-2">
            Vous n&apos;avez pas reçu le code ?
          </p>
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0 || isResending}
            className="text-blue-500 hover:text-blue-600 font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
          >
            {isResending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Envoi...
              </>
            ) : resendCooldown > 0 ? (
              <>
                <RefreshCw className="w-4 h-4" />
                Renvoyer dans {resendCooldown}s
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Renvoyer le code
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
