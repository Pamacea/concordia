import { motion } from 'motion/react';
import { fadeUp, viewportOnce } from './variants';

/** Mini-grille de frettes dorée (bloc « Grille cliquable »). */
const GridVisual = (
  <svg viewBox="0 0 260 170" className="w-full h-auto" aria-hidden="true">
    <rect x="30" y="18" width="196" height="7" fill="#e3c38a" />
    {[0, 1, 2, 3, 4].map((i) => (
      <line
        key={`f${i}`}
        x1="30"
        y1={44 + i * 26}
        x2="226"
        y2={44 + i * 26}
        stroke="#a3a3a3"
        strokeWidth="2"
        opacity="0.55"
      />
    ))}
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <line
        key={`s${i}`}
        x1={30 + i * 39.2}
        y1="18"
        x2={30 + i * 39.2}
        y2="148"
        stroke="#ffffff"
        strokeWidth="1.6"
        opacity="0.75"
      />
    ))}
    <circle cx="108.4" cy="57" r="10" fill="#cfa86a" />
    <circle cx="186.8" cy="83" r="10" fill="#ef4444" />
    <circle cx="147.6" cy="109" r="10" fill="#cfa86a" />
    <circle
      cx="69.2"
      cy="83"
      r="13"
      fill="none"
      stroke="#cfa86a"
      strokeWidth="2"
      strokeDasharray="4 4"
    />
  </svg>
);

/** Notes ○/× et indicateurs au-dessus du sillet (bloc « Un accordage… »). */
const TuningVisual = (
  <svg viewBox="0 0 260 140" className="w-full h-auto" aria-hidden="true">
    {['E', 'A', 'D', 'G', 'B', 'e'].map((n, i) => (
      <text
        key={n}
        x={44 + i * 34.4}
        y="34"
        fill="#cfa86a"
        fontSize="15"
        fontWeight="bold"
        fontFamily="sans-serif"
        textAnchor="middle"
      >
        {n}
      </text>
    ))}
    <rect x="30" y="52" width="204" height="6" fill="#ffffff" />
    {['○', '×', '○', '2', '○', '×'].map((g, i) => (
      <text
        key={i}
        x={44 + i * 34.4}
        y="100"
        fill={g === '×' ? '#ef4444' : '#cfa86a'}
        fontSize="24"
        fontWeight="bold"
        fontFamily="sans-serif"
        textAnchor="middle"
      >
        {g}
      </text>
    ))}
  </svg>
);

/** Badges de format (bloc « Export en un clic »). */
const ExportVisual = (
  <div className="flex flex-wrap items-center justify-center gap-3">
    {['SVG', 'PNG', 'PDF'].map((fmt) => (
      <span
        key={fmt}
        className="font-cyber font-black text-lg md:text-xl text-gold border border-gold/40 bg-neutral-950/60 px-5 py-3"
      >
        {fmt}
      </span>
    ))}
  </div>
);

const BLOCKS = [
  {
    n: '01',
    tag: 'Édition',
    title: 'Grille cliquable',
    body: "Posez une note d'un clic, déplacez-la, effacez-la : la grille de frettes suit votre style en direct. Cordes, cases et pastilles se règlent au pointeur, sans dialogue.",
    visual: GridVisual,
  },
  {
    n: '02',
    tag: 'Théorie',
    title: 'Un accordage par diagramme',
    body: "Standard, Drop D, Dad GAD, ouvertures… 12 accordages pré-réglés, avec les notes affichées au-dessus du sillet et les indicateurs de notes, doigtés ou d'intervalles.",
    visual: TuningVisual,
  },
  {
    n: '03',
    tag: 'Export',
    title: 'Export en un clic',
    body: 'SVG vectoriel, PNG haute résolution, PDF imprimable ou JSON réimportable : vos diagrammes sortent en un clic, sans compte et sans serveur.',
    visual: ExportVisual,
  },
] as const;

/** Section « Fonctionnalités » : trois blocs texte/visuel alternés. */
export default function Features() {
  return (
    <section
      id="fonctionnalites"
      className="scroll-mt-20 border-b border-neutral-800 py-20 md:py-28"
    >
      <div className="mx-auto px-6 flex flex-col gap-16 md:gap-24" style={{ maxWidth: '64rem' }}>
        <motion.header
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="text-center"
        >
          <p className="text-gold uppercase tracking-wider text-xs">Fonctionnalités</p>
          <h2 className="mt-3 font-cyber text-2xl md:text-4xl font-black text-white">
            Tout pour dessiner, rien pour troubler
          </h2>
        </motion.header>

        {BLOCKS.map((b, i) => (
          <motion.article
            key={b.title}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className={`flex flex-col md:flex-row items-center gap-8 md:gap-14 ${
              i % 2 === 1 ? 'md:flex-row-reverse' : ''
            }`}
          >
            <div className="flex-1">
              <p className="text-gold uppercase tracking-wider text-xs">
                {b.n} · {b.tag}
              </p>
              <h3 className="mt-3 text-2xl md:text-3xl font-semibold text-white">{b.title}</h3>
              <p className="mt-4 text-neutral-400 leading-relaxed">{b.body}</p>
            </div>
            <div className="flex-1 w-full bg-neutral-900/40 border border-neutral-800 backdrop-blur p-6 md:p-8">
              {b.visual}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
