import { RegisterForm } from "@/components/auth/register-form";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-violet-500/15 to-blue-500/15 rounded-full blur-3xl" />
      </div>

      {/* Logo */}
      <Link href="/" className="mb-10 flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden bg-white">
          <Image src="/logo.png" alt="DocuSafe" width={48} height={48} className="object-contain" priority />
        </div>
        <span className="text-2xl font-bold text-gray-900">DocuSafe</span>
      </Link>

      <RegisterForm />

      <p className="mt-8 text-sm text-gray-500 text-center max-w-md">
        En créant un compte, vous acceptez nos{" "}
        <a href="#" className="text-blue-500 hover:underline">conditions d&apos;utilisation</a>
        {" "}et notre{" "}
        <a href="#" className="text-blue-500 hover:underline">politique de confidentialité</a>.
      </p>
    </div>
  );
}
