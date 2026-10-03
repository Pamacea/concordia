import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  FolderPlus, 
  Trash2, 
  Type, 
  Circle, 
  Download, 
  Upload, 
  MousePointer2, 
  Eraser, 
  Folder, 
  FolderOpen, 
  CheckSquare, 
  Square, 
  Edit2, 
  X, 
  Music, 
  Palette, 
  GripVertical,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  AlertCircle,
  Check
} from 'lucide-react';

const generateId = () => Math.random().toString(36).substring(2, 9);

const STRING_OFFSETS = [0, 5, 10, 15, 19, 24]; // E2, A2, D3, G3, B3, E4
const NOTE_NAMES = ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#'];

// Base de données d'accords 100% fermés / transposables (sans cordes à vide)
const DEFAULT_GROUPS_DATA = [
  {
    name: 'Accords Majeurs & Triades (Cordes 6, 5, 4)',
    chords: [
      { name: 'G Majeur (Forme E - Corde 6)', startFret: 3, root: { s: 0, f: 0 }, notes: [{ s: 1, f: 2 }, { s: 2, f: 2 }, { s: 3, f: 1 }, { s: 4, f: 0 }, { s: 5, f: 0 }], fingerings: { 0: '1', 1: '3', 2: '4', 3: '2', 4: '1', 5: '1' } },
      { name: 'C Majeur (Forme A - Corde 5)', startFret: 3, root: { s: 1, f: 0 }, notes: [{ s: 2, f: 2 }, { s: 3, f: 2 }, { s: 4, f: 2 }, { s: 5, f: 0 }], fingerings: { 0: 'X', 1: '1', 2: '2', 3: '3', 4: '4', 5: '1' } },
      { name: 'Eb Majeur (Forme C - Corde 5)', startFret: 3, root: { s: 1, f: 3 }, notes: [{ s: 2, f: 2 }, { s: 3, f: 0 }, { s: 4, f: 1 }], fingerings: { 0: 'X', 1: '4', 2: '3', 3: '1', 4: '2', 5: 'X' } },
      { name: 'F Majeur (Forme D - Corde 4)', startFret: 3, root: { s: 2, f: 0 }, notes: [{ s: 3, f: 2 }, { s: 4, f: 3 }, { s: 5, f: 2 }], fingerings: { 0: 'X', 1: 'X', 2: '1', 3: '2', 4: '4', 5: '3' } },
      { name: 'A Majeur (Forme G - Corde 6)', startFret: 2, root: { s: 0, f: 3 }, notes: [{ s: 1, f: 2 }, { s: 2, f: 0 }, { s: 3, f: 0 }, { s: 5, f: 3 }], fingerings: { 0: '4', 1: '3', 2: '1', 3: '1', 4: 'X', 5: '4' } },
      { name: 'G Majeur (Drop 3 - Corde 6)', startFret: 3, root: { s: 0, f: 0 }, notes: [{ s: 2, f: 1 }, { s: 3, f: 1 }, { s: 4, f: 0 }], fingerings: { 0: '1', 1: 'X', 2: '3', 3: '4', 4: '2', 5: 'X' } }
    ]
  },
  {
    name: 'Accords Mineurs & Triades (Cordes 6, 5, 4)',
    chords: [
      { name: 'G mineur (Forme Em - Corde 6)', startFret: 3, root: { s: 0, f: 0 }, notes: [{ s: 1, f: 2 }, { s: 2, f: 2 }, { s: 3, f: 0 }, { s: 4, f: 0 }, { s: 5, f: 0 }], fingerings: { 0: '1', 1: '3', 2: '4', 3: '1', 4: '1', 5: '1' } },
      { name: 'C mineur (Forme Am - Corde 5)', startFret: 3, root: { s: 1, f: 0 }, notes: [{ s: 2, f: 2 }, { s: 3, f: 2 }, { s: 4, f: 1 }, { s: 5, f: 0 }], fingerings: { 0: 'X', 1: '1', 2: '3', 3: '4', 4: '2', 5: '1' } },
      { name: 'F mineur (Forme Dm - Corde 4)', startFret: 3, root: { s: 2, f: 0 }, notes: [{ s: 3, f: 2 }, { s: 4, f: 3 }, { s: 5, f: 1 }], fingerings: { 0: 'X', 1: 'X', 2: '1', 3: '3', 4: '4', 5: '2' } },
      { name: 'F# mineur (Forme Cm - Corde 5)', startFret: 6, root: { s: 1, f: 3 }, notes: [{ s: 2, f: 1 }, { s: 3, f: 0 }, { s: 4, f: 1 }], fingerings: { 0: 'X', 1: '4', 2: '2', 3: '1', 4: '3', 5: 'X' } }
    ]
  },
  {
    name: 'Accords 6 & Mineur 6',
    chords: [
      { name: 'G6 (Majeur 6 - Corde 6)', startFret: 3, root: { s: 0, f: 0 }, notes: [{ s: 2, f: 0 }, { s: 3, f: 1 }, { s: 4, f: 0 }], fingerings: { 0: '2', 1: 'X', 2: '1', 3: '3', 4: '1', 5: 'X' } },
      { name: 'C6 (Majeur 6 - Corde 5)', startFret: 3, root: { s: 1, f: 0 }, notes: [{ s: 2, f: 2 }, { s: 3, f: 0 }, { s: 4, f: 2 }], fingerings: { 0: 'X', 1: '2', 2: '3', 3: '1', 4: '4', 5: 'X' } },
      { name: 'F6 (Majeur 6 - Corde 4)', startFret: 3, root: { s: 2, f: 0 }, notes: [{ s: 3, f: 2 }, { s: 4, f: 0 }, { s: 5, f: 2 }], fingerings: { 0: 'X', 1: 'X', 2: '1', 3: '3', 4: '1', 5: '4' } },
      { name: 'G m6 (Mineur 6 - Corde 6)', startFret: 3, root: { s: 0, f: 0 }, notes: [{ s: 2, f: 0 }, { s: 3, f: 0 }, { s: 4, f: 0 }], fingerings: { 0: '1', 1: 'X', 2: '1', 3: '1', 4: '1', 5: 'X' } },
      { name: 'C m6 (Mineur 6 - Corde 5)', startFret: 3, root: { s: 1, f: 0 }, notes: [{ s: 2, f: 1 }, { s: 3, f: 2 }, { s: 4, f: 1 }], fingerings: { 0: 'X', 1: '2', 2: '1', 3: '3', 4: '1', 5: 'X' } }
    ]
  },
  {
    name: 'Accords 7, Majeur 7 (maj7), Mineur 7 (m7)',
    chords: [
      { name: 'G7 (Forme E7 - Corde 6)', startFret: 3, root: { s: 0, f: 0 }, notes: [{ s: 1, f: 2 }, { s: 2, f: 0 }, { s: 3, f: 1 }, { s: 4, f: 0 }, { s: 5, f: 0 }], fingerings: { 0: '1', 1: '3', 2: '1', 3: '2', 4: '1', 5: '1' } },
      { name: 'C7 (Forme A7 - Corde 5)', startFret: 3, root: { s: 1, f: 0 }, notes: [{ s: 2, f: 2 }, { s: 3, f: 0 }, { s: 4, f: 2 }, { s: 5, f: 0 }], fingerings: { 0: 'X', 1: '1', 2: '3', 3: '1', 4: '4', 5: '1' } },
      { name: 'F7 (Forme D7 - Corde 4)', startFret: 3, root: { s: 2, f: 0 }, notes: [{ s: 3, f: 2 }, { s: 4, f: 1 }, { s: 5, f: 2 }], fingerings: { 0: 'X', 1: 'X', 2: '1', 3: '3', 4: '2', 5: '4' } },
      { name: 'G maj7 (Drop 3 - Corde 6)', startFret: 3, root: { s: 0, f: 0 }, notes: [{ s: 2, f: 1 }, { s: 3, f: 1 }, { s: 4, f: 0 }], fingerings: { 0: '2', 1: 'X', 2: '3', 3: '4', 4: '1', 5: 'X' } },
      { name: 'C maj7 (Forme A maj7 - Corde 5)', startFret: 3, root: { s: 1, f: 0 }, notes: [{ s: 2, f: 2 }, { s: 3, f: 1 }, { s: 4, f: 2 }, { s: 5, f: 0 }], fingerings: { 0: 'X', 1: '1', 2: '3', 3: '2', 4: '4', 5: '1' } },
      { name: 'F maj7 (Forme D maj7 - Corde 4)', startFret: 3, root: { s: 2, f: 0 }, notes: [{ s: 3, f: 2 }, { s: 4, f: 2 }, { s: 5, f: 2 }], fingerings: { 0: 'X', 1: 'X', 2: '1', 3: '2', 4: '3', 5: '4' } },
      { name: 'G m7 (Forme Em7 - Corde 6)', startFret: 3, root: { s: 0, f: 0 }, notes: [{ s: 1, f: 2 }, { s: 2, f: 0 }, { s: 3, f: 0 }, { s: 4, f: 0 }, { s: 5, f: 0 }], fingerings: { 0: '1', 1: '3', 2: '1', 3: '1', 4: '1', 5: '1' } },
      { name: 'C m7 (Forme Am7 - Corde 5)', startFret: 3, root: { s: 1, f: 0 }, notes: [{ s: 2, f: 2 }, { s: 3, f: 0 }, { s: 4, f: 1 }, { s: 5, f: 0 }], fingerings: { 0: 'X', 1: '1', 2: '3', 3: '1', 4: '2', 5: '1' } },
      { name: 'F m7 (Forme Dm7 - Corde 4)', startFret: 3, root: { s: 2, f: 0 }, notes: [{ s: 3, f: 2 }, { s: 4, f: 1 }, { s: 5, f: 1 }], fingerings: { 0: 'X', 1: 'X', 2: '1', 3: '3', 4: '2', 5: '2' } }
    ]
  },
  {
    name: 'Accords Mineur maj7, maj7 sus4 & maj7 sus2',
    chords: [
      { name: 'G m(maj7) (Mineur Majeur 7 - Corde 6)', startFret: 3, root: { s: 0, f: 0 }, notes: [{ s: 2, f: 1 }, { s: 3, f: 0 }, { s: 4, f: 0 }], fingerings: { 0: '2', 1: 'X', 2: '3', 3: '1', 4: '1', 5: 'X' } },
      { name: 'C m(maj7) (Mineur Majeur 7 - Corde 5)', startFret: 3, root: { s: 1, f: 0 }, notes: [{ s: 2, f: 2 }, { s: 3, f: 1 }, { s: 4, f: 1 }], fingerings: { 0: 'X', 1: '1', 2: '4', 3: '2', 4: '3', 5: 'X' } },
      { name: 'G maj7 sus4 (Corde 6)', startFret: 3, root: { s: 0, f: 0 }, notes: [{ s: 2, f: 1 }, { s: 3, f: 2 }, { s: 4, f: 0 }], fingerings: { 0: '1', 1: 'X', 2: '2', 3: '4', 4: '1', 5: 'X' } },
      { name: 'C maj7 sus4 (Corde 5)', startFret: 3, root: { s: 1, f: 0 }, notes: [{ s: 2, f: 2 }, { s: 3, f: 1 }, { s: 4, f: 3 }], fingerings: { 0: 'X', 1: '1', 2: '3', 3: '2', 4: '4', 5: 'X' } },
      { name: 'C maj7 sus2 (Corde 5)', startFret: 3, root: { s: 1, f: 0 }, notes: [{ s: 2, f: 2 }, { s: 3, f: 1 }, { s: 4, f: 0 }], fingerings: { 0: 'X', 1: '1', 2: '4', 3: '3', 4: '1', 5: 'X' } }
    ]
  },
  {
    name: 'Accords Sus2, Sus4, Sus b9 & Sus 9',
    chords: [
      { name: 'C sus2 (Corde 5)', startFret: 3, root: { s: 1, f: 0 }, notes: [{ s: 2, f: 2 }, { s: 3, f: 2 }, { s: 4, f: 0 }, { s: 5, f: 0 }], fingerings: { 0: 'X', 1: '1', 2: '3', 3: '4', 4: '1', 5: '1' } },
      { name: 'G sus4 (Corde 6)', startFret: 3, root: { s: 0, f: 0 }, notes: [{ s: 1, f: 2 }, { s: 2, f: 2 }, { s: 3, f: 2 }, { s: 4, f: 0 }, { s: 5, f: 0 }], fingerings: { 0: '1', 1: '3', 2: '4', 3: '2', 4: '1', 5: '1' } },
      { name: 'C sus4 (Corde 5)', startFret: 3, root: { s: 1, f: 0 }, notes: [{ s: 2, f: 2 }, { s: 3, f: 2 }, { s: 4, f: 3 }, { s: 5, f: 0 }], fingerings: { 0: 'X', 1: '1', 2: '2', 3: '3', 4: '4', 5: '1' } },
      { name: 'C7 sus b9 (Flamenco / Jazz - Corde 5)', startFret: 3, root: { s: 1, f: 0 }, notes: [{ s: 2, f: 0 }, { s: 3, f: 0 }, { s: 4, f: 0 }], fingerings: { 0: 'X', 1: '3', 2: '1', 3: '2', 4: '1', 5: 'X' } },
      { name: 'C9 sus4 (Dominante Sus 9 - Corde 5)', startFret: 3, root: { s: 1, f: 0 }, notes: [{ s: 2, f: 2 }, { s: 3, f: 0 }, { s: 4, f: 0 }, { s: 5, f: 0 }], fingerings: { 0: 'X', 1: '1', 2: '3', 3: '1', 4: '1', 5: '1' } }
    ]
  },
  {
    name: 'Accords 9, 11, 13 & Extensions (Majeur, Mineur & Dominante)',
    chords: [
      { name: 'C9 (Dominante 9 - Corde 5)', startFret: 2, root: { s: 1, f: 1 }, notes: [{ s: 2, f: 0 }, { s: 3, f: 1 }, { s: 4, f: 1 }, { s: 5, f: 1 }], fingerings: { 0: 'X', 1: '2', 2: '1', 3: '3', 4: '3', 5: '3' } },
      { name: 'G maj9 (Drop 3 - Corde 6)', startFret: 2, root: { s: 0, f: 1 }, notes: [{ s: 2, f: 2 }, { s: 3, f: 2 }, { s: 4, f: 0 }], fingerings: { 0: '2', 1: 'X', 2: '3', 3: '4', 4: '1', 5: 'X' } },
      { name: 'C maj9 (Majeur 9 - Corde 5)', startFret: 2, root: { s: 1, f: 1 }, notes: [{ s: 2, f: 0 }, { s: 3, f: 1 }, { s: 4, f: 1 }, { s: 5, f: 0 }], fingerings: { 0: 'X', 1: '2', 2: '1', 3: '3', 4: '3', 5: '1' } },
      { name: 'G m9 (Mineur 9 - Corde 6)', startFret: 3, root: { s: 0, f: 0 }, notes: [{ s: 2, f: 0 }, { s: 3, f: 0 }, { s: 4, f: 0 }], fingerings: { 0: '2', 1: 'X', 2: '1', 3: '1', 4: '1', 5: 'X' } },
      { name: 'C m9 (Mineur 9 - Corde 5)', startFret: 3, root: { s: 1, f: 0 }, notes: [{ s: 2, f: 1 }, { s: 3, f: 0 }, { s: 4, f: 0 }], fingerings: { 0: 'X', 1: '2', 2: '1', 3: '3', 4: '4', 5: 'X' } },
      { name: 'G m11 (Mineur 11 - Corde 6)', startFret: 3, root: { s: 0, f: 0 }, notes: [{ s: 2, f: 0 }, { s: 3, f: 0 }, { s: 4, f: 0 }, { s: 5, f: 0 }], fingerings: { 0: '1', 1: 'X', 2: '1', 3: '1', 4: '1', 5: '1' } },
      { name: 'C m11 (Mineur 11 - Corde 5)', startFret: 3, root: { s: 1, f: 0 }, notes: [{ s: 2, f: 0 }, { s: 3, f: 0 }, { s: 4, f: 1 }], fingerings: { 0: 'X', 1: '2', 2: '1', 3: '1', 4: '3', 5: 'X' } },
      { name: 'G maj7 (#11 / 11e - Corde 6)', startFret: 2, root: { s: 0, f: 1 }, notes: [{ s: 2, f: 2 }, { s: 3, f: 2 }, { s: 4, f: 0 }], fingerings: { 0: '2', 1: 'X', 2: '3', 3: '4', 4: '1', 5: 'X' } },
      { name: 'G13 (Dominante 13 - Corde 6)', startFret: 3, root: { s: 0, f: 0 }, notes: [{ s: 2, f: 0 }, { s: 3, f: 1 }, { s: 4, f: 2 }], fingerings: { 0: '1', 1: 'X', 2: '2', 3: '3', 4: '4', 5: 'X' } },
      { name: 'C maj13 (Majeur 13 - Corde 5)', startFret: 3, root: { s: 1, f: 0 }, notes: [{ s: 2, f: 2 }, { s: 3, f: 1 }, { s: 4, f: 2 }, { s: 5, f: 2 }], fingerings: { 0: 'X', 1: '1', 2: '3', 3: '2', 4: '4', 5: '4' } },
      { name: 'G maj9 (13, #11 - Extension Corde 6)', startFret: 3, root: { s: 0, f: 0 }, notes: [{ s: 2, f: 1 }, { s: 3, f: 1 }, { s: 4, f: 2 }, { s: 5, f: 2 }], fingerings: { 0: '2', 1: 'X', 2: '3', 3: '1', 4: '4', 5: '4' } }
    ]
  },
  {
    name: 'Accords Augmentés, Diminués, Diminués 7 & Diminué 7 b13',
    chords: [
      { name: 'G Augmenté (G+ / aug - Corde 6)', startFret: 3, root: { s: 0, f: 0 }, notes: [{ s: 1, f: 2 }, { s: 2, f: 2 }, { s: 3, f: 1 }, { s: 4, f: 1 }], fingerings: { 0: '1', 1: '3', 2: '4', 3: '2', 4: '2', 5: 'X' } },
      { name: 'C Augmenté (C+ / aug - Corde 5)', startFret: 3, root: { s: 1, f: 0 }, notes: [{ s: 2, f: 2 }, { s: 3, f: 2 }, { s: 4, f: 2 }], fingerings: { 0: 'X', 1: '1', 2: '2', 3: '3', 4: '4', 5: 'X' } },
      { name: 'C dim7 (Corde 5)', startFret: 2, root: { s: 1, f: 1 }, notes: [{ s: 2, f: 2 }, { s: 3, f: 0 }, { s: 4, f: 2 }], fingerings: { 0: 'X', 1: '2', 2: '4', 3: '1', 4: '3', 5: 'X' } },
      { name: 'G dim7 (Corde 6)', startFret: 3, root: { s: 0, f: 0 }, notes: [{ s: 2, f: 0 }, { s: 3, f: 0 }, { s: 4, f: 0 }], fingerings: { 0: '1', 1: 'X', 2: '2', 3: '1', 4: '3', 5: 'X' } },
      { name: 'C dim7 b13 (Diminué 7 bémol 13 - Corde 5)', startFret: 2, root: { s: 1, f: 1 }, notes: [{ s: 2, f: 2 }, { s: 3, f: 0 }, { s: 4, f: 2 }, { s: 5, f: 2 }], fingerings: { 0: 'X', 1: '2', 2: '3', 3: '1', 4: '4', 5: '4' } }
    ]
  },
  {
    name: 'Accords Demi-diminués (m7b5)',
    chords: [
      { name: 'B m7b5 (Demi-diminué Corde 5)', startFret: 2, root: { s: 1, f: 0 }, notes: [{ s: 2, f: 1 }, { s: 3, f: 0 }, { s: 4, f: 1 }], fingerings: { 0: 'X', 1: '1', 2: '3', 3: '2', 4: '4', 5: 'X' } },
      { name: 'G m7b5 (Demi-diminué Corde 6)', startFret: 3, root: { s: 0, f: 0 }, notes: [{ s: 2, f: 0 }, { s: 3, f: 0 }, { s: 4, f: 0 }], fingerings: { 0: '1', 1: 'X', 2: '2', 3: '3', 4: '4', 5: 'X' } },
      { name: 'D m7b5 (Demi-diminué Corde 4)', startFret: 3, root: { s: 2, f: 0 }, notes: [{ s: 3, f: 2 }, { s: 4, f: 1 }, { s: 5, f: 1 }], fingerings: { 0: 'X', 1: 'X', 2: '1', 3: '3', 4: '2', 5: '2' } }
    ]
  },
  {
    name: 'Accords Altérés & Dominantes Enrichies',
    chords: [
      { name: 'C7b9 (Dominante b9 - Corde 5)', startFret: 2, root: { s: 1, f: 1 }, notes: [{ s: 2, f: 0 }, { s: 3, f: 1 }, { s: 4, f: 0 }], fingerings: { 0: 'X', 1: '2', 2: '1', 3: '3', 4: '1', 5: 'X' } },
      { name: 'C7#9 (Accord Hendrix - Corde 5)', startFret: 2, root: { s: 1, f: 1 }, notes: [{ s: 2, f: 0 }, { s: 3, f: 1 }, { s: 4, f: 2 }], fingerings: { 0: 'X', 1: '2', 2: '1', 3: '3', 4: '4', 5: 'X' } },
      { name: 'G7#5 (Dominante #5 - Corde 6)', startFret: 3, root: { s: 0, f: 0 }, notes: [{ s: 2, f: 0 }, { s: 3, f: 1 }, { s: 4, f: 1 }], fingerings: { 0: '1', 1: 'X', 2: '2', 3: '3', 4: '4', 5: 'X' } },
      { name: 'G7b5 (Dominante b5 - Corde 6)', startFret: 3, root: { s: 0, f: 0 }, notes: [{ s: 2, f: 0 }, { s: 3, f: 1 }, { s: 4, f: 0 }], fingerings: { 0: '2', 1: 'X', 2: '1', 3: '3', 4: '1', 5: 'X' } },
      { name: 'C7alt (Super-locrien - Corde 5)', startFret: 3, root: { s: 1, f: 0 }, notes: [{ s: 2, f: 2 }, { s: 3, f: 0 }, { s: 4, f: 1 }], fingerings: { 0: 'X', 1: '2', 2: '3', 3: '1', 4: '4', 5: 'X' } },
      { name: 'G9 (7e quinte 9 - Corde 6)', startFret: 3, root: { s: 0, f: 0 }, notes: [{ s: 1, f: 2 }, { s: 2, f: 0 }, { s: 3, f: 1 }, { s: 4, f: 0 }, { s: 5, f: 2 }], fingerings: { 0: '1', 1: '3', 2: '1', 3: '2', 4: '1', 5: '4' } }
    ]
  },
  {
    name: 'Power Chords & Renversements',
    chords: [
      { name: 'Power Chord - Racine Corde 6 (ex: G5)', startFret: 3, root: { s: 0, f: 0 }, notes: [{ s: 1, f: 2 }, { s: 2, f: 2 }], fingerings: { 0: '1', 1: '3', 2: '4', 3: 'X', 4: 'X', 5: 'X' } },
      { name: 'Power Chord - Racine Corde 5 (ex: C5)', startFret: 3, root: { s: 1, f: 0 }, notes: [{ s: 2, f: 2 }, { s: 3, f: 2 }], fingerings: { 0: 'X', 1: '1', 2: '3', 3: '4', 4: 'X', 5: 'X' } },
      { name: 'Power Chord - Racine Corde 4 (ex: F5)', startFret: 3, root: { s: 2, f: 0 }, notes: [{ s: 3, f: 2 }, { s: 4, f: 3 }], fingerings: { 0: 'X', 1: 'X', 2: '1', 3: '3', 4: '4', 5: 'X' } },
      { name: 'D/F# (Fermé - Basse F#)', startFret: 2, root: { s: 2, f: 2 }, notes: [{ s: 0, f: 0 }, { s: 3, f: 0 }, { s: 4, f: 1 }, { s: 5, f: 0 }], fingerings: { 0: '1', 1: 'X', 2: '4', 3: '1', 4: '2', 5: '1' } }
    ]
  }
];

const getIntervalInfo = (rootPos, notePos, startFret = 1) => {
  if (!rootPos) return { label: '?', color: '#6b7280', text: '#ffffff' };
  
  const rootActualFret = rootPos.f === -1 ? 0 : (startFret - 1) + rootPos.f + 1;
  const rootPitch = STRING_OFFSETS[rootPos.s] + rootActualFret;
  
  const noteActualFret = notePos.f === -1 ? 0 : (startFret - 1) + notePos.f + 1;
  const notePitch = STRING_OFFSETS[notePos.s] + noteActualFret;
  
  let diff = (notePitch - rootPitch) % 12;
  if (diff < 0) diff += 12;

  const intervals = {
    0:  { label: 'R',  color: '#ef4444', text: '#ffffff' },
    1:  { label: 'b2', color: '#f97316', text: '#ffffff' },
    2:  { label: '2',  color: '#f97316', text: '#ffffff' },
    3:  { label: 'b3', color: '#22c55e', text: '#ffffff' },
    4:  { label: '3',  color: '#22c55e', text: '#ffffff' },
    5:  { label: '4',  color: '#ec4899', text: '#ffffff' },
    6:  { label: 'b5', color: '#0284c7', text: '#ffffff' },
    7:  { label: '5',  color: '#38bdf8', text: '#000000' },
    8:  { label: 'b6', color: '#a855f7', text: '#ffffff' },
    9:  { label: '6',  color: '#a855f7', text: '#ffffff' },
    10: { label: 'b7', color: '#eab308', text: '#000000' },
    11: { label: '7',  color: '#eab308', text: '#000000' },
  };
  
  return intervals[diff] || { label: '?', color: '#6b7280', text: '#ffffff' };
};

const getNoteName = (stringIdx, actualFret) => {
  const semitone = STRING_OFFSETS[stringIdx] + actualFret;
  return NOTE_NAMES[semitone % 12];
};

function ToolButton({ icon, label, shortcutKey, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      title={`${label} (${shortcutKey})`}
      className={`p-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 justify-center ${
        isActive 
          ? 'bg-blue-600 text-white shadow-lg scale-105' 
          : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
      }`}
    >
      {icon}
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 text-neutral-300 font-mono font-semibold uppercase">{shortcutKey}</span>
    </button>
  );
}

export default function App() {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  const [groups, setGroups] = useState([]);
  const [diagrams, setDiagrams] = useState({});
  const [activeDiagramId, setActiveDiagramId] = useState(null);
  const [openGroups, setOpenGroups] = useState({});

  const [activeTool, setActiveTool] = useState('note');

  // Custom Toast/Notification State
  const [toastMessage, setToastMessage] = useState(null);

  // Diagram Styles State
  const [diagramBgColor, setDiagramBgColor] = useState('#1c1c1e');
  const [nutThickness, setNutThickness] = useState(8);
  const [nutOpacity, setNutOpacity] = useState(100);
  const [nutColor, setNutColor] = useState('#ffffff');

  const [stringThicknessBase, setStringThicknessBase] = useState(3);
  const [stringOpacity, setStringOpacity] = useState(90);

  const [fretThickness, setFretThickness] = useState(3);
  const [fretOpacity, setFretOpacity] = useState(90);

  // Fret Numbers Settings
  const [showFretNumbers, setShowFretNumbers] = useState(true);
  const [fretNumberSize, setFretNumberSize] = useState(18);
  const [fretNumberColor, setFretNumberColor] = useState('#a3a3a3');

  // Bottom String Indicators
  const [bottomIndicatorType, setBottomIndicatorType] = useState('notes');

  // Export / Import Modal State
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');
  const [exportScope, setExportScope] = useState('all');
  const [selectedGroupForExport, setSelectedGroupForExport] = useState('');
  const [selectedDiagramIds, setSelectedDiagramIds] = useState(new Set());
  const [pdfGrid, setPdfGrid] = useState(4);
  const fileInputRef = useRef(null);

  // Editing Group Name
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editingGroupTitle, setEditingGroupTitle] = useState('');

  // Drag and Drop State
  const [draggedItem, setDraggedItem] = useState(null);

  const svgRef = useRef(null);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  useEffect(() => {
    const initialGroups = [];
    const initialDiagrams = {};
    const openState = {};

    DEFAULT_GROUPS_DATA.forEach((gData) => {
      const gId = generateId();
      openState[gId] = true;

      const dIds = [];
      gData.chords.forEach((c) => {
        const dId = generateId();
        dIds.push(dId);
        initialDiagrams[dId] = {
          id: dId,
          groupId: gId,
          name: c.name,
          startFret: c.startFret || 1,
          root: c.root ? { ...c.root } : null,
          notes: c.notes.map(n => ({ ...n, id: generateId() })),
          fingerings: c.fingerings ? { ...c.fingerings } : { 0: 'X', 1: '3', 2: '2', 3: '0', 4: '1', 5: '0' },
          texts: []
        };
      });
      initialGroups.push({
        id: gId,
        name: gData.name,
        diagramIds: dIds
      });
    });

    setGroups(initialGroups);
    setDiagrams(initialDiagrams);
    setOpenGroups(openState);
    if (initialGroups[0] && initialGroups[0].diagramIds[0]) {
      setActiveDiagramId(initialGroups[0].diagramIds[0]);
    }
  }, []);

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.target.tagName === 'INPUT' || 
        e.target.tagName === 'TEXTAREA' || 
        e.target.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'p') {
        setActiveTool('pointer');
      } else if (key === 'n') {
        setActiveTool('note');
      } else if (key === 't') {
        setActiveTool('text');
      } else if (key === 'g') {
        setActiveTool('eraser');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeDiagram = useMemo(() => {
    return diagrams[activeDiagramId] || null;
  }, [diagrams, activeDiagramId]);

  const updateActiveDiagram = (updater) => {
    if (!activeDiagramId) return;
    setDiagrams(prev => ({
      ...prev,
      [activeDiagramId]: updater(prev[activeDiagramId])
    }));
  };

  const handleAddGroup = () => {
    const gId = generateId();
    const newGroup = {
      id: gId,
      name: 'Nouveau Groupe',
      diagramIds: []
    };
    setGroups(prev => [...prev, newGroup]);
    setOpenGroups(prev => ({ ...prev, [gId]: true }));
  };

  const handleDeleteGroup = (gId, e) => {
    e.stopPropagation();
    if (groups.length <= 1) return;
    
    const groupToDelete = groups.find(g => g.id === gId);
    setGroups(prev => prev.filter(g => g.id !== gId));
    
    setDiagrams(prev => {
      const next = { ...prev };
      groupToDelete.diagramIds.forEach(id => delete next[id]);
      return next;
    });

    if (activeDiagram && activeDiagram.groupId === gId) {
      const remainingGroup = groups.find(g => g.id !== gId);
      if (remainingGroup && remainingGroup.diagramIds.length > 0) {
        setActiveDiagramId(remainingGroup.diagramIds[0]);
      } else {
        setActiveDiagramId(null);
      }
    }
  };

  const handleAddDiagramToGroup = (gId, e) => {
    e?.stopPropagation();
    const dId = generateId();
    const newDiagram = {
      id: dId,
      groupId: gId,
      name: 'Nouvel Accord',
      startFret: 3,
      root: null,
      notes: [],
      fingerings: { 0: 'X', 1: '1', 2: '3', 3: '4', 4: '2', 5: '1' },
      texts: []
    };

    setDiagrams(prev => ({ ...prev, [dId]: newDiagram }));
    setGroups(prev => prev.map(g => g.id === gId ? { ...g, diagramIds: [...g.diagramIds, dId] } : g));
    setActiveDiagramId(dId);
  };

  const handleDeleteDiagram = (dId, e) => {
    e?.stopPropagation();
    const target = diagrams[dId];
    if (!target) return;

    setDiagrams(prev => {
      const next = { ...prev };
      delete next[dId];
      return next;
    });

    setGroups(prev => prev.map(g => g.id === target.groupId ? { ...g, diagramIds: g.diagramIds.filter(id => id !== dId) } : g));

    if (activeDiagramId === dId) {
      const allOtherIds = Object.keys(diagrams).filter(id => id !== dId);
      setActiveDiagramId(allOtherIds.length > 0 ? allOtherIds[0] : null);
    }
  };

  const toggleGroupOpen = (gId) => {
    setOpenGroups(prev => ({ ...prev, [gId]: !prev[gId] }));
  };

  const handleDragStartGroup = (e, gId) => {
    e.stopPropagation();
    setDraggedItem({ type: 'group', id: gId });
  };

  const handleDragStartDiagram = (e, dId, gId) => {
    e.stopPropagation();
    setDraggedItem({ type: 'diagram', id: dId, groupId: gId });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetId, targetType) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedItem) return;

    if (draggedItem.type === 'group' && targetType === 'group') {
      if (draggedItem.id === targetId) return;
      const gList = [...groups];
      const dragIdx = gList.findIndex(g => g.id === draggedItem.id);
      const targetIdx = gList.findIndex(g => g.id === targetId);
      if (dragIdx !== -1 && targetIdx !== -1) {
        const [removed] = gList.splice(dragIdx, 1);
        gList.splice(targetIdx, 0, removed);
        setGroups(gList);
      }
    } else if (draggedItem.type === 'diagram') {
      const sourceDiagId = draggedItem.id;
      const sourceGroupId = draggedItem.groupId;

      let destGroupId = targetType === 'group' ? targetId : diagrams[targetId]?.groupId;
      if (!destGroupId) return;

      setGroups(prevGroups => {
        const newGroups = prevGroups.map(g => {
          if (g.id === sourceGroupId) {
            return { ...g, diagramIds: g.diagramIds.filter(id => id !== sourceDiagId) };
          }
          return g;
        });

        return newGroups.map(g => {
          if (g.id === destGroupId) {
            if (targetType === 'diagram' && targetId !== sourceDiagId) {
              const tIdx = g.diagramIds.indexOf(targetId);
              const newDList = [...g.diagramIds];
              if (tIdx !== -1) {
                newDList.splice(tIdx, 0, sourceDiagId);
              } else {
                newDList.push(sourceDiagId);
              }
              return { ...g, diagramIds: Array.from(new Set(newDList)) };
            } else if (!g.diagramIds.includes(sourceDiagId)) {
              return { ...g, diagramIds: [...g.diagramIds, sourceDiagId] };
            }
          }
          return g;
        });
      });

      setDiagrams(prev => ({
        ...prev,
        [sourceDiagId]: { ...prev[sourceDiagId], groupId: destGroupId }
      }));
    }

    setDraggedItem(null);
  };

  const SVG_WIDTH = 480;
  const SVG_HEIGHT = 680;
  const OFFSET_X = 65; 
  const OFFSET_Y = 120; 

  const handleCanvasClick = (e) => {
    if (!svgRef.current || !activeDiagram) return;

    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = SVG_WIDTH / rect.width;
    const scaleY = SVG_HEIGHT / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (y >= 75 && y < 115) {
      const stringIdx = Math.round((x - OFFSET_X) / 70);
      if (stringIdx >= 0 && stringIdx <= 5) {
        const current = activeDiagram.fingerings[stringIdx];
        let nextState = '0';
        if (current === '0') nextState = 'X';
        else if (current === 'X') nextState = '';
        else nextState = '0';

        updateActiveDiagram(d => ({
          ...d,
          fingerings: { ...d.fingerings, [stringIdx]: nextState }
        }));
        return;
      }
    }

    const maxFretsLimit = bottomIndicatorType === 'none' ? 7 : 6;
    const gridY = y - OFFSET_Y;
    const s = Math.round((x - OFFSET_X) / 70);
    const f = Math.floor(gridY / 75);

    const validS = Math.max(0, Math.min(5, s));
    const validF = Math.max(0, Math.min(maxFretsLimit - 1, f));

    if (gridY < 0 && activeTool !== 'text' && activeTool !== 'pointer') return;

    if (activeTool === 'note') {
      updateActiveDiagram(d => {
        const isRoot = d.root && d.root.s === validS && d.root.f === validF;
        const isNoteIndex = d.notes.findIndex(n => n.s === validS && n.f === validF);

        if (isRoot) {
          return { ...d, root: null };
        } else if (isNoteIndex !== -1) {
          const newNotes = [...d.notes];
          newNotes.splice(isNoteIndex, 1);
          return { ...d, notes: newNotes };
        } else {
          if (!d.root) {
            return { ...d, root: { s: validS, f: validF } };
          } else {
            return { ...d, notes: [...d.notes, { id: generateId(), s: validS, f: validF }] };
          }
        }
      });
    } else if (activeTool === 'text') {
      const userInput = prompt('Entrez votre texte :');
      if (userInput && userInput.trim()) {
        updateActiveDiagram(d => ({
          ...d,
          texts: [...d.texts, { id: generateId(), x, y, text: userInput }]
        }));
      }
    } else if (activeTool === 'eraser') {
      updateActiveDiagram(d => {
        let newD = { ...d };
        if (newD.root && newD.root.s === validS && newD.root.f === validF) {
          newD.root = null;
          return newD;
        }
        const noteIndex = newD.notes.findIndex(n => n.s === validS && n.f === validF);
        if (noteIndex !== -1) {
          const newNotes = [...newD.notes];
          newNotes.splice(noteIndex, 1);
          newD.notes = newNotes;
          return newD;
        }
        const textIndex = newD.texts.findIndex(t => Math.hypot(t.x - x, t.y - y) < 30);
        if (textIndex !== -1) {
          const newTexts = [...newD.texts];
          newTexts.splice(textIndex, 1);
          newD.texts = newTexts;
        }
        return newD;
      });
    }
  };

  const handleCanvasContextMenu = (e) => {
    e.preventDefault();
    if (!svgRef.current || !activeDiagram) return;

    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = SVG_WIDTH / rect.width;
    const scaleY = SVG_HEIGHT / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (y >= 75 && y < 115) {
      const stringIdx = Math.round((x - OFFSET_X) / 70);
      if (stringIdx >= 0 && stringIdx <= 5) {
        updateActiveDiagram(d => ({
          ...d,
          root: { s: stringIdx, f: -1 },
          fingerings: { ...d.fingerings, [stringIdx]: '0' }
        }));
        return;
      }
    }

    const maxFretsLimit = bottomIndicatorType === 'none' ? 7 : 6;
    const gridY = y - OFFSET_Y;
    const s = Math.round((x - OFFSET_X) / 70);
    const f = Math.floor(gridY / 75);

    const validS = Math.max(0, Math.min(5, s));
    const validF = Math.max(0, Math.min(maxFretsLimit - 1, f));

    if (gridY < 0) return;

    updateActiveDiagram(d => {
      if (d.root && d.root.s === validS && d.root.f === validF) {
        return { ...d, root: null };
      }
      
      const filteredNotes = d.notes.filter(n => !(n.s === validS && n.f === validF));
      return {
        ...d,
        root: { s: validS, f: validF },
        notes: filteredNotes
      };
    });
  };

  const renderDiagramSVG = (diag, width = SVG_WIDTH, height = SVG_HEIGHT) => {
    if (!diag) return null;

    const startFret = diag.startFret || 1;
    const totalFrets = bottomIndicatorType === 'none' ? 7 : 6;

    return (
      <svg 
        ref={svgRef}
        width={width} 
        height={height} 
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} 
        className="select-none transition-colors duration-200 cursor-pointer max-w-full h-auto"
        style={{ backgroundColor: diagramBgColor }}
        onClick={handleCanvasClick}
        onContextMenu={handleCanvasContextMenu}
      >
        <rect width="100%" height="100%" fill={diagramBgColor} />

        <text
          x={SVG_WIDTH / 2}
          y="45"
          fill="#ffffff"
          fontSize="32"
          fontWeight="bold"
          fontFamily="sans-serif"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {diag.name}
        </text>

        {/* Nut indicators (Open, Muted, or Open Root) */}
        {Array.from({ length: 6 }).map((_, i) => {
          const status = diag.fingerings[i] || '';
          const hasFretted = (diag.root && diag.root.s === i && diag.root.f >= 0) || 
                             (diag.notes && diag.notes.some(n => n.s === i && n.f >= 0));
          const isOpenRoot = diag.root && diag.root.s === i && diag.root.f === -1;

          if (isOpenRoot) {
            return (
              <g key={`nut-ind-${i}`}>
                <circle
                  cx={OFFSET_X + i * 70}
                  cy="95"
                  r={16}
                  fill="#ef4444"
                />
                <text
                  x={OFFSET_X + i * 70}
                  y="95"
                  fill="#ffffff"
                  fontSize="14"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  R
                </text>
              </g>
            );
          }

          if (hasFretted) return null;

          if (status !== '0' && status !== 'X') return null;

          return (
            <text
              key={`nut-ind-${i}`}
              x={OFFSET_X + i * 70}
              y="95"
              fill={status === '0' ? '#38bdf8' : '#ef4444'}
              fontSize="24"
              fontWeight="bold"
              fontFamily="sans-serif"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {status === '0' ? '○' : '×'}
            </text>
          );
        })}

        {/* Strings */}
        {Array.from({ length: 6 }).map((_, i) => {
          const proportionalWidth = Math.max(1, stringThicknessBase * (1 - (i * 0.12)));
          return (
            <line
              key={`string-${i}`}
              x1={OFFSET_X + i * 70}
              y1={OFFSET_Y}
              x2={OFFSET_X + i * 70}
              y2={OFFSET_Y + totalFrets * 75}
              stroke="#ffffff"
              strokeWidth={proportionalWidth}
              opacity={stringOpacity / 100}
            />
          );
        })}

        {/* Frets */}
        {Array.from({ length: totalFrets + 1 }).map((_, i) => (
          <line
            key={`fret-${i}`}
            x1={OFFSET_X}
            y1={OFFSET_Y + i * 75}
            x2={OFFSET_X + 5 * 70}
            y2={OFFSET_Y + i * 75}
            stroke="#ffffff"
            strokeWidth={fretThickness}
            opacity={fretOpacity / 100}
          />
        ))}

        {/* Nut Line */}
        <line
          x1={OFFSET_X - (stringThicknessBase / 2)}
          y1={OFFSET_Y}
          x2={OFFSET_X + 5 * 70 + (stringThicknessBase / 2)}
          y2={OFFSET_Y}
          stroke={nutColor}
          strokeWidth={startFret === 1 ? nutThickness : Math.max(2, nutThickness * 0.4)}
          opacity={nutOpacity / 100}
        />

        {/* Fret Numbers */}
        {showFretNumbers && (
          <g>
            {Array.from({ length: totalFrets }).map((_, i) => (
              <text
                key={`fret-num-${i}`}
                x={OFFSET_X - 28}
                y={OFFSET_Y + i * 75 + 37.5}
                fill={fretNumberColor}
                fontSize={fretNumberSize}
                fontWeight="bold"
                fontFamily="sans-serif"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {startFret + i}
              </text>
            ))}
          </g>
        )}

        {/* Fretted Root Note */}
        {diag.root && diag.root.f >= 0 && (
          <g>
            <circle
              cx={OFFSET_X + diag.root.s * 70}
              cy={OFFSET_Y + diag.root.f * 75 + 37.5}
              r={22}
              fill="#ef4444"
            />
            <text
              x={OFFSET_X + diag.root.s * 70}
              y={OFFSET_Y + diag.root.f * 75 + 37.5}
              fill="#ffffff"
              fontSize="18"
              fontWeight="bold"
              fontFamily="sans-serif"
              textAnchor="middle"
              dominantBaseline="central"
            >
              R
            </text>
          </g>
        )}

        {/* Other Fretted Notes */}
        {diag.notes.map(note => {
          const info = getIntervalInfo(diag.root, note, startFret);
          const cx = OFFSET_X + note.s * 70;
          const cy = OFFSET_Y + note.f * 75 + 37.5;

          return (
            <g key={note.id}>
              <circle
                cx={cx}
                cy={cy}
                r={22}
                fill={info.color}
              />
              <text
                x={cx}
                y={cy}
                fill={info.text}
                fontSize="15"
                fontWeight="bold"
                fontFamily="sans-serif"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {info.label}
              </text>
            </g>
          );
        })}

        {/* Free Texts */}
        {diag.texts.map(txtItem => (
          <text
            key={txtItem.id}
            x={txtItem.x}
            y={txtItem.y}
            fill="#ffffff"
            fontSize="26"
            fontWeight="bold"
            fontFamily="sans-serif"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {txtItem.text}
          </text>
        ))}

        {/* Bottom String Indicators */}
        {bottomIndicatorType !== 'none' && Array.from({ length: 6 }).map((_, sIdx) => {
          let label = '';
          const customFingering = diag.fingerings[sIdx];

          if (bottomIndicatorType === 'fingerings') {
            label = customFingering || '';
          } else if (bottomIndicatorType === 'notes') {
            let actualFret = -1;
            if (diag.root && diag.root.s === sIdx) {
              actualFret = diag.root.f === -1 ? 0 : (startFret - 1) + diag.root.f + 1;
            }
            const nOnS = diag.notes.find(n => n.s === sIdx);
            if (nOnS) {
              actualFret = (startFret - 1) + nOnS.f + 1;
            }

            if (customFingering === 'X' && actualFret === -1) {
              label = 'X';
            } else if (actualFret >= 0) {
              label = getNoteName(sIdx, actualFret);
            } else if (customFingering === '0') {
              label = getNoteName(sIdx, 0);
            }
          } else if (bottomIndicatorType === 'intervals') {
            let playedFretPos = null;
            if (diag.root && diag.root.s === sIdx) playedFretPos = diag.root;
            const nOnS = diag.notes.find(n => n.s === sIdx);
            if (nOnS) playedFretPos = nOnS;

            if (playedFretPos) {
              const info = getIntervalInfo(diag.root, playedFretPos, startFret);
              label = info.label;
            } else {
              label = customFingering || '';
            }
          }

          if (!label) return null;

          return (
            <text
              key={`bottom-ind-${sIdx}`}
              x={OFFSET_X + sIdx * 70}
              y={OFFSET_Y + 6 * 75 + 32}
              fill="#38bdf8"
              fontSize="18"
              fontWeight="bold"
              fontFamily="sans-serif"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {label}
            </text>
          );
        })}
      </svg>
    );
  };

  const getTargetDiagramsForExport = () => {
    if (exportScope === 'all') {
      return Object.values(diagrams);
    } else if (exportScope === 'group') {
      const targetGroup = groups.find(g => g.id === selectedGroupForExport);
      if (!targetGroup) return [];
      return targetGroup.diagramIds.map(id => diagrams[id]).filter(Boolean);
    } else {
      return Array.from(selectedDiagramIds).map(id => diagrams[id]).filter(Boolean);
    }
  };

  const createSVGString = (diag) => {
    const startFret = diag.startFret || 1;
    const totalFrets = bottomIndicatorType === 'none' ? 7 : 6;

    let fretNumsHTML = '';
    if (showFretNumbers) {
      for (let i = 0; i < totalFrets; i++) {
        fretNumsHTML += `<text x="${OFFSET_X - 28}" y="${OFFSET_Y + i * 75 + 37.5}" fill="${fretNumberColor}" font-size="${fretNumberSize}" font-weight="bold" font-family="sans-serif" text-anchor="middle" dominant-baseline="central">${startFret + i}</text>`;
      }
    }

    let nutIndicatorsHTML = '';
    for (let i = 0; i < 6; i++) {
      const status = diag.fingerings[i] || '';
      const hasFretted = (diag.root && diag.root.s === i && diag.root.f >= 0) || 
                         (diag.notes && diag.notes.some(n => n.s === i && n.f >= 0));
      const isOpenRoot = diag.root && diag.root.s === i && diag.root.f === -1;

      if (isOpenRoot) {
        nutIndicatorsHTML += `<circle cx="${OFFSET_X + i * 70}" cy="95" r="16" fill="#ef4444"/><text x="${OFFSET_X + i * 70}" y="95" fill="#ffffff" font-size="14" font-weight="bold" font-family="sans-serif" text-anchor="middle" dominant-baseline="central">R</text>`;
      } else if (!hasFretted && (status === '0' || status === 'X')) {
        nutIndicatorsHTML += `<text x="${OFFSET_X + i * 70}" y="95" fill="${status === '0' ? '#38bdf8' : '#ef4444'}" font-size="24" font-weight="bold" font-family="sans-serif" text-anchor="middle" dominant-baseline="central">${status === '0' ? '○' : '×'}</text>`;
      }
    }

    let rootHTML = '';
    if (diag.root && diag.root.f >= 0) {
      rootHTML = `<circle cx="${OFFSET_X + diag.root.s * 70}" cy="${OFFSET_Y + diag.root.f * 75 + 37.5}" r="22" fill="#ef4444"/><text x="${OFFSET_X + diag.root.s * 70}" y="${OFFSET_Y + diag.root.f * 75 + 37.5}" fill="#ffffff" font-size="18" font-weight="bold" font-family="sans-serif" text-anchor="middle" dominant-baseline="central">R</text>`;
    }

    let notesHTML = diag.notes.map(note => {
      const info = getIntervalInfo(diag.root, note, startFret);
      return `<circle cx="${OFFSET_X + note.s * 70}" cy="${OFFSET_Y + note.f * 75 + 37.5}" r="22" fill="${info.color}"/><text x="${OFFSET_X + note.s * 70}" y="${OFFSET_Y + note.f * 75 + 37.5}" fill="${info.text}" font-size="15" font-weight="bold" font-family="sans-serif" text-anchor="middle" dominant-baseline="central">${info.label}</text>`;
    }).join('');

    let textsHTML = diag.texts.map(t => `<text x="${t.x}" y="${t.y}" fill="#ffffff" font-size="26" font-weight="bold" font-family="sans-serif" text-anchor="middle" dominant-baseline="central">${t.text}</text>`).join('');

    let bottomHTML = '';
    if (bottomIndicatorType !== 'none') {
      for (let sIdx = 0; sIdx < 6; sIdx++) {
        let label = '';
        const customFingering = diag.fingerings[sIdx];

        if (bottomIndicatorType === 'fingerings') {
          label = customFingering || '';
        } else if (bottomIndicatorType === 'notes') {
          let actualFret = -1;
          if (diag.root && diag.root.s === sIdx) {
            actualFret = diag.root.f === -1 ? 0 : (startFret - 1) + diag.root.f + 1;
          }
          const nOnS = diag.notes.find(n => n.s === sIdx);
          if (nOnS) {
            actualFret = (startFret - 1) + nOnS.f + 1;
          }

          if (customFingering === 'X' && actualFret === -1) {
            label = 'X';
          } else if (actualFret >= 0) {
            label = getNoteName(sIdx, actualFret);
          } else if (customFingering === '0') {
            label = getNoteName(sIdx, 0);
          }
        } else if (bottomIndicatorType === 'intervals') {
          let playedFretPos = null;
          if (diag.root && diag.root.s === sIdx) playedFretPos = diag.root;
          const nOnS = diag.notes.find(n => n.s === sIdx);
          if (nOnS) playedFretPos = nOnS;

          if (playedFretPos) {
            const info = getIntervalInfo(diag.root, playedFretPos, startFret);
            label = info.label;
          } else {
            label = customFingering || '';
          }
        }

        if (label) {
          bottomHTML += `<text x="${OFFSET_X + sIdx * 70}" y="${OFFSET_Y + 6 * 75 + 32}" fill="#38bdf8" font-size="18" font-weight="bold" font-family="sans-serif" text-anchor="middle" dominant-baseline="central">${label}</text>`;
        }
      }
    }

    const nutWidthVal = startFret === 1 ? nutThickness : Math.max(2, nutThickness * 0.4);
    const nutHTML = `<line x1="${OFFSET_X - (stringThicknessBase / 2)}" y1="${OFFSET_Y}" x2="${OFFSET_X + 5 * 70 + (stringThicknessBase / 2)}" y2="${OFFSET_Y}" stroke="${nutColor}" stroke-width="${nutWidthVal}" opacity="${nutOpacity / 100}"/>`;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}">
      <rect width="100%" height="100%" fill="${diagramBgColor}"/>
      <text x="${SVG_WIDTH / 2}" y="45" fill="#ffffff" font-size="32" font-weight="bold" font-family="sans-serif" text-anchor="middle" dominant-baseline="central">${diag.name}</text>
      ${nutIndicatorsHTML}
      ${Array.from({ length: 6 }).map((_, i) => {
        const pw = Math.max(1, stringThicknessBase * (1 - (i * 0.12)));
        return `<line x1="${OFFSET_X + i * 70}" y1="${OFFSET_Y}" x2="${OFFSET_X + i * 70}" y2="${OFFSET_Y + totalFrets * 75}" stroke="#ffffff" stroke-width="${pw}" opacity="${stringOpacity / 100}"/>`;
      }).join('')}
      ${Array.from({ length: totalFrets + 1 }).map((_, i) => `<line x1="${OFFSET_X}" y1="${OFFSET_Y + i * 75}" x2="${OFFSET_X + 5 * 70}" y2="${OFFSET_Y + i * 75}" stroke="#ffffff" stroke-width="${fretThickness}" opacity="${fretOpacity / 100}"/>`).join('')}
      ${nutHTML}
      ${fretNumsHTML}
      ${rootHTML}
      ${notesHTML}
      ${textsHTML}
      ${bottomHTML}
    </svg>`;
  };

  const handleExecuteExport = async () => {
    if (exportFormat === 'json') {
      const exportData = {
        version: '1.0',
        groups,
        diagrams
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.download = 'chord_architect_export.json';
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
      setExportModalOpen(false);
      showToast("Fichier JSON exporté avec succès !", "success");
      return;
    }

    const list = getTargetDiagramsForExport();
    if (list.length === 0) {
      showToast("Aucun diagramme sélectionné pour l'exportation.", "error");
      return;
    }

    if (exportFormat === 'svg') {
      list.forEach((diag) => {
        const svgStr = createSVGString(diag);
        const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = `${diag.name.replace(/\s+/g, '_')}.svg`;
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
      });
      showToast("Exportation SVG terminée !", "success");
    } else if (exportFormat === 'png') {
      for (const diag of list) {
        const svgStr = createSVGString(diag);
        const img = new Image();
        const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        await new Promise((resolve) => {
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = SVG_WIDTH * 2;
            canvas.height = SVG_HEIGHT * 2;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = diagramBgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.scale(2, 2);
            ctx.drawImage(img, 0, 0);

            const a = document.createElement('a');
            a.download = `${diag.name.replace(/\s+/g, '_')}.png`;
            a.href = canvas.toDataURL('image/png');
            a.click();
            URL.revokeObjectURL(url);
            resolve();
          };
          img.src = url;
        });
      }
      showToast("Exportation PNG terminée !", "success");
    } else if (exportFormat === 'pdf') {
      if (!window.jspdf) {
        showToast('Chargement de la bibliothèque PDF en cours, veuillez réessayer.', 'error');
        return;
      }

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.setFillColor(diagramBgColor);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');

      let cols = 2, rows = 2;
      if (pdfGrid === 1) { cols = 1; rows = 1; }
      else if (pdfGrid === 2) { cols = 1; rows = 2; }
      else if (pdfGrid === 4) { cols = 2; rows = 2; }
      else if (pdfGrid === 6) { cols = 2; rows = 3; }
      else if (pdfGrid === 8) { cols = 2; rows = 4; }
      else if (pdfGrid === 12) { cols = 3; rows = 4; }

      const padding = 10;
      const cellWidth = (pageWidth - padding * (cols + 1)) / cols;
      const cellHeight = (pageHeight - padding * (rows + 1)) / rows;

      const perPage = cols * rows;

      for (let i = 0; i < list.length; i++) {
        if (i > 0 && i % perPage === 0) {
          pdf.addPage();
          pdf.setFillColor(diagramBgColor);
          pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        }

        const diag = list[i];
        const pageIdx = i % perPage;
        const colIdx = pageIdx % cols;
        const rowIdx = Math.floor(pageIdx / cols);

        const xPos = padding + colIdx * (cellWidth + padding);
        const yPos = padding + rowIdx * (cellHeight + padding);

        const svgStr = createSVGString(diag);
        const img = new Image();
        const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        await new Promise((resolve) => {
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = SVG_WIDTH * 2;
            canvas.height = SVG_HEIGHT * 2;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = diagramBgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.scale(2, 2);
            ctx.drawImage(img, 0, 0);

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            
            const aspect = SVG_WIDTH / SVG_HEIGHT;
            let drawW = cellWidth;
            let drawH = cellWidth / aspect;
            if (drawH > cellHeight) {
              drawH = cellHeight;
              drawW = cellHeight * aspect;
            }

            const offsetX = xPos + (cellWidth - drawW) / 2;
            const offsetY = yPos + (cellHeight - drawH) / 2;

            pdf.addImage(imgData, 'JPEG', offsetX, offsetY, drawW, drawH);
            URL.revokeObjectURL(url);
            resolve();
          };
          img.src = url;
        });
      }

      pdf.save(`Diagrammes_Accords_${pdfGrid}_par_page.pdf`);
      showToast("Document PDF généré avec succès !", "success");
    }

    setExportModalOpen(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.groups && parsed.diagrams) {
          setGroups(parsed.groups);
          setDiagrams(parsed.diagrams);
          const firstDiagId = Object.keys(parsed.diagrams)[0];
          if (firstDiagId) setActiveDiagramId(firstDiagId);
          const newOpen = {};
          parsed.groups.forEach(g => { newOpen[g.id] = true; });
          setOpenGroups(newOpen);
          showToast("Importation JSON réussie !", "success");
        } else {
          showToast("Format JSON invalide.", "error");
        }
      } catch (err) {
        showToast("Erreur lors de la lecture du fichier JSON.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const toggleSelectDiagramForExport = (id) => {
    setSelectedDiagramIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="h-screen w-screen bg-neutral-900 text-neutral-100 flex flex-col overflow-hidden font-sans select-none relative">
      
      <style>{`
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
        }
        input[type="range"] {
          -webkit-appearance: none;
          background: transparent;
        }
        input[type="range"]::-webkit-slider-runnable-track {
          height: 6px;
          background: #3f3f46;
          border-radius: 2px;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 14px;
          width: 14px;
          border-radius: 2px;
          background: #e5e5e5;
          margin-top: -4px;
          cursor: pointer;
          border: 1px solid #737373;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          background: #ffffff;
        }
      `}</style>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 border shadow-2xl text-xs font-semibold tracking-wide transition-all ${
          toastMessage.type === 'error' 
            ? 'bg-red-950/90 border-red-700 text-red-200' 
            : 'bg-emerald-950/90 border-emerald-700 text-emerald-200'
        }`}>
          {toastMessage.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <div className="h-16 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between px-3 md:px-5 z-25 shrink-0 relative">
        
        {/* Left Section */}
        <div className="flex items-center gap-2 md:gap-3 justify-start py-1 z-10">
          <button
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            title="Basculer le panneau gauche"
            className="p-2 bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors shrink-0"
          >
            {leftSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>

          <div className="hidden sm:flex items-center gap-2 font-bold text-base md:text-lg text-white tracking-wide shrink-0">
            <Music className="text-blue-500" size={22} />
            <span className="hidden md:inline">Chord Architect Pro</span>
          </div>
        </div>

        {/* Center Title Section */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
          {activeDiagram && (
            <div className="flex items-center gap-2 bg-neutral-900/90 px-3.5 py-1.5 border border-neutral-800 shadow-inner focus-within:border-blue-500 transition-colors rounded-none">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Titre</span>
              <div className="w-px h-4 bg-neutral-800"></div>
              <input 
                type="text" 
                value={activeDiagram.name} 
                onChange={(e) => updateActiveDiagram(d => ({ ...d, name: e.target.value }))}
                className="bg-transparent text-white text-sm md:text-base px-3 py-1 focus:outline-none w-36 md:w-60 font-semibold tracking-wide placeholder:text-neutral-600 rounded-none"
                placeholder="Nom de l'accord..."
              />
            </div>
          )}
        </div>

        {/* Right Actions Section */}
        <div className="flex items-center gap-2 md:gap-3 justify-end shrink-0 z-10">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".json" 
            className="hidden" 
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3.5 py-2 text-xs md:text-sm font-medium transition-colors border border-neutral-700 shrink-0"
          >
            <Upload size={16} />
            <span className="hidden sm:inline">Importer</span>
          </button>

          <button
            onClick={() => setExportModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-xs md:text-sm font-medium transition-colors shadow shrink-0"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Exporter</span>
          </button>
          
          <button
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            title="Basculer le panneau droit"
            className="p-2 bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors shrink-0"
          >
            {rightSidebarOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
          </button>
        </div>

      </div>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Sidebar */}
        {leftSidebarOpen && (
          <div className="w-72 bg-neutral-950 border-r border-neutral-800 flex flex-col shrink-0 z-10 absolute md:relative inset-y-0 left-0 shadow-2xl md:shadow-none">
            <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Groupes & Accords</span>
              <button
                onClick={handleAddGroup}
                className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors border border-neutral-700 shadow-sm flex items-center justify-center shrink-0"
                title="Nouveau groupe"
              >
                <FolderPlus size={16} className="text-blue-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {groups.map((group) => {
                const isOpen = openGroups[group.id];
                const isEditing = editingGroupId === group.id;

                return (
                  <div 
                    key={group.id} 
                    draggable
                    onDragStart={(e) => handleDragStartGroup(e, group.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, group.id, 'group')}
                    className="bg-neutral-900/50 border border-neutral-800/80 overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-2 hover:bg-neutral-800/50 cursor-pointer text-sm font-medium">
                      <div className="flex items-center gap-2 overflow-hidden flex-1" onClick={() => toggleGroupOpen(group.id)}>
                        <GripVertical size={14} className="text-neutral-600 cursor-grab shrink-0" />
                        <button className="text-neutral-400 hover:text-white">
                          {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                        </button>
                        {isOpen ? <FolderOpen size={16} className="text-blue-400 shrink-0" /> : <Folder size={16} className="text-neutral-500 shrink-0" />}
                        {isEditing ? (
                          <input
                            type="text"
                            autoFocus
                            value={editingGroupTitle}
                            onChange={(e) => setEditingGroupTitle(e.target.value)}
                            onBlur={() => {
                              setGroups(prev => prev.map(g => g.id === group.id ? { ...g, name: editingGroupTitle } : g));
                              setEditingGroupId(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setGroups(prev => prev.map(g => g.id === group.id ? { ...g, name: editingGroupTitle } : g));
                                setEditingGroupId(null);
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-neutral-800 text-white text-xs px-3 py-1.5 border border-neutral-700 w-full rounded-none"
                          />
                        ) : (
                          <span className="truncate text-neutral-200">{group.name}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingGroupId(group.id);
                            setEditingGroupTitle(group.name);
                          }}
                          className="p-1 hover:text-blue-400 text-neutral-500"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={(e) => handleAddDiagramToGroup(group.id, e)}
                          className="p-1 hover:text-green-400 text-neutral-500"
                          title="Ajouter un accord"
                        >
                          <Plus size={14} />
                        </button>
                        {groups.length > 1 && (
                          <button
                            onClick={(e) => handleDeleteGroup(group.id, e)}
                            className="p-1 hover:text-red-400 text-neutral-500"
                            title="Supprimer le groupe"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {isOpen && (
                      <div 
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, group.id, 'group')}
                        className="pl-4 pr-1 py-1 space-y-0.5 border-t border-neutral-800/40 bg-neutral-950/40 min-h-[30px]"
                      >
                        {group.diagramIds.map((dId) => {
                          const diag = diagrams[dId];
                          if (!diag) return null;
                          const isActive = activeDiagramId === dId;

                          return (
                            <div
                              key={dId}
                              draggable
                              onDragStart={(e) => handleDragStartDiagram(e, dId, group.id)}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, dId, 'diagram')}
                              onClick={() => {
                                setActiveDiagramId(dId);
                                if (window.innerWidth < 768) setLeftSidebarOpen(false);
                              }}
                              className={`flex items-center justify-between px-2.5 py-1.5 text-xs cursor-pointer transition-colors group ${
                                isActive 
                                  ? 'bg-blue-600/20 text-blue-300 font-semibold border border-blue-500/30' 
                                  : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-200'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <GripVertical size={12} className="text-neutral-600 cursor-grab shrink-0" />
                                <span className="truncate">{diag.name}</span>
                              </div>
                              <button
                                onClick={(e) => handleDeleteDiagram(dId, e)}
                                className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-0.5 transition-opacity"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Center Main Canvas Area */}
        <div className="flex-1 bg-neutral-900 flex flex-col items-center justify-center p-4 md:p-6 pb-24 overflow-auto relative">
          {activeDiagram ? (
            <div className="relative shadow-2xl border border-neutral-800 overflow-hidden max-w-full">
              {renderDiagramSVG(activeDiagram)}
            </div>
          ) : (
            <div className="w-[480px] max-w-full h-[680px] flex flex-col items-center justify-center bg-neutral-950 text-neutral-500 border border-neutral-800 p-6 text-center">
              <Music size={48} className="mb-2 opacity-40" />
              <p>Sélectionnez ou créez un accord pour commencer</p>
            </div>
          )}

          {/* Floating Toolbar */}
          {activeDiagram && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-neutral-950/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-neutral-700/80 shadow-2xl">
              <ToolButton icon={<MousePointer2 size={18} />} label="Pointeur" shortcutKey="P" isActive={activeTool === 'pointer'} onClick={() => setActiveTool('pointer')} />
              <ToolButton icon={<Circle size={18} />} label="Note / Fondamentale" shortcutKey="N" isActive={activeTool === 'note'} onClick={() => setActiveTool('note')} />
              <ToolButton icon={<Type size={18} />} label="Texte Libre" shortcutKey="T" isActive={activeTool === 'text'} onClick={() => setActiveTool('text')} />
              <div className="w-px h-6 bg-neutral-800 mx-1"></div>
              <ToolButton icon={<Eraser size={18} />} label="Gomme" shortcutKey="G" isActive={activeTool === 'eraser'} onClick={() => setActiveTool('eraser')} />
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        {rightSidebarOpen && (
          <div className="w-80 bg-neutral-950 border-l border-neutral-800 flex flex-col shrink-0 z-10 absolute md:relative inset-y-0 right-0 shadow-2xl md:shadow-none overflow-y-auto p-4 space-y-6">
            
            {/* Start Fret Section */}
            {activeDiagram && (
              <div className="space-y-3 bg-neutral-900/60 p-3 rounded-none border border-neutral-800">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Case de départ (Fret)
                </h3>
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center w-36 bg-neutral-800 rounded-none border border-neutral-700 overflow-hidden focus-within:border-blue-500">
                    <input 
                      type="number" 
                      min="1"
                      max="24"
                      value={activeDiagram.startFret || 1} 
                      onChange={(e) => {
                        const newFret = Math.max(1, Math.min(24, parseInt(e.target.value) || 1));
                        updateActiveDiagram(d => ({ ...d, startFret: newFret }));
                      }}
                      className="w-full bg-transparent text-white text-sm px-3.5 py-2.5 focus:outline-none font-bold text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none rounded-none"
                    />
                    <div className="flex flex-col border-l border-neutral-700 bg-neutral-900 rounded-none">
                      <button 
                        type="button" 
                        onClick={() => {
                          const current = activeDiagram.startFret || 1;
                          if (current < 24) updateActiveDiagram(d => ({ ...d, startFret: current + 1 }));
                        }}
                        className="px-2.5 py-1 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors text-[10px] leading-none rounded-none"
                        title="Incrémenter"
                      >
                        ▲
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          const current = activeDiagram.startFret || 1;
                          if (current > 1) updateActiveDiagram(d => ({ ...d, startFret: current - 1 }));
                        }}
                        className="px-2.5 py-1 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors text-[10px] leading-none border-t border-neutral-800 rounded-none"
                        title="Décrémenter"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                  <span className="text-xs text-neutral-400 font-medium">Sillet</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                <Edit2 size={14} /> Doigtés & Cordes à Vide
              </h3>
              <div className="grid grid-cols-6 gap-2">
                {['E', 'A', 'D', 'G', 'B', 'e'].map((stringLabel, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <span className="text-xs text-neutral-400 font-mono">{stringLabel}</span>
                    <input
                      type="text"
                      maxLength={2}
                      value={activeDiagram?.fingerings[idx] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateActiveDiagram(d => ({
                          ...d,
                          fingerings: { ...d.fingerings, [idx]: val }
                        }));
                      }}
                      className="w-full text-center bg-neutral-900 border border-neutral-800 rounded-none px-2.5 py-2.5 text-sm font-semibold text-blue-400 focus:outline-none focus:border-blue-500"
                      placeholder="-"
                    />
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-neutral-500 italic">0 = Corde à vide (○), X = Non jouée (×)</p>
            </div>

            <div className="w-full h-px bg-neutral-800"></div>

            {/* Bottom Indicator Selector Section */}
            <div className="space-y-3 bg-neutral-900/60 p-3 rounded-none border border-neutral-800">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Indicateurs sous la touche
              </h3>
              <select
                value={bottomIndicatorType}
                onChange={(e) => setBottomIndicatorType(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-none px-3 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="notes">Note</option>
                <option value="fingerings">Doigtés Personnalisés</option>
                <option value="intervals">Intervals / Degrés</option>
                <option value="none">Aucun</option>
              </select>
            </div>

            <div className="w-full h-px bg-neutral-800"></div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                <Palette size={14} /> Style du Diagramme
              </h3>

              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-300">Couleur de fond</span>
                <label className="flex items-center gap-2 cursor-pointer bg-neutral-900 border border-neutral-700 hover:border-neutral-500 px-3 py-1.5 transition-colors">
                  <span className="w-4 h-4 rounded-full border border-neutral-600 shadow-inner" style={{ backgroundColor: diagramBgColor }}></span>
                  <span className="text-[11px] font-mono text-neutral-300">{diagramBgColor}</span>
                  <input
                    type="color"
                    value={diagramBgColor}
                    onChange={(e) => setDiagramBgColor(e.target.value)}
                    className="sr-only"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-300">Couleur du sillet</span>
                <label className="flex items-center gap-2 cursor-pointer bg-neutral-900 border border-neutral-700 hover:border-neutral-500 px-3 py-1.5 transition-colors">
                  <span className="w-4 h-4 rounded-full border border-neutral-600 shadow-inner" style={{ backgroundColor: nutColor }}></span>
                  <span className="text-[11px] font-mono text-neutral-300">{nutColor}</span>
                  <input
                    type="color"
                    value={nutColor}
                    onChange={(e) => setNutColor(e.target.value)}
                    className="sr-only"
                  />
                </label>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-neutral-300">Sillet de tête (Épaisseur & Opacité)</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="range"
                    min="2"
                    max="16"
                    value={nutThickness}
                    onChange={(e) => setNutThickness(Number(e.target.value))}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={nutOpacity}
                    onChange={(e) => setNutOpacity(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-neutral-300">Cordes (Épaisseur & Opacité)</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={stringThicknessBase}
                    onChange={(e) => setStringThicknessBase(Number(e.target.value))}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={stringOpacity}
                    onChange={(e) => setStringOpacity(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-neutral-300">Frettes (Épaisseur & Opacité)</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={fretThickness}
                    onChange={(e) => setFretThickness(Number(e.target.value))}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={fretOpacity}
                    onChange={(e) => setFretOpacity(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-neutral-800"></div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Numéros de cases</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showFretNumbers}
                    onChange={(e) => setShowFretNumbers(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {showFretNumbers && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-300">Couleur du texte</span>
                    <label className="flex items-center gap-2 cursor-pointer bg-neutral-900 border border-neutral-700 hover:border-neutral-500 px-3 py-1.5 transition-colors">
                      <span className="w-4 h-4 rounded-full border border-neutral-600 shadow-inner" style={{ backgroundColor: fretNumberColor }}></span>
                      <span className="text-[11px] font-mono text-neutral-300">{fretNumberColor}</span>
                      <input
                        type="color"
                        value={fretNumberColor}
                        onChange={(e) => setFretNumberColor(e.target.value)}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-neutral-300">Taille de police ({fretNumberSize}px)</span>
                    <input
                      type="range"
                      min="12"
                      max="28"
                      value={fretNumberSize}
                      onChange={(e) => setFretNumberSize(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Export Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Download size={20} className="text-blue-500" />
                <span>Exporter les Diagrammes</span>
              </h2>
              <button
                onClick={() => setExportModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Format d'export</label>
                <div className="grid grid-cols-4 gap-2">
                  {['json', 'png', 'svg', 'pdf'].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setExportFormat(fmt)}
                      className={`py-2 px-2 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-colors ${
                        exportFormat === fmt
                          ? 'bg-blue-600 border-blue-500 text-white shadow'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {exportFormat === 'json' && (
                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-xs text-neutral-400">
                  L'exportation en JSON sauvegarde l'intégralité de vos groupes, de vos accords, de leurs positions et de leurs paramètres de personnalisation dans un fichier unique.
                </div>
              )}

              {exportFormat === 'pdf' && (
                <div className="space-y-2 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Disposition PDF (par page A4)</label>
                  <select
                    value={pdfGrid}
                    onChange={(e) => setPdfGrid(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value={1}>1 diagramme par page</option>
                    <option value={2}>2 diagrammes par page</option>
                    <option value={4}>4 diagrammes par page (Grid 2x2)</option>
                    <option value={6}>6 diagrammes par page (Grid 2x3)</option>
                    <option value={8}>8 diagrammes par page (Grid 2x4)</option>
                    <option value={12}>12 diagrammes par page (Grid 3x4)</option>
                  </select>
                </div>
              )}

              {exportFormat !== 'json' && (
                <>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Périmètre</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2.5 text-sm text-neutral-200 cursor-pointer">
                        <input
                          type="radio"
                          name="scope"
                          value="all"
                          checked={exportScope === 'all'}
                          onChange={() => setExportScope('all')}
                          className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span>Tous les diagrammes ({Object.keys(diagrams).length})</span>
                      </label>

                      <label className="flex items-center gap-2.5 text-sm text-neutral-200 cursor-pointer">
                        <input
                          type="radio"
                          name="scope"
                          value="group"
                          checked={exportScope === 'group'}
                          onChange={() => setExportScope('group')}
                          className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span>Un groupe spécifique</span>
                      </label>

                      {exportScope === 'group' && (
                        <select
                          value={selectedGroupForExport}
                          onChange={(e) => setSelectedGroupForExport(e.target.value)}
                          className="w-full ml-6 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-blue-500 font-medium"
                        >
                          {groups.map(g => (
                            <option key={g.id} value={g.id}>{g.name} ({g.diagramIds.length} accords)</option>
                          ))}
                        </select>
                      )}

                      <label className="flex items-center gap-2.5 text-sm text-neutral-200 cursor-pointer">
                        <input
                          type="radio"
                          name="scope"
                          value="custom"
                          checked={exportScope === 'custom'}
                          onChange={() => setExportScope('custom')}
                          className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span>Sélection personnalisée</span>
                      </label>
                    </div>
                  </div>

                  {exportScope === 'custom' && (
                    <div className="max-h-48 overflow-y-auto bg-neutral-950 rounded-xl border border-neutral-800 p-2 space-y-1">
                      {Object.values(diagrams).map((d) => {
                        const isChecked = selectedDiagramIds.has(d.id);
                        return (
                          <div
                            key={d.id}
                            onClick={() => toggleSelectDiagramForExport(d.id)}
                            className="flex items-center gap-2 p-1.5 hover:bg-neutral-900 rounded-lg cursor-pointer text-xs text-neutral-300"
                          >
                            {isChecked ? <CheckSquare size={16} className="text-blue-500" /> : <Square size={16} className="text-neutral-600" />}
                            <span>{d.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

            </div>

            <div className="p-4 border-t border-neutral-800 flex items-center justify-end gap-3 bg-neutral-950/50">
              <button
                onClick={() => setExportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-400 hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleExecuteExport}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow transition-colors"
              >
                {exportFormat === 'json' ? 'Télécharger JSON' : 'Télécharger'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}