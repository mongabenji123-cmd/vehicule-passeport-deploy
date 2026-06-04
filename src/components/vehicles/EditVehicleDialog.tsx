import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { updateVehicle } from '@/lib/actions/vehicles';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

interface Vehicle {
  id: string;
  marque: string;
  modele: string;
  annee: number | null;
  couleur: string | null;
  plaque_immatriculation: string;
  kilometrage_actuel: number | null;
}

interface EditVehicleDialogProps {
  vehicle: Vehicle;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditVehicleDialog({ vehicle, open, onOpenChange }: EditVehicleDialogProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    marque: vehicle.marque,
    modele: vehicle.modele,
    annee: vehicle.annee?.toString() ?? '',
    couleur: vehicle.couleur ?? '',
    plaque_immatriculation: vehicle.plaque_immatriculation,
    kilometrage_actuel: vehicle.kilometrage_actuel?.toString() ?? '',
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateVehicle(vehicle.id, user.id, {
        marque: form.marque,
        modele: form.modele,
        annee: form.annee ? parseInt(form.annee) : null,
        couleur: form.couleur || null,
        plaque_immatriculation: form.plaque_immatriculation,
        kilometrage_actuel: form.kilometrage_actuel ? parseInt(form.kilometrage_actuel) : null,
      });
      toast.success('Véhicule mis à jour');
      queryClient.invalidateQueries({ queryKey: ['vehicule', vehicle.id] });
      queryClient.invalidateQueries({ queryKey: ['vehicules'] });
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le véhicule</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="marque">Marque</Label>
              <Input id="marque" value={form.marque} onChange={e => handleChange('marque', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="modele">Modèle</Label>
              <Input id="modele" value={form.modele} onChange={e => handleChange('modele', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="annee">Année</Label>
              <Input id="annee" type="number" value={form.annee} onChange={e => handleChange('annee', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="couleur">Couleur</Label>
              <Input id="couleur" value={form.couleur} onChange={e => handleChange('couleur', e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="plaque">Plaque d'immatriculation</Label>
            <Input id="plaque" value={form.plaque_immatriculation} onChange={e => handleChange('plaque_immatriculation', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="km">Kilométrage actuel</Label>
            <Input id="km" type="number" value={form.kilometrage_actuel} onChange={e => handleChange('kilometrage_actuel', e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving || !form.marque || !form.modele || !form.plaque_immatriculation}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
