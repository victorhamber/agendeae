import styles from './agenda.module.css';
import { resolveAgendaThemeKey, type AgendaThemeKey } from '@/lib/resolveAgendaThemeKey';

const THEME_CLASS_MAP: Record<AgendaThemeKey, string> = {
  gold: styles.themeGold,
  amber: styles.themeAmber,
  orange: styles.themeOrange,
  rose: styles.themeRose,
  red: styles.themeRed,
  pink: styles.themePink,
  purple: styles.themePurple,
  indigo: styles.themeIndigo,
  blue: styles.themeBlue,
  cyan: styles.themeCyan,
  teal: styles.themeTeal,
  green: styles.themeGreen,
  lime: styles.themeLime,
  zinc: styles.themeZinc,
};

export function getAgendaThemeClass(primaryColor: string | null | undefined): string {
  return THEME_CLASS_MAP[resolveAgendaThemeKey(primaryColor)];
}
