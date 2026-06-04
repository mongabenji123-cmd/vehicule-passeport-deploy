import { useState, createContext, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import logoSrc from '@/assets/logo-icon.svg';
import { ArrowLeft, Globe, Search, HelpCircle, ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

/* ─── i18n ─── */
type Lang = 'fr' | 'ln';
const LangCtx = createContext<{ lang: Lang; toggle: () => void }>({ lang: 'fr', toggle: () => {} });
const useLang = () => useContext(LangCtx);

type FAQ = { q: { fr: string; ln: string }; a: { fr: string; ln: string } };

const faqs: FAQ[] = [
  {
    q: { fr: "Qu'est-ce qu'Auto-Passeport ?", ln: "Auto-Passeport ezali nini?" },
    a: {
      fr: "Auto-Passeport est un passeport numérique pour votre véhicule. Il enregistre tout l'historique d'entretien (vidanges, réparations, contrôles) et génère un rapport certifié que vous pouvez montrer lors d'une revente ou d'un contrôle.",
      ln: "Auto-Passeport ezali passeport ya numérique ya motuka na yo. Ekobomba makambo nyonso ya bobongisi (vidanges, réparations, contrôles) mpe ekosala rapport ya solo oyo okoki kolakisa tango ozali kotéka to na contrôle.",
    },
  },
  {
    q: { fr: "Comment créer mon compte ?", ln: "Ndenge nini nakoki kofungola compte na ngai?" },
    a: {
      fr: "Cliquez sur « Commencer » sur la page d'accueil, entrez votre nom, email et mot de passe. Vous recevrez un email de confirmation. Une fois validé, l'onboarding vous guide en 3 étapes : compte → véhicule → premier scan QR.",
      ln: "Finá « Banda » na page ya liboso, kotia nkombo, email mpe mot de passe na yo. Okozwa email ya confirmation. Sima ya ko-valider, onboarding ekotambwisa yo na ba étapes 3 : compte → motuka → scan QR ya liboso.",
    },
  },
  {
    q: { fr: "Comment ajouter un véhicule ?", ln: "Ndenge nini nakoki kobakisa motuka?" },
    a: {
      fr: "Depuis le tableau de bord, cliquez sur « Ajouter un véhicule ». Renseignez la marque, le modèle, l'année, la plaque d'immatriculation et le kilométrage actuel. Votre véhicule apparaîtra immédiatement dans votre liste.",
      ln: "Longwa na tableau de bord, finá « Kobakisa motuka ». Kotia marque, modèle, mbula, plaque ya immatriculation mpe kilomètres ya sika. Motuka na yo ekomonana mbala moko na liste na yo.",
    },
  },
  {
    q: { fr: "Comment fonctionne le score de santé du véhicule ?", ln: "Score ya santé ya motuka esalaka ndenge nini?" },
    a: {
      fr: "Le score de santé (0-100) est calculé automatiquement selon la régularité de vos entretiens, le kilométrage parcouru depuis la dernière vidange et les alertes en cours. Plus vous entretenez votre véhicule, plus le score est élevé.",
      ln: "Score ya santé (0-100) etángamaka yango moko na kolanda régularité ya bobongisi, kilomètres oyo osali banda vidange ya suka mpe ba alertes ya lelo. Soki obongisi motuka malamu, score ekozala likolo.",
    },
  },
  {
    q: { fr: "Comment trouver un garage certifié près de chez moi ?", ln: "Ndenge nini nakoki kozwa garage ya solo pene na ngai?" },
    a: {
      fr: "Allez dans l'onglet « Garages » du tableau de bord. Vous verrez la liste des garages partenaires avec leur commune, spécialités et notes. Vous pouvez les appeler directement ou les contacter via WhatsApp.",
      ln: "Kende na onglet « Ba garages » ya tableau de bord. Okomona liste ya ba garages partenaires na commune, spécialités mpe ba notes na bango. Okoki kobenga bango to kotindela bango message na WhatsApp.",
    },
  },
  {
    q: { fr: "À quoi servent les alertes ?", ln: "Ba alertes esalelaka nini?" },
    a: {
      fr: "Les alertes vous préviennent quand un entretien approche (vidange, plaquettes de frein, courroie…). Elles sont basées sur le kilométrage et les délais recommandés. Vous recevez une notification pour ne jamais oublier un entretien important.",
      ln: "Ba alertes ekebisaka yo tango entretien ezali kopusana (vidange, plaquettes ya frein, courroie…). Ezali na base ya kilomètres mpe ba délais ya recommandé. Okozwa notification mpo obosana te entretien moko ya ntina.",
    },
  },
  {
    q: { fr: "Comment obtenir le rapport PDF certifié ?", ln: "Ndenge nini nakoki kozwa rapport PDF ya solo?" },
    a: {
      fr: "Sur la fiche de votre véhicule, cliquez sur « Télécharger le passeport PDF ». Ce rapport contient tout l'historique d'entretien certifié par les garages partenaires. Il est idéal pour rassurer un acheteur potentiel.",
      ln: "Na fiche ya motuka na yo, finá « Télécharger le passeport PDF ». Rapport yango ezali na makambo nyonso ya bobongisi oyo ba garages partenaires ba-certifier. Ezali malamu mpo na kotya motema na mosombi.",
    },
  },
  {
    q: { fr: "Mes données sont-elles sécurisées ?", ln: "Ba données na ngai ebombami malamu?" },
    a: {
      fr: "Oui. Toutes vos données sont chiffrées et stockées sur des serveurs sécurisés. Seuls vous et les garages que vous autorisez peuvent accéder à l'historique de votre véhicule. Nous ne partageons jamais vos données avec des tiers.",
      ln: "Ee. Ba données na yo nyonso ebombami na ba serveurs ya sécurité. Kaka yo mpe ba garages oyo opesi ndingisa nde bakoki komona makambo ya motuka na yo. Topesaka te ba données na yo na bato mosusu.",
    },
  },
  {
    q: { fr: "Comment fonctionne la marketplace de pièces ?", ln: "Marketplace ya biteni esalaka ndenge nini?" },
    a: {
      fr: "La marketplace permet aux vendeurs de pièces détachées de publier leur stock et aux propriétaires de trouver des pièces compatibles. Vous pouvez parcourir les annonces, comparer les prix et passer commande directement depuis l'application.",
      ln: "Marketplace epesaka ba vendeurs ya biteni nzela ya ko-publier stock na bango mpe ba propriétaires bazwa biteni oyo ekokani. Okoki kotala ba annonces, kokokanisa ba ntalo mpe kosomba mbala moko na application.",
    },
  },
  {
    q: { fr: "Je suis garagiste, comment rejoindre Auto-Passeport ?", ln: "Nazali garagiste, ndenge nini nakoki kokɔta na Auto-Passeport?" },
    a: {
      fr: "Créez un compte en choisissant le rôle « Garage ». L'onboarding en 3 étapes vous guide : création du compte → informations du garage → première intervention. Une fois inscrit, vous apparaissez dans l'annuaire des garages certifiés de Kinshasa.",
      ln: "Fungolá compte na kopona rôle « Garage ». Onboarding ya ba étapes 3 ekotambwisa yo : kofungola compte → makambo ya garage → intervention ya liboso. Sima ya ko-inscrire, okomonana na annuaire ya ba garages ya solo ya Kinshasa.",
    },
  },
];

const t = {
  title:       { fr: 'Questions fréquentes', ln: 'Mituna oyo batunaka mingi' },
  subtitle:    { fr: "Trouvez rapidement les réponses à vos questions sur Auto-Passeport.", ln: "Zwá mbala moko biyano na mituna na yo na likambo ya Auto-Passeport." },
  search:      { fr: 'Rechercher une question…', ln: 'Koluka motuna…' },
  noResult:    { fr: 'Aucun résultat trouvé.', ln: 'Eloko moko emonani te.' },
  contactTitle:{ fr: "Vous n'avez pas trouvé votre réponse ?", ln: 'Ozwi eyano na yo te?' },
  contactText: { fr: "Contactez-nous sur WhatsApp, nous répondons en moins de 24h.", ln: "Tindá biso message na WhatsApp, tokozongisela yo na ngonga 24." },
  contactBtn:  { fr: 'Nous contacter', ln: 'Kobenga biso' },
  back:        { fr: 'Retour', ln: 'Kozonga' },
};

function LangToggle() {
  const { lang, toggle } = useLang();
  return (
    <button onClick={toggle} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-border bg-card hover:bg-muted transition-colors">
      <Globe className="w-3.5 h-3.5" />
      {lang === 'fr' ? 'LN' : 'FR'}
    </button>
  );
}

export default function FAQPage() {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('ap-lang') as Lang) || 'fr');
  const toggle = () => setLang(p => { const n = p === 'fr' ? 'ln' : 'fr'; localStorage.setItem('ap-lang', n); return n; });
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const filtered = faqs.filter(f => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return f.q[lang].toLowerCase().includes(s) || f.a[lang].toLowerCase().includes(s);
  });

  return (
    <LangCtx.Provider value={{ lang, toggle }}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <div className="flex items-center justify-between h-14 px-4 max-w-2xl mx-auto">
            <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {t.back[lang]}
            </Link>
            <LangToggle />
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
          {/* Hero */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-2">
              <HelpCircle className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">
              {t.title[lang]}
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {t.subtitle[lang]}
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t.search[lang]}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* FAQ list */}
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">{t.noResult[lang]}</p>
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {filtered.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border rounded-xl px-4 bg-card">
                  <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline">
                    <span className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span>{faq.q[lang]}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed pl-9">
                    {faq.a[lang]}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          {/* Contact CTA */}
          <div className="rounded-2xl border bg-card p-6 text-center space-y-3">
            <p className="font-display font-bold text-foreground">{t.contactTitle[lang]}</p>
            <p className="text-sm text-muted-foreground">{t.contactText[lang]}</p>
            <Button asChild className="rounded-full">
              <a href="https://wa.me/243992826770" target="_blank" rel="noopener noreferrer">
                {t.contactBtn[lang]}
              </a>
            </Button>
          </div>
        </main>
      </div>
    </LangCtx.Provider>
  );
}
