'use client';

import { useState } from 'react';
import { createBlockedTime, deleteBlockedTime } from '@/app/actions/blockedTimes';

type BlockedTime = {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  reason: string | null;
};

export default function BlockedTimesForm({ 
  companyId, 
  professionalId, 
  blockedTimes 
}: { 
  companyId: string; 
  professionalId: string; 
  blockedTimes: BlockedTime[];
}) {
  const [dateStr, setDateStr] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!dateStr || !startTime || !endTime) return;
    setIsSubmitting(true);
    try {
      await createBlockedTime({
        companyId,
        professionalId,
        dateStr,
        startTime,
        endTime,
        reason: reason || undefined
      });
      setDateStr('');
      setReason('');
    } catch (error) {
      console.error(error);
      alert('Erro ao adicionar bloqueio.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este bloqueio?')) return;
    setDeletingId(id);
    try {
      await deleteBlockedTime(id, professionalId);
    } catch (error) {
      console.error(error);
      alert('Erro ao remover bloqueio.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', marginTop: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Bloqueios de Horário</h2>
      <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        Bloqueie datas ou horários específicos (folga, feriado, compromisso pessoal, etc.).
      </p>

      {/* Formulário para adicionar */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '1.5rem', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Data</label>
          <input type="date" className="input" value={dateStr} onChange={e => setDateStr(e.target.value)} style={{ padding: '0.5rem' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Início</label>
          <input type="time" className="input" value={startTime} onChange={e => setStartTime(e.target.value)} style={{ padding: '0.5rem' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Fim</label>
          <input type="time" className="input" value={endTime} onChange={e => setEndTime(e.target.value)} style={{ padding: '0.5rem' }} />
        </div>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Motivo (opcional)</label>
          <input type="text" className="input" value={reason} onChange={e => setReason(e.target.value)} placeholder="Ex: Feriado, Folga..." style={{ padding: '0.5rem' }} />
        </div>
        <button className="btn-primary" onClick={handleAdd} disabled={isSubmitting} style={{ padding: '0.5rem 1.25rem', whiteSpace: 'nowrap' }}>
          {isSubmitting ? 'Salvando...' : '+ Bloquear'}
        </button>
      </div>

      {/* Lista de bloqueios */}
      {blockedTimes.length === 0 ? (
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>
          Nenhum bloqueio configurado.
        </p>
      ) : (
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                <th style={{ padding: '0.5rem 0', textAlign: 'left', fontWeight: 500 }}>Data</th>
                <th style={{ padding: '0.5rem 0', textAlign: 'left', fontWeight: 500 }}>Horário</th>
                <th style={{ padding: '0.5rem 0', textAlign: 'left', fontWeight: 500 }}>Motivo</th>
                <th style={{ padding: '0.5rem 0', textAlign: 'right', fontWeight: 500 }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {blockedTimes.map(bt => (
                <tr key={bt.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem 0' }}>{new Date(bt.date).toLocaleDateString('pt-BR')}</td>
                  <td style={{ padding: '0.75rem 0' }}>{bt.startTime} - {bt.endTime}</td>
                  <td style={{ padding: '0.75rem 0', color: 'var(--muted)' }}>{bt.reason || '—'}</td>
                  <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDelete(bt.id)} 
                      disabled={deletingId === bt.id}
                      style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                    >
                      {deletingId === bt.id ? 'Removendo...' : 'Remover'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
