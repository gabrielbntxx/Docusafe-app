import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation – DocuSafe",
  description: "Conditions Générales d'Utilisation (CGU) de DocuSafe. Version en vigueur au 21 février 2026.",
};

const TERMS_VERSION = "21 février 2026";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-8 shadow-xl dark:bg-neutral-800/50 sm:p-12">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Conditions Générales d&apos;Utilisation
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Version du {TERMS_VERSION} — En vigueur immédiatement
          </p>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300">
            <strong>Important :</strong> Ces conditions constituent un contrat juridiquement contraignant entre vous et DocuSafe.
            Lisez-les attentivement avant d&apos;utiliser le service. L&apos;utilisation du service implique l&apos;acceptation intégrale de ces conditions.
          </div>

          <div className="mt-10 space-y-10 text-neutral-700 dark:text-neutral-300">

            {/* ─── Article 1 ─── */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Article 1 – Éditeur du service (mentions légales)
              </h2>
              <p className="mt-3">
                Le service DocuSafe (ci-après &quot;le Service&quot;) est édité par :
              </p>
              <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4 font-mono text-sm dark:border-neutral-700 dark:bg-neutral-800">
                <p><strong>Dénomination sociale :</strong> DocuSafe SAS</p>
                <p className="mt-1"><strong>Siège social :</strong> France</p>
                <p className="mt-1"><strong>Contact :</strong>{" "}
                  <a href="mailto:legal@docusafe.online" className="text-blue-600 hover:underline dark:text-blue-400">
                    legal@docusafe.online
                  </a>
                </p>
                <p className="mt-1"><strong>Site web :</strong> https://www.docusafe.online</p>
                <p className="mt-1"><strong>Hébergeur :</strong> Railway Technologies, Inc. (infrastructure) / Cloudflare, Inc. (CDN et stockage objet)</p>
              </div>
              <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
                Conformément à l&apos;article 6 de la Loi n°2004-575 du 21 juin 2004 pour la Confiance dans l&apos;Économie Numérique (LCEN).
              </p>
            </section>

            {/* ─── Article 2 ─── */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Article 2 – Objet et champ d&apos;application
              </h2>
              <p className="mt-3">
                Les présentes Conditions Générales d&apos;Utilisation (CGU) ont pour objet de définir les modalités et conditions
                dans lesquelles DocuSafe met à disposition ses services de gestion, stockage, organisation et traitement
                de documents numériques, ci-après &quot;le Service&quot;, ainsi que les droits et obligations respectifs de DocuSafe
                et de l&apos;utilisateur.
              </p>
              <p className="mt-3">
                Les présentes CGU s&apos;appliquent à toute personne physique ou morale accédant ou utilisant le Service,
                ci-après &quot;l&apos;Utilisateur&quot; ou &quot;vous&quot;. Elles s&apos;appliquent à l&apos;exclusion de toutes autres conditions,
                sauf accord écrit préalable de DocuSafe.
              </p>
              <p className="mt-3">
                En cas de contradiction entre les CGU et tout autre document (devis, conditions spéciales, etc.),
                les conditions spéciales prévaudront sur les CGU pour les seuls éléments qu&apos;elles prévoient.
              </p>
            </section>

            {/* ─── Article 3 ─── */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Article 3 – Accès au service et conditions d&apos;âge
              </h2>
              <p className="mt-3">
                L&apos;accès au Service est réservé aux personnes âgées d&apos;au moins <strong>16 ans</strong> conformément au
                Règlement (UE) 2016/679 (RGPD), article 8. Les personnes âgées de 16 à 18 ans doivent obtenir
                l&apos;accord préalable de leur représentant légal.
              </p>
              <p className="mt-3">
                En créant un compte, vous déclarez sur l&apos;honneur avoir au moins 16 ans et, si vous agissez pour
                le compte d&apos;une personne morale, avoir l&apos;autorité pour engager juridiquement cette entité.
              </p>
              <p className="mt-3">
                DocuSafe se réserve le droit de demander une justification d&apos;âge à tout moment et de suspendre
                tout compte pour lequel une telle justification ne peut être fournie.
              </p>
            </section>

            {/* ─── Article 4 ─── */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Article 4 – Inscription et compte utilisateur
              </h2>
              <p className="mt-3">
                Pour accéder au Service, vous devez créer un compte en fournissant des informations exactes, complètes
                et à jour. Vous vous engagez à mettre à jour ces informations en cas de modification.
              </p>
              <p className="mt-3">Vous êtes seul responsable de :</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>la confidentialité de vos identifiants de connexion ;</li>
                <li>toutes les activités effectuées sous votre compte, qu&apos;elles soient autorisées ou non ;</li>
                <li>la sécurité de vos appareils permettant l&apos;accès au Service.</li>
              </ul>
              <p className="mt-3">
                Vous vous engagez à informer DocuSafe immédiatement à l&apos;adresse{" "}
                <a href="mailto:security@docusafe.online" className="text-blue-600 hover:underline dark:text-blue-400">
                  security@docusafe.online
                </a>{" "}
                de toute utilisation non autorisée de votre compte ou de toute violation de sécurité.
              </p>
              <p className="mt-3">
                DocuSafe ne peut être tenu responsable des pertes ou dommages résultant du non-respect de ces obligations.
                La création de plusieurs comptes gratuits par un même utilisateur pour contourner les limites du plan
                est interdite et constitue un motif de suspension immédiate.
              </p>
            </section>

            {/* ─── Article 5 ─── */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Article 5 – Description du service et évolutions
              </h2>
              <p className="mt-3">DocuSafe fournit une plateforme SaaS (Software as a Service) permettant :</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>le téléversement, le stockage et l&apos;organisation de documents numériques ;</li>
                <li>la classification automatique de documents par intelligence artificielle ;</li>
                <li>l&apos;import de documents depuis des services tiers (Google Drive, OneDrive) ;</li>
                <li>le partage sécurisé de documents ;</li>
                <li>la génération de documents professionnels (plan Business) ;</li>
                <li>l&apos;assistance par chatbot IA (DocuBot) pour la gestion documentaire (plans payants).</li>
              </ul>
              <p className="mt-3">
                DocuSafe se réserve le droit de modifier, enrichir ou supprimer des fonctionnalités du Service à tout
                moment, sans préavis, dans la limite où cela ne constitue pas une dégradation substantielle des
                fonctionnalités incluses dans l&apos;abonnement en cours de l&apos;Utilisateur.
              </p>
            </section>

            {/* ─── Article 6 ─── */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Article 6 – Plans tarifaires, paiement et renouvellement
              </h2>
              <p className="mt-3">
                Le Service est proposé selon différents plans tarifaires (Free, Pro, Business) décrits sur le site web.
                Les prix sont indiqués en euros toutes taxes comprises (TTC).
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>
                  <strong>Plan Free :</strong> accès gratuit avec fonctionnalités limitées.
                  DocuSafe se réserve le droit de modifier ou supprimer le plan gratuit avec un préavis de 30 jours.
                </li>
                <li>
                  <strong>Plans payants :</strong> les abonnements sont mensuels ou annuels selon l&apos;option choisie,
                  renouvelés automatiquement à l&apos;échéance. Le paiement est prélevé à chaque renouvellement.
                </li>
                <li>
                  <strong>Modification de tarifs :</strong> DocuSafe peut modifier ses tarifs avec un préavis de
                  30 jours par e-mail. Si vous n&apos;acceptez pas la nouvelle tarification, vous pouvez résilier
                  avant le prochain renouvellement.
                </li>
                <li>
                  <strong>Défaut de paiement :</strong> en cas d&apos;échec de paiement, DocuSafe peut suspendre l&apos;accès
                  au Service. Les données sont conservées pendant 30 jours après la suspension pour permettre le
                  règlement. Au-delà, DocuSafe peut procéder à la suppression définitive des données.
                </li>
              </ul>
              <p className="mt-3">
                Les paiements sont traités par Stripe Inc. (prestataire de paiement). DocuSafe ne stocke aucune
                donnée bancaire de l&apos;Utilisateur.
              </p>
            </section>

            {/* ─── Article 7 ─── */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Article 7 – Droit de rétractation
              </h2>
              <p className="mt-3">
                Conformément à l&apos;article L221-18 du Code de la consommation, les consommateurs (personnes physiques
                n&apos;agissant pas à titre professionnel) disposent d&apos;un <strong>délai de rétractation de 14 jours</strong> à compter
                de la souscription d&apos;un abonnement payant.
              </p>
              <p className="mt-3">
                <strong>Renonciation au droit de rétractation :</strong> conformément à l&apos;article L221-28, 13° du Code
                de la consommation, si vous demandez expressément le début de l&apos;exécution des services avant l&apos;expiration
                du délai de rétractation (accès immédiat au Service), vous reconnaissez que vous ne pourrez exercer
                votre droit de rétractation une fois le Service pleinement exécuté.
              </p>
              <p className="mt-3">
                Pour exercer votre droit de rétractation (si applicable), contactez-nous à{" "}
                <a href="mailto:support@docusafe.online" className="text-blue-600 hover:underline dark:text-blue-400">
                  support@docusafe.online
                </a>{" "}
                dans le délai imparti. Ce droit ne s&apos;applique pas aux professionnels.
              </p>
              <p className="mt-3">
                <strong>Remboursements :</strong> aucun remboursement n&apos;est accordé pour une période d&apos;abonnement
                déjà entamée, sauf dans les cas prévus par la loi ou à la discrétion de DocuSafe.
              </p>
            </section>

            {/* ─── Article 8 ─── */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Article 8 – Utilisation acceptable et obligations de l&apos;utilisateur
              </h2>
              <p className="mt-3">
                L&apos;Utilisateur s&apos;engage à utiliser le Service conformément aux présentes CGU, aux lois et règlements
                applicables, et aux droits des tiers. Il est formellement interdit de :
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>téléverser, stocker ou partager des contenus illicites, diffamatoires, obscènes, portant atteinte
                  à la vie privée de tiers, ou contrefaisants ;</li>
                <li>utiliser le Service pour des activités de phishing, spam, escroquerie ou toute autre activité frauduleuse ;</li>
                <li>tenter d&apos;accéder sans autorisation aux systèmes, serveurs ou données de DocuSafe ou d&apos;autres utilisateurs ;</li>
                <li>procéder à des attaques de type déni de service (DDoS), injection SQL, cross-site scripting (XSS)
                  ou toute autre tentative d&apos;exploitation de failles de sécurité ;</li>
                <li>utiliser des robots, scripts automatisés, scrapers ou tout outil d&apos;extraction de données
                  sans autorisation écrite préalable ;</li>
                <li>revendre, louer, sous-licencier ou commercialiser l&apos;accès au Service ;</li>
                <li>contourner les mesures techniques de protection du Service ;</li>
                <li>usurper l&apos;identité d&apos;un autre utilisateur ou d&apos;un employé de DocuSafe ;</li>
                <li>stocker des données à caractère personnel sans base légale adéquate (RGPD) ;</li>
                <li>stocker des informations relatives à des cartes de paiement (PAN, CVV) — usage interdit et contraire aux normes PCI-DSS.</li>
              </ul>
              <p className="mt-3">
                Toute violation de ces obligations peut entraîner la suspension immédiate et définitive du compte,
                sans préavis ni remboursement, et engager la responsabilité civile et pénale de l&apos;Utilisateur.
                DocuSafe se réserve le droit de signaler toute activité illicite aux autorités compétentes.
              </p>
            </section>

            {/* ─── Article 9 ─── */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Article 9 – Propriété intellectuelle
              </h2>
              <p className="mt-3">
                <strong>Propriété de DocuSafe :</strong> le Service, son code source, ses interfaces, ses algorithmes,
                sa marque, ses logos et l&apos;ensemble de ses composants sont la propriété exclusive de DocuSafe ou de
                ses ayants droit, et sont protégés par le droit de la propriété intellectuelle. Toute reproduction,
                représentation, modification ou exploitation non autorisée est interdite.
              </p>
              <p className="mt-3">
                <strong>Contenu de l&apos;Utilisateur :</strong> vous conservez l&apos;intégralité des droits sur les documents
                que vous téléversez. En utilisant le Service, vous concédez à DocuSafe une licence non exclusive,
                non transférable, limitée au territoire mondial, pour stocker, reproduire techniquement et traiter
                vos documents dans le seul but de fournir le Service (stockage, chiffrement, classification IA, affichage).
                Cette licence prend fin à la suppression de vos données.
              </p>
              <p className="mt-3">
                DocuSafe ne revendique aucun droit de propriété sur vos documents et ne les utilisera pas à d&apos;autres fins
                que la fourniture du Service.
              </p>
            </section>

            {/* ─── Article 10 ─── */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Article 10 – Traitement des données personnelles
              </h2>
              <p className="mt-3">
                DocuSafe traite vos données personnelles conformément au Règlement (UE) 2016/679 (RGPD) et à la
                loi Informatique et Libertés du 6 janvier 1978 modifiée. Le détail des traitements, des finalités,
                des bases légales et de vos droits figure dans notre{" "}
                <a href="/privacy" className="text-blue-600 hover:underline dark:text-blue-400">
                  Politique de confidentialité
                </a>
                , qui fait partie intégrante des présentes CGU.
              </p>
              <p className="mt-3">
                Vous êtes informé que les documents que vous téléversez peuvent contenir des données personnelles
                de tiers. En téléversant ces documents, vous garantissez disposer d&apos;une base légale pour leur traitement
                et vous assumez la responsabilité du respect des droits des personnes concernées.
              </p>
            </section>

            {/* ─── Article 11 ─── */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Article 11 – Responsabilité et limitation de responsabilité
              </h2>
              <p className="mt-3">
                <strong>Responsabilité de l&apos;Utilisateur :</strong> l&apos;Utilisateur est seul responsable du contenu
                des documents qu&apos;il téléverse, de l&apos;usage qu&apos;il fait du Service et de toute conséquence en découlant.
                Il s&apos;engage à indemniser DocuSafe contre toute réclamation, perte, préjudice ou coût (y compris
                les honoraires d&apos;avocat) résultant de sa violation des présentes CGU ou des droits de tiers.
              </p>
              <p className="mt-3">
                <strong>Responsabilité de DocuSafe :</strong> DocuSafe s&apos;engage à mettre en œuvre les meilleurs
                efforts pour assurer la disponibilité et la sécurité du Service. Cependant, dans la limite permise
                par la loi applicable :
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>le Service est fourni &quot;en l&apos;état&quot; et &quot;selon disponibilité&quot;, sans garantie d&apos;aucune sorte ;</li>
                <li>DocuSafe ne garantit pas que le Service sera exempt d&apos;erreurs, de virus ou d&apos;interruptions ;</li>
                <li>DocuSafe exclut toute responsabilité pour les dommages indirects, accessoires, spéciaux,
                  punitifs ou consécutifs (perte de données, perte de bénéfices, perte d&apos;activité), même si
                  DocuSafe a été informé de la possibilité de tels dommages ;</li>
                <li>en tout état de cause, la responsabilité totale de DocuSafe est limitée au montant des sommes
                  effectivement payées par l&apos;Utilisateur au cours des 12 derniers mois précédant l&apos;événement
                  donnant lieu à réclamation, ou à 100 euros si l&apos;Utilisateur est sur le plan gratuit ;</li>
                <li>DocuSafe n&apos;est pas responsable de la perte de données en cas d&apos;utilisation non conforme du Service.</li>
              </ul>
              <p className="mt-3">
                Ces limitations s&apos;appliquent dans toute la mesure autorisée par le droit applicable. Les limitations
                ne s&apos;appliquent pas en cas de faute lourde ou dolosive de DocuSafe, ni aux droits légaux des consommateurs
                qui ne peuvent être exclus contractuellement.
              </p>
            </section>

            {/* ─── Article 12 ─── */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Article 12 – Disponibilité du service et sauvegarde
              </h2>
              <p className="mt-3">
                DocuSafe vise une disponibilité du Service de 99,5 % par mois. Des maintenances planifiées peuvent
                occasionner des interruptions, annoncées dans la mesure du possible avec un préavis raisonnable.
              </p>
              <p className="mt-3">
                <strong>Sauvegarde :</strong> bien que DocuSafe mette en œuvre des procédures de sauvegarde, il vous est
                fortement recommandé de conserver une copie de vos documents en dehors du Service. DocuSafe ne peut
                garantir la récupération totale des données en cas d&apos;incident majeur.
              </p>
            </section>

            {/* ─── Article 13 ─── */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Article 13 – Force majeure
              </h2>
              <p className="mt-3">
                DocuSafe ne pourra être tenu responsable de l&apos;inexécution ou du retard dans l&apos;exécution de ses
                obligations résultant d&apos;un événement de force majeure au sens de l&apos;article 1218 du Code civil,
                notamment : catastrophes naturelles, cyberattaques d&apos;ampleur exceptionnelle, pannes des
                infrastructures internet critiques, réquisitions gouvernementales, ou défaillance de sous-traitants
                essentiels (hébergeurs, opérateurs de réseau).
              </p>
              <p className="mt-3">
                DocuSafe informera l&apos;Utilisateur dans les meilleurs délais et s&apos;efforcera de rétablir le Service
                aussi vite que possible.
              </p>
            </section>

            {/* ─── Article 14 ─── */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Article 14 – Durée, résiliation et suppression du compte
              </h2>
              <p className="mt-3">
                Les présentes CGU sont conclues pour une durée indéterminée à compter de votre acceptation.
              </p>
              <p className="mt-3">
                <strong>Résiliation par l&apos;Utilisateur :</strong> vous pouvez supprimer votre compte à tout moment
                depuis les paramètres de votre compte. La suppression entraîne la résiliation immédiate de l&apos;accès
                au Service et la suppression de vos données conformément à notre Politique de confidentialité.
                Aucun remboursement n&apos;est accordé pour la période restante d&apos;abonnement en cours.
              </p>
              <p className="mt-3">
                <strong>Résiliation par DocuSafe :</strong> DocuSafe se réserve le droit de suspendre ou résilier
                votre compte, avec ou sans préavis selon la gravité du manquement, notamment en cas de :
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>violation des présentes CGU ;</li>
                <li>activité illicite ou frauduleuse ;</li>
                <li>non-paiement des sommes dues ;</li>
                <li>inactivité prolongée (compte inactif depuis plus de 24 mois sur plan gratuit).</li>
              </ul>
              <p className="mt-3">
                <strong>Effets de la résiliation :</strong> à la résiliation, vos données seront supprimées dans
                un délai de 30 jours, sauf obligation légale de conservation plus longue.
              </p>
            </section>

            {/* ─── Article 15 ─── */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Article 15 – Modification des CGU
              </h2>
              <p className="mt-3">
                DocuSafe se réserve le droit de modifier les présentes CGU à tout moment. En cas de modification
                substantielle, vous serez informé par e-mail et/ou notification dans le Service au moins{" "}
                <strong>30 jours avant</strong> l&apos;entrée en vigueur des nouvelles conditions.
              </p>
              <p className="mt-3">
                Si vous n&apos;acceptez pas les nouvelles conditions, vous pouvez supprimer votre compte avant leur entrée
                en vigueur. La poursuite de l&apos;utilisation du Service après ce délai vaut acceptation des nouvelles CGU.
                Une nouvelle acceptation explicite pourra vous être demandée via l&apos;interface du Service.
              </p>
            </section>

            {/* ─── Article 16 ─── */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Article 16 – Médiation et règlement des litiges
              </h2>
              <p className="mt-3">
                <strong>Utilisateurs consommateurs (B2C) :</strong> conformément aux articles L611-1 et suivants
                du Code de la consommation, en cas de litige non résolu avec DocuSafe, vous pouvez recourir
                gratuitement à un médiateur de la consommation. DocuSafe adhère au service de médiation en ligne
                de la Commission européenne accessible via la plateforme RLL (Règlement en Ligne des Litiges) :{" "}
                <a href="https://ec.europa.eu/consumers/odr" className="text-blue-600 hover:underline dark:text-blue-400" target="_blank" rel="noopener noreferrer">
                  https://ec.europa.eu/consumers/odr
                </a>.
              </p>
              <p className="mt-3">
                <strong>Utilisateurs professionnels (B2B) :</strong> tout litige sera soumis à une tentative
                préalable de résolution amiable. À défaut, les tribunaux compétents seront exclusivement ceux
                du ressort du siège social de DocuSafe, nonobstant pluralité de défendeurs ou appel en garantie.
              </p>
            </section>

            {/* ─── Article 17 ─── */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Article 17 – Droit applicable
              </h2>
              <p className="mt-3">
                Les présentes CGU sont soumises au droit français. En cas de traduction dans une autre langue,
                la version française prévaudra en cas de contradiction.
              </p>
            </section>

            {/* ─── Article 18 ─── */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Article 18 – Divisibilité et intégralité de l&apos;accord
              </h2>
              <p className="mt-3">
                Si une clause des présentes CGU est déclarée nulle ou inapplicable par une décision de justice,
                les autres clauses restent en vigueur. Le fait pour DocuSafe de ne pas exercer un droit prévu
                par les CGU ne constitue pas une renonciation à ce droit.
              </p>
              <p className="mt-3">
                Les présentes CGU, la Politique de confidentialité et, le cas échéant, les conditions spécifiques
                à votre plan constituent l&apos;intégralité de l&apos;accord entre vous et DocuSafe, et remplacent tout accord
                antérieur relatif au Service.
              </p>
            </section>

            {/* ─── Article 19 ─── */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Article 19 – Contact
              </h2>
              <p className="mt-3">
                Pour toute question relative aux présentes CGU ou pour exercer vos droits :
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-6">
                <li>Questions légales : <a href="mailto:legal@docusafe.online" className="text-blue-600 hover:underline dark:text-blue-400">legal@docusafe.online</a></li>
                <li>Sécurité : <a href="mailto:security@docusafe.online" className="text-blue-600 hover:underline dark:text-blue-400">security@docusafe.online</a></li>
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
                href="/privacy"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
              >
                Politique de confidentialité →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
