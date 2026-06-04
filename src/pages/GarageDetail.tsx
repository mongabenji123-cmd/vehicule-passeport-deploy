import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Building2, MapPin, BadgeCheck, Wrench, Star, ExternalLink } from 'lucide-react';
import { SEO } from '@/components/seo/SEO';

export default function GarageDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: garage, isLoading, isError } = useQuery({
    queryKey: ['garage', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('garages_public_directory')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: interventions } = useQuery({
    queryKey: ['garage-interventions', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interventions')
        .select('*, vehicules:vehicule_id(marque, modele, plaque_immatriculation)')
        .eq('garage_id', id!)
        .order('date_intervention', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in max-w-3xl">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !garage) {
    return (
      <div className="text-center py-20">
        <Building2 className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-foreground font-semibold mb-1">Garage introuvable</p>
        <Link to="/dashboard/garages" className="text-primary text-sm hover:underline mt-2 inline-block">
          ← Retour à l'annuaire
        </Link>
      </div>
    );
  }

  const seoTitle = `${garage.nom_garage} — Garage certifié à ${garage.commune ?? 'Kinshasa'}`;
  const seoDesc = `${garage.nom_garage}${garage.est_certifie ? ' (certifié Auto-Passeport)' : ''} — ${[garage.adresse_complete, garage.commune].filter(Boolean).join(', ') || 'Kinshasa, RDC'}.${garage.specialites?.length ? ` Spécialités : ${garage.specialites.join(', ')}.` : ''}`;
  const garageJsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "name": garage.nom_garage,
    "address": {
      "@type": "PostalAddress",
      ...(garage.adresse_complete ? { "streetAddress": garage.adresse_complete } : {}),
      "addressLocality": garage.commune ?? "Kinshasa",
      "addressCountry": "CD",
    },
    ...(garage.latitude && garage.longitude
      ? { "geo": { "@type": "GeoCoordinates", "latitude": garage.latitude, "longitude": garage.longitude } }
      : {}),
    ...(garage.note_moyenne && Number(garage.note_moyenne) > 0
      ? { "aggregateRating": { "@type": "AggregateRating", "ratingValue": Number(garage.note_moyenne), "reviewCount": garage.nombre_avis ?? 0 } }
      : {}),
    ...(garage.specialites?.length ? { "knowsAbout": garage.specialites } : {}),
  };

  return (
    <div className="animate-fade-in max-w-3xl">
      <SEO title={seoTitle} description={seoDesc} type="product" jsonLd={garageJsonLd} />
      <Link to="/dashboard/garages" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        Retour à l'annuaire
      </Link>

      {/* Garage card */}
      <div className="border border-border rounded-xl p-6 bg-card mb-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-8 h-8 text-success" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="font-display text-xl font-bold uppercase tracking-wide text-foreground">{garage.nom_garage}</h1>
              {garage.est_certifie && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-display uppercase tracking-widest rounded-md bg-success/10 text-success border border-success/20">
                  <BadgeCheck className="w-3 h-3" /> Certifié Auto-Passeport
                </span>
              )}
            </div>

            <div className="space-y-1.5 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{[garage.adresse_complete, garage.commune].filter(Boolean).join(', ')}</span>
              </div>
              {garage.note_moyenne != null && Number(garage.note_moyenne) > 0 && (
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 flex-shrink-0 text-accent fill-accent" />
                  <span>{Number(garage.note_moyenne).toFixed(1)} ({garage.nombre_avis} avis)</span>
                </div>
              )}
            </div>

            {garage.specialites && garage.specialites.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {garage.specialites.map((s: string) => (
                  <span key={s} className="px-2 py-0.5 text-[10px] rounded bg-secondary text-muted-foreground">{s}</span>
                ))}
              </div>
            )}

            {/* Google Maps link */}
            {garage.latitude && garage.longitude && (
              <div className="mt-4">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${garage.latitude},${garage.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Voir sur Google Maps
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interventions */}
      <div className="border border-border rounded-xl p-5 bg-card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Wrench className="w-3.5 h-3.5" />
            Interventions réalisées
          </h2>
          <span className="font-mono text-xs text-muted-foreground">
            {interventions?.length ?? 0} intervention{(interventions?.length ?? 0) > 1 ? 's' : ''}
          </span>
        </div>

        {!interventions || interventions.length === 0 ? (
          <div className="text-center py-12">
            <Wrench className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Aucune intervention enregistrée</p>
          </div>
        ) : (
          <div className="space-y-3">
            {interventions.map((intervention) => {
              const vehicule = (intervention as any).vehicules;
              return (
                <div key={intervention.id} className="border border-border rounded-lg p-4 bg-background hover:border-primary/20 transition-colors">
                  <div className="flex items-start justify-between mb-1.5">
                    <h4 className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">{intervention.type_service}</h4>
                    <time className="font-mono text-xs text-muted-foreground">
                      {intervention.date_intervention ? new Date(intervention.date_intervention).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </time>
                  </div>
                  {vehicule && (
                    <p className="text-xs text-muted-foreground mb-1.5">
                      {vehicule.marque} {vehicule.modele} — <span className="font-mono">{vehicule.plaque_immatriculation}</span>
                    </p>
                  )}
                  {intervention.description_travaux && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{intervention.description_travaux}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    {intervention.kilometrage_au_moment_rdv && (
                      <span className="font-mono">{intervention.kilometrage_au_moment_rdv.toLocaleString('fr-FR')} km</span>
                    )}
                    {intervention.montant_facture && (
                      <span className="font-mono">{Number(intervention.montant_facture).toFixed(2)} $</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
