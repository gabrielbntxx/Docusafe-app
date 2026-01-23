import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || "DocuSafe <noreply@docusafe.app>";

/**
 * Send welcome email when user upgrades to Pro
 */
export async function sendWelcomeProEmail(userEmail: string, userName?: string) {
  const name = userName || "cher utilisateur";

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: "Bienvenue dans DocuSafe Pro !",
      html: getWelcomeProEmailHtml(name),
    });

    if (error) {
      console.error("[Email] Error sending welcome email:", error);
      return { success: false, error };
    }

    console.log("[Email] Welcome Pro email sent to:", userEmail);
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
  const name = userName || "cher utilisateur";

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: "Confirmation d'annulation - DocuSafe",
      html: getCancellationEmailHtml(name),
    });

    if (error) {
      console.error("[Email] Error sending cancellation email:", error);
      return { success: false, error };
    }

    console.log("[Email] Cancellation email sent to:", userEmail);
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
                          <span style="color: #3f3f46; font-size: 15px;">10 GB de stockage sécurisé</span>
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
                    <a href="https://justif-app-production.up.railway.app/dashboard"
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
 * Cancellation email HTML template
 */
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
                Vous pourrez toujours accéder à vos documents avec le plan gratuit (5 documents, 2 MB de stockage).
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
                    <a href="https://justif-app-production.up.railway.app/dashboard/subscription"
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
