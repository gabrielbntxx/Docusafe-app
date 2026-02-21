import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Current version of legal documents — update this date when CGU/Privacy are updated
// to force users to re-accept. Format: YYYY-MM-DD
const TERMS_CURRENT_VERSION = "2026-02-21";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { acceptedTerms, acceptedPrivacy } = body;

  if (!acceptedTerms || !acceptedPrivacy) {
    return NextResponse.json(
      { error: "Vous devez accepter les CGU et la politique de confidentialité" },
      { status: 400 }
    );
  }

  await db.user.update({
    where: { id: session.user.id },
    data: {
      termsAcceptedAt: new Date(),
      termsVersion: TERMS_CURRENT_VERSION,
    },
  });

  return NextResponse.json({ success: true });
}
