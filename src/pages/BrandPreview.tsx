import { Link } from "react-router-dom";
import { SEO } from "@/components/seo/SEO";
import logoIcon from "@/assets/logo-icon.svg";
import logoDark from "@/assets/logo-dark.svg";
import logoLight from "@/assets/logo-light.svg";
import logoGlass from "@/assets/logo-glass.png";
import logoGlassIcon from "@/assets/logo-glass-icon.png";

export default function BrandPreview() {
  const variants = [
    { label: "Glassmorphism — logo complet", src: logoGlass, bg: "bg-[#0A0F1E]", featured: true },
    { label: "Glassmorphism — icône seule", src: logoGlassIcon, bg: "bg-[#0A0F1E]", icon: true, featured: true },
    { label: "Logo complet — fond sombre", src: logoDark, bg: "bg-[#0A0F1E]" },
    { label: "Logo complet — fond clair", src: logoLight, bg: "bg-white" },
    { label: "Icône SVG — fond sombre", src: logoIcon, bg: "bg-[#0A0F1E]", icon: true },
    { label: "Icône SVG — fond clair", src: logoIcon, bg: "bg-white", icon: true },
  ];

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <SEO
        title="Identité visuelle — Auto-Passeport"
        description="Variantes du logo Auto-Passeport : versions sombre, claire et icône seule."
      />
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-foreground">
            Identité visuelle
          </h1>
          <p className="text-sm text-muted-foreground">
            Symbole fusionnant passeport sécurisé (puce + tampon de validation) et silhouette automobile.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {variants.map((v) => (
            <div key={v.label} className="rounded-xl border border-border overflow-hidden">
              <div className={`${v.bg} flex items-center justify-center p-8 min-h-[160px]`}>
                <img
                  src={v.src}
                  alt={v.label}
                  className={v.icon ? "w-20 h-20" : "h-16 w-auto"}
                />
              </div>
              <div className="p-3 bg-card">
                <p className="text-xs font-medium text-foreground">{v.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-foreground">
            Palette
          </h2>
          <div className="flex flex-wrap gap-3 text-xs">
            {[
              { name: "Bleu primaire", hex: "#3B82F6" },
              { name: "Bleu profond", hex: "#1E40AF" },
              { name: "Or accent", hex: "#FBBF24" },
              { name: "Fond sombre", hex: "#0A0F1E" },
            ].map((c) => (
              <div key={c.hex} className="flex items-center gap-2 rounded-lg border border-border px-2 py-1">
                <span className="w-5 h-5 rounded" style={{ background: c.hex }} />
                <span className="text-foreground">{c.name}</span>
                <span className="text-muted-foreground">{c.hex}</span>
              </div>
            ))}
          </div>
        </div>

        <Link to="/" className="inline-block text-sm text-primary hover:underline">
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
