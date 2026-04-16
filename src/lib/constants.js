export const CLUSTER_COLORS = {
  'Digitale Kultur & Befähigung': 'var(--status-blue)',
  'Infrastruktur & Beschaffung': 'var(--status-green)',
  'Kommunikation & Transparenz': 'var(--status-yellow)',
  'Prozesse & Methoden': '#9B59B6',
  'Strategie & Steuerung': '#EA515A',
  'Daten & Wissen': '#1ABC9C',
};

export const CLUSTER_OPTIONS = Object.keys(CLUSTER_COLORS);

export const PRIO_ORDER = { A: 0, B: 1, C: 2, D: 3 };
export const PRIO_LABEL = { A: 'Quick Win', B: 'Strategisch', C: 'Mittelfristig', D: 'Langfristig' };
export const PRIO_OPTIONS = ['A', 'B', 'C', 'D'];

export const STATUS_OPTIONS = ['geplant', 'in_umsetzung', 'blockiert', 'abgeschlossen', 'sistiert'];
export const STATUS_LABELS = {
  geplant: 'Backlog',
  in_umsetzung: 'In Bearbeitung',
  blockiert: 'Blockiert',
  abgeschlossen: 'Erledigt',
  sistiert: 'Sistiert',
};
export const STATUS_COLORS = {
  geplant: 'bg-bg-elevated text-txt-secondary',
  in_umsetzung: 'bg-status-green/15 text-status-green',
  blockiert: 'bg-status-yellow/15 text-status-yellow',
  abgeschlossen: 'bg-scnat-teal/15 text-scnat-teal',
  sistiert: 'bg-scnat-red/15 text-scnat-red',
};

export const KANBAN_COLUMNS = [
  { id: 'geplant', label: 'Backlog', desc: 'Alle geplanten Massnahmen', borderClass: 'border-txt-tertiary/40' },
  { id: 'in_umsetzung', label: 'In Bearbeitung', desc: 'Aktiv in Umsetzung', borderClass: 'border-status-green' },
  { id: 'blockiert', label: 'Blockiert', desc: 'Braucht Entscheid / Freigabe', borderClass: 'border-status-yellow' },
  { id: 'abgeschlossen', label: 'Erledigt', desc: 'Abgenommen & dokumentiert', borderClass: 'border-scnat-teal' },
  { id: 'sistiert', label: 'Sistiert', desc: 'Zurückgestellt', borderClass: 'border-scnat-red' },
];

export const TAG_OPTIONS = ['Schulungen', 'Befähigungen', 'Beschaffung', 'Information & Transparenz', 'Kommunikation'];
