import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { UploadRequestClient } from "@/components/upload-request/upload-request-client";

export const metadata = {
  title: "Envoyer des documents | Justif'",
  description: "Envoyez vos documents de manière sécurisée",
};

export default async function UploadRequestPage({
  params,
}: {
  params: { token: string };
}) {
  const { token } = params;

  // Find the request
  const request = await db.documentRequest.findUnique({
    where: { token },
    include: {
      _count: {
        select: { uploads: true },
      },
    },
  });

  if (!request) {
    notFound();
  }

  // Check if expired
  const isExpired = new Date(request.expiresAt) < new Date();

  // Increment view count
  await db.documentRequest.update({
    where: { id: request.id },
    data: {
      viewCount: { increment: 1 },
      lastViewedAt: new Date(),
    },
  });

  return (
    <UploadRequestClient
      token={token}
      title={request.title}
      description={request.description}
      recipientName={request.recipientName}
      maxFiles={request.maxFiles}
      filesUploaded={request._count.uploads}
      expiresAt={request.expiresAt.toISOString()}
      hasPassword={!!request.password}
      isExpired={isExpired}
      status={request.status}
    />
  );
}
