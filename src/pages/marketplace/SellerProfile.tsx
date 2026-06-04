import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSeller } from '@/hooks/useSeller';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Store, Save, ShieldCheck } from 'lucide-react';

const COMMUNES = [
  'Bandalungwa', 'Barumbu', 'Bumbu', 'Gombe', 'Kalamu', 'Kasa-Vubu',
  'Kimbanseke', 'Kinshasa', 'Kintambo', 'Kisenso', 'Lemba', 'Limete',
  'Lingwala', 'Makala', 'Maluku', 'Masina', 'Matete', 'Mont-Ngafula',
  'Ndjili', 'Ngaba', 'Ngaliema', 'Ngiri-Ngiri', 'Nsele', 'Selembao',
];

export default function SellerProfile() {
  const { seller, isLoading } = useSeller();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{
    store_name: string;
    commune: string;
    phone_contact: string;
    address: string;
  } | null>(null);

  if (isLoading) return <Skeleton className="h-60 w-full" />;
  if (!seller) return <p className="text-center text-muted-foreground py-10">Pas de profil vendeur.</p>;

  const current = form ?? {
    store_name: seller.store_name,
    commune: seller.commune ?? '',
    phone_contact: seller.phone_contact ?? '',
    address: seller.address ?? '',
  };

  const update = (key: string, value: string) => {
    setForm({ ...current, [key]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('sellers')
        .update({
          store_name: form.store_name,
          commune: form.commune || null,
          phone_contact: form.phone_contact || null,
          address: form.address || null,
        })
        .eq('id', seller.id);
      if (error) throw error;
      toast.success('Profil mis à jour');
      setForm(null);
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
          <Store className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h2 className="font-display font-bold text-lg">Mon Profil</h2>
          <div className="flex items-center gap-2 mt-0.5">
            {seller.is_verified && (
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 text-[10px] gap-1">
                <ShieldCheck className="h-3 w-3" /> Vérifié
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="pt-5">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Nom du magasin</Label>
              <Input value={current.store_name} onChange={(e) => update('store_name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Commune</Label>
              <Select value={current.commune} onValueChange={(v) => update('commune', v)}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {COMMUNES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Téléphone / WhatsApp</Label>
              <Input value={current.phone_contact} onChange={(e) => update('phone_contact', e.target.value)} placeholder="+243 ..." />
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input value={current.address} onChange={(e) => update('address', e.target.value)} />
            </div>
            <Button
              type="submit"
              disabled={saving || !form}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold active:scale-[0.97] transition-transform"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Sauvegarde...' : 'Enregistrer'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
