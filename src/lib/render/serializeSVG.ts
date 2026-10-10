import type { Primitive } from './types';

/** Échappe les caractères XML des contenus et attributs utilisateur. */
export const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/** Attribut SVG optionnel (camelCase → kebab-case géré par le nom fourni). */
const attr = (name: string, value: string | number | undefined): string =>
  value === undefined ? '' : ` ${name}="${escapeXml(String(value))}"`;

type Line = Extract<Primitive, { kind: 'line' }>;
type Text = Extract<Primitive, { kind: 'text' }>;
type Circle = Extract<Primitive, { kind: 'circle' }>;
type Rect = Extract<Primitive, { kind: 'rect' }>;

const serializeLine = (p: Line): string =>
  `<line${attr('x1', p.x1)}${attr('y1', p.y1)}${attr('x2', p.x2)}${attr('y2', p.y2)}${attr('stroke', p.stroke)}${attr('stroke-width', p.strokeWidth)}${attr('opacity', p.opacity)}${attr('stroke-dasharray', p.strokeDasharray)}/>`;

const serializeText = (p: Text): string =>
  `<text${attr('x', p.x)}${attr('y', p.y)}${attr('fill', p.fill)}${attr('font-size', p.fontSize)}${attr('font-weight', p.fontWeight)}${attr('font-family', p.fontFamily)}${attr('text-anchor', p.textAnchor)}${attr('dominant-baseline', p.dominantBaseline)}>${escapeXml(p.text)}</text>`;

const serializeCircle = (p: Circle): string =>
  `<circle${attr('cx', p.cx)}${attr('cy', p.cy)}${attr('r', p.r)}${attr('fill', p.fill)}${attr('stroke', p.stroke)}${attr('stroke-width', p.strokeWidth)}/>`;

const serializeRect = (p: Rect): string =>
  `<rect${attr('x', p.x)}${attr('y', p.y)}${attr('width', p.width)}${attr('height', p.height)}${attr('fill', p.fill)}${attr('stroke', p.stroke)}${attr('stroke-width', p.strokeWidth)}${attr('rx', p.rx)}/>`;

const serializePrimitive = (p: Primitive): string => {
  switch (p.kind) {
    case 'line':
      return serializeLine(p);
    case 'text':
      return serializeText(p);
    case 'circle':
      return serializeCircle(p);
    case 'rect':
      return serializeRect(p);
    case 'group':
      // À plat : identique au rendu écran (un <g> sans transform ne change rien).
      return p.children.map(serializePrimitive).join('');
  }
};

/**
 * Sérialise les primitives en une chaîne SVG autonome.
 * Même enveloppe que l'export historique : xmlns, width/height, viewBox, fond.
 */
export const serializeSVG = (
  primitives: Primitive[],
  size: { width: number; height: number },
  bg: string,
): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}" viewBox="0 0 ${size.width} ${size.height}">
      <rect width="100%" height="100%" fill="${escapeXml(bg)}"/>
      ${primitives.map(serializePrimitive).join('\n      ')}
    </svg>`;
