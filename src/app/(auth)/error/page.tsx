import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const error = searchParams.error;

  const getErrorMessage = (error?: string) => {
    switch (error) {
      case "Configuration":
        return "Il y a un problème avec la configuration du serveur.";
      case "AccessDenied":
        return "Accès refusé. Vous n'avez pas la permission d'accéder à cette ressource.";
      case "Verification":
        return "Le token de vérification a expiré ou a déjà été utilisé.";
      case "OAuthSignin":
        return "Erreur lors de la connexion avec le fournisseur OAuth.";
      case "OAuthCallback":
        return "Erreur lors du callback OAuth.";
      case "OAuthCreateAccount":
        return "Impossible de créer un compte OAuth.";
      case "EmailCreateAccount":
        return "Impossible de créer un compte email.";
      case "Callback":
        return "Erreur lors du callback d'authentification.";
      case "OAuthAccountNotLinked":
        return "Cet email est déjà utilisé avec une autre méthode de connexion.";
      case "EmailSignin":
        return "Impossible d'envoyer l'email de connexion.";
      case "CredentialsSignin":
        return "Identifiants invalides. Vérifiez votre email et mot de passe.";
      case "SessionRequired":
        return "Vous devez être connecté pour accéder à cette page.";
      default:
        return "Une erreur inattendue s'est produite lors de l'authentification.";
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
      <Link href="/" className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
          Justif&apos;
        </h1>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-red-600">
            Erreur d&apos;authentification
          </CardTitle>
          <CardDescription>
            {getErrorMessage(error)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">
              {error && <span className="font-mono text-xs">Code: {error}</span>}
            </p>
          </div>

          <div className="flex gap-3">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/login">
                Réessayer
              </Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/">
                Retour à l&apos;accueil
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
