import { RegisterForm } from "@/components/auth/register-form";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
      <Link href="/" className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
          Justif&apos;
        </h1>
      </Link>

      <RegisterForm />

      <p className="mt-8 text-sm text-neutral-500 text-center max-w-md">
        En créant un compte, vous acceptez nos conditions d&apos;utilisation et notre politique de confidentialité.
      </p>
    </div>
  );
}
