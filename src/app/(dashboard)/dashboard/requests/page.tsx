import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { RequestsClient } from "@/components/requests/requests-client";

export const metadata = {
  title: "Demandes de documents | Justif'",
  description: "Demandez des documents à des particuliers ou entreprises",
};

export default async function RequestsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      planType: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Get existing requests for PRO/BUSINESS users
  let requests: any[] = [];
  if (user.planType === "PRO" || user.planType === "BUSINESS") {
    requests = await db.documentRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        _count: {
          select: { uploads: true },
        },
        uploads: {
          select: {
            id: true,
            originalName: true,
            fileType: true,
            sizeBytes: true,
            uploaderName: true,
            uploaderEmail: true,
            note: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  return (
    <RequestsClient
      userPlan={user.planType as "FREE" | "STUDENT" | "PRO" | "BUSINESS"}
      requests={requests.map((r) => ({
        id: r.id,
        token: r.token,
        title: r.title,
        description: r.description,
        recipientName: r.recipientName,
        recipientEmail: r.recipientEmail,
        expiresAt: r.expiresAt.toISOString(),
        status: r.status,
        filesReceived: r._count.uploads,
        maxFiles: r.maxFiles,
        viewCount: r.viewCount,
        hasPassword: !!r.password,
        createdAt: r.createdAt.toISOString(),
        uploads: r.uploads.map((u: any) => ({
          id: u.id,
          originalName: u.originalName,
          fileType: u.fileType,
          sizeBytes: u.sizeBytes.toString(),
          uploaderName: u.uploaderName,
          uploaderEmail: u.uploaderEmail,
          note: u.note,
          createdAt: u.createdAt.toISOString(),
        })),
      }))}
    />
  );
}
