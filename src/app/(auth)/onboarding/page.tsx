import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import Link from "next/link";
import Image from "next/image";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Check if user already has a subscription or completed onboarding
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { planType: true, onboardingCompleted: true, email: true },
  });

  if (!user) {
    redirect("/login");
  }

  // If user already has a paid plan, go to dashboard
  if (user.planType !== "FREE") {
    redirect("/dashboard");
  }

  // If already completed onboarding, go to dashboard (restricted mode)
  if (user.onboardingCompleted) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-violet-500/15 to-blue-500/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl" />
      </div>

      {/* Logo */}
      <Link href="/" className="mb-10 flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden bg-white">
          <Image src="/logo.png" alt="DocuSafe" width={48} height={48} className="object-contain" priority />
        </div>
        <span className="text-2xl font-bold text-gray-900">DocuSafe</span>
      </Link>

      <OnboardingFlow userEmail={user.email} />
    </div>
  );
}
