import { z } from 'zod';
import type { TuningId } from './types';

const PositionSchema = z.object({
  s: z.number(),
  f: z.number(),
});

const NoteSchema = PositionSchema.extend({
  id: z.string(),
});

const FreeTextSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  text: z.string(),
  fontFamily: z.string().optional(),
  fontSize: z.number().optional(),
  color: z.string().optional(),
  bold: z.boolean().optional(),
});

export const DiagramSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  name: z.string(),
  startFret: z.number(),
  fretCount: z.number().int().min(1).max(15).optional(),
  orientation: z.enum(['vertical', 'horizontal']).optional(),
  // Chaîne libre (et non enum) : un accordage inconnu ne doit pas invalider
  // tout le document au chargement — tuningOffsets() retombe sur Standard E.
  tuning: z
    .string()
    .optional()
    .transform((v) => v as TuningId | undefined),
  // `.catch` : une valeur héritée (ex. 'intervals', retiré de la liste)
  // retombe sur 'none' au chargement au lieu d'invalider tout le document.
  nutIndicator: z.enum(['notes', 'none']).optional().catch('none'),
  root: PositionSchema.nullable().default(null),
  notes: z.array(NoteSchema).default([]),
  fingerings: z.record(z.string(), z.string()).default({}),
  texts: z.array(FreeTextSchema).default([]),
});

export const GroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  diagramIds: z.array(z.string()),
});

export const ChordsFileSchema = z.object({
  version: z.string(),
  groups: z.array(GroupSchema),
  diagrams: z.record(z.string(), DiagramSchema),
});

export const StyleSettingsSchema = z.object({
  diagramBgColor: z.string(),
  nutThickness: z.number(),
  nutOpacity: z.number(),
  nutColor: z.string(),
  stringThicknessBase: z.number(),
  stringOpacity: z.number(),
  fretThickness: z.number(),
  fretOpacity: z.number(),
  showFretNumbers: z.boolean(),
  fretNumberSize: z.number(),
  fretNumberColor: z.string(),
  bottomIndicatorType: z.enum(['notes', 'fingerings', 'intervals', 'none']),
});

/** Contenu persisté de la session : document (groupes + diagrammes) + préférences. */
export const PersistedDocSchema = z.object({
  schemaVersion: z.literal(1),
  groups: z.array(GroupSchema),
  diagrams: z.record(z.string(), DiagramSchema),
  openGroups: z.record(z.string(), z.boolean()),
  activeDiagramId: z.string().nullable(),
});

export const PersistedSettingsSchema = z.object({
  schemaVersion: z.literal(1),
  style: StyleSettingsSchema,
});
