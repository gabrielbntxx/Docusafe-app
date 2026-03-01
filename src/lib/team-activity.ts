import { db } from "./db";

export async function sendActivityMessage(
  teamOwnerId: string,
  actorId: string,
  action: "upload" | "folder_created",
  name: string
) {
  try {
    // Only send if at least the owner or one member has activity messages enabled
    const hasRecipient = await db.user.findFirst({
      where: {
        OR: [
          { id: teamOwnerId, activityMessagesEnabled: 1 },
          { teamOwnerId, activityMessagesEnabled: 1 },
        ],
      },
      select: { id: true },
    });
    if (!hasRecipient) return;

    const content =
      action === "upload"
        ? `a uploadé "${name}"`
        : `a créé le dossier "${name}"`;

    await db.message.create({
      data: {
        teamOwnerId,
        senderId: actorId,
        receiverId: null,
        content,
        type: "activity",
        metadata: JSON.stringify({ action, name }),
      },
    });
  } catch (error) {
    console.error("Error sending activity message:", error);
  }
}
