import type { ReactNode } from 'react';

interface RadioCardProps {
  name: string;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
}

/** Étiquette radio stylisée (groupe « Périmètre » de l'export). */
export default function RadioCard({ name, checked, onChange, children }: RadioCardProps) {
  return (
    <label className="flex items-center gap-2.5 text-sm text-neutral-200 cursor-pointer">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="text-gold focus:ring-gold h-4 w-4"
      />
      <span>{children}</span>
    </label>
  );
}
