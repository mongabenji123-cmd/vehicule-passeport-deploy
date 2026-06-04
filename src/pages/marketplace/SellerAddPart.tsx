import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSeller, useSpareParts } from '@/hooks/useSeller';
import { toast } from 'sonner';
import { PlusCircle } from 'lucide-react';

const CATEGORIES = ['Engine', 'Brakes', 'Suspension', 'Body', 'Electrical'];
const CONDITIONS = [
  { value: 'new', label: 'Neuf' },
  { value: 'used', label: 'Usagé' },
  { value: 'venant', label: 'Venant' },
];

export default function SellerAddPart() {
  const { seller } = useSeller();
  const { addPart } = useSpareParts(seller?.id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    part_name: '',
    category: '',
    price: '',
    condition: 'new',
    compatibility_tags: '',
    stock_quantity: '1',
  });

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.part_name.trim()) {
      toast.error('Le nom de la pièce est requis');
      return;
    }
    if (!seller) {
      toast.error('Créez d\'abord votre profil vendeur');
      return;
    }
    try {
      await addPart.mutateAsync({
        part_name: form.part_name.trim(),
        category: form.category || undefined,
        price: form.price ? parseFloat(form.price) : undefined,
        currency: 'USD',
        condition: form.condition || undefined,
        compatibility_tags: form.compatibility_tags || undefined,
        stock_quantity: parseInt(form.stock_quantity) || 1,
      });
      toast.success('Pièce ajoutée avec succès !');
      navigate('/marketplace/inventory');
    } catch {
      toast.error('Erreur lors de l\'ajout');
    }
  };

  if (!seller) {
    return <p className="text-center text-muted-foreground py-10">Créez d'abord votre profil vendeur.</p>;
  }

  return (
    <div className="animate-fade-up">
      <h2 className="font-display font-bold text-lg mb-4">Ajouter une pièce</h2>

      <Card className="border-0 shadow-md">
        <CardContent className="pt-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nom de la pièce *</Label>
              <Input value={form.part_name} onChange={(e) => update('part_name', e.target.value)} placeholder="Ex: Filtre à huile" />
            </div>

            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={form.category} onValueChange={(v) => update('category', v)}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Prix (USD)</Label>
                <Input type="number" min="0" step="0.01" value={form.price} onChange={(e) => update('price', e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label>Quantité</Label>
                <Input type="number" min="1" value={form.stock_quantity} onChange={(e) => update('stock_quantity', e.target.value)} placeholder="1" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>État</Label>
              <Select value={form.condition} onValueChange={(v) => update('condition', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Compatibilité véhicules</Label>
              <Input value={form.compatibility_tags} onChange={(e) => update('compatibility_tags', e.target.value)} placeholder="Ex: Toyota IST, RAV4, Corolla" />
              <p className="text-[10px] text-muted-foreground">Séparez par des virgules</p>
            </div>

            <Button
              type="submit"
              disabled={addPart.isPending}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold active:scale-[0.97] transition-transform"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              {addPart.isPending ? 'Ajout en cours...' : 'Ajouter la pièce'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
