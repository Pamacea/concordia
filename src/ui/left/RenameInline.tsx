interface RenameInlineProps {
  value: string;
  onValueChange: (value: string) => void;
  /** Valide le renommage (Enter ou perte du focus). */
  onCommit: () => void;
}

/** Input de renommage inline d'un groupe (Enter ou blur pour valider). */
export default function RenameInline({ value, onValueChange, onCommit }: RenameInlineProps) {
  return (
    <input
      type="text"
      autoFocus
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      onBlur={onCommit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onCommit();
      }}
      onClick={(e) => e.stopPropagation()}
      className="bg-neutral-800 text-white text-xs px-3 py-1.5 border border-neutral-700 w-full rounded-none"
    />
  );
}
