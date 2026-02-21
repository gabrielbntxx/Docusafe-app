import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité – DocuSafe",
  description: "Politique de confidentialité et traitement des données personnelles conforme au RGPD. Version en vigueur au 21 février 2026.",
};

const PRIVACY_VERSION = "21 février 2026";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-8 shadow-xl dark:bg-neutral-800/50 sm:p-12">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Politique de confidentialité
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Version du {PRIVACY_VERSION} — Conforme au Règlement (UE) 2016/679 (RGPD)
          </p>

          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800/40 dark:bg-blue-900/20 dark:text-blue-300">
            Vos données vous appartiennent. Cette politique explique de façon transparente comment DocuSafe
            les collecte, les utilise et les protège, conformément au RGPD et à la loi Informatique et Libertés.
          </div>

          <div className="mt-10 space-y-10 text-neutral-700 dark:text-neutral-300">

            {/* ─── Article 1 ─── */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                1. Responsable du traitement
              </h2>
              <p className="mt-3">
                Le responsable du traitement de vos données personnelles est :
              </p>
              <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4 font-mono text-sm dark:border-neutral-700 dark:bg-neutral-800">
                <p><strong>DocuSafe SAS</strong></p>
                <p className="mt-1"><strong>Contact RGPD :</strong>{" "}
                  <a href="mailto:privacy@docusafe.online" className="text-blue-600 hover:underline dark:text-blue-400">
                    privacy@docusafe.online
                  </a>
                </p>
                <p className="mt-1"><strong>Délégué à la Protection des Données (DPO) :</strong>{" "}
                  <a href="mailto:privacy@docusafe.online" className="text-blue-600 hover:underline dark:text-blue-400">
                    privacy@docusafe.online
                  </a>
                </p>
              </div>
            </section>

            {/* ─── Article 2 ─── */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                2. Données collectées et bases légales (Art. 6 RGPD)
              </h2>
              <p className="mt-3">
                DocuSafe collecte uniquement les données strictement nécessaires à la fourniture du Service
                (principe de minimisation — Art. 5 RGPD). Voici le détail de chaque traitement :
              </p>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <th className="py-2 pr-4 text-left font-semibold text-neutral-900 dark:text-white">Données</th>
                      <th className="py-2 pr-4 text-left font-semibold text-neutral-900 dark:text-white">Finalité</th>
                      <th className="py-2 text-left font-semibold text-neutral-900 dark:text-white">Base légale (Art. 6 RGPD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    <tr>
                      <td className="py-2 pr-4 align-top">Email, nom, mot de passe (haché)</td>
                      <td className="py-2 pr-4 align-top">Création et gestion du compte</td>
                      <td className="py-2 align-top">Exécution du contrat (6.1.b)</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 align-top">Documents téléversés</td>
                      <td className="py-2 pr-4 align-top">Stockage sécurisé, classification IA</td>
                      <td className="py-2 align-top">Exécution du contrat (6.1.b)</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 align-top">Données de paiement (token Stripe)</td>
                      <td className="py-2 pr-4 align-top">Facturation et gestion abonnement</td>
                      <td className="py-2 align-top">Exécution du contrat (6.1.b) + Obligation légale (6.1.c)</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 align-top">Adresse IP, logs de connexion</td>
                      <td className="py-2 pr-4 align-top">Sécurité, détection de fraude</td>
                      <td className="py-2 align-top">Intérêt légitime (6.1.f)</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 align-top">Langue, préférences, thème</td>
                      <td className="py-2 pr-4 align-top">Personnalisation de l&apos;interface</td>
                      <td className="py-2 align-top">Exécution du contrat (6.1.b)</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 align-top">Date d&apos;acceptation des CGU</td>
                      <td className="py-2 pr-4 align-top">Preuve du consentement</td>
                      <td className="py-2 align-top">Obligation légale (6.1.c) + Intérêt légitime (6.1.f)</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 align-top">Données d&apos;usage (statistiques anonymisées)</td>
                      <td className="py-2 pr-4 align-top">Amélioration du service</td>
                      <td className="py-2 align-top">Intérêt légitime (6.1.f)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* ─── Article 3 ─── */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                3. Chiffrement et sécurité des données
              </h2>
              <p className="mt-3">
                DocuSafe applique le principe de <strong>chiffrement de bout en bout</strong> pour vos documents :
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Chaque document est chiffré avec une <strong>clé de chiffrement personnelle</strong> unique à votre compte
                  (algorithme AES-256-GCM), dérivée d&apos;une clé maître stockée séparément ;</li>
                <li>Les documents ne sont déchiffrés qu&apos;à la demande, au moment de votre consultation, et uniquement
                  pour votre compte ;</li>
                <li>Les mots de passe sont hachés avec bcrypt (facteur de travail ≥ 12) — DocuSafe n&apos;a pas accès
                  à votre mot de passe en clair ;</li>
                <li>Toutes les communications sont chiffrées via TLS 1.3 ;</li>
                <li>L&apos;accès aux données de production est restreint aux seuls membres autorisés de l&apos;équipe DocuSafe,
                  avec journalisation des accès.</li>
              </ul>
            </section>

            {/* ─── Article 4 ─── */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                4. Sous-traitants et transferts de données
              </h2>
              <p className="mt-3">
                DocuSafe fait appel aux sous-traitants suivants, sélectionnés pour leurs garanties en matière de
                protection des données (Art. 28 RGPD) :
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <th className="py-2 pr-4 text-left font-semibold text-neutral-900 dark:text-white">Sous-traitant</th>
                      <th className="py-2 pr-4 text-left font-semibold text-neutral-900 dark:text-white">Rôle</th>
                      <th className="py-2 pr-4 text-left font-semibold text-neutral-900 dark:text-white">Localisation</th>
                      <th className="py-2 text-left font-semibold text-neutral-900 dark:text-white">Garantie</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    <tr>
                      <td className="py-2 pr-4">Railway Technologies</td>
                      <td className="py-2 pr-4">Hébergement applicatif</td>
                      <td className="py-2 pr-4">USA (UE disponible)</td>
                      <td className="py-2">Clauses contractuelles types UE</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Cloudflare R2</td>
                      <td className="py-2 pr-4">Stockage objet chiffré</td>
                      <td className="py-2 pr-4">USA / UE</td>
                      <td className="py-2">Clauses contractuelles types UE</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Stripe Inc.</td>
                      <td className="py-2 pr-4">Paiement</td>
                      <td className="py-2 pr-4">USA / UE</td>
                      <td className="py-2">Certifié PCI-DSS, CCT UE</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Resend</td>
                      <td className="py-2 pr-4">Envoi d&apos;e-mails transactionnels</td>
                      <td className="py-2 pr-4">USA</td>
                      <td className="py-2">Clauses contractuelles types UE</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Google LLC</td>
                      <td className="py-2 pr-4">OAuth (connexion Google), IA (Gemini)</td>
                      <td className="py-2 pr-4">USA / UE</td>
                      <td className="py-2">Clauses contractuelles types UE</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">PlanetScale / Neon (ou équivalent)</td>
                      <td className="py-2 pr-4">Base de données</td>
                      <td className="py-2 pr-4">USA / UE</td>
                      <td className="py-2">Clauses contractuelles types UE</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4">
                Les transferts vers des pays hors UE reposent sur les <strong>Clauses Contractuelles Types (CCT)</strong> adoptées
                par la Commission européenne, conformément à l&apos;article 46 RGPD. Aucune donnée n&apos;est transférée
                vers des pays ne disposant pas d&apos;un niveau de protection adéquat sans garanties appropriées.
              </p>
            </section>

            {/* ─── Article 5 ─── */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                5. Durées de conservation
              </h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <th className="py-2 pr-4 text-left font-semibold text-neutral-900 dark:text-white">Donnée</th>
                      <th className="py-2 text-left font-semibold text-neutral-900 dark:text-white">Durée de conservation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    <tr>
                      <td className="py-2 pr-4">Données de compte actif</td>
                      <td className="py-2">Durée de la relation contractuelle</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Documents utilisateur</td>
                      <td className="py-2">Durée de la relation contractuelle + 30 jours après résiliation</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Données de facturation et factures</td>
                      <td className="py-2">10 ans (obligation comptable légale)</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Logs de connexion et sécurité</td>
                      <td className="py-2">12 mois (L34-1 CPCE)</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Preuve d&apos;acceptation des CGU</td>
                      <td className="py-2">5 ans après la fin de la relation contractuelle</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Compte inactif (plan gratuit)</td>
                      <td className="py-2">24 mois d&apos;inactivité puis suppression avec préavis par e-mail</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* ─── Article 6 ─── */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                6. Intelligence artificielle et traitement de vos documents
              </h2>
              <p className="mt-3">
                DocuSafe utilise des modèles d&apos;intelligence artificielle (Google Gemini) pour analyser et classifier
                vos documents. Ce traitement intervient uniquement :
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>à votre demande explicite (lors du téléversement ou via DocuBot) ;</li>
                <li>via des requêtes sécurisées à l&apos;API de Google, sans stockage permanent des données par Google
                  pour l&apos;entraînement de leurs modèles (conformément à nos accords de sous-traitance) ;</li>
                <li>sur des documents déchiffrés temporairement le temps de l&apos;analyse, puis rechiffrés immédiatement.</li>
              </ul>
              <p className="mt-3">
                Vous pouvez désactiver l&apos;analyse IA automatique dans les paramètres de votre compte.
                DocuSafe n&apos;utilise pas vos documents pour entraîner ses propres modèles d&apos;IA.
              </p>
            </section>

            {/* ─── Article 7 ─── */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                7. Vos droits (Art. 12 à 22 RGPD)
              </h2>
              <p className="mt-3">
                Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li><strong>Droit d&apos;accès (Art. 15) :</strong> obtenir une copie de vos données ;</li>
                <li><strong>Droit de rectification (Art. 16) :</strong> corriger des données inexactes ;</li>
                <li><strong>Droit à l&apos;effacement / &quot;droit à l&apos;oubli&quot; (Art. 17) :</strong> demander la suppression
                  de vos données (sous réserve des obligations légales de conservation) ;</li>
                <li><strong>Droit à la portabilité (Art. 20) :</strong> recevoir vos données dans un format structuré
                  et lisible par machine ;</li>
                <li><strong>Droit d&apos;opposition (Art. 21) :</strong> vous opposer au traitement basé sur l&apos;intérêt légitime ;</li>
                <li><strong>Droit à la limitation du traitement (Art. 18) :</strong> restreindre temporairement
                  le traitement de vos données ;</li>
                <li><strong>Droit de retrait du consentement :</strong> si le traitement est basé sur votre consentement,
                  vous pouvez le retirer à tout moment sans affecter la licéité des traitements antérieurs.</li>
              </ul>
              <p className="mt-3">
                Pour exercer ces droits, contactez-nous à{" "}
                <a href="mailto:privacy@docusafe.online" className="text-blue-600 hover:underline dark:text-blue-400">
                  privacy@docusafe.online
                </a>.
                Nous répondrons dans un délai d&apos;un mois (Art. 12 RGPD). En cas de demande complexe, ce délai
                peut être prolongé de deux mois supplémentaires, avec information préalable.
              </p>
              <p className="mt-3">
                Vous devrez fournir une pièce d&apos;identité pour les demandes d&apos;accès, de rectification ou d&apos;effacement,
                afin de nous permettre de vérifier votre identité et protéger vos données.
              </p>
            </section>

            {/* ─── Article 8 ─── */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                8. Droit de réclamation auprès de la CNIL
              </h2>
              <p className="mt-3">
                Si vous estimez que vos droits ne sont pas respectés, vous avez le droit d&apos;introduire une réclamation
                auprès de la <strong>Commission Nationale de l&apos;Informatique et des Libertés (CNIL)</strong> :
              </p>
              <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm dark:border-neutral-700 dark:bg-neutral-800">
                <p><strong>CNIL</strong> — 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07</p>
                <p className="mt-1">Téléphone : +33 (0)1 53 73 22 22</p>
                <p className="mt-1">Site web :{" "}
                  <a href="https://www.cnil.fr" className="text-blue-600 hover:underline dark:text-blue-400" target="_blank" rel="noopener noreferrer">
                    www.cnil.fr
                  </a>
                </p>
              </div>
            </section>

            {/* ─── Article 9 ─── */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                9. Cookies et traceurs
              </h2>
              <p className="mt-3">
                DocuSafe utilise uniquement des cookies <strong>strictement nécessaires</strong> au fonctionnement
                du Service, exemptés de consentement selon les lignes directrices de la CNIL :
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <th className="py-2 pr-4 text-left font-semibold text-neutral-900 dark:text-white">Cookie</th>
                      <th className="py-2 pr-4 text-left font-semibold text-neutral-900 dark:text-white">Finalité</th>
                      <th className="py-2 text-left font-semibold text-neutral-900 dark:text-white">Durée</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    <tr>
                      <td className="py-2 pr-4 font-mono text-xs">next-auth.session-token</td>
                      <td className="py-2 pr-4">Maintien de la session de connexion</td>
                      <td className="py-2">30 jours</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-mono text-xs">next-auth.csrf-token</td>
                      <td className="py-2 pr-4">Protection contre les attaques CSRF</td>
                      <td className="py-2">Session</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-mono text-xs">docusafe-language</td>
                      <td className="py-2 pr-4">Mémorisation de la langue choisie</td>
                      <td className="py-2">1 an (localStorage)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3">
                Nous n&apos;utilisons <strong>aucun cookie de traçage publicitaire, de profilage ou analytique tiers</strong>.
                Aucun cookie non essentiel n&apos;est déposé sans votre consentement préalable.
              </p>
            </section>

            {/* ─── Article 10 ─── */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                10. Notification en cas de violation de données (Art. 33-34 RGPD)
              </h2>
              <p className="mt-3">
                En cas de violation de données à caractère personnel susceptible d&apos;engendrer un risque élevé pour
                vos droits et libertés, DocuSafe s&apos;engage à :
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>notifier la CNIL dans les <strong>72 heures</strong> suivant la prise de connaissance (Art. 33 RGPD) ;</li>
                <li>vous informer dans les <strong>meilleurs délais</strong> si la violation est susceptible d&apos;engendrer
                  un risque élevé pour vos droits et libertés (Art. 34 RGPD), avec description de la nature
                  de la violation, des données concernées et des mesures prises.</li>
              </ul>
            </section>

            {/* ─── Article 11 ─── */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                11. Données de mineurs
              </h2>
              <p className="mt-3">
                Le Service n&apos;est pas destiné aux personnes de moins de 16 ans. DocuSafe ne collecte pas
                sciemment de données personnelles de mineurs de moins de 16 ans. Si nous apprenons qu&apos;un compte
                a été créé par une personne de moins de 16 ans sans consentement parental, nous supprimerons
                ce compte et les données associées dans les meilleurs délais.
              </p>
              <p className="mt-3">
                Si vous estimez que votre enfant de moins de 16 ans a créé un compte, contactez-nous à{" "}
                <a href="mailto:privacy@docusafe.online" className="text-blue-600 hover:underline dark:text-blue-400">
                  privacy@docusafe.online
                </a>.
              </p>
            </section>

            {/* ─── Article 12 ─── */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                12. Modifications de la politique de confidentialité
              </h2>
              <p className="mt-3">
                DocuSafe peut mettre à jour cette politique de confidentialité. En cas de modification substantielle,
                vous en serez informé par e-mail et/ou notification dans le Service, et une nouvelle acceptation
                pourra vous être demandée. La version en vigueur est toujours accessible sur cette page.
                La date de dernière mise à jour figure en haut de ce document.
              </p>
            </section>

            {/* ─── Article 13 ─── */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                13. Contact
              </h2>
              <p className="mt-3">
                Pour toute question relative à cette politique ou pour exercer vos droits :
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-6">
                <li>RGPD / données personnelles : <a href="mailto:privacy@docusafe.online" className="text-blue-600 hover:underline dark:text-blue-400">privacy@docusafe.online</a></li>
                <li>Support général : <a href="mailto:support@docusafe.online" className="text-blue-600 hover:underline dark:text-blue-400">support@docusafe.online</a></li>
              </ul>
            </section>

          </div>

          <div className="mt-12 border-t border-neutral-200 pt-8 dark:border-neutral-700">
            <div className="flex flex-wrap gap-4">
              <a
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
              >
                ← Retour à l&apos;accueil
              </a>
              <a
                href="/terms"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
              >
                Conditions d&apos;utilisation →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
