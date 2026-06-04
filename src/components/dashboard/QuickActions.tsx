import { PlusCircle, ShoppingCart, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const actions = [
  {
    label: 'Entretien',
    icon: PlusCircle,
    color: 'text-primary',
    bgGlow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]',
    path: '/dashboard/interventions/new',
  },
  {
    label: 'Pièces',
    icon: ShoppingCart,
    color: 'text-success',
    bgGlow: 'hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]',
    path: '/marketplace',
  },
  {
    label: 'Garages',
    icon: MapPin,
    color: 'text-accent',
    bgGlow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]',
    path: '/dashboard/garages',
  },
];

interface Props {
  vehicleId?: string;
}

export function QuickActions({ vehicleId }: Props) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-3 gap-3">
      {actions.map((a, i) => (
        <button
          key={a.label}
          onClick={() => {
            const path = a.path.includes('interventions') && vehicleId
              ? `${a.path}?vehicleId=${vehicleId}`
              : a.path;
            navigate(path);
          }}
          className={cn(
            'flex flex-col items-center gap-2 p-4 rounded-2xl border border-white/5',
            'bg-white/5 backdrop-blur-sm',
            'hover:scale-[1.03] active:scale-[0.97] transition-all duration-200',
            a.bgGlow,
            'animate-fade-up',
            `stagger-${i + 1}`
          )}
        >
          <a.icon className={cn('w-6 h-6', a.color)} />
          <span className="font-display text-xs font-semibold uppercase tracking-wider text-foreground truncate w-full text-center">
            {a.label}
          </span>
        </button>
      ))}
    </div>
  );
}
