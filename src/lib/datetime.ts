import { DateTime } from 'luxon';

export const DEFAULT_COMPANY_TIMEZONE = 'America/Sao_Paulo';

export function safeTz(tz: string | null | undefined) {
  const value = (tz ?? '').trim();
  return value || DEFAULT_COMPANY_TIMEZONE;
}

/** Converte YYYY-MM-DD em Date (UTC) correspondente ao início do dia no timezone informado. */
export function ymdToUtcDate(ymd: string, tz: string) {
  const dt = DateTime.fromISO(ymd, { zone: tz }).startOf('day');
  if (!dt.isValid) throw new Error('Data inválida');
  return dt.toUTC().toJSDate();
}

export function ymdToUtcRange(ymd: string, tz: string) {
  const start = DateTime.fromISO(ymd, { zone: tz }).startOf('day');
  if (!start.isValid) throw new Error('Data inválida');
  const end = start.endOf('day');
  return { startUtc: start.toUTC().toJSDate(), endUtc: end.toUTC().toJSDate() };
}

/** Dia da semana no padrão do schema: 0=Domingo ... 6=Sábado, respeitando timezone. */
export function ymdToDayOfWeek(ymd: string, tz: string) {
  const dt = DateTime.fromISO(ymd, { zone: tz }).startOf('day');
  if (!dt.isValid) throw new Error('Data inválida');
  // Luxon weekday: 1=Mon..7=Sun → schema: 0=Sun..6=Sat
  return dt.weekday % 7;
}

export function formatMonthYearPtBr(ymd: string, tz: string) {
  const dt = DateTime.fromISO(ymd, { zone: tz });
  if (!dt.isValid) return '';
  return dt.setLocale('pt-BR').toFormat('LLLL yyyy');
}

