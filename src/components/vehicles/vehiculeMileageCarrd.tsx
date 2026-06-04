import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function VehicleMileageCard({ vehicle, lastMileage, onSave }: any) {
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
    <Card className="border border-border rounded-lg p-5 bg-card mt-4">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Mise à jour kilométrage
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-4">
        <div className="text-2xl font-bold">
          {lastMileage ? `${lastMileage.toLocaleString('fr-FR')} km` : "Non défini"}
        </div>
        
        {isAdding ? (
          <div className="flex gap-2">
            <Input 
              type="number" 
              placeholder="Nouveau km" 
              value={newMileage}
              onChange={(e) => setNewMileage(e.target.value)}
              className="rounded-md"
            />
            <Button onClick={handleConfirm} size="sm">Valider</Button>
            <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Annuler</Button>
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