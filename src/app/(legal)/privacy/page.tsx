import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité - DocuSafe",
  description: "Politique de confidentialité de DocuSafe",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-8 shadow-xl dark:bg-neutral-800/50 sm:p-12">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Politique de confidentialité
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <div className="mt-8 space-y-8 text-neutral-700 dark:text-neutral-300">
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                1. Introduction
              </h2>
              <p className="mt-3">
                DocuSafe (&quot;nous&quot;, &quot;notre&quot;, &quot;nos&quot;) s&apos;engage à protéger la vie privée de ses utilisateurs.
                Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons
                vos informations personnelles lorsque vous utilisez notre service de gestion de documents.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                2. Informations collectées
              </h2>
              <p className="mt-3">Nous collectons les types d&apos;informations suivants :</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>
                  <strong>Informations de compte :</strong> nom, adresse e-mail, mot de passe (crypté)
                </li>
                <li>
                  <strong>Documents :</strong> les fichiers que vous téléchargez sur notre plateforme
                </li>
                <li>
                  <strong>Données d&apos;utilisation :</strong> informations sur votre utilisation du service
                </li>
                <li>
                  <strong>Informations de connexion :</strong> adresse IP, type de navigateur, appareil utilisé
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                3. Utilisation des informations
              </h2>
              <p className="mt-3">Nous utilisons vos informations pour :</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Fournir et maintenir notre service</li>
                <li>Gérer votre compte et vos documents</li>
                <li>Améliorer et personnaliser votre expérience</li>
                <li>Communiquer avec vous concernant votre compte</li>
                <li>Assurer la sécurité de notre plateforme</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                4. Intégrations tierces
              </h2>
              <p className="mt-3">
                Notre service peut s&apos;intégrer avec des services tiers comme Google Drive et OneDrive
                pour vous permettre d&apos;importer des documents. Lorsque vous utilisez ces intégrations :
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Nous accédons uniquement aux fichiers que vous sélectionnez explicitement</li>
                <li>Nous ne stockons pas vos identifiants de connexion à ces services</li>
                <li>Les tokens d&apos;accès sont utilisés temporairement et ne sont pas conservés</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                5. Stockage et sécurité
              </h2>
              <p className="mt-3">
                Vos documents sont stockés de manière sécurisée. Nous utilisons des mesures de sécurité
                appropriées pour protéger vos informations contre tout accès non autorisé, modification,
                divulgation ou destruction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                6. Partage des informations
              </h2>
              <p className="mt-3">
                Nous ne vendons, n&apos;échangeons ni ne louons vos informations personnelles à des tiers.
                Nous pouvons partager des informations uniquement dans les cas suivants :
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Avec votre consentement explicite</li>
                <li>Pour respecter une obligation légale</li>
                <li>Pour protéger nos droits et notre sécurité</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                7. Vos droits
              </h2>
              <p className="mt-3">Vous avez le droit de :</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Accéder à vos données personnelles</li>
                <li>Rectifier vos données inexactes</li>
                <li>Supprimer votre compte et vos données</li>
                <li>Exporter vos documents</li>
                <li>Retirer votre consentement à tout moment</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                8. Cookies
              </h2>
              <p className="mt-3">
                Nous utilisons des cookies essentiels pour le fonctionnement du service,
                notamment pour maintenir votre session de connexion.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                9. Modifications
              </h2>
              <p className="mt-3">
                Nous pouvons mettre à jour cette politique de confidentialité de temps à autre.
                Nous vous informerons de tout changement important par e-mail ou via notre service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                10. Contact
              </h2>
              <p className="mt-3">
                Pour toute question concernant cette politique de confidentialité,
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
