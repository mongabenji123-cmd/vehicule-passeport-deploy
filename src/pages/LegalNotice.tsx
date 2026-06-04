import { Link } from "react-router-dom";
import { Building2, ArrowLeft } from "lucide-react";

export default function LegalNotice() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Building2 className="w-5 h-5 text-primary" />
          <h1 className="font-display text-lg font-bold uppercase tracking-wide">Mentions Légales</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        <Section number="1" title="Éditeur du site">
          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <p className="text-sm"><strong className="text-foreground">Auto-Passeport SAS</strong></p>
            <p className="text-sm">Société par Actions Simplifiée de droit OHADA</p>
            <p className="text-sm">RCCM : <span className="text-foreground font-medium">En cours d'immatriculation</span></p>
            <p className="text-sm">Siège social : <strong className="text-foreground">Kinshasa, République Démocratique du Congo</strong></p>
            <p className="text-sm">Email : <a href="mailto:Auto-passeport@gmail.com" className="text-primary hover:underline">Auto-passeport@gmail.com</a></p>
            <p className="text-sm">Directeur de la publication : L'équipe Auto-Passeport</p>
          </div>
        </Section>

        <Section number="2" title="Hébergement">
          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <p className="text-sm"><strong className="text-foreground">Lovable Cloud</strong></p>
            <p className="text-sm">Infrastructure cloud sécurisée</p>
            <p className="text-sm">Site : <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">lovable.dev</a></p>
          </div>
        </Section>

        <Section number="3" title="Propriété intellectuelle">
          <p>
            L'ensemble des éléments composant le site Auto-Passeport (textes, graphismes, logos, icônes, images, clips audio et vidéo, logiciels, bases de données) sont la propriété exclusive d'Auto-Passeport ou de ses partenaires et sont protégés par les lois relatives à la propriété intellectuelle.
          </p>
          <p>
            Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation écrite préalable d'Auto-Passeport.
          </p>
        </Section>

        <Section number="4" title="Données personnelles">
          <p>
            Les informations collectées sur ce site sont traitées conformément à notre{" "}
            <Link to="/privacy" className="text-primary hover:underline font-medium">Politique de Confidentialité</Link>.
            Auto-Passeport s'engage à respecter la vie privée de ses utilisateurs et à protéger les données personnelles communiquées.
          </p>
          <p>
            Conformément à la réglementation applicable, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Pour exercer ces droits, contactez-nous à{" "}
            <a href="mailto:Auto-passeport@gmail.com" className="text-primary hover:underline">Auto-passeport@gmail.com</a>.
          </p>
        </Section>

        <Section number="5" title="Cookies">
          <p>
            Le site Auto-Passeport utilise des cookies strictement nécessaires au fonctionnement de l'application (authentification, préférences de session). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.
          </p>
        </Section>

        <Section number="6" title="Limitation de responsabilité">
          <p>
            Auto-Passeport s'efforce de fournir des informations aussi précises que possible. Toutefois, Auto-Passeport ne pourra être tenu responsable des omissions, inexactitudes ou carences dans la mise à jour des informations, qu'elles soient de son fait ou du fait des partenaires tiers qui lui fournissent ces informations.
          </p>
          <p>
            Le score de santé véhicule est un indicateur calculé sur la base des données déclarées et ne constitue en aucun cas un diagnostic mécanique professionnel. Consultez notre page{" "}
            <Link to="/terms" className="text-primary hover:underline font-medium">Conditions Générales d'Utilisation</Link>{" "}
            pour plus de détails.
          </p>
        </Section>

        <Section number="7" title="Droit applicable">
          <p>
            Les présentes mentions légales sont soumises au droit de la <strong className="text-foreground">République Démocratique du Congo</strong>. En cas de litige, et après tentative de résolution amiable, les tribunaux de Kinshasa seront seuls compétents.
          </p>
        </Section>

        <div className="pt-6 border-t border-border text-center space-x-4">
          <Link to="/privacy" className="text-sm text-primary hover:underline">Confidentialité</Link>
          <span className="text-muted-foreground">·</span>
          <Link to="/terms" className="text-sm text-primary hover:underline">CGU</Link>
          <span className="text-muted-foreground">·</span>
          <Link to="/" className="text-sm text-primary hover:underline">← Accueil</Link>
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
