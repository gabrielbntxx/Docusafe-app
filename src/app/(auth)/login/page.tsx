import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";
import { Shield } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-apple-blue/20 to-apple-violet/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-apple-violet/15 to-apple-blue/15 rounded-full blur-3xl" />
      </div>

      {/* Logo */}
      <Link href="/" className="mb-10 flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-apple-blue to-apple-violet rounded-2xl flex items-center justify-center shadow-apple">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold text-apple-gray-600">DocuSafe</span>
      </Link>

      <LoginForm />

      <p className="mt-8 text-sm text-apple-gray-400 text-center max-w-md">
        En vous connectant, vous acceptez nos{" "}
        <a href="#" className="text-apple-blue hover:underline">conditions d&apos;utilisation</a>
        {" "}et notre{" "}
        <a href="#" className="text-apple-blue hover:underline">politique de confidentialité</a>.
      </p>
    </div>
  );
}
