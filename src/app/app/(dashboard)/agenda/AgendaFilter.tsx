'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';

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

  const [showCustom, setShowCustom] = useState(currentFilter === 'custom');
  const [dateFrom, setDateFrom] = useState(customFrom);
  const [dateTo, setDateTo] = useState(customTo);

  const applyFilter = (key: string) => {
    if (key === 'custom') {
      setShowCustom(true);
      return;
    }
    setShowCustom(false);
    router.push(`${pathname}?filtro=${key}`);
  };

  const applyCustomRange = () => {
    if (!dateFrom || !dateTo) return;
    router.push(`${pathname}?filtro=custom&de=${dateFrom}&ate=${dateTo}`);
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
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>De</label>
            <input 
              type="date" 
              className="input" 
              value={dateFrom} 
              onChange={(e) => setDateFrom(e.target.value)}
              style={{ padding: '0.5rem', fontSize: '0.875rem' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Até</label>
            <input 
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
