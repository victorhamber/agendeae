export type AgendaThemeKey =
  | 'gold'
  | 'amber'
  | 'orange'
  | 'rose'
  | 'red'
  | 'pink'
  | 'purple'
  | 'indigo'
  | 'blue'
  | 'cyan'
  | 'teal'
  | 'green'
  | 'lime'
  | 'zinc';

/** Mapeia a cor primária salva pela empresa para um preset de tema da agenda pública. */
export function resolveAgendaThemeKey(primaryColor: string | null | undefined): AgendaThemeKey {
  const raw = (primaryColor || '').trim().toLowerCase();
  const hex = raw.startsWith('#') ? raw.slice(1) : raw;
  if (hex.length !== 6 || !/^[0-9a-f]{6}$/.test(hex)) {
    return 'gold';
  }
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  const hue = h * 360;
  const s = max === 0 ? 0 : d / max;

  if (s < 0.12) {
    return 'zinc';
  }
  if (hue < 18 || hue >= 345) return 'red';
  if (hue < 40) return 'orange';
  if (hue < 55) return 'amber';
  if (hue < 75) return 'gold';
  if (hue < 95) return 'lime';
  if (hue < 150) return 'green';
  if (hue < 175) return 'teal';
  if (hue < 200) return 'cyan';
  if (hue < 230) return 'blue';
  if (hue < 260) return 'indigo';
  if (hue < 285) return 'purple';
  if (hue < 320) return 'pink';
  if (hue < 345) return 'rose';
  return 'gold';
}
