import React from 'react';
import { Check, X, ShieldAlert, ShieldCheck } from 'lucide-react';
import { PasswordStrength } from '../../types';

interface PasswordStrengthMeterProps {
  password: string;
  onStrengthChange?: (strength: PasswordStrength) => void;
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);

  let score = 0;
  if (hasMinLength) score++;
  if (hasNumber) score++;
  if (hasSymbol) score++;
  if (hasMixedCase) score++;
  if (password.length >= 12 && score === 4) {
    score = 4; // Very strong
  }

  const labels: PasswordStrength['label'][] = ['Débil', 'Regular', 'Buena', 'Fuerte', 'Muy Fuerte'];
  const label = password.length === 0 ? 'Débil' : labels[score];

  return {
    score,
    label,
    hasMinLength,
    hasNumber,
    hasSymbol,
    hasMixedCase,
  };
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  onStrengthChange,
}) => {
  const strength = calculatePasswordStrength(password);

  React.useEffect(() => {
    onStrengthChange?.(strength);
  }, [password]);

  if (!password) return null;

  const getScoreColor = () => {
    switch (strength.score) {
      case 0:
      case 1:
        return 'bg-rose-500 text-rose-600 dark:text-rose-400';
      case 2:
        return 'bg-amber-500 text-amber-600 dark:text-amber-400';
      case 3:
        return 'bg-emerald-500 text-emerald-600 dark:text-emerald-400';
      case 4:
        return 'bg-emerald-600 text-emerald-700 dark:text-emerald-400';
      default:
        return 'bg-slate-300 text-slate-500';
    }
  };

  return (
    <div className="space-y-2 mt-2 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5">
          {strength.score >= 3 ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          )}
          Nivel de seguridad:
        </span>
        <span className={`font-bold ${getScoreColor().split(' ')[1]}`}>
          {strength.label}
        </span>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-full rounded-full transition-all duration-300 ${
              step <= strength.score ? getScoreColor().split(' ')[0] : 'bg-slate-200 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>

      {/* Checklist items */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1 text-[11px]">
        <div className={`flex items-center gap-1.5 ${strength.hasMinLength ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
          {strength.hasMinLength ? <Check className="w-3 h-3 text-emerald-600 shrink-0" /> : <X className="w-3 h-3 text-slate-400 shrink-0" />}
          <span>Mínimo 8-12 caracteres</span>
        </div>
        <div className={`flex items-center gap-1.5 ${strength.hasMixedCase ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
          {strength.hasMixedCase ? <Check className="w-3 h-3 text-emerald-600 shrink-0" /> : <X className="w-3 h-3 text-slate-400 shrink-0" />}
          <span>Mayúsculas y minúsculas</span>
        </div>
        <div className={`flex items-center gap-1.5 ${strength.hasNumber ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
          {strength.hasNumber ? <Check className="w-3 h-3 text-emerald-600 shrink-0" /> : <X className="w-3 h-3 text-slate-400 shrink-0" />}
          <span>Al menos un número (0-9)</span>
        </div>
        <div className={`flex items-center gap-1.5 ${strength.hasSymbol ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
          {strength.hasSymbol ? <Check className="w-3 h-3 text-emerald-600 shrink-0" /> : <X className="w-3 h-3 text-slate-400 shrink-0" />}
          <span>Símbolo o carácter especial</span>
        </div>
      </div>
    </div>
  );
};
