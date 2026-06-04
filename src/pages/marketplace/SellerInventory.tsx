import { useState } from 'react';
import { Search, Filter, Trash2, Edit2, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useSeller, useSpareParts } from '@/hooks/useSeller';
import { toast } from 'sonner';

const CATEGORIES = ['Engine', 'Brakes', 'Suspension', 'Body', 'Electrical'];
const CONDITIONS = ['new', 'used', 'venant'];

const conditionLabels: Record<string, string> = { new: 'Neuf', used: 'Usagé', venant: 'Venant' };
const conditionColors: Record<string, string> = {
  new: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  used: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  venant: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
};

export default function SellerInventory() {
  const { seller, isLoading: sellerLoading } = useSeller();
  const { parts, isLoading, deletePart } = useSpareParts(seller?.id);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [conditionFilter, setConditionFilter] = useState<string>('all');

  if (sellerLoading || isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
      </div>
    );
  }

  if (!seller) {
    return <p className="text-center text-muted-foreground py-10">Créez d'abord votre profil vendeur.</p>;
  }

  const filtered = parts.filter((p) => {
    if (search && !p.part_name.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (conditionFilter !== 'all' && p.condition !== conditionFilter) return false;
    return true;
  });

  const handleDelete = async (id: number) => {
    try {
      await deletePart.mutateAsync(id);
      toast.success('Pièce supprimée');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <h2 className="font-display font-bold text-lg">Mon Stock</h2>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une pièce..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="flex-1 h-9 text-xs">
            <Filter className="h-3 w-3 mr-1" />
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={conditionFilter} onValueChange={setConditionFilter}>
          <SelectTrigger className="flex-1 h-9 text-xs">
            <SelectValue placeholder="État" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous états</SelectItem>
            {CONDITIONS.map((c) => <SelectItem key={c} value={c}>{conditionLabels[c]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Aucune pièce trouvée</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p, i) => (
            <Card key={p.id} className={`border-0 shadow-sm animate-fade-up stagger-${Math.min(i + 1, 5)}`}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{p.part_name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {p.category && (
                        <Badge variant="secondary" className="text-[10px] h-5">{p.category}</Badge>
                      )}
                      {p.condition && (
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${conditionColors[p.condition] ?? 'bg-muted text-muted-foreground'}`}>
                          {conditionLabels[p.condition] ?? p.condition}
                        </span>
                      )}
                    </div>
                    {p.compatibility_tags && (
                      <p className="text-[10px] text-muted-foreground mt-1 truncate">🚗 {p.compatibility_tags}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold font-mono">{p.price ?? 0} <span className="text-[10px] text-muted-foreground">{p.currency ?? 'USD'}</span></p>
                    <p className="text-[10px] text-muted-foreground">Qté: {p.stock_quantity ?? 0}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-2 justify-end">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive">
                        <Trash2 className="h-3 w-3 mr-1" /> Supprimer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette pièce ?</AlertDialogTitle>
                        <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(p.id)} className="bg-destructive text-destructive-foreground">
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
