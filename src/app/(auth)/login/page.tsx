import { LoginForm } from "@/components/auth/login-form";
import { SkyBackground } from "@/components/auth/sky-background";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <SkyBackground />

      {/* Logo */}
      <Link href="/" className="mb-10 flex items-center gap-3 relative z-10">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden bg-white">
          <Image src="/logo.png" alt="DocuSafe" width={48} height={48} className="object-contain" priority />
        </div>
        <span className="text-2xl font-bold text-white drop-shadow-md">DocuSafe</span>
      </Link>

      <div className="relative z-10 w-full flex flex-col items-center">
        <LoginForm />

        <p className="mt-8 text-sm text-white/70 text-center max-w-md">
          En vous connectant, vous acceptez nos{" "}
          <a href="#" className="text-white hover:underline">conditions d&apos;utilisation</a>
          {" "}et notre{" "}
          <a href="#" className="text-white hover:underline">politique de confidentialité</a>.
        </p>
      </div>
    </div>
  );
}
