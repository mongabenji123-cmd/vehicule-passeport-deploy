import { Link } from "react-router-dom";
import { Shield, ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  const lastUpdated = "7 avril 2025";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="font-display text-lg font-bold uppercase tracking-wide">Politique de confidentialité</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Dernière mise à jour : {lastUpdated}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            La présente politique de confidentialité décrit comment <strong className="text-foreground">Auto-Passeport</strong> (ci-après « nous », « notre ») collecte, utilise, stocke et protège vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD) et aux lois applicables en République Démocratique du Congo.
          </p>
        </div>

        {/* Section 1 */}
        <Section number="1" title="Responsable du traitement">
          <p>
            Le responsable du traitement des données est <strong>Auto-Passeport</strong>, accessible via l'application web à l'adresse de publication officielle. Pour toute question relative à vos données personnelles, contactez-nous à : <a href="mailto:Auto-passeport@gmail.com" className="text-primary hover:underline">Auto-passeport@gmail.com</a>.
          </p>
        </Section>

        {/* Section 2 */}
        <Section number="2" title="Données collectées">
          <p className="mb-3">Nous collectons les catégories de données suivantes :</p>
          <SubSection title="2.1 Données d'identité">
            <ul className="list-disc pl-5 space-y-1">
              <li>Nom complet</li>
              <li>Adresse email</li>
              <li>Numéro de téléphone</li>
              <li>Rôle dans l'application (propriétaire, garage, vendeur)</li>
            </ul>
          </SubSection>
          <SubSection title="2.2 Données relatives aux véhicules">
            <ul className="list-disc pl-5 space-y-1">
              <li>Marque, modèle, année de fabrication</li>
              <li>Numéro de plaque d'immatriculation</li>
              <li>Numéro d'identification du véhicule (VIN)</li>
              <li>Kilométrage actuel et historique</li>
              <li>Couleur et photos du véhicule</li>
              <li>Score de santé calculé</li>
            </ul>
          </SubSection>
          <SubSection title="2.3 Données d'interventions et d'entretien">
            <ul className="list-disc pl-5 space-y-1">
              <li>Type de service effectué</li>
              <li>Description des travaux</li>
              <li>Pièces remplacées</li>
              <li>Montant de la facture</li>
              <li>Photos des interventions</li>
              <li>Nom du technicien</li>
              <li>Garage ayant effectué l'intervention</li>
            </ul>
          </SubSection>
          <SubSection title="2.4 Données des garages">
            <ul className="list-disc pl-5 space-y-1">
              <li>Nom du garage et adresse complète</li>
              <li>Coordonnées (téléphone, WhatsApp)</li>
              <li>Spécialités et certifications</li>
              <li>Notes et avis</li>
            </ul>
          </SubSection>
          <SubSection title="2.5 Données techniques">
            <ul className="list-disc pl-5 space-y-1">
              <li>Adresse IP et type de navigateur</li>
              <li>Données de connexion et journaux d'erreurs (via Sentry)</li>
              <li>Cookies de session</li>
            </ul>
          </SubSection>
        </Section>

        {/* Section 3 */}
        <Section number="3" title="Finalités du traitement">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Gestion du passeport véhicule :</strong> centraliser l'historique d'entretien et générer des rapports PDF certifiés.</li>
            <li><strong>Alertes intelligentes :</strong> vous notifier des échéances d'entretien basées sur le kilométrage ou les dates.</li>
            <li><strong>Mise en relation :</strong> connecter propriétaires et garages certifiés.</li>
            <li><strong>Marketplace :</strong> faciliter l'achat et la vente de pièces détachées.</li>
            <li><strong>Amélioration du service :</strong> analyser les erreurs et optimiser l'expérience utilisateur.</li>
            <li><strong>Sécurité :</strong> prévenir les fraudes et les accès non autorisés.</li>
          </ul>
        </Section>

        {/* Section 4 */}
        <Section number="4" title="Base légale du traitement">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Exécution du contrat :</strong> le traitement est nécessaire pour fournir les services Auto-Passeport auxquels vous avez souscrit.</li>
            <li><strong>Consentement :</strong> pour l'envoi de notifications et communications marketing.</li>
            <li><strong>Intérêt légitime :</strong> pour la sécurité de la plateforme et l'amélioration des services.</li>
            <li><strong>Obligation légale :</strong> conservation des données requises par la réglementation applicable.</li>
          </ul>
        </Section>

        {/* Section 5 */}
        <Section number="5" title="Partage des données">
          <p className="mb-3">Vos données personnelles peuvent être partagées avec :</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Garages certifiés :</strong> les données du véhicule sont partagées avec le garage lors d'une intervention, avec votre consentement.</li>
            <li><strong>Acheteurs/vendeurs :</strong> dans le cadre du marketplace, les informations de contact nécessaires à la transaction.</li>
            <li><strong>Sous-traitants techniques :</strong> hébergement (Supabase/AWS), monitoring (Sentry), uniquement pour le fonctionnement du service.</li>
          </ul>
          <p className="mt-3">Nous ne vendons <strong>jamais</strong> vos données personnelles à des tiers.</p>
        </Section>

        {/* Section 6 */}
        <Section number="6" title="Durée de conservation">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-secondary">
                  <th className="text-left p-3 font-medium text-foreground">Type de données</th>
                  <th className="text-left p-3 font-medium text-foreground">Durée</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr><td className="p-3 text-muted-foreground">Compte utilisateur</td><td className="p-3 text-muted-foreground">Jusqu'à suppression du compte</td></tr>
                <tr><td className="p-3 text-muted-foreground">Données véhicule</td><td className="p-3 text-muted-foreground">Durée de vie du véhicule + 3 ans</td></tr>
                <tr><td className="p-3 text-muted-foreground">Interventions</td><td className="p-3 text-muted-foreground">10 ans (obligation légale)</td></tr>
                <tr><td className="p-3 text-muted-foreground">Rapports PDF</td><td className="p-3 text-muted-foreground">Selon date d'expiration définie</td></tr>
                <tr><td className="p-3 text-muted-foreground">Logs techniques</td><td className="p-3 text-muted-foreground">90 jours</td></tr>
                <tr><td className="p-3 text-muted-foreground">Commandes marketplace</td><td className="p-3 text-muted-foreground">5 ans (obligation comptable)</td></tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* Section 7 */}
        <Section number="7" title="Sécurité des données">
          <p>Nous mettons en œuvre les mesures techniques et organisationnelles suivantes :</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Chiffrement des données en transit (TLS/HTTPS)</li>
            <li>Chiffrement des mots de passe (bcrypt)</li>
            <li>Politiques de sécurité au niveau des lignes (Row Level Security)</li>
            <li>Limitation du nombre de tentatives de connexion (rate limiting)</li>
            <li>Authentification par token JWT</li>
            <li>Surveillance des erreurs en temps réel (Sentry)</li>
          </ul>
        </Section>

        {/* Section 8 */}
        <Section number="8" title="Vos droits">
          <p className="mb-3">Conformément au RGPD et aux lois applicables, vous disposez des droits suivants :</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Droit d'accès :</strong> obtenir une copie de vos données personnelles.</li>
            <li><strong>Droit de rectification :</strong> corriger des données inexactes ou incomplètes.</li>
            <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données (sous réserve des obligations légales).</li>
            <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré (PDF, JSON).</li>
            <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données pour des motifs légitimes.</li>
            <li><strong>Droit de limitation :</strong> restreindre temporairement le traitement de vos données.</li>
          </ul>
          <p className="mt-3">
            Pour exercer vos droits, envoyez un email à <a href="mailto:Auto-passeport@gmail.com" className="text-primary hover:underline">Auto-passeport@gmail.com</a> avec une copie de votre pièce d'identité. Nous répondrons dans un délai de 30 jours.
          </p>
        </Section>

        {/* Section 9 */}
        <Section number="9" title="Cookies">
          <p>
            Auto-Passeport utilise uniquement des cookies techniques essentiels au fonctionnement de l'application (session d'authentification). Nous n'utilisons pas de cookies publicitaires ni de trackers tiers, à l'exception de Sentry pour le monitoring des erreurs en production.
          </p>
        </Section>

        {/* Section 10 */}
        <Section number="10" title="Transferts internationaux">
          <p>
            Vos données peuvent être hébergées sur des serveurs situés en dehors de la RDC (infrastructure cloud). Dans ce cas, nous nous assurons que des garanties appropriées sont en place (clauses contractuelles types, certification adéquate) pour protéger vos données conformément aux normes applicables.
          </p>
        </Section>

        {/* Section 11 */}
        <Section number="11" title="Mineurs">
          <p>
            Auto-Passeport n'est pas destiné aux personnes de moins de 18 ans. Nous ne collectons pas sciemment de données personnelles de mineurs. Si vous êtes parent et constatez que votre enfant nous a fourni des données, contactez-nous pour leur suppression.
          </p>
        </Section>

        {/* Section 12 */}
        <Section number="12" title="Modifications de cette politique">
          <p>
            Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Toute modification sera publiée sur cette page avec une date de mise à jour. En cas de modification substantielle, nous vous en informerons par email ou notification dans l'application.
          </p>
        </Section>

        {/* Section 13 */}
        <Section number="13" title="Contact">
          <p>
            Pour toute question concernant cette politique ou vos données personnelles :
          </p>
          <div className="mt-3 rounded-xl border border-border bg-card p-4 space-y-2">
            <p className="text-sm"><strong>Auto-Passeport</strong></p>
            <p className="text-sm text-muted-foreground">Email : <a href="mailto:Auto-passeport@gmail.com" className="text-primary hover:underline">Auto-passeport@gmail.com</a></p>
            <p className="text-sm text-muted-foreground">Kinshasa, République Démocratique du Congo</p>
          </div>
        </Section>

        <div className="pt-6 border-t border-border text-center">
          <Link to="/" className="text-sm text-primary hover:underline">← Retour à l'accueil</Link>
        </div>
      </main>
    </div>
  );
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg font-bold uppercase tracking-wide text-foreground flex items-center gap-2">
        <span className="text-primary">{number}.</span> {title}
      </h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>
      <div className="text-sm text-muted-foreground">{children}</div>
    </div>
  );
}
