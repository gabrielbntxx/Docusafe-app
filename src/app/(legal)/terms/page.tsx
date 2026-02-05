import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions d'utilisation - DocuSafe",
  description: "Conditions d'utilisation de DocuSafe",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-8 shadow-xl dark:bg-neutral-800/50 sm:p-12">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Conditions d&apos;utilisation
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <div className="mt-8 space-y-8 text-neutral-700 dark:text-neutral-300">
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                1. Acceptation des conditions
              </h2>
              <p className="mt-3">
                En accédant et en utilisant DocuSafe, vous acceptez d&apos;être lié par ces conditions d&apos;utilisation.
                Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser notre service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                2. Description du service
              </h2>
              <p className="mt-3">
                DocuSafe est une plateforme de gestion de documents qui vous permet de :
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Télécharger et stocker des documents</li>
                <li>Organiser vos fichiers dans des dossiers</li>
                <li>Importer des documents depuis des services cloud (Google Drive, OneDrive)</li>
                <li>Partager des documents avec d&apos;autres utilisateurs</li>
                <li>Utiliser l&apos;IA pour classer automatiquement vos documents</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                3. Compte utilisateur
              </h2>
              <p className="mt-3">Pour utiliser notre service, vous devez :</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Créer un compte avec des informations exactes</li>
                <li>Maintenir la confidentialité de vos identifiants</li>
                <li>Être responsable de toutes les activités sur votre compte</li>
                <li>Nous informer immédiatement de toute utilisation non autorisée</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                4. Utilisation acceptable
              </h2>
              <p className="mt-3">Vous vous engagez à ne pas :</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Utiliser le service à des fins illégales</li>
                <li>Télécharger des contenus illicites, offensants ou portant atteinte aux droits d&apos;autrui</li>
                <li>Tenter d&apos;accéder aux comptes d&apos;autres utilisateurs</li>
                <li>Perturber ou surcharger nos systèmes</li>
                <li>Utiliser des robots ou des scripts automatisés sans autorisation</li>
                <li>Contourner les mesures de sécurité du service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                5. Propriété intellectuelle
              </h2>
              <p className="mt-3">
                Vous conservez tous les droits sur les documents que vous téléchargez.
                En téléchargeant du contenu, vous nous accordez une licence limitée pour
                stocker et afficher ce contenu dans le cadre du service.
              </p>
              <p className="mt-3">
                DocuSafe et son contenu (hors documents utilisateurs) sont protégés par les lois
                sur la propriété intellectuelle.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                6. Abonnements et paiements
              </h2>
              <p className="mt-3">
                Certaines fonctionnalités peuvent nécessiter un abonnement payant.
                Les conditions de paiement sont les suivantes :
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Les prix sont indiqués TTC</li>
                <li>Les abonnements sont renouvelés automatiquement</li>
                <li>Vous pouvez annuler à tout moment avant le renouvellement</li>
                <li>Aucun remboursement pour les périodes partielles</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                7. Limites de stockage
              </h2>
              <p className="mt-3">
                Chaque plan dispose de limites de stockage spécifiques. Si vous dépassez ces limites,
                vous devrez supprimer des fichiers ou passer à un plan supérieur.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                8. Disponibilité du service
              </h2>
              <p className="mt-3">
                Nous nous efforçons de maintenir le service disponible 24h/24, mais nous ne garantissons pas
                une disponibilité ininterrompue. Des maintenances planifiées peuvent occasionner des interruptions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                9. Limitation de responsabilité
              </h2>
              <p className="mt-3">
                DocuSafe est fourni &quot;tel quel&quot;. Nous ne garantissons pas que le service sera exempt
                d&apos;erreurs ou de virus. Dans la limite permise par la loi, nous déclinons toute responsabilité
                pour les dommages indirects résultant de l&apos;utilisation du service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                10. Résiliation
              </h2>
              <p className="mt-3">
                Vous pouvez supprimer votre compte à tout moment. Nous nous réservons le droit de suspendre
                ou de résilier votre accès en cas de violation de ces conditions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                11. Modifications des conditions
              </h2>
              <p className="mt-3">
                Nous pouvons modifier ces conditions à tout moment. Les modifications importantes vous seront
                notifiées par e-mail ou via le service. La poursuite de l&apos;utilisation du service après
                modification vaut acceptation des nouvelles conditions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                12. Droit applicable
              </h2>
              <p className="mt-3">
                Ces conditions sont régies par le droit français. Tout litige sera soumis aux tribunaux compétents.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                13. Contact
              </h2>
              <p className="mt-3">
                Pour toute question concernant ces conditions d&apos;utilisation,
                vous pouvez nous contacter à : <a href="mailto:contact@docusafe.app" className="text-blue-600 hover:underline dark:text-blue-400">contact@docusafe.app</a>
              </p>
            </section>
          </div>

          <div className="mt-12 border-t border-neutral-200 pt-8 dark:border-neutral-700">
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
            >
              ← Retour à l&apos;accueil
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
