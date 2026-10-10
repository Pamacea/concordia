import { motion } from 'motion/react';
import type { ReactNode } from 'react';

interface ToolButtonProps {
  icon: ReactNode;
  label: string;
  shortcutKey: string;
  isActive: boolean;
  onClick: () => void;
}

export default function ToolButton({
  icon,
  label,
  shortcutKey,
  isActive,
  onClick,
}: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      title={`${label} (${shortcutKey})`}
      className={`relative p-2.5 text-xs font-medium transition-all flex items-center gap-1.5 justify-center ${
        isActive
          ? 'bg-gold text-neutral-950 shadow-lg scale-105'
          : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
      }`}
    >
      {icon}
      <span className="text-[10px] px-1.5 py-0.5 bg-black/30 text-neutral-300 font-mono font-semibold uppercase">
        {shortcutKey}
      </span>
      {/* Barre d'outil actif : glisse d'un bouton à l'autre via layoutId. */}
      {isActive && (
        <motion.span
          layoutId="tool-underline"
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          className="absolute left-1 right-1 -bottom-1 h-0.5 bg-[#cfa86a] rounded-full"
        />
      )}
    </button>
  );
}
