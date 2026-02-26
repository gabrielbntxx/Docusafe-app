import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getEffectiveUserId } from "@/lib/team";

// GET — list active workflow runs for the workspace
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = await getEffectiveUserId(session.user.id);

    const runs = await db.workflowRun.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        template: { select: { name: true, type: true } },
        document: { select: { id: true, displayName: true } },
        folder: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(
      runs.map((r) => ({
        ...r,
        stepStatuses: JSON.parse(r.stepStatuses || "[]"),
        template: r.template,
        documentName: r.document?.displayName ?? null,
        folderName: r.folder?.name ?? null,
      }))
    );
  } catch (error) {
    console.error("Error listing workflow runs:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
