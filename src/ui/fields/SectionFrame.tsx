import type { ReactNode } from 'react';

/** Même gabarit que les encadrements « Indicateurs … ». */
export const FRAME = 'space-y-2 bg-neutral-900/60 p-2.5 border border-neutral-800';
export const SELECT =
  'w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-gold font-medium';
export const FRAME_TITLE = 'text-xs font-bold text-gold uppercase tracking-wider';
export const FRAME_HINT = 'text-[10px] text-neutral-500 font-medium';
/** Alias lisible : titre de section. */
export const SECTION_TITLE = FRAME_TITLE;

interface SectionFrameProps {
  title: string;
  hint?: string;
  children: ReactNode;
}

export default function SectionFrame({ title, hint, children }: SectionFrameProps) {
  return (
    <div className={FRAME}>
      <h3 className={FRAME_TITLE}>{title}</h3>
      {children}
      {hint ? <p className={FRAME_HINT}>{hint}</p> : null}
    </div>
  );
}
