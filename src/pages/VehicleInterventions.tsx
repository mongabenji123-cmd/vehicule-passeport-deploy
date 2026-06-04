import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { InterventionTimeline } from '@/components/vehicles/InterventionTimeline';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, FilterX, Wrench } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Intervention = Tables<'interventions'> & {
  garages?: { id: string; nom_garage: string; commune: string | null } | null;
};

const INTERVENTION_TYPES = [
  'Vidange', 'Freins', 'Pneus', 'Contrôle technique', 'Climatisation', 'Carrosserie', 'Courroie distribution',
];

export default function VehicleInterventionsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const { data: vehicle, isLoading: loadingVehicle } = useQuery({
    queryKey: ['vehicule-basic', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicules')
        .select('id, marque, modele, plaque_immatriculation')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  const { data: interventions, isLoading: loadingInterventions } = useQuery({
    queryKey: ['vehicule-interventions-full', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interventions')
        .select('*, garages:garage_id(id, nom_garage, commune)')
        .eq('vehicule_id', id!)
        .order('date_intervention', { ascending: false });
      if (error) throw error;
      return data as Intervention[];
    },
    enabled: !!id && !!user,
  });

  const filtered = useMemo(() => {
    return (interventions ?? []).filter(i => {
      const matchType = selectedType === 'all' || i.type_service === selectedType;
      const matchSearch = !search ||
        i.type_service.toLowerCase().includes(search.toLowerCase()) ||
        (i.description_travaux ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (i.garages?.nom_garage ?? '').toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [interventions, selectedType, search]);

  const hasFilters = search || selectedType !== 'all';
  const isLoading = loadingVehicle || loadingInterventions;

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Véhicule introuvable</p>
        <Link to="/dashboard/vehicles" className="text-primary text-sm hover:underline mt-2 inline-block">Retour aux véhicules</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-3xl">
      <Link to={`/dashboard/vehicles/${id}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        Retour au passeport
      </Link>

      <div className="mb-6">
        <h1 className="font-display text-xl font-bold uppercase tracking-wide text-foreground">Historique complet</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {vehicle.marque} {vehicle.modele} — <span className="text-mono">{vehicle.plaque_immatriculation}</span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full sm:w-56">
            <Wrench className="w-4 h-4 mr-2 text-muted-foreground flex-shrink-0" />
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {INTERVENTION_TYPES.map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        {hasFilters && (
          <button onClick={() => { setSearch(''); setSelectedType('all'); }} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs border border-border rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground active:scale-[0.97] flex-shrink-0">
            <FilterX className="w-3.5 h-3.5" />
            Réinitialiser
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        {filtered.length} intervention{filtered.length > 1 ? 's' : ''}
        {selectedType !== 'all' ? ` de type « ${selectedType} »` : ''}
      </p>

      <InterventionTimeline interventions={filtered} />
    </div>
  );
}
