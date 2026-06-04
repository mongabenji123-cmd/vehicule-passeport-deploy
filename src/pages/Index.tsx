import logoSrc from '@/assets/logo-icon.svg';
import { useEffect, useRef, useState, ReactNode, createContext, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { VehiclePassportMock } from '@/components/landing/VehiclePassportMock';
import {
  Building2, MapPin, BadgeCheck, Car, ArrowRight,
  ChevronRight, Shield, Clock, Wrench, Zap, Lock, Bell,
  Star, Menu, X, FileText, Globe,
} from 'lucide-react';

/* ─── i18n ─── */
type Lang = 'fr' | 'ln';
const LangCtx = createContext<{ lang: Lang; toggle: () => void }>({ lang: 'fr', toggle: () => {} });
const useLang = () => useContext(LangCtx);

const t = {
  navGarages:    { fr: 'Garages',        ln: 'Ba garages' },
  navFeatures:   { fr: 'Fonctionnalités', ln: 'Makambo ya kosaléla' },
  navPricing:    { fr: 'Tarifs',          ln: 'Ntalo' },
  navLogin:      { fr: 'Se connecter',    ln: 'Kokɔta' },
  navStart:      { fr: 'Commencer',       ln: 'Banda' },
  navDashboard:  { fr: 'Tableau de bord', ln: 'Tableau ya mosala' },

  heroBadge:     { fr: 'Passeport numérique certifié',           ln: 'Passeport ya numérique ya solo' },
  heroTitle1:    { fr: 'Le passeport',                          ln: 'Passeport' },
  heroTitle2:    { fr: 'numérique',                              ln: 'ya numérique' },
  heroTitle3:    { fr: 'de votre véhicule.',                     ln: 'ya motuka na yo.' },
  heroDesc:      { fr: "Centralisez tout l'historique de vos véhicules. Accédez à vos documents certifiés en 1 clic. Recevez des alertes avant chaque échéance.",
                   ln: "Bómisa makambo nyonso ya motuka na yo esika moko. Kozwa mikanda ya solo na clic moko. Bázwa ba alertes liboso ya eleko nyonso." },
  heroCta:       { fr: 'Créer mon compte gratuitement',          ln: 'Kofungola compte na ofele' },
  heroDemo:      { fr: 'Voir la démo',                          ln: 'Komona démo' },

  statVehicles:  { fr: 'véhicules gérés',    ln: 'mituka ebómbami' },
  statSatisf:    { fr: 'satisfaction clients', ln: 'esengo ya ba clients' },
  statPdf:       { fr: 'pour exporter un PDF', ln: 'mpo na ko-exporter PDF' },
  statRgpd:      { fr: 'certifié RGPD',       ln: 'certifié RGPD' },

  featTitle:     { fr: 'Fonctionnalités',                ln: 'Makambo ya kosaléla' },
  featSubtitle:  { fr: 'Tout ce dont vous avez besoin',    ln: 'Nyonso oyo ozali na yango mposa' },
  feat1Title:    { fr: 'Passeport numérique',              ln: 'Passeport ya numérique' },
  feat1Desc:     { fr: "Tout l'historique de votre véhicule en un seul endroit — interventions, photos, documents certifiés.",
                   ln: "Makambo nyonso ya motuka na yo esika moko — ba interventions, ba photos, mikanda ya solo." },
  feat2Title:    { fr: 'Réseau de garages',                ln: 'Réseau ya ba garages' },
  feat2Desc:     { fr: "Connectez-vous aux garages certifiés de votre réseau. Ils saisissent directement dans votre passeport.",
                   ln: "Kosangana na ba garages ya solo ya réseau na yo. Bakokɔtisa directement na passeport na yo." },
  feat3Title:    { fr: 'PDF certifié',                      ln: 'PDF ya solo' },
  feat3Desc:     { fr: "Exportez un document officiel de l'historique complet en 1 clic. Idéal pour la revente.",
                   ln: "Kobimisa mokanda officiel ya makambo nyonso na clic moko. Malamu mpo na kotéka." },
  feat4Title:    { fr: 'Alertes intelligentes',            ln: 'Ba alertes ya mayele' },
  feat4Desc:     { fr: "Vidange, contrôle technique, assurance : ne ratez plus jamais une échéance kilométrique ou calendaire.",
                   ln: "Vidange, contrôle technique, assurance: okobungisa lisusu eleko moko te." },
  feat5Title:    { fr: 'Temps réel',                       ln: 'Na ntango ya solo' },
  feat5Desc:     { fr: "Les interventions apparaissent instantanément dans votre passeport.",
                   ln: "Ba interventions emonanaka mbala moko na passeport na yo." },
  feat6Title:    { fr: 'Sécurisé & privé',                 ln: 'Ebómbami malamu' },
  feat6Desc:     { fr: "Données chiffrées, accès strict par Row Level Security. Seul vous voyez vos véhicules.",
                   ln: "Ba données ebómbami, kaka yo moko nde okomona mituka na yo." },

  forWhoTitle:   { fr: 'Pour qui ?',                       ln: 'Mpo na nani ?' },
  ownerTitle:    { fr: 'Propriétaire',                     ln: 'Nkolo motuka' },
  owner1:        { fr: "Centralise l'historique de tous mes véhicules",    ln: "Kobómisa makambo nyonso ya mituka na ngai esika moko" },
  owner2:        { fr: "Reçoit des alertes avant chaque échéance",        ln: "Kozwa ba alertes liboso ya eleko nyonso" },
  owner3:        { fr: "Exporte le passeport pour revendre plus cher",    ln: "Ko-exporter passeport mpo na kotéka na ntalo ya malamu" },
  owner4:        { fr: "Voit en temps réel ce que fait le garage",        ln: "Komona na ntango ya solo makambo garage azali kosala" },
  ownerCta:      { fr: 'Je suis propriétaire',                            ln: 'Nazali nkolo motuka' },
  garageTitle:   { fr: 'Garage',                        ln: 'Garage' },
  garage1:       { fr: "Saisit les interventions en quelques secondes",      ln: "Kokɔtisa ba interventions na secondes moke" },
  garage2:       { fr: "Génère des PDFs certifiés pour le client",          ln: "Kosala ba PDFs ya solo mpo na client" },
  garage3:       { fr: "Construit sa réputation avec des avis vérifiés",    ln: "Kotonga lokumu na ba avis ya solo" },
  garage4:       { fr: "Accède à l'historique complet du véhicule",        ln: "Kozwa makambo nyonso ya motuka" },
  garageCta:     { fr: 'Je suis un garage',                                 ln: 'Nazali garage' },

  testimTitle:   { fr: 'Ils nous font confiance',          ln: 'Batyeli biso motéma' },
  testim1Text:   { fr: "Depuis Auto-Passeport, j'ai revendu ma voiture avec un historique complet. L'acheteur a payé le prix sans discuter.",
                   ln: "Banda Auto-Passeport, natékaki motuka na ngai na makambo nyonso ya solo. Mosombi afutaki ntalo mobimba sans kolobela." },
  testim1Author: { fr: 'Papa Mwamba',                      ln: 'Papa Mwamba' },
  testim1Info:   { fr: 'Propriétaire · Gombe · 2 véhicules', ln: 'Nkolo motuka · Gombe · mituka 2' },
  testim2Text:   { fr: "Mes clients adorent recevoir le PDF après chaque intervention. Ça montre qu'on est sérieux.",
                   ln: "Ba clients na ngai basepelaka mingi kozwa PDF nsima ya intervention nyonso. Yango emonisaka tozali sérieux." },
  testim2Author: { fr: 'Garage Étoile de Limete',          ln: 'Garage Étoile ya Limete' },
  testim2Info:   { fr: 'Garage certifié · Limete · 320 interventions', ln: 'Garage ya solo · Limete · ba interventions 320' },
  testim3Text:   { fr: "Les alertes kilométriques m'ont évité une panne sur la nationale Kin-Matadi. Application indispensable !",
                   ln: "Ba alertes ya kilomètres epésiaki ngai nzela naboya panne na route Kin-Matadi. Application ya ntina mingi !" },
  testim3Author: { fr: 'Mamie Nseka',                      ln: 'Mamie Nseka' },
  testim3Info:   { fr: 'Propriétaire · Bandalungwa · 1 véhicule', ln: 'Nkolo motuka · Bandalungwa · motuka 1' },

  garagesTitle:  { fr: 'Garages certifiés',                ln: 'Ba garages ya solo' },
  garagesSub:    { fr: 'Trouvez un professionnel de confiance', ln: 'Luka professionnel ya solo' },
  garagesViewAll:{ fr: 'Voir tout',                        ln: 'Talá nyonso' },
  garagesEmpty:  { fr: 'Aucun garage certifié pour le moment', ln: 'Garage ya solo moko te mpo na sikoyo' },
  certified:     { fr: 'Certifié',                        ln: 'Ya solo' },

  ctaBadge:      { fr: 'Commencez gratuitement',            ln: 'Banda na ofele' },
  ctaTitle:      { fr: "Prêt à digitaliser l'historique de vos véhicules ?", ln: "Opesi mpo na kobómisa makambo ya mituka na yo na numérique ?" },
  ctaDesc:       { fr: "Créez votre compte et digitalisez l'historique de vos véhicules dès aujourd'hui.",
                   ln: "Fungolá compte na yo mpe bómisá makambo ya mituka na yo na numérique lelo." },
  ctaBtn:        { fr: 'Créer mon compte gratuitement',      ln: 'Kofungola compte na ofele' },
  ctaNote:       { fr: 'Aucune carte bancaire requise · Annulation à tout moment',
                   ln: 'Carte bancaire esengeli te · Kotika ntango nyonso' },

  footerTagline: { fr: 'Le passeport numérique de votre véhicule.',  ln: 'Passeport ya numérique ya motuka na yo.' },
  footerProduct: { fr: 'Produit',          ln: 'Produit' },
  footerLegal:   { fr: 'Légal',          ln: 'Légal' },
  footerContact: { fr: 'Contact',          ln: 'Contact' },
  footerFeatures:{ fr: 'Fonctionnalités',   ln: 'Makambo ya kosaléla' },
  footerGarages: { fr: 'Garages',          ln: 'Ba garages' },
  footerPricing: { fr: 'Tarifs',           ln: 'Ntalo' },
  footerLegalN:  { fr: 'Mentions légales',  ln: 'Makambo ya mibeko' },
  footerPrivacy: { fr: 'Confidentialité',   ln: 'Bosɛkrɛ' },
  footerTerms:   { fr: 'CGU',              ln: 'CGU' },
  footerCopy:    { fr: 'Tous droits réservés', ln: 'Makoki nyonso ebómbami' },
} as const;

function T(key: keyof typeof t) {
  const { lang } = useLang();
  return t[key][lang];
}

/* ─── Scroll reveal ─── */
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(18px)',
        filter: visible ? 'blur(0)' : 'blur(4px)',
        transition: `opacity 650ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 650ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, filter 650ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Counter ─── */
function Counter({ end, suffix = '', prefix = '', duration = 1800 }: { end: number; suffix?: string; prefix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);
  const [val, setVal] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * end));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [started, end, duration]);

  return <span ref={ref}>{prefix}{started ? `${val.toLocaleString('fr-FR')}${suffix}` : `0${suffix}`}</span>;
}

/* ─── SVG dot pattern ─── */
const DotPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="currentColor" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dots)" />
  </svg>
);

/* ─── Language Toggle ─── */
function LangToggle() {
  const { lang, toggle } = useLang();
  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      title={lang === 'fr' ? 'Passer en Lingala' : 'Passer en Français'}
    >
      <Globe className="w-3.5 h-3.5" />
      {lang === 'fr' ? 'LN' : 'FR'}
    </button>
  );
}

export default function IndexPage() {
  const { user } = useAuth();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState<Lang>(() => {
    try { return (localStorage.getItem('ap-lang') as Lang) || 'fr'; } catch { return 'fr'; }
  });

  const toggle = () => {
    const next = lang === 'fr' ? 'ln' : 'fr';
    setLang(next);
    try { localStorage.setItem('ap-lang', next); } catch {}
  };

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const { data: garages, isLoading } = useQuery({
    queryKey: ['public-garages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('garages_public_directory')
        .select('*')
        .order('nom_garage')
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  const navLinks = [
    { label: t.navGarages[lang], href: '#garages' },
    { label: t.navFeatures[lang], href: '#features' },
    { label: t.navPricing[lang], href: '#cta' },
  ];

  return (
    <LangCtx.Provider value={{ lang, toggle }}>
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ═══════ NAVBAR ═══════ */}
      <nav className={`sticky top-0 z-50 transition-all duration-200 ${scrolled ? 'border-b border-border bg-background/85 backdrop-blur-lg' : 'bg-transparent'}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoSrc} alt="Auto-Passeport" className="w-9 h-9 object-contain" />
            <span className="font-display text-sm font-bold uppercase tracking-widest text-secondary-foreground bg-[sidebar-primary-foreground] bg-secondary">
              Auto-Passeport
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.label}</a>
            ))}
            <LangToggle />
            {user ? (
              <Button asChild size="sm" className="active:scale-[0.97]">
                <Link to="/dashboard">{t.navDashboard[lang]}</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="active:scale-[0.97]">
                  <Link to="/login">{t.navLogin[lang]}</Link>
                </Button>
                <Button asChild size="sm" className="gap-1.5 active:scale-[0.97]">
                  <Link to="/signup">{t.navStart[lang]} <ArrowRight className="w-3.5 h-3.5" /></Link>
                </Button>
              </>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            <LangToggle />
            <button className="p-2 text-muted-foreground hover:text-foreground" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-lg px-5 py-4 space-y-3 animate-fadeInUp">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} onClick={() => setMobileMenu(false)} className="block text-sm text-muted-foreground hover:text-foreground">{l.label}</a>
            ))}
            <div className="flex gap-2 pt-2">
              {user ? (
                <Button asChild size="sm" className="w-full"><Link to="/dashboard">{t.navDashboard[lang]}</Link></Button>
              ) : (
                <>
                  <Button asChild variant="ghost" size="sm" className="flex-1"><Link to="/login">{t.navLogin[lang]}</Link></Button>
                  <Button asChild size="sm" className="flex-1"><Link to="/signup">{t.navStart[lang]}</Link></Button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-[85vh] flex items-center px-5 py-16">
        <DotPattern />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_50%,hsl(217_91%_60%/0.07),transparent_70%)]" />

        <div className="relative mx-auto max-w-6xl w-full grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div>
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
                <span className="font-display text-xs font-semibold uppercase tracking-wider text-primary">
                  {t.heroBadge[lang]}
                </span>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h1
                className="font-extrabold uppercase leading-none tracking-tight text-foreground text-center text-3xl font-serif"
                style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', textWrap: 'balance', lineHeight: '0.95' } as React.CSSProperties}
              >
                {t.heroTitle1[lang]}{' '}
                <span className="text-primary">{t.heroTitle2[lang]}</span>{' '}
                {t.heroTitle3[lang]}
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-5 max-w-md text-base text-muted-foreground leading-relaxed" style={{ textWrap: 'pretty' } as React.CSSProperties}>
                {t.heroDesc[lang]}
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="gap-2 px-8 py-6 text-base font-display font-semibold uppercase tracking-wider active:scale-[0.97]">
                  <Link to={user ? '/dashboard' : '/signup'}>
                    {t.heroCta[lang]} <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="px-6 py-6 text-base active:scale-[0.97]">
                  <a href="#features">{t.heroDemo[lang]}</a>
                </Button>
              </div>
            </Reveal>
          </div>

          <Reveal delay={300} className="hidden lg:flex justify-center">
            <div className="relative">
              <div className="absolute -inset-12 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,hsl(217_91%_60%/0.12),transparent_70%)]" />
              <VehiclePassportMock variant="hero" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════ STATS BAND ═══════ */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-5xl grid grid-cols-2 lg:grid-cols-4">
          {[
            { value: 12000, suffix: '+', prefix: '', label: t.statVehicles[lang] },
            { value: 98, suffix: '%', prefix: '', label: t.statSatisf[lang] },
            { value: 3, suffix: ' min', prefix: '< ', label: t.statPdf[lang] },
            { value: 100, suffix: '%', prefix: '', label: t.statRgpd[lang] },
          ].map((stat, i) => (
            <div key={i} className={`py-8 px-6 text-center ${i < 3 ? 'lg:border-r border-border' : ''} ${i < 2 ? 'border-r border-border lg:border-r' : ''}`}>
              <p className="font-display text-3xl sm:text-4xl font-bold text-foreground">
                <Counter end={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section id="features" className="scroll-mt-16 px-5 py-20 lg:py-28">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="text-center mb-12">
              <span className="font-display text-xs font-semibold uppercase tracking-widest text-primary">{t.featTitle[lang]}</span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-foreground mt-2">
                {t.featSubtitle[lang]}
              </h2>
              <div className="mx-auto mt-3 w-12 h-px bg-primary" />
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: FileText, title: t.feat1Title[lang], desc: t.feat1Desc[lang] },
              { icon: Wrench,   title: t.feat2Title[lang], desc: t.feat2Desc[lang] },
              { icon: FileText, title: t.feat3Title[lang], desc: t.feat3Desc[lang] },
              { icon: Bell,     title: t.feat4Title[lang], desc: t.feat4Desc[lang] },
              { icon: Zap,      title: t.feat5Title[lang], desc: t.feat5Desc[lang] },
              { icon: Lock,     title: t.feat6Title[lang], desc: t.feat6Desc[lang] },
            ].map((feat, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 h-full">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-secondary border border-border">
                    <feat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-foreground mb-2">{feat.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feat.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FOR WHO ═══════ */}
      <section className="px-5 py-20 lg:py-28">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-foreground text-center mb-12">
              {t.forWhoTitle[lang]}
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6">
            <Reveal delay={0}>
              <div className="rounded-xl border border-border border-t-4 border-t-primary bg-card p-8 h-full">
                <p className="text-3xl mb-3">🚗</p>
                <h3 className="font-display text-lg font-bold uppercase tracking-wide text-foreground mb-4">{t.ownerTitle[lang]}</h3>
                <ul className="space-y-3 mb-6">
                  {[t.owner1[lang], t.owner2[lang], t.owner3[lang], t.owner4[lang]].map(txt => (
                    <li key={txt} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="text-primary mt-0.5">✓</span>{txt}
                    </li>
                  ))}
                </ul>
                <Button asChild className="gap-1.5 active:scale-[0.97]">
                  <Link to="/signup?role=owner">{t.ownerCta[lang]} <ArrowRight className="w-3.5 h-3.5" /></Link>
                </Button>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="rounded-xl border border-border border-t-4 border-t-accent bg-card p-8 h-full">
                <p className="text-3xl mb-3">🔧</p>
                <h3 className="font-display text-lg font-bold uppercase tracking-wide text-foreground mb-4">{t.garageTitle[lang]}</h3>
                <ul className="space-y-3 mb-6">
                  {[t.garage1[lang], t.garage2[lang], t.garage3[lang], t.garage4[lang]].map(txt => (
                    <li key={txt} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="text-accent mt-0.5">✓</span>{txt}
                    </li>
                  ))}
                </ul>
                <Button asChild className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.97]">
                  <Link to="/signup?role=garage">{t.garageCta[lang]} <ArrowRight className="w-3.5 h-3.5" /></Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="px-5 py-20 lg:py-28">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-foreground text-center mb-12">
              {t.testimTitle[lang]}
            </h2>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { text: t.testim1Text[lang], author: t.testim1Author[lang], info: t.testim1Info[lang] },
              { text: t.testim2Text[lang], author: t.testim2Author[lang], info: t.testim2Info[lang] },
              { text: t.testim3Text[lang], author: t.testim3Author[lang], info: t.testim3Info[lang] },
            ].map((tm, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="rounded-xl border border-border bg-card p-6 h-full flex flex-col">
                  <div className="flex gap-0.5 mb-3">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 text-accent fill-accent" />)}
                  </div>
                  <p className="text-sm text-muted-foreground italic leading-relaxed flex-1">
                    &ldquo;{tm.text}&rdquo;
                  </p>
                  <div className="mt-4 pt-3 border-t border-border">
                    <p className="font-display text-sm font-semibold uppercase text-foreground">{tm.author}</p>
                    <p className="text-[10px] text-muted-foreground/60">{tm.info}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ GARAGES ═══════ */}
      <section id="garages" className="scroll-mt-16 px-5 py-20 lg:py-28">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-foreground">
                  {t.garagesTitle[lang]}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{t.garagesSub[lang]}</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex gap-1 active:scale-[0.97]">
                <Link to={user ? '/dashboard/garages' : '/login'}>
                  {t.garagesViewAll[lang]} <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </Reveal>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
            </div>
          ) : !garages || garages.length === 0 ? (
            <Reveal>
              <div className="text-center py-16 border border-border rounded-xl bg-card">
                <Building2 className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground text-sm">{t.garagesEmpty[lang]}</p>
              </div>
            </Reveal>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {garages.map((garage, i) => (
                <Reveal key={garage.id} delay={i * 70}>
                  <Link
                    to={user ? `/dashboard/garages/${garage.id}` : '/login'}
                    className="block border border-border rounded-xl p-5 bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-success" />
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-display uppercase tracking-widest rounded-md bg-success/10 text-success border border-success/20">
                        <BadgeCheck className="w-3 h-3" />
                        {t.certified[lang]}
                      </span>
                    </div>
                    <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-foreground mb-2">
                      {garage.nom_garage}
                    </h3>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      {garage.commune && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span>{garage.adresse_complete ? `${garage.adresse_complete}, ` : ''}{garage.commune}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════ CTA FINAL ═══════ */}
      <section id="cta" className="scroll-mt-16 px-5 py-20 lg:py-28">
        <Reveal>
          <div className="relative mx-auto max-w-3xl rounded-2xl border border-border bg-card overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_80%_at_50%_50%,hsl(217_91%_60%/0.1),transparent)]" />
            <div className="relative p-10 sm:p-14 text-center">
              <span className="font-display text-xs font-semibold uppercase tracking-widest text-primary">{t.ctaBadge[lang]}</span>
              <h2
                className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-foreground leading-tight mt-3"
                style={{ textWrap: 'balance' } as React.CSSProperties}
              >
                {t.ctaTitle[lang]}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
                {t.ctaDesc[lang]}
              </p>
              <Button asChild size="lg" className="mt-8 gap-2 px-10 py-6 text-base font-display font-semibold uppercase tracking-wider active:scale-[0.97]">
                <Link to={user ? '/dashboard' : '/signup'}>
                  {t.ctaBtn[lang]} <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <p className="mt-3 text-xs text-muted-foreground/60">{t.ctaNote[lang]}</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="border-t border-border px-5 py-12">
        <div className="mx-auto max-w-6xl">
           {/* Reste du footer... */}
        </div>
      </footer>
    </div>
    </LangCtx.Provider>
  );
}