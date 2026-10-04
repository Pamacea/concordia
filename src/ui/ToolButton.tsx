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
      className={`p-2.5 text-xs font-medium transition-all flex items-center gap-1.5 justify-center ${
        isActive
          ? 'bg-gold text-neutral-950 shadow-lg scale-105'
          : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
      }`}
    >
      {icon}
      <span className="text-[10px] px-1.5 py-0.5 bg-black/30 text-neutral-300 font-mono font-semibold uppercase">
        {shortcutKey}
      </span>
    </button>
  );
}
