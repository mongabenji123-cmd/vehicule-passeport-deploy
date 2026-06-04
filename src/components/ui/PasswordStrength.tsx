interface PasswordStrengthProps {
  password: string;
}

function getScore(pw: string): number {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const labels = ['', 'Faible', 'Moyen', 'Bon', 'Fort'];
const colors = ['', 'bg-destructive', 'bg-accent', 'bg-accent', 'bg-success'];

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;
  const score = getScore(password);

  return (
    <div className="space-y-1.5 mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
              i <= score ? colors[score] : 'bg-border'
            }`}
          />
        ))}
      </div>
      <p className={`text-[10px] font-display uppercase tracking-wider ${
        score <= 1 ? 'text-destructive' : score <= 2 ? 'text-accent' : 'text-success'
      }`}>
        {labels[score]}
      </p>
    </div>
  );
}
