import { db } from "./db";

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message?: string
) {
  try {
    await db.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        read: 0,
      },
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}
