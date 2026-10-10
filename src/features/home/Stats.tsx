import { animate, motion, useInView } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { fadeUp, viewportOnce } from './variants';

const STATS = [
  { value: 12, label: 'accordages', suffix: '' },
  { value: 4, label: "formats d'export", suffix: '' },
  { value: 100, label: 'local', suffix: ' %' },
] as const;

/** Bande de preuve sociale : trois compteurs 0 → cible à l'entrée en vue. */
export default function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [values, setValues] = useState<number[]>([0, 0, 0]);

  useEffect(() => {
    if (!inView) return;
    const controls = STATS.map((s, i) =>
      animate(0, s.value, {
        duration: 1.6,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: (latest: number) =>
          setValues((prev) => {
            const next = [...prev];
            next[i] = Math.round(latest);
            return next;
          }),
      }),
    );
    return () => controls.forEach((c) => c.stop());
  }, [inView]);

  return (
    <section className="border-b border-neutral-800 py-12 md:py-14">
      <motion.div
        ref={ref}
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="mx-auto px-6 grid grid-cols-3 gap-4 md:gap-8 text-center"
        style={{ maxWidth: '72rem' }}
      >
        {STATS.map((s, i) => (
          <div key={s.label}>
            <p className="font-cyber font-black text-3xl md:text-5xl text-gold tabular-nums">
              {values[i]}
              {s.suffix}
            </p>
            <p className="mt-2 text-xs uppercase tracking-widest text-neutral-500">{s.label}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
