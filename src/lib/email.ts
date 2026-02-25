import { Resend } from "resend";

// Only initialize Resend if API key is available
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.FROM_EMAIL || "DocuSafe <noreply@docusafe.online>";
const APP_URL = process.env.NEXTAUTH_URL || "https://www.docusafe.online";

// Anti-spam: List-Unsubscribe headers (required by Gmail/Yahoo 2024 bulk sender rules)
const ANTI_SPAM_HEADERS = {
  "List-Unsubscribe": `<https://www.docusafe.online/unsubscribe>, <mailto:contact@docusafe.online>`,
  "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  "X-Priority": "3",
};

/** Mask email for safe logging: user@example.com → u***@e***.com */
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const domainParts = domain.split(".");
  const tld = domainParts.pop() || "";
  return `${local[0]}***@${domainParts[0]?.[0] || ""}***.${tld}`;
}

/**
 * Send welcome email when user upgrades to Pro
 */
export async function sendWelcomeProEmail(userEmail: string, userName?: string) {
  if (!resend) {
    console.warn("[Email] Resend not configured, skipping welcome email");
    return { success: false, error: "Email service not configured" };
  }

  const name = userName || "cher utilisateur";

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: "Bienvenue dans DocuSafe Pro !",
      html: getWelcomeProEmailHtml(name),
      headers: ANTI_SPAM_HEADERS,
    });

    if (error) {
      console.error("[Email] Error sending welcome email:", error);
      return { success: false, error };
    }

    console.log("[Email] Welcome Pro email sent to:", maskEmail(userEmail));
    return { success: true, data };
  } catch (error) {
    console.error("[Email] Failed to send welcome email:", error);
    return { success: false, error };
  }
}

/**
 * Send cancellation confirmation email
 */
export async function sendCancellationEmail(userEmail: string, userName?: string) {
  if (!resend) {
    console.warn("[Email] Resend not configured, skipping cancellation email");
    return { success: false, error: "Email service not configured" };
  }

  const name = userName || "cher utilisateur";

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: "Confirmation d'annulation - DocuSafe",
      html: getCancellationEmailHtml(name),
      headers: ANTI_SPAM_HEADERS,
    });

    if (error) {
      console.error("[Email] Error sending cancellation email:", error);
      return { success: false, error };
    }

    console.log("[Email] Cancellation email sent to:", maskEmail(userEmail));
    return { success: true, data };
  } catch (error) {
    console.error("[Email] Failed to send cancellation email:", error);
    return { success: false, error };
  }
}

/**
 * Welcome Pro email HTML template
 */
function getWelcomeProEmailHtml(name: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue dans DocuSafe Pro</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                DocuSafe Pro
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                Merci pour votre confiance !
              </p>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #18181b; font-size: 24px;">
                Bonjour ${name},
              </h2>

              <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">
                Nous sommes ravis de vous accueillir parmi nos utilisateurs Pro ! Votre abonnement est maintenant actif et vous avez accès à toutes les fonctionnalités premium.
              </p>

              <!-- Features box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; border-radius: 12px; margin: 30px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="margin: 0 0 16px; color: #18181b; font-size: 18px;">
                      Vos avantages Pro :
                    </h3>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #8b5cf6; font-size: 18px; margin-right: 10px;">✓</span>
                          <span style="color: #3f3f46; font-size: 15px;">Documents illimités</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #8b5cf6; font-size: 18px; margin-right: 10px;">✓</span>
                          <span style="color: #3f3f46; font-size: 15px;">100 GB de stockage sécurisé</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #8b5cf6; font-size: 18px; margin-right: 10px;">✓</span>
                          <span style="color: #3f3f46; font-size: 15px;">Tri automatique par IA</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #8b5cf6; font-size: 18px; margin-right: 10px;">✓</span>
                          <span style="color: #3f3f46; font-size: 15px;">Support prioritaire</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 30px; color: #52525b; font-size: 16px; line-height: 1.6;">
                Commencez dès maintenant à organiser vos documents en toute simplicité !
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${APP_URL}/dashboard"
                       style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 16px; font-weight: 600;">
                      Accéder à mon espace
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f5; padding: 24px 40px; text-align: center;">
              <p style="margin: 0 0 8px; color: #71717a; font-size: 14px;">
                Une question ? Contactez-nous à tout moment.
              </p>
              <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                © 2024 DocuSafe. Tous droits réservés.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(userEmail: string, token: string, userName?: string) {
  if (!resend) {
    console.warn("[Email] Resend not configured, skipping password reset email");
    return { success: false, error: "Email service not configured" };
  }

  const name = userName || "cher utilisateur";
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: "Réinitialisation de votre mot de passe - DocuSafe",
      html: getPasswordResetEmailHtml(name, resetUrl),
      headers: ANTI_SPAM_HEADERS,
    });

    if (error) {
      console.error("[Email] Error sending password reset email:", error);
      return { success: false, error };
    }

    console.log("[Email] Password reset email sent to:", maskEmail(userEmail));
    return { success: true, data };
  } catch (error) {
    console.error("[Email] Failed to send password reset email:", error);
    return { success: false, error };
  }
}

/**
 * Password reset email HTML template
 */
function getPasswordResetEmailHtml(name: string, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation de mot de passe</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                DocuSafe
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                Réinitialisation de mot de passe
              </p>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #18181b; font-size: 24px;">
                Bonjour ${name},
              </h2>

              <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">
                Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}"
                       style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-size: 16px; font-weight: 600;">
                      Réinitialiser mon mot de passe
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Warning box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-radius: 12px; margin: 30px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                      <strong>Ce lien expire dans 1 heure.</strong><br>
                      Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #71717a; font-size: 14px; line-height: 1.6;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
                <a href="${resetUrl}" style="color: #3b82f6; word-break: break-all;">${resetUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f5; padding: 24px 40px; text-align: center;">
              <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                © 2024 DocuSafe. Tous droits réservés.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Send email verification code
 */
export async function sendVerificationCodeEmail(
  userEmail: string,
  code: string,
  userName?: string
) {
  if (!resend) {
    console.warn("[Email] Resend not configured, skipping verification email");
    return { success: false, error: "Email service not configured" };
  }

  const name = userName || "cher utilisateur";

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: "Votre code de vérification - DocuSafe",
      html: getVerificationCodeEmailHtml(name, code),
      headers: ANTI_SPAM_HEADERS,
    });

    if (error) {
      console.error("[Email] Error sending verification email:", error);
      return { success: false, error };
    }

    console.log("[Email] Verification code email sent to:", maskEmail(userEmail));
    return { success: true, data };
  } catch (error) {
    console.error("[Email] Failed to send verification email:", error);
    return { success: false, error };
  }
}

/**
 * Verification code email HTML template
 */
function getVerificationCodeEmailHtml(name: string, code: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code de vérification</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">DocuSafe</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Vérification de votre email</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #18181b; font-size: 24px;">Bonjour ${name},</h2>
              <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">
                Voici votre code de vérification pour activer votre compte DocuSafe :
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: #f4f4f5; border: 2px solid #e4e4e7; border-radius: 12px; padding: 20px 40px;">
                      <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #18181b;">${code}</span>
                    </div>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-radius: 12px; margin: 30px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                      <strong>Ce code expire dans 10 minutes.</strong><br>
                      Si vous n'avez pas créé de compte sur DocuSafe, ignorez cet email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f4f4f5; padding: 24px 40px; text-align: center;">
              <p style="margin: 0; color: #a1a1aa; font-size: 12px;">&copy; ${new Date().getFullYear()} DocuSafe. Tous droits réservés.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Send document sharing email
 */
export async function sendDocumentEmail(
  to: string,
  senderName: string,
  documentName: string,
  downloadUrl: string,
  message?: string
): Promise<{ success: boolean; error?: unknown }> {
  if (!resend) {
    return { success: false, error: "Service email non configuré" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `${senderName} vous a envoyé un document - DocuSafe`,
      html: getDocumentShareEmailHtml(senderName, documentName, downloadUrl, message),
      headers: ANTI_SPAM_HEADERS,
    });

    if (error) {
      console.error("[Email] Error sending document email:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error("[Email] Failed to send document email:", error);
    return { success: false, error };
  }
}

/**
 * Document sharing email HTML template
 */
function getDocumentShareEmailHtml(
  senderName: string,
  documentName: string,
  downloadUrl: string,
  message?: string
): string {
  const messageBlock = message
    ? `
          <tr>
            <td style="padding: 0 40px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; border-radius: 12px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 6px; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Message</p>
                    <p style="margin: 0; color: #3f3f46; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
    : "";

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document partagé</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                DocuSafe
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                Document partagé avec vous
              </p>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding: 40px 40px 20px;">
              <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">
                <strong style="color: #18181b;">${senderName.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</strong> vous a envoyé un document via DocuSafe.
              </p>

              <!-- Document card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; margin: 0 0 20px;">
                <tr>
                  <td style="padding: 20px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 14px;">
                          <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 10px; text-align: center; line-height: 44px; font-size: 20px; color: white;">
                            📄
                          </div>
                        </td>
                        <td style="vertical-align: middle;">
                          <p style="margin: 0; color: #1e40af; font-size: 16px; font-weight: 600;">
                            ${documentName.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Optional message -->
          ${messageBlock}

          <!-- CTA Button -->
          <tr>
            <td style="padding: 10px 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${downloadUrl}"
                       style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 600;">
                      Télécharger le document
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0; text-align: center; color: #71717a; font-size: 13px;">
                Ce lien expire dans 48 heures.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f5; padding: 24px 40px; text-align: center;">
              <p style="margin: 0 0 8px; color: #71717a; font-size: 13px;">
                Envoyé via <strong>DocuSafe</strong> — Vos documents en toute sécurité.
              </p>
              <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                © ${new Date().getFullYear()} DocuSafe. Tous droits réservés.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Send team invitation email (Business plan)
 */
export async function sendTeamInvitationEmail(
  toEmail: string,
  ownerName: string,
  inviteToken: string
) {
  if (!resend) {
    console.warn("[Email] Resend not configured, skipping invitation email");
    return { success: false, error: "Email service not configured" };
  }

  const inviteUrl = `${process.env.NEXTAUTH_URL || "https://www.docusafe.online"}/invite/${inviteToken}`;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `${ownerName} vous invite sur DocuSafe Business`,
      html: getTeamInvitationEmailHtml(ownerName, inviteUrl),
      headers: ANTI_SPAM_HEADERS,
    });

    if (error) {
      console.error("[Email] Error sending invitation email:", error);
      return { success: false, error };
    }

    console.log("[Email] Team invitation sent to:", toEmail);
    return { success: true, data };
  } catch (error) {
    console.error("[Email] Failed to send invitation email:", error);
    return { success: false, error };
  }
}

function getTeamInvitationEmailHtml(ownerName: string, inviteUrl: string): string {
  const safeOwnerName = ownerName.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation DocuSafe Business</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                DocuSafe Business
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                Invitation à rejoindre une équipe
              </p>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #18181b; font-size: 24px;">
                Vous avez été invité !
              </h2>

              <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">
                <strong>${safeOwnerName}</strong> vous invite à rejoindre son espace DocuSafe Business. Vous aurez accès à tous les documents et dossiers partagés de l'équipe.
              </p>

              <!-- Features box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 12px; margin: 30px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 12px; color: #166534; font-size: 14px; font-weight: 600;">Ce que vous obtenez :</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr><td style="padding: 4px 0; color: #166534; font-size: 14px;">&#10003; Stockage illimité</td></tr>
                      <tr><td style="padding: 4px 0; color: #166534; font-size: 14px;">&#10003; IA d'analyse illimitée</td></tr>
                      <tr><td style="padding: 4px 0; color: #166534; font-size: 14px;">&#10003; Documents et dossiers partagés</td></tr>
                      <tr><td style="padding: 4px 0; color: #166534; font-size: 14px;">&#10003; Toutes les fonctionnalités Business</td></tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${inviteUrl}" target="_blank" style="display: inline-block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-size: 16px; font-weight: 600;">
                      Accepter l'invitation
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0; color: #71717a; font-size: 14px; line-height: 1.6; text-align: center;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien :<br>
                <a href="${inviteUrl}" style="color: #7c3aed; word-break: break-all;">${inviteUrl}</a>
              </p>

              <p style="margin: 20px 0 0; color: #a1a1aa; font-size: 13px; text-align: center;">
                Ce lien expire dans 7 jours.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f5; padding: 24px 40px; text-align: center;">
              <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                &copy; ${new Date().getFullYear()} DocuSafe. Tous droits réservés.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Send document expiry alert email
 */
export async function sendExpiryAlertEmail(
  userEmail: string,
  userName: string | undefined,
  documentName: string,
  expiryDate: Date,
  daysLeft: number
) {
  if (!resend) {
    console.warn("[Email] Resend not configured, skipping expiry alert email");
    return { success: false, error: "Email service not configured" };
  }

  const name = userName || "cher utilisateur";
  const baseUrl = process.env.NEXTAUTH_URL || "https://www.docusafe.online";
  const dashboardUrl = `${baseUrl}/dashboard/documents`;
  const formattedDate = expiryDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const urgency =
    daysLeft <= 7
      ? { label: "URGENT", color: "#ef4444", bg: "#fef2f2", border: "#fecaca" }
      : daysLeft <= 30
      ? { label: "BIENTÔT", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" }
      : { label: "À RENOUVELER", color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" };

  const subject =
    daysLeft <= 1
      ? `⚠️ Document expiré aujourd'hui : ${documentName}`
      : `⏰ Rappel J-${daysLeft} : ${documentName} expire bientôt`;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject,
      html: getExpiryAlertEmailHtml(name, documentName, formattedDate, daysLeft, urgency, dashboardUrl),
      headers: ANTI_SPAM_HEADERS,
    });

    if (error) {
      console.error("[Email] Error sending expiry alert email:", error);
      return { success: false, error };
    }

    console.log("[Email] Expiry alert sent to:", maskEmail(userEmail), "daysLeft:", daysLeft);
    return { success: true, data };
  } catch (error) {
    console.error("[Email] Failed to send expiry alert email:", error);
    return { success: false, error };
  }
}

function getExpiryAlertEmailHtml(
  name: string,
  documentName: string,
  formattedDate: string,
  daysLeft: number,
  urgency: { label: string; color: string; bg: string; border: string },
  dashboardUrl: string
): string {
  const safeDocName = documentName.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safeDate = formattedDate.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const daysText =
    daysLeft <= 0
      ? "Ce document a expiré aujourd'hui."
      : daysLeft === 1
      ? "Ce document expire <strong>demain</strong>."
      : `Ce document expire dans <strong>${daysLeft} jours</strong>.`;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rappel d'expiration - DocuSafe</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">DocuSafe</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Rappel de renouvellement</p>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #18181b; font-size: 24px;">Bonjour ${name},</h2>

              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px; line-height: 1.6;">
                ${daysText}
              </p>

              <!-- Document card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${urgency.bg}; border: 1px solid ${urgency.border}; border-radius: 12px; margin: 0 0 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <span style="display: inline-block; background-color: ${urgency.color}; color: white; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; padding: 3px 10px; border-radius: 20px; margin-bottom: 12px;">${urgency.label}</span>
                          <p style="margin: 0 0 6px; color: #18181b; font-size: 16px; font-weight: 600;">${safeDocName}</p>
                          <p style="margin: 0; color: #71717a; font-size: 14px;">Date d'expiration : <strong style="color: ${urgency.color};">${safeDate}</strong></p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 30px; color: #52525b; font-size: 15px; line-height: 1.6;">
                Pensez à renouveler ce document dès que possible pour éviter tout désagrément.
                Vous pouvez retrouver ce document directement dans votre espace DocuSafe.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${dashboardUrl}"
                       style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 600;">
                      Voir mes documents
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f5; padding: 24px 40px; text-align: center;">
              <p style="margin: 0 0 6px; color: #71717a; font-size: 13px;">
                Vous recevez cet email car vous avez activé les alertes de renouvellement sur DocuSafe.
              </p>
              <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                &copy; ${new Date().getFullYear()} DocuSafe. Tous droits réservés.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Send welcome email after email verification (free plan)
 */
export async function sendWelcomeFreeEmail(userEmail: string, userName?: string) {
  if (!resend) return { success: false, error: "Email service not configured" };
  const name = userName || "cher utilisateur";
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: "Votre compte DocuSafe est prêt !",
      html: getWelcomeFreeEmailHtml(name),
      headers: ANTI_SPAM_HEADERS,
    });
    if (error) return { success: false, error };
    console.log("[Email] Welcome free email sent to:", maskEmail(userEmail));
    return { success: true, data };
  } catch (error) {
    console.error("[Email] Failed to send welcome free email:", error);
    return { success: false, error };
  }
}

/**
 * Send welcome email for Student plan
 */
export async function sendWelcomeStudentEmail(userEmail: string, userName?: string) {
  if (!resend) return { success: false, error: "Email service not configured" };
  const name = userName || "cher utilisateur";
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: "Bienvenue dans DocuSafe Étudiant !",
      html: getWelcomeStudentEmailHtml(name),
      headers: ANTI_SPAM_HEADERS,
    });
    if (error) return { success: false, error };
    console.log("[Email] Welcome Student email sent to:", maskEmail(userEmail));
    return { success: true, data };
  } catch (error) {
    console.error("[Email] Failed to send welcome student email:", error);
    return { success: false, error };
  }
}

/**
 * Send welcome email for Business plan
 */
export async function sendWelcomeBusinessEmail(userEmail: string, userName?: string) {
  if (!resend) return { success: false, error: "Email service not configured" };
  const name = userName || "cher utilisateur";
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: "Bienvenue dans DocuSafe Business !",
      html: getWelcomeBusinessEmailHtml(name),
      headers: ANTI_SPAM_HEADERS,
    });
    if (error) return { success: false, error };
    console.log("[Email] Welcome Business email sent to:", maskEmail(userEmail));
    return { success: true, data };
  } catch (error) {
    console.error("[Email] Failed to send welcome business email:", error);
    return { success: false, error };
  }
}

/**
 * Send account deletion confirmation email
 */
export async function sendAccountDeletionEmail(userEmail: string, userName?: string) {
  if (!resend) return { success: false, error: "Email service not configured" };
  const name = userName || "cher utilisateur";
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: "Votre compte DocuSafe a été supprimé",
      html: getAccountDeletionEmailHtml(name),
      headers: ANTI_SPAM_HEADERS,
    });
    if (error) return { success: false, error };
    console.log("[Email] Account deletion email sent to:", maskEmail(userEmail));
    return { success: true, data };
  } catch (error) {
    console.error("[Email] Failed to send account deletion email:", error);
    return { success: false, error };
  }
}

/**
 * Send payment failed alert email
 */
export async function sendPaymentFailedEmail(userEmail: string, userName?: string) {
  if (!resend) return { success: false, error: "Email service not configured" };
  const name = userName || "cher utilisateur";
  const billingUrl = `${APP_URL}/dashboard/subscription`;
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: "Problème de paiement - Action requise",
      html: getPaymentFailedEmailHtml(name, billingUrl),
      headers: ANTI_SPAM_HEADERS,
    });
    if (error) return { success: false, error };
    console.log("[Email] Payment failed email sent to:", maskEmail(userEmail));
    return { success: true, data };
  } catch (error) {
    console.error("[Email] Failed to send payment failed email:", error);
    return { success: false, error };
  }
}

function getWelcomeFreeEmailHtml(name: string): string {
  const dashboardUrl = `${APP_URL}/dashboard`;
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue sur DocuSafe</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">DocuSafe</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Votre espace documentaire sécurisé</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #18181b; font-size: 22px;">Bienvenue ${name} !</h2>
              <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">
                Votre compte est maintenant actif. Vous pouvez commencer à stocker et organiser vos documents en toute sécurité.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border-radius: 12px; margin: 0 0 28px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 14px; color: #1e40af; font-size: 15px; font-weight: 600;">Ce que vous pouvez faire avec le plan gratuit :</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr><td style="padding: 5px 0; color: #3b82f6; font-size: 14px;">&#10003;&nbsp; Stocker jusqu'à 15 documents</td></tr>
                      <tr><td style="padding: 5px 0; color: #3b82f6; font-size: 14px;">&#10003;&nbsp; 1 Go de stockage sécurisé</td></tr>
                      <tr><td style="padding: 5px 0; color: #3b82f6; font-size: 14px;">&#10003;&nbsp; Organisation en dossiers</td></tr>
                      <tr><td style="padding: 5px 0; color: #3b82f6; font-size: 14px;">&#10003;&nbsp; Chiffrement AES-256</td></tr>
                    </table>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 600;">
                      Accéder à mon espace
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f4f4f5; padding: 24px 40px; text-align: center;">
              <p style="margin: 0 0 6px; color: #71717a; font-size: 13px;">
                Vous recevez cet email car vous venez de créer un compte sur DocuSafe.
              </p>
              <p style="margin: 0; color: #a1a1aa; font-size: 12px;">&copy; ${new Date().getFullYear()} DocuSafe. Tous droits réservés.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function getWelcomeStudentEmailHtml(name: string): string {
  const dashboardUrl = `${APP_URL}/dashboard`;
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue dans DocuSafe Étudiant</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">DocuSafe Étudiant</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Merci pour votre confiance !</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #18181b; font-size: 22px;">Bienvenue ${name} !</h2>
              <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">
                Votre abonnement Étudiant est actif. Organisez tous vos documents de scolarité, stages et démarches administratives en un seul endroit sécurisé.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ecfdf5; border-radius: 12px; margin: 0 0 28px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 14px; color: #065f46; font-size: 15px; font-weight: 600;">Vos avantages Étudiant :</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr><td style="padding: 5px 0; color: #10b981; font-size: 14px;">&#10003;&nbsp; Documents illimités</td></tr>
                      <tr><td style="padding: 5px 0; color: #10b981; font-size: 14px;">&#10003;&nbsp; Stockage étendu sécurisé</td></tr>
                      <tr><td style="padding: 5px 0; color: #10b981; font-size: 14px;">&#10003;&nbsp; Tri automatique par IA</td></tr>
                      <tr><td style="padding: 5px 0; color: #10b981; font-size: 14px;">&#10003;&nbsp; Alertes de renouvellement (carte étudiant, visas…)</td></tr>
                      <tr><td style="padding: 5px 0; color: #10b981; font-size: 14px;">&#10003;&nbsp; Partage sécurisé de documents</td></tr>
                    </table>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 600;">
                      Accéder à mon espace
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f4f4f5; padding: 24px 40px; text-align: center;">
              <p style="margin: 0 0 6px; color: #71717a; font-size: 13px;">
                Vous recevez cet email car vous venez de souscrire à DocuSafe Étudiant.
              </p>
              <p style="margin: 0; color: #a1a1aa; font-size: 12px;">&copy; ${new Date().getFullYear()} DocuSafe. Tous droits réservés.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function getWelcomeBusinessEmailHtml(name: string): string {
  const dashboardUrl = `${APP_URL}/dashboard`;
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue dans DocuSafe Business</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">DocuSafe Business</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Merci pour votre confiance !</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #18181b; font-size: 22px;">Bienvenue ${name} !</h2>
              <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">
                Votre abonnement Business est actif. Vous avez maintenant accès à toutes les fonctionnalités avancées, y compris la gestion d'équipe.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f3ff; border-radius: 12px; margin: 0 0 28px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 14px; color: #5b21b6; font-size: 15px; font-weight: 600;">Vos avantages Business :</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr><td style="padding: 5px 0; color: #7c3aed; font-size: 14px;">&#10003;&nbsp; Documents et stockage illimités</td></tr>
                      <tr><td style="padding: 5px 0; color: #7c3aed; font-size: 14px;">&#10003;&nbsp; Gestion d'équipe (invitations, rôles)</td></tr>
                      <tr><td style="padding: 5px 0; color: #7c3aed; font-size: 14px;">&#10003;&nbsp; IA d'analyse illimitée</td></tr>
                      <tr><td style="padding: 5px 0; color: #7c3aed; font-size: 14px;">&#10003;&nbsp; Dossiers et documents privés par membre</td></tr>
                      <tr><td style="padding: 5px 0; color: #7c3aed; font-size: 14px;">&#10003;&nbsp; Support prioritaire</td></tr>
                    </table>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 600;">
                      Accéder à mon espace
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f4f4f5; padding: 24px 40px; text-align: center;">
              <p style="margin: 0 0 6px; color: #71717a; font-size: 13px;">
                Vous recevez cet email car vous venez de souscrire à DocuSafe Business.
              </p>
              <p style="margin: 0; color: #a1a1aa; font-size: 12px;">&copy; ${new Date().getFullYear()} DocuSafe. Tous droits réservés.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function getAccountDeletionEmailHtml(name: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Compte supprimé - DocuSafe</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
          <tr>
            <td style="background-color: #18181b; padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">DocuSafe</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.7); font-size: 16px;">Confirmation de suppression</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #18181b; font-size: 22px;">Bonjour ${name},</h2>
              <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">
                Nous confirmons que votre compte DocuSafe et toutes vos données ont été définitivement supprimés.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; margin: 0 0 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px; font-weight: 600;">Ce qui a été supprimé :</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr><td style="padding: 4px 0; color: #6b7280; font-size: 14px;">&#10003;&nbsp; Votre compte et vos informations personnelles</td></tr>
                      <tr><td style="padding: 4px 0; color: #6b7280; font-size: 14px;">&#10003;&nbsp; Tous vos documents et fichiers stockés</td></tr>
                      <tr><td style="padding: 4px 0; color: #6b7280; font-size: 14px;">&#10003;&nbsp; Vos dossiers et paramètres</td></tr>
                      <tr><td style="padding: 4px 0; color: #6b7280; font-size: 14px;">&#10003;&nbsp; Votre abonnement (si applicable)</td></tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 20px; color: #52525b; font-size: 15px; line-height: 1.6;">
                Conformément au RGPD, toutes vos données ont été effacées de nos serveurs. Nous espérons vous revoir un jour !
              </p>
              <p style="margin: 0; color: #71717a; font-size: 14px; line-height: 1.6;">
                Si vous n'avez pas demandé cette suppression ou si vous pensez que c'est une erreur, contactez-nous immédiatement à <a href="mailto:contact@docusafe.online" style="color: #3b82f6;">contact@docusafe.online</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f4f4f5; padding: 24px 40px; text-align: center;">
              <p style="margin: 0; color: #a1a1aa; font-size: 12px;">&copy; ${new Date().getFullYear()} DocuSafe. Tous droits réservés.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function getPaymentFailedEmailHtml(name: string, billingUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Problème de paiement - DocuSafe</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
          <tr>
            <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">DocuSafe</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Action requise</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #18181b; font-size: 22px;">Bonjour ${name},</h2>
              <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">
                Nous n'avons pas pu traiter le paiement de votre abonnement DocuSafe.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; margin: 0 0 28px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 8px; color: #991b1b; font-size: 15px; font-weight: 600;">Ce que vous devez faire :</p>
                    <p style="margin: 0; color: #b91c1c; font-size: 14px; line-height: 1.6;">
                      Vérifiez que votre carte bancaire est valide et que votre solde est suffisant. Mettez à jour vos informations de paiement pour éviter toute interruption de service.
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 28px; color: #52525b; font-size: 15px; line-height: 1.6;">
                Si le problème persiste, votre abonnement pourrait être suspendu. Mettez à jour votre moyen de paiement dès que possible.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${billingUrl}" style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 600;">
                      Mettre à jour mon paiement
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; color: #71717a; font-size: 14px; text-align: center; line-height: 1.6;">
                Besoin d'aide ? Contactez-nous à <a href="mailto:contact@docusafe.online" style="color: #3b82f6;">contact@docusafe.online</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f4f4f5; padding: 24px 40px; text-align: center;">
              <p style="margin: 0 0 6px; color: #71717a; font-size: 13px;">
                Vous recevez cet email car vous avez un abonnement actif sur DocuSafe.
              </p>
              <p style="margin: 0; color: #a1a1aa; font-size: 12px;">&copy; ${new Date().getFullYear()} DocuSafe. Tous droits réservés.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function getCancellationEmailHtml(name: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation d'annulation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color: #18181b; padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                DocuSafe
              </h1>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #18181b; font-size: 24px;">
                Bonjour ${name},
              </h2>

              <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">
                Nous confirmons l'annulation de votre abonnement Pro. Votre accès aux fonctionnalités premium restera actif jusqu'à la fin de votre période de facturation en cours.
              </p>

              <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">
                Vous pourrez toujours accéder à vos documents avec le plan gratuit (15 documents, 1 GB de stockage).
              </p>

              <!-- Info box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-radius: 12px; margin: 30px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                      <strong>Vous avez changé d'avis ?</strong><br>
                      Vous pouvez vous réabonner à tout moment depuis votre espace personnel.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 30px; color: #52525b; font-size: 16px; line-height: 1.6;">
                Merci d'avoir utilisé DocuSafe Pro. Nous espérons vous revoir bientôt !
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${APP_URL}/dashboard/subscription"
                       style="display: inline-block; background-color: #18181b; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 16px; font-weight: 600;">
                      Se réabonner
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f5; padding: 24px 40px; text-align: center;">
              <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                © 2024 DocuSafe. Tous droits réservés.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
