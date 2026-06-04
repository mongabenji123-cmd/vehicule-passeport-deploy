import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, ShieldCheck, Package, ShoppingCart, ClipboardList } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useMarketplaceParts } from '@/hooks/useSeller';

const CATEGORIES = ['Engine', 'Brakes', 'Suspension', 'Body', 'Electrical'];
const CONDITIONS = [
  { value: 'new', label: 'Neuf' },
  { value: 'used', label: 'Usagé' },
  { value: 'venant', label: 'Venant' },
];
const COMMUNES = [
  'Bandalungwa', 'Barumbu', 'Bumbu', 'Gombe', 'Kalamu', 'Kasa-Vubu',
  'Kimbanseke', 'Kinshasa', 'Kintambo', 'Kisenso', 'Lemba', 'Limete',
  'Lingwala', 'Makala', 'Maluku', 'Masina', 'Matete', 'Mont-Ngafula',
  'Ndjili', 'Ngaba', 'Ngaliema', 'Ngiri-Ngiri', 'Nsele', 'Selembao',
];

const conditionLabels: Record<string, string> = { new: 'Neuf', used: 'Usagé', venant: 'Venant' };
const conditionColors: Record<string, string> = {
  new: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  used: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  venant: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
};

export default function MarketplaceBrowse() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [condition, setCondition] = useState<string>('all');
  const [commune, setCommune] = useState<string>('all');

  const { data: parts = [], isLoading } = useMarketplaceParts({
    search: search || undefined,
    category: category !== 'all' ? category : undefined,
    condition: condition !== 'all' ? condition : undefined,
    commune: commune !== 'all' ? commune : undefined,
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-display font-bold text-foreground">
              Marketplace Pièces Auto
            </h1>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => navigate('/marketplace/orders')}>
              <ClipboardList className="h-4 w-4" />
              Commandes
            </Button>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une pièce..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-8 text-xs min-w-[110px]">
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger className="h-8 text-xs min-w-[90px]">
                <SelectValue placeholder="État" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {CONDITIONS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={commune} onValueChange={setCommune}>
              <SelectTrigger className="h-8 text-xs min-w-[110px]">
                <MapPin className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Commune" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {COMMUNES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
          </div>
        ) : parts.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Aucune pièce trouvée</p>
          </div>
        ) : (
          <div className="space-y-3">
            {parts.map((p: any, i: number) => (
              <Card key={p.id} className={`border-0 shadow-sm animate-fade-up stagger-${Math.min(i + 1, 5)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm">{p.part_name}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {p.category && <Badge variant="secondary" className="text-[10px] h-5">{p.category}</Badge>}
                        {p.condition && (
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${conditionColors[p.condition] ?? ''}`}>
                            {conditionLabels[p.condition] ?? p.condition}
                          </span>
                        )}
                      </div>
                      {p.compatibility_tags && (
                        <p className="text-[10px] text-muted-foreground mt-1">🚗 {p.compatibility_tags}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-bold font-mono text-foreground">
                        {p.price ?? 0} <span className="text-xs text-muted-foreground">{p.currency ?? 'USD'}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground">Stock: {p.stock_quantity ?? 0}</p>
                    </div>
                  </div>

                  {/* Seller info */}
                   {p.marketplace_sellers_public && (
                    <div className="mt-3 pt-3 border-t flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                         <span>{p.marketplace_sellers_public.store_name}</span>
                         {p.marketplace_sellers_public.commune && <span>· {p.marketplace_sellers_public.commune}</span>}
                          {p.marketplace_sellers_public.is_verified && <ShieldCheck className="h-3 w-3 text-success ml-1" />}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
                           onClick={() => navigate('/marketplace/checkout', { state: { part: p, seller: p.marketplace_sellers_public } })}
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          Commander
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
