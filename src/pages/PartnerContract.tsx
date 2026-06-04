import { Link } from "react-router-dom";
import { FileText, ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PartnerContract() {
  const lastUpdated = "11 avril 2025";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <FileText className="w-5 h-5 text-primary" />
          <h1 className="font-display text-lg font-bold uppercase tracking-wide">Contrat Garage Partenaire</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Dernière mise à jour : {lastUpdated}</p>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm leading-relaxed">
              Ce document définit les conditions et obligations régissant le partenariat entre <strong className="text-foreground">Auto-Passeport SAS</strong> et les garages souhaitant rejoindre le réseau de professionnels certifiés Auto-Passeport.
            </p>
          </div>
        </div>

        <Section number="1" title="Objet du contrat">
          <p>
            Le présent contrat a pour objet de définir les conditions dans lesquelles le Garage Partenaire (ci-après « le Partenaire ») rejoint le réseau Auto-Passeport et bénéficie de la visibilité, des outils numériques et de la certification offerts par la plateforme Auto-Passeport (ci-après « la Plateforme »), éditée par <strong>Auto-Passeport SAS</strong>, Société par Actions Simplifiée de droit OHADA, domiciliée à Kinshasa, République Démocratique du Congo.
          </p>
        </Section>

        <Section number="2" title="Conditions d'adhésion">
          <p className="mb-3">Pour rejoindre le réseau Auto-Passeport, le garage candidat doit remplir les conditions suivantes :</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Existence légale :</strong> disposer d'un numéro RCCM valide et être en règle avec les obligations fiscales en RDC.</li>
            <li><strong>Local professionnel :</strong> posséder un atelier physique situé à Kinshasa, équipé pour effectuer les prestations déclarées.</li>
            <li><strong>Personnel qualifié :</strong> employer au moins un technicien mécanicien justifiant d'une expérience professionnelle de 2 ans minimum.</li>
            <li><strong>Équipement minimal :</strong> disposer d'un appareil connecté (smartphone ou tablette) pour accéder à la Plateforme et saisir les interventions.</li>
            <li><strong>Engagement qualité :</strong> s'engager à respecter les normes de qualité et d'éthique définies dans le présent contrat.</li>
          </ul>
        </Section>

        <Section number="3" title="Processus de certification">
          <SubSection title="3.1 Candidature">
            <p>Le garage soumet sa candidature via le formulaire dédié sur la Plateforme ou en contactant l'équipe Auto-Passeport. Le dossier doit inclure : copie du RCCM, photos de l'atelier, liste des spécialités et coordonnées complètes.</p>
          </SubSection>
          <SubSection title="3.2 Vérification">
            <p>L'équipe Auto-Passeport procède à une vérification comprenant :</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Contrôle documentaire des pièces fournies.</li>
              <li>Visite physique de l'atelier (si jugé nécessaire).</li>
              <li>Entretien avec le responsable du garage.</li>
            </ul>
          </SubSection>
          <SubSection title="3.3 Validation">
            <p>Après validation, le garage reçoit le badge <strong>« Certifié Auto-Passeport »</strong> et apparaît dans l'annuaire des garages partenaires de la Plateforme.</p>
          </SubSection>
        </Section>

        <Section number="4" title="Obligations du Partenaire">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Exactitude des données :</strong> saisir des informations véridiques et complètes pour chaque intervention réalisée (type de service, pièces remplacées, kilométrage, montant).</li>
            <li><strong>Délai de saisie :</strong> enregistrer chaque intervention sur la Plateforme dans un délai maximum de <strong>48 heures</strong> après sa réalisation.</li>
            <li><strong>Interdiction de falsification :</strong> ne jamais valider d'interventions fictives ou manipuler les données pour influencer le score de santé d'un véhicule.</li>
            <li><strong>Service client :</strong> maintenir un standard de service professionnel envers les propriétaires de véhicules référencés par Auto-Passeport.</li>
            <li><strong>Mise à jour des informations :</strong> informer Auto-Passeport de tout changement concernant ses coordonnées, spécialités, horaires ou personnel qualifié.</li>
            <li><strong>Confidentialité :</strong> protéger les données personnelles des clients conformément à la Politique de Confidentialité d'Auto-Passeport.</li>
          </ul>
        </Section>

        <Section number="5" title="Obligations d'Auto-Passeport">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Visibilité :</strong> référencer le Partenaire dans l'annuaire des garages avec ses coordonnées, spécialités et note de satisfaction.</li>
            <li><strong>Outils numériques :</strong> fournir un accès au tableau de bord garage pour la gestion des interventions et le suivi des véhicules.</li>
            <li><strong>Support technique :</strong> assurer un support pour l'utilisation de la Plateforme pendant les heures ouvrables.</li>
            <li><strong>Badge de certification :</strong> attribuer et maintenir le badge « Certifié Auto-Passeport » tant que le Partenaire respecte ses engagements.</li>
            <li><strong>Mise en relation :</strong> faciliter la mise en relation entre les propriétaires de véhicules et le Partenaire via la Plateforme.</li>
          </ul>
        </Section>

        <Section number="6" title="Tarification du partenariat">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Adhésion :</strong> l'inscription au réseau est <strong>gratuite</strong> pendant la phase de lancement.</li>
            <li><strong>Commission :</strong> Auto-Passeport se réserve le droit d'appliquer une commission sur les interventions réalisées via la Plateforme, dont le taux sera communiqué <strong>30 jours</strong> avant son application.</li>
            <li><strong>Services premium :</strong> des services optionnels (mise en avant, publicité ciblée) pourront être proposés moyennant un abonnement mensuel dont les tarifs seront affichés sur la Plateforme.</li>
          </ul>
        </Section>

        <Section number="7" title="Système de notation">
          <p className="mb-3">Les garages partenaires sont soumis à un système de notation basé sur :</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Avis clients :</strong> les propriétaires de véhicules peuvent évaluer la qualité du service après chaque intervention.</li>
            <li><strong>Fiabilité des données :</strong> la régularité et l'exactitude des saisies d'interventions sont prises en compte.</li>
            <li><strong>Délai de réponse :</strong> la réactivité dans le traitement des demandes via la Plateforme.</li>
          </ul>
          <p className="mt-3">Une note moyenne inférieure à <strong>2/5</strong> pendant <strong>3 mois consécutifs</strong> peut entraîner la suspension de la certification.</p>
        </Section>

        <Section number="8" title="Suspension et résiliation">
          <SubSection title="8.1 Suspension">
            <p>Auto-Passeport peut suspendre temporairement le statut de Partenaire en cas de :</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Plaintes répétées de clients (3 ou plus en 30 jours).</li>
              <li>Non-respect du délai de saisie des interventions.</li>
              <li>Suspicion de falsification de données.</li>
            </ul>
            <p className="mt-2">Le Partenaire sera notifié et disposera de <strong>15 jours</strong> pour remédier à la situation.</p>
          </SubSection>
          <SubSection title="8.2 Résiliation par Auto-Passeport">
            <p>Auto-Passeport peut résilier le contrat de plein droit, sans indemnité, en cas de :</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Falsification avérée de données d'intervention.</li>
              <li>Non-régularisation après une période de suspension.</li>
              <li>Cessation d'activité du garage.</li>
              <li>Violation grave des présentes conditions.</li>
            </ul>
          </SubSection>
          <SubSection title="8.3 Résiliation par le Partenaire">
            <p>Le Partenaire peut résilier le contrat à tout moment avec un préavis de <strong>30 jours</strong> adressé par email à <a href="mailto:Auto-passeport@gmail.com" className="text-primary hover:underline">Auto-passeport@gmail.com</a>. Les interventions en cours restent consultables par les propriétaires de véhicules.</p>
          </SubSection>
        </Section>

        <Section number="9" title="Propriété intellectuelle">
          <p>
            Le Partenaire est autorisé à utiliser le logo et la mention « Certifié Auto-Passeport » uniquement dans le cadre du partenariat et conformément à la charte graphique fournie. Toute utilisation abusive ou après résiliation est strictement interdite.
          </p>
        </Section>

        <Section number="10" title="Responsabilité">
          <ul className="list-disc pl-5 space-y-2">
            <li>Le Partenaire est seul responsable de la qualité des prestations réalisées dans son atelier.</li>
            <li>Auto-Passeport ne peut être tenu responsable des dommages résultant d'une intervention réalisée par le Partenaire.</li>
            <li>Le Partenaire s'engage à disposer d'une assurance responsabilité civile professionnelle valide.</li>
          </ul>
        </Section>

        <Section number="11" title="Résolution des litiges">
          <p className="mb-3">En cas de litige entre Auto-Passeport et le Partenaire :</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Médiation :</strong> les parties s'engagent à privilégier une résolution amiable dans un délai de <strong>30 jours</strong>.</li>
            <li><strong>Juridiction :</strong> à défaut d'accord, les tribunaux de <strong>Kinshasa, RDC</strong> seront seuls compétents.</li>
          </ul>
        </Section>

        <Section number="12" title="Droit applicable">
          <p>
            Le présent contrat est régi par le droit de la <strong>République Démocratique du Congo</strong> et les dispositions de l'Acte Uniforme OHADA relatif au droit commercial général.
          </p>
        </Section>

        <Section number="13" title="Contact">
          <p>Pour toute demande relative au partenariat garage :</p>
          <div className="mt-3 rounded-xl border border-border bg-card p-4 space-y-2">
            <p className="text-sm"><strong>Auto-Passeport SAS</strong></p>
            <p className="text-sm text-muted-foreground">Email : <a href="mailto:Auto-passeport@gmail.com" className="text-primary hover:underline">Auto-passeport@gmail.com</a></p>
            <p className="text-sm text-muted-foreground">Kinshasa, République Démocratique du Congo</p>
          </div>
        </Section>

        <div className="pt-6 border-t border-border text-center space-y-4">
          <div className="space-x-4">
            <Link to="/terms" className="text-sm text-primary hover:underline">Conditions d'utilisation</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/privacy" className="text-sm text-primary hover:underline">Politique de confidentialité</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/" className="text-sm text-primary hover:underline">← Retour à l'accueil</Link>
          </div>
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
