import { NextRequest, NextResponse } from "next/server";

/**
 * OneDrive OAuth Callback Handler
 *
 * This endpoint handles the OAuth redirect from Microsoft/OneDrive.
 * The OneDrive File Picker SDK opens a popup and redirects here after authentication.
 * We need to post the message back to the parent window so the SDK can continue.
 */
export async function GET(request: NextRequest) {
  // Get all query parameters from the URL
  const searchParams = request.nextUrl.searchParams;
  const params = Object.fromEntries(searchParams.entries());

  // Create an HTML page that posts the authentication result back to the parent window
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>OneDrive - Redirecting...</title>
</head>
<body>
  <script>
    // Pass the authentication response back to the parent window
    if (window.opener) {
      window.opener.postMessage(${JSON.stringify(params)}, window.location.origin);
    }
    // Close the popup
    window.close();
  </script>
  <p>Authentication complete. This window should close automatically.</p>
  <p>If it doesn't close, you can close it manually.</p>
</body>
</html>
  `.trim();

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}

/**
 * Handle POST requests (some OAuth flows may POST instead of GET)
 */
export async function POST(request: NextRequest) {
  return GET(request);
}
