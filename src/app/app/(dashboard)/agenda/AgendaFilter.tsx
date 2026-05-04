'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import styles from '../../app.module.css';

const FILTERS = [
  { key: 'hoje', label: 'Hoje' },
  { key: 'amanha', label: 'Amanhã' },
  { key: 'semana', label: 'Esta Semana' },
  { key: 'mes', label: 'Este Mês' },
  { key: 'custom', label: 'Personalizado' },
];

export default function AgendaFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get('filtro') || 'hoje';
  const customFrom = searchParams.get('de') || '';
  const customTo = searchParams.get('ate') || '';

  const [dateFrom, setDateFrom] = useState(customFrom);
  const [dateTo, setDateTo] = useState(customTo);

  const showCustom = currentFilter === 'custom';

  useEffect(() => {
    setDateFrom(customFrom);
    setDateTo(customTo);
  }, [customFrom, customTo]);

  const buildQuery = useMemo(() => {
    return (next: { filtro: string; de?: string; ate?: string }) => {
      const params = new URLSearchParams();
      params.set('filtro', next.filtro);
      if (next.filtro === 'custom') {
        if (next.de) params.set('de', next.de);
        if (next.ate) params.set('ate', next.ate);
      }
      return `${pathname}?${params.toString()}`;
    };
  }, [pathname]);

  const applyFilter = (key: string) => {
    if (key === 'custom') {
      router.push(buildQuery({ filtro: 'custom', de: customFrom || undefined, ate: customTo || undefined }));
      return;
    }
    router.push(buildQuery({ filtro: key }));
  };

  const applyCustomRange = () => {
    if (!dateFrom || !dateTo) return;
    router.push(buildQuery({ filtro: 'custom', de: dateFrom, ate: dateTo }));
  };

  return (
    <div className={styles.agendaFilter}>
      <div className={styles.agendaFilterPills}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => applyFilter(f.key)}
            className={`${styles.agendaFilterPill} ${currentFilter === f.key ? styles.agendaFilterPillActive : ''}`}
            type="button"
          >
            {f.label}
          </button>
        ))}
      </div>

      {showCustom && (
        <div className={styles.agendaFilterCustom}>
          <div>
            <label htmlFor="agenda-filter-de" className={styles.agendaFilterFieldLabel}>De</label>
            <input 
              id="agenda-filter-de"
              type="date" 
              className={`input ${styles.agendaFilterDateInput}`}
              value={dateFrom} 
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="agenda-filter-ate" className={styles.agendaFilterFieldLabel}>Até</label>
            <input 
              id="agenda-filter-ate"
              type="date" 
              className={`input ${styles.agendaFilterDateInput}`}
              value={dateTo} 
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <button 
            onClick={applyCustomRange}
            type="button"
            className={`btn-primary ${styles.agendaFilterBuscarBtn}`}
          >
            Buscar
          </button>
        </div>
      )}
    </div>
  );
}
