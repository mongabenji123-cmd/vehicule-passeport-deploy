import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Vehicule } from '@/hooks/useOwnerVehicles';

interface Props {
  vehicles: Vehicule[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function VehicleSelector({ vehicles, selectedId, onSelect }: Props) {
  if (vehicles.length === 0) return null;

  return (
    <Select value={selectedId ?? undefined} onValueChange={onSelect}>
      <SelectTrigger className="w-full sm:w-64 bg-card border-white/5 rounded-2xl font-display text-sm">
        <SelectValue placeholder="Sélectionner un véhicule" />
      </SelectTrigger>
      <SelectContent>
        {vehicles.map(v => (
          <SelectItem key={v.id} value={v.id}>
            {v.marque} {v.modele} — {v.plaque_immatriculation}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
