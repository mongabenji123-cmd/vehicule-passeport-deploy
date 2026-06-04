import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Vehicule } from '@/hooks/useOwnerVehicles';

interface Props {
  vehicle: Vehicule;
  lastMileage?: number;
  onSave: (mileage: number) => Promise<void>;
}

export function VehicleMileageCard({ vehicle, lastMileage, onSave }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [newMileage, setNewMileage] = useState('');

  const handleConfirm = async () => {
    const val = parseInt(newMileage);
    if (!val) return;
    await onSave(val);
    setIsAdding(false);
    setNewMileage('');
  };

  return (
    <Card className="bg-card border-white/10 rounded-2xl mt-4">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Kilométrage actuel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-3xl font-bold">
          {lastMileage ? `${lastMileage.toLocaleString()} km` : "Non défini"}
        </div>
        
        {isAdding ? (
          <div className="flex gap-2">
            <Input 
              type="number" 
              placeholder="Nouveau km" 
              value={newMileage}
              onChange={(e) => setNewMileage(e.target.value)}
            />
            <Button onClick={handleConfirm} size="sm">Valider</Button>
          </div>
        ) : (
          <Button variant="outline" className="w-full" onClick={() => setIsAdding(true)}>
            Ajouter un relevé
          </Button>
        )}
      </CardContent>
    </Card>
  );
}