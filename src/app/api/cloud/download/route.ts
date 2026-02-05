import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { url, filename, provider, accessToken } = body;

    if (!url || !filename) {
      return NextResponse.json(
        { error: "URL et nom de fichier requis" },
        { status: 400 }
      );
    }

    // Build headers based on provider
    const headers: HeadersInit = {};

    if (provider === "google" && accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
    // OneDrive provides direct download URLs that don't need auth

    // Fetch the file from the cloud provider
    const response = await fetch(url, {
      headers,
    });

    if (!response.ok) {
      console.error(
        `[Cloud Download] Failed to fetch from ${provider}:`,
        response.status,
        response.statusText
      );
      return NextResponse.json(
        { error: `Impossible de télécharger le fichier depuis ${provider}` },
        { status: response.status }
      );
    }

    // Get the file content
    const arrayBuffer = await response.arrayBuffer();

    // Determine content type from response or filename
    let contentType =
      response.headers.get("content-type") || "application/octet-stream";

    // If content type is generic, try to infer from filename
    if (contentType === "application/octet-stream") {
      const ext = filename.toLowerCase().split(".").pop();
      const mimeTypes: { [key: string]: string } = {
        pdf: "application/pdf",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        webp: "image/webp",
        doc: "application/msword",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        xls: "application/vnd.ms-excel",
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ppt: "application/vnd.ms-powerpoint",
        pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        txt: "text/plain",
        csv: "text/csv",
        mp3: "audio/mpeg",
        wav: "audio/wav",
        mp4: "video/mp4",
        mov: "video/quicktime",
      };
      if (ext && mimeTypes[ext]) {
        contentType = mimeTypes[ext];
      }
    }

    // Return the file as a blob
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Content-Length": arrayBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("[Cloud Download] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors du téléchargement" },
      { status: 500 }
    );
  }
}
