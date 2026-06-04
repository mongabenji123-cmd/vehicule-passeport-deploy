import { cn } from '@/lib/utils';
import type { HealthScore } from '@/lib/utils/health';

interface HealthBadgeProps {
  score: HealthScore;
  showDot?: boolean;
}

const statusStyles: Record<string, { bg: string; text: string }> = {
  bon:       { bg: 'bg-success/10 border-success/20', text: 'text-success' },
  attention: { bg: 'bg-accent/10 border-accent/20',   text: 'text-accent' },
  urgent:    { bg: 'bg-destructive/10 border-destructive/20', text: 'text-destructive' },
};

export function HealthBadge({ score, showDot = true }: HealthBadgeProps) {
  const style = statusStyles[score.status] ?? statusStyles.bon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-display uppercase tracking-wider border',
        style.bg,
        style.text
      )}
    >
      {showDot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', {
          'bg-success': score.status === 'bon',
          'bg-accent': score.status === 'attention',
          'bg-destructive': score.status === 'urgent',
        })} />
      )}
      {score.label}
    </span>
  );
}
