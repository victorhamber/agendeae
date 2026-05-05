'use client';

import { useState } from 'react';
import { createBlockedTime, deleteBlockedTime } from '@/app/actions/blockedTimes';
import styles from '../../../app.module.css';

type BlockedTime = {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  reason: string | null;
};

export default function BlockedTimesForm({ 
  professionalId, 
  blockedTimes 
}: { 
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
    <div className={`glass ${styles.blockedTimesSection}`}>
      <h2 className={styles.blockedTimesTitle}>Bloqueios de Horário</h2>
      <p className={styles.blockedTimesLead}>
        Bloqueie datas ou horários específicos (folga, feriado, compromisso pessoal, etc.).
      </p>

      <div className={styles.blockedTimesAddPanel}>
        <div>
          <label className={styles.blockedTimesFieldLabel} htmlFor="blocked-date">Data</label>
          <input
            id="blocked-date"
            type="date"
            className={`input ${styles.blockedTimesInput}`}
            value={dateStr}
            onChange={e => setDateStr(e.target.value)}
            aria-label="Data do bloqueio"
          />
        </div>
        <div>
          <label className={styles.blockedTimesFieldLabel} htmlFor="blocked-start">Início</label>
          <input
            id="blocked-start"
            type="time"
            className={`input ${styles.blockedTimesInput}`}
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            aria-label="Horário de início do bloqueio"
          />
        </div>
        <div>
          <label className={styles.blockedTimesFieldLabel} htmlFor="blocked-end">Fim</label>
          <input
            id="blocked-end"
            type="time"
            className={`input ${styles.blockedTimesInput}`}
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
            aria-label="Horário de fim do bloqueio"
          />
        </div>
        <div className={styles.blockedTimesReasonGrow}>
          <label className={styles.blockedTimesFieldLabel} htmlFor="blocked-reason">Motivo (opcional)</label>
          <input
            id="blocked-reason"
            type="text"
            className={`input ${styles.blockedTimesInput}`}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Ex: Feriado, Folga..."
          />
        </div>
        <button
          type="button"
          className={`btn-primary ${styles.blockedTimesAddButton}`}
          onClick={handleAdd}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Salvando...' : '+ Bloquear'}
        </button>
      </div>

      {blockedTimes.length === 0 ? (
        <p className={styles.blockedTimesEmpty}>Nenhum bloqueio configurado.</p>
      ) : (
        <div className="table-responsive">
          <table className={styles.blockedTimesTable}>
            <thead>
              <tr className={styles.blockedTimesTheadRow}>
                <th className={styles.blockedTimesTh}>Data</th>
                <th className={styles.blockedTimesTh}>Horário</th>
                <th className={styles.blockedTimesTh}>Motivo</th>
                <th className={styles.blockedTimesThRight}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {blockedTimes.map(bt => (
                <tr key={bt.id} className={styles.blockedTimesTbodyRow}>
                  <td className={styles.blockedTimesTd}>{new Date(bt.date).toLocaleDateString('pt-BR')}</td>
                  <td className={styles.blockedTimesTd}>{bt.startTime} - {bt.endTime}</td>
                  <td className={`${styles.blockedTimesTd} ${styles.blockedTimesTdMuted}`}>{bt.reason || '—'}</td>
                  <td className={styles.blockedTimesTdRight}>
                    <button 
                      type="button"
                      onClick={() => handleDelete(bt.id)} 
                      disabled={deletingId === bt.id}
                      className={styles.blockedTimesDeleteBtn}
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
