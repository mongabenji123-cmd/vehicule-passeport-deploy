import { Link } from "react-router-dom";
import { FileText, ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  const lastUpdated = "10 avril 2025";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <FileText className="w-5 h-5 text-primary" />
          <h1 className="font-display text-lg font-bold uppercase tracking-wide">Conditions Générales d'Utilisation</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Dernière mise à jour : {lastUpdated}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») régissent l'accès et l'utilisation de la plateforme <strong className="text-foreground">Auto-Passeport</strong> (ci-après « la Plateforme »), éditée et opérée depuis Kinshasa, République Démocratique du Congo.
          </p>
        </div>

        <Section number="1" title="Objet">
          <p>
            Auto-Passeport est une plateforme numérique permettant aux propriétaires de véhicules de centraliser l'historique d'entretien de leurs véhicules, de générer des passeports véhicules certifiés (PDF), de recevoir des alertes d'entretien, et d'accéder à un marketplace de pièces détachées. En utilisant la Plateforme, vous acceptez sans réserve les présentes CGU.
          </p>
        </Section>

        <Section number="2" title="Inscription et compte utilisateur">
          <p className="mb-3">Pour accéder aux services, l'utilisateur doit créer un compte en fournissant des informations exactes et à jour.</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>L'utilisateur est responsable de la confidentialité de ses identifiants de connexion.</li>
            <li>Toute activité réalisée sous son compte est présumée effectuée par lui.</li>
            <li>L'utilisateur s'engage à notifier immédiatement Auto-Passeport de toute utilisation non autorisée de son compte.</li>
            <li>Auto-Passeport se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU.</li>
          </ul>
        </Section>

        <Section number="3" title="Rôles et responsabilités">
          <SubSection title="3.1 Propriétaire de véhicule">
            <ul className="list-disc pl-5 space-y-1">
              <li>S'assurer de l'exactitude des informations saisies (kilométrage, immatriculation, VIN).</li>
              <li>Ne pas falsifier l'historique d'entretien de son véhicule.</li>
              <li>Comprendre que le score de santé est un indicateur basé sur les données fournies et ne constitue pas un diagnostic mécanique professionnel.</li>
            </ul>
          </SubSection>
          <SubSection title="3.2 Garage / Professionnel">
            <ul className="list-disc pl-5 space-y-1">
              <li>Fournir des informations véridiques sur les interventions réalisées.</li>
              <li>Ne pas valider d'interventions fictives.</li>
              <li>Maintenir à jour ses informations de contact et spécialités.</li>
            </ul>
          </SubSection>
          <SubSection title="3.3 Vendeur (Marketplace)">
            <ul className="list-disc pl-5 space-y-1">
              <li>Proposer uniquement des pièces conformes à la description publiée.</li>
              <li>Respecter les prix affichés et les conditions de vente.</li>
              <li>Expédier les commandes dans les délais convenus.</li>
            </ul>
          </SubSection>
        </Section>

        <Section number="4" title="Limitation de responsabilité">
          <p className="mb-3">Auto-Passeport met tout en œuvre pour assurer la fiabilité de ses services, mais ne peut être tenu responsable :</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Données saisies par les utilisateurs :</strong> Auto-Passeport ne vérifie pas l'exactitude des informations fournies par les propriétaires ou garages. Les passeports véhicules reflètent uniquement les données déclarées.</li>
            <li><strong>Interruptions de service :</strong> en cas de maintenance programmée ou imprévue, de pannes techniques, ou de force majeure.</li>
            <li><strong>Transactions marketplace :</strong> Auto-Passeport agit en tant qu'intermédiaire. La qualité, la conformité et la livraison des pièces relèvent de la responsabilité exclusive du vendeur.</li>
            <li><strong>Décisions basées sur le score de santé :</strong> le score est un outil indicatif. Il ne remplace en aucun cas un diagnostic réalisé par un professionnel certifié.</li>
            <li><strong>Pertes financières :</strong> en aucun cas Auto-Passeport ne sera responsable de dommages indirects, consécutifs ou de perte de profit résultant de l'utilisation de la Plateforme.</li>
          </ul>
        </Section>

        <Section number="5" title="Tarification et paiement">
          <ul className="list-disc pl-5 space-y-2">
            <li>La création de compte et l'ajout de véhicules sont <strong>gratuits</strong>.</li>
            <li>La génération de passeports PDF certifiés peut être soumise à des frais, affichés avant la confirmation.</li>
            <li>Les transactions sur le marketplace sont soumises à une commission plateforme dont le taux est indiqué lors de la mise en vente.</li>
            <li>Les prix sont affichés en <strong>USD</strong> sauf indication contraire.</li>
          </ul>
        </Section>

        <Section number="6" title="Politique de remboursement">
          <SubSection title="6.1 Passeports PDF">
            <p>
              Les passeports PDF étant des contenus numériques générés instantanément, ils ne sont <strong>pas remboursables</strong> une fois générés et téléchargés. En cas d'erreur technique avérée empêchant la génération, un nouveau PDF sera fourni sans frais supplémentaires.
            </p>
          </SubSection>
          <SubSection title="6.2 Marketplace — Pièces détachées">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Pièce non conforme :</strong> l'acheteur dispose de <strong>48 heures</strong> après réception pour signaler une non-conformité via la Plateforme.</li>
              <li><strong>Pièce non livrée :</strong> si la livraison n'est pas confirmée sous <strong>7 jours ouvrables</strong>, l'acheteur peut ouvrir une réclamation.</li>
              <li><strong>Processus :</strong> Auto-Passeport examine la réclamation et peut décider d'un remboursement total ou partiel. La commission plateforme n'est pas remboursable.</li>
              <li><strong>Annulation :</strong> une commande peut être annulée sans frais tant que le vendeur n'a pas confirmé l'expédition.</li>
            </ul>
          </SubSection>
        </Section>

        <Section number="7" title="Propriété intellectuelle">
          <p>
            L'ensemble des éléments de la Plateforme (code source, design, logo, textes, fonctionnalités) sont la propriété exclusive d'Auto-Passeport. Toute reproduction, modification ou utilisation non autorisée est strictement interdite et passible de poursuites.
          </p>
        </Section>

        <Section number="8" title="Données personnelles">
          <p>
            Le traitement des données personnelles est régi par notre <Link to="/privacy" className="text-primary hover:underline font-medium">Politique de Confidentialité</Link>. En utilisant la Plateforme, vous consentez au traitement de vos données conformément à cette politique.
          </p>
        </Section>

        <Section number="9" title="Comportements interdits">
          <p className="mb-3">Il est interdit de :</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Falsifier des données de véhicule ou d'intervention dans le but de tromper un acheteur potentiel.</li>
            <li>Utiliser la Plateforme pour des activités frauduleuses ou illégales.</li>
            <li>Tenter d'accéder aux données d'autres utilisateurs sans autorisation.</li>
            <li>Perturber le fonctionnement de la Plateforme (attaques, scraping, spam).</li>
            <li>Créer plusieurs comptes pour contourner une suspension.</li>
          </ul>
        </Section>

        <Section number="10" title="Résolution des litiges">
          <SubSection title="10.1 Litiges entre utilisateurs">
            <p>
              En cas de litige entre un acheteur et un vendeur sur le marketplace, les parties s'engagent à tenter une résolution amiable via la messagerie de la Plateforme. Auto-Passeport peut intervenir en tant que médiateur mais n'est pas tenu de résoudre le litige.
            </p>
          </SubSection>
          <SubSection title="10.2 Litiges avec Auto-Passeport">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Réclamation :</strong> toute réclamation doit être adressée par email à <a href="mailto:Auto-passeport@gmail.com" className="text-primary hover:underline">Auto-passeport@gmail.com</a> dans un délai de <strong>30 jours</strong> suivant le fait générateur.</li>
              <li><strong>Médiation :</strong> en cas d'échec de la résolution amiable, les parties conviennent de recourir à la médiation avant toute action judiciaire.</li>
              <li><strong>Juridiction :</strong> à défaut de résolution, les tribunaux de <strong>Kinshasa, RDC</strong> seront seuls compétents.</li>
            </ul>
          </SubSection>
        </Section>

        <Section number="11" title="Suspension et résiliation">
          <ul className="list-disc pl-5 space-y-2">
            <li>Auto-Passeport peut suspendre ou résilier un compte en cas de violation des CGU, avec ou sans préavis selon la gravité.</li>
            <li>L'utilisateur peut supprimer son compte à tout moment. Les données seront traitées conformément à la Politique de Confidentialité.</li>
            <li>En cas de résiliation, les commandes marketplace en cours restent exécutoires.</li>
          </ul>
        </Section>

        <Section number="12" title="Modification des CGU">
          <p>
            Auto-Passeport se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés des modifications substantielles par notification dans l'application. L'utilisation continue de la Plateforme après modification vaut acceptation des nouvelles CGU.
          </p>
        </Section>

        <Section number="13" title="Droit applicable">
          <p>
            Les présentes CGU sont régies par le droit de la <strong>République Démocratique du Congo</strong>. En cas de contradiction avec une réglementation locale, les dispositions les plus protectrices pour l'utilisateur prévaudront.
          </p>
        </Section>

        <Section number="14" title="Contact">
          <p>Pour toute question relative aux présentes CGU :</p>
          <div className="mt-3 rounded-xl border border-border bg-card p-4 space-y-2">
            <p className="text-sm"><strong>Auto-Passeport</strong></p>
            <p className="text-sm text-muted-foreground">Email : <a href="mailto:Auto-passeport@gmail.com" className="text-primary hover:underline">Auto-passeport@gmail.com</a></p>
            <p className="text-sm text-muted-foreground">Kinshasa, République Démocratique du Congo</p>
          </div>
        </Section>

        <div className="pt-6 border-t border-border text-center space-x-4">
          <Link to="/privacy" className="text-sm text-primary hover:underline">Politique de confidentialité</Link>
          <span className="text-muted-foreground">·</span>
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
