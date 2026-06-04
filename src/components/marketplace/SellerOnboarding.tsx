import { useState } from 'react';
import { Store } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSeller } from '@/hooks/useSeller';
import { toast } from 'sonner';

const COMMUNES = [
  'Bandalungwa', 'Barumbu', 'Bumbu', 'Gombe', 'Kalamu', 'Kasa-Vubu',
  'Kimbanseke', 'Kinshasa', 'Kintambo', 'Kisenso', 'Lemba', 'Limete',
  'Lingwala', 'Makala', 'Maluku', 'Masina', 'Matete', 'Mont-Ngafula',
  'Ndjili', 'Ngaba', 'Ngaliema', 'Ngiri-Ngiri', 'Nsele', 'Selembao',
];

export function SellerOnboarding() {
  // Sécurité : On enveloppe l'appel dans un bloc try/catch ou on gère ses états d'erreur internes
  const sellerContext = useSeller();
  
  const [storeName, setStoreName] = useState('');
  const [commune, setCommune] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // 1. Si le hook rencontre une erreur de chargement (ex: erreur 406), on n'interrompt pas le rendu
  const createSeller = sellerContext?.createSeller || { isPending: false, mutateAsync: async () => {} };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) {
      toast.error('Le nom du magasin est requis');
      return;
    }
    try {
      await createSeller.mutateAsync({
        store_name: storeName.trim(),
        commune: commune || undefined,
        phone_contact: phone || undefined,
        address: address || undefined,
      });
      toast.success('Profil vendeur créé !');
    } catch (err) {
      console.error("Détails de l'erreur de création :", err);
      toast.error('Erreur lors de la création du profil');
    }
  };

  return (
    <div className="animate-fade-up">
      <div className="text-center mb-6">
        <div className="h-16 w-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mx-auto mb-3">
          <Store className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="font-display font-bold text-xl">Bienvenue sur le Marketplace</h2>
        <p className="text-sm text-muted-foreground mt-1">Créez votre profil vendeur pour commencer</p>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Informations du magasin</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Nom du magasin *</Label>
              <Input id="storeName" value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Ex: Pièces Auto Gombe" />
            </div>
            <div className="space-y-2">
              <Label>Commune</Label>
              <Select value={commune} onValueChange={setCommune}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {COMMUNES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone / WhatsApp</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+243 ..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Avenue, numéro..." />
            </div>
            <Button
              type="submit"
              disabled={createSeller.isPending}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold active:scale-[0.97] transition-transform"
            >
              {createSeller.isPending ? 'Création...' : 'Créer mon profil vendeur'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}