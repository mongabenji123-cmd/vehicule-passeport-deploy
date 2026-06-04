import { Car, Wrench, Store } from 'lucide-react';

interface RoleCardProps {
  role: 'owner' | 'garage' | 'seller';
  selected: boolean;
  onSelect: () => void;
}

const config = {
  owner: {
    icon: Car,
    title: 'Propriétaire',
    desc: 'Gérez vos véhicules et leur historique',
    emoji: '🚗',
  },
  garage: {
    icon: Wrench,
    title: 'Un Garage',
    desc: 'Gérez vos interventions clients',
    emoji: '🔧',
  },
  seller: {
    icon: Store,
    title: 'Vendeur',
    desc: 'Vendez vos pièces de rechange',
    emoji: '🏪',
  },
};

export function RoleCard({ role, selected, onSelect }: RoleCardProps) {
  const c = config[role];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        cursor-pointer rounded-xl border-2 p-5 transition-all duration-200 text-left w-full
        active:scale-[0.97]
        ${selected
          ? 'border-primary bg-primary/5 shadow-[0_0_0_1px_hsl(var(--primary)/0.2)]'
          : 'border-border bg-card hover:border-border/80 hover:bg-secondary'
        }
      `}
    >
      <div className="text-2xl mb-2">{c.emoji}</div>
      <p className="font-display text-sm font-bold uppercase tracking-wide text-foreground mb-0.5">
        Je suis {c.title}
      </p>
      <p className="text-xs text-muted-foreground leading-snug">{c.desc}</p>
    </button>
  );
}
