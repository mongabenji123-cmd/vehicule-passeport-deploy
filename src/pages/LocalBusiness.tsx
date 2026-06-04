import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import logoSrc from '@/assets/logo-icon.svg';
import {
  MapPin, Phone, Clock, Globe, Star, ExternalLink,
  CheckCircle2, Car, Shield, Wrench, MessageCircle,
  Navigation, ChevronRight, Users, Award,
} from 'lucide-react';

/* ─── Structured Data (JSON-LD) for Google ─── */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Auto-Passeport Kinshasa",
  "description": "Passeport numérique certifié pour véhicules. Historique d'entretien, garages certifiés, alertes intelligentes et rapport PDF certifié à Kinshasa, RDC.",
  "url": "https://auto-passeport.cd",
  "telephone": "+243 992 826 770",
  "email": "Auto-passeport@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Avenue du Commerce, Gombe",
    "addressLocality": "Kinshasa",
    "addressRegion": "Kinshasa",
    "addressCountry": "CD",
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -4.3250,
    "longitude": 15.3222,
  },
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "08:00", "closes": "18:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "08:00", "closes": "13:00" },
  ],
  "image": "/assets/logo.jpeg",
  "priceRange": "$$",
  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "reviewCount": "127" },
  "sameAs": ["https://wa.me/243992826770"],
};

const reviews = [
  { name: "Patrick M.", loc: "Gombe", rating: 5, text: "Grâce à Auto-Passeport, j'ai vendu ma voiture 15% plus cher. L'acheteur avait confiance avec le rapport certifié." },
  { name: "Carine L.", loc: "Limete", rating: 5, text: "Je reçois les alertes de vidange à temps. Plus jamais de panne à cause d'un entretien oublié !" },
  { name: "Serge K.", loc: "Bandalungwa", rating: 4, text: "Application simple et pratique. Mon garagiste est partenaire, tout est automatique." },
  { name: "Marie-Claire N.", loc: "Ngaliema", rating: 5, text: "Le passeport PDF m'a sauvée lors d'un contrôle routier. Tout était en ordre." },
];

const services = [
  { icon: Car, title: "Passeport véhicule numérique", desc: "Historique complet certifié par des garages partenaires" },
  { icon: Wrench, title: "Réseau de garages certifiés", desc: "Garages vérifiés à Kinshasa : Gombe, Limete, Bandalungwa, Ngaliema…" },
  { icon: Shield, title: "Rapport PDF certifié", desc: "Document officiel pour revente ou contrôle routier" },
  { icon: Clock, title: "Alertes intelligentes", desc: "Notifications avant chaque échéance d'entretien" },
];

const stats = [
  { value: "500+", label: "Véhicules enregistrés" },
  { value: "45+", label: "Garages partenaires" },
  { value: "2 000+", label: "Interventions certifiées" },
  { value: "4.8/5", label: "Note moyenne" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-accent fill-accent' : 'text-muted-foreground/30'}`} />
      ))}
    </div>
  );
}

export default function LocalBusiness() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <div className="flex items-center justify-between h-14 px-4 max-w-3xl mx-auto">
            <Link to="/" className="flex items-center gap-2">
              <img src={logoSrc} alt="Auto-Passeport Kinshasa" className="w-8 h-8 rounded-lg object-contain" />
              <span className="font-display text-sm font-bold tracking-wide uppercase">Auto-Passeport</span>
            </Link>
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="outline" className="rounded-full text-xs">
                <a href="tel:+243992826770"><Phone className="w-3.5 h-3.5 mr-1" />Appeler</a>
              </Button>
              <Button asChild size="sm" className="rounded-full text-xs">
                <Link to="/signup">Commencer</Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto">
          {/* Hero / Business Card */}
          <section className="px-4 py-8 space-y-5">
            <div className="flex items-start gap-4">
              <img src={logoSrc} alt="Auto-Passeport" className="w-20 h-20 rounded-2xl border-2 border-primary/20 object-contain bg-card p-1" />
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-display font-bold tracking-tight">Auto-Passeport Kinshasa</h1>
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                </div>
                <p className="text-xs text-muted-foreground">Passeport numérique certifié pour véhicules</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-accent fill-accent" />
                    <span className="text-sm font-bold">4.8</span>
                  </div>
                  <span className="text-xs text-muted-foreground">(127 avis)</span>
                  <Badge variant="secondary" className="text-[10px]">Vérifié</Badge>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button asChild variant="outline" className="rounded-xl h-12 text-xs">
                <a href="https://wa.me/243992826770" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4 mr-1.5" />WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline" className="rounded-xl h-12 text-xs">
                <a href="tel:+243992826770">
                  <Phone className="w-4 h-4 mr-1.5" />Appeler
                </a>
              </Button>
              <Button asChild variant="outline" className="rounded-xl h-12 text-xs">
                <a href="https://maps.google.com/?q=-4.325,15.3222" target="_blank" rel="noopener noreferrer">
                  <Navigation className="w-4 h-4 mr-1.5" />Itinéraire
                </a>
              </Button>
              <Button asChild variant="outline" className="rounded-xl h-12 text-xs">
                <Link to="/">
                  <Globe className="w-4 h-4 mr-1.5" />Site web
                </Link>
              </Button>
            </div>
          </section>

          {/* Info cards */}
          <section className="px-4 space-y-3">
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Avenue du Commerce, Gombe</p>
                  <p className="text-xs text-muted-foreground">Kinshasa, République Démocratique du Congo</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Horaires</p>
                  <p className="text-xs text-muted-foreground">Lun – Ven : 08h00 – 18h00</p>
                  <p className="text-xs text-muted-foreground">Sam : 08h00 – 13h00</p>
                  <p className="text-xs text-primary font-medium">● Ouvert maintenant</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium">+243 992 826 770</p>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="px-4 py-6">
            <div className="grid grid-cols-2 gap-3">
              {stats.map(s => (
                <div key={s.label} className="rounded-xl border bg-card p-4 text-center">
                  <p className="text-xl font-display font-bold text-primary">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Services */}
          <section className="px-4 py-4 space-y-4">
            <h2 className="text-lg font-display font-bold">Nos services</h2>
            <div className="space-y-2">
              {services.map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.title} className="flex items-start gap-3 rounded-xl border bg-card p-4">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{s.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Reviews */}
          <section className="px-4 py-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-bold">Avis clients</h2>
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span className="font-bold">4.8</span>
                <span className="text-muted-foreground text-xs">(127)</span>
              </div>
            </div>
            <div className="space-y-3">
              {reviews.map((r, i) => (
                <div key={i} className="rounded-xl border bg-card p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">{r.name[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{r.name}</p>
                        <p className="text-[10px] text-muted-foreground">{r.loc}</p>
                      </div>
                    </div>
                    <StarRating rating={r.rating} />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="px-4 py-8">
            <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-6 text-center space-y-4">
              <Award className="w-10 h-10 text-primary mx-auto" />
              <h2 className="text-lg font-display font-bold">Créez votre passeport véhicule</h2>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Protégez la valeur de votre véhicule à Kinshasa avec Auto-Passeport.
              </p>
              <Button asChild size="lg" className="rounded-full w-full max-w-xs">
                <Link to="/signup">
                  Commencer gratuitement <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t px-4 py-6 text-center space-y-2">
            <p className="text-xs text-muted-foreground">© 2026 Auto-Passeport · Kinshasa, RDC</p>
            <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
              <Link to="/privacy" className="hover:text-foreground transition-colors">Confidentialité</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">CGU</Link>
              <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
