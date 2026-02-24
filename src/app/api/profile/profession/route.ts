import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { ALL_PROFESSIONS } from "@/lib/professions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { profession: true, planType: true },
  });

  return NextResponse.json({ profession: user?.profession ?? null, planType: user?.planType });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const profession: string = (body.profession ?? "").trim();

  if (!profession) {
    return NextResponse.json({ error: "Profession required" }, { status: 400 });
  }

  // Accept any string but cap at 100 chars to prevent abuse
  if (profession.length > 100) {
    return NextResponse.json({ error: "Profession too long" }, { status: 400 });
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { profession },
  });

  return NextResponse.json({ success: true, profession });
}
