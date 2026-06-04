import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Building2, MapPin, Search, BadgeCheck, Star, X } from 'lucide-react';

export default function GaragesListPage() {
  const [search, setSearch] = useState('');

  const { data: garages = [], isLoading } = useQuery({
    queryKey: ['garages-certifies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('garages_public_directory')
        .select('*')
        .order('nom_garage');
      if (error) throw error;
      return data ?? [];
    },
  });

  const communes = useMemo(() => {
    const list = garages.map(g => g.commune).filter(Boolean);
    return [...new Set(list)].sort();
  }, [garages]);

  const filtered = garages.filter(g => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return g.nom_garage.toLowerCase().includes(q) || g.commune.toLowerCase().includes(q);
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-8 w-20 rounded-full" />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-foreground">
          Réseau Garages
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {garages.length} garage{garages.length !== 1 ? 's' : ''} certifié{garages.length !== 1 ? 's' : ''} dans le réseau Auto-Passeport
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom ou commune…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Commune pills */}
      {communes.length > 0 && !search && (
        <div className="flex gap-2 flex-wrap">
          {communes.slice(0, 10).map(commune => (
            <button
              key={commune}
              type="button"
              onClick={() => setSearch(commune)}
              className="text-xs px-3 py-1.5 rounded-full border border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors active:scale-[0.97]"
            >
              {commune}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Building2 className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm font-semibold text-foreground mb-1">Aucun garage trouvé</p>
          <p className="text-xs text-muted-foreground">
            {search ? `Aucun garage certifié pour « ${search} »` : 'Le réseau est en cours de constitution'}
          </p>
          {search && (
            <button onClick={() => setSearch('')} className="mt-3 text-xs text-primary hover:underline">
              Voir tous les garages
            </button>
          )}
        </div>
      ) : (
        <>
          {search && (
            <p className="text-xs text-muted-foreground">
              {filtered.length} résultat{filtered.length !== 1 ? 's' : ''} pour « {search} »
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((garage) => (
              <Link
                to={`/dashboard/garages/${garage.id}`}
                key={garage.id}
                className="group border border-border rounded-xl p-5 bg-card hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-success" />
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-display uppercase tracking-widest rounded-md bg-success/10 text-success border border-success/20">
                    <BadgeCheck className="w-3 h-3" />
                    Certifié
                  </span>
                </div>

                <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-foreground mb-2">
                  {garage.nom_garage}
                </h3>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span>{garage.adresse_complete ? `${garage.adresse_complete}, ` : ''}{garage.commune}</span>
                  </div>
                  {garage.note_moyenne != null && Number(garage.note_moyenne) > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3 h-3 flex-shrink-0 text-accent fill-accent" />
                      <span>{Number(garage.note_moyenne).toFixed(1)} ({garage.nombre_avis} avis)</span>
                    </div>
                  )}
                </div>

                {garage.specialites && garage.specialites.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {garage.specialites.slice(0, 3).map(s => (
                      <span key={s} className="px-2 py-0.5 text-[10px] rounded bg-secondary text-muted-foreground">{s}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">Voir la fiche</span>
                  <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">→</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
