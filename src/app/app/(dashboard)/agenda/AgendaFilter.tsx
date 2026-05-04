'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

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
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => applyFilter(f.key)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              border: currentFilter === f.key ? '2px solid var(--primary)' : '1px solid var(--border)',
              backgroundColor: currentFilter === f.key ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: currentFilter === f.key ? 'var(--primary)' : 'var(--muted)',
              fontWeight: currentFilter === f.key ? 600 : 400,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {showCustom && (
        <div style={{ 
          display: 'flex', gap: '0.75rem', alignItems: 'flex-end', marginTop: '1rem',
          padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.02)'
        }}>
          <div>
            <label htmlFor="agenda-filter-de" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>De</label>
            <input 
              id="agenda-filter-de"
              type="date" 
              className="input" 
              value={dateFrom} 
              onChange={(e) => setDateFrom(e.target.value)}
              style={{ padding: '0.5rem', fontSize: '0.875rem' }}
            />
          </div>
          <div>
            <label htmlFor="agenda-filter-ate" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Até</label>
            <input 
              id="agenda-filter-ate"
              type="date" 
              className="input" 
              value={dateTo} 
              onChange={(e) => setDateTo(e.target.value)}
              style={{ padding: '0.5rem', fontSize: '0.875rem' }}
            />
          </div>
          <button 
            className="btn-primary" 
            onClick={applyCustomRange}
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
          >
            Buscar
          </button>
        </div>
      )}
    </div>
  );
}
