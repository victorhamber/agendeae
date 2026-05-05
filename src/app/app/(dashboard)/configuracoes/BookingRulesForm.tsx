'use client';

import { useState } from 'react';
import { saveBookingRules } from '@/app/actions/bookingRules';

type Rules = {
  minAdvanceHours: number;
  maxAdvanceDays: number;
  allowCancellation: boolean;
  cancellationDeadlineHours: number;
  allowReschedule: boolean;
  rescheduleDeadlineHours: number;
  allowAnyProfessional: boolean;
};

const defaults: Rules = {
  minAdvanceHours: 60,
  maxAdvanceDays: 60,
  allowCancellation: true,
  cancellationDeadlineHours: 6,
  allowReschedule: true,
  rescheduleDeadlineHours: 12,
  allowAnyProfessional: true,
};

export default function BookingRulesForm({ rules }: { rules: Rules | null }) {
  const data = rules || defaults;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    try {
      const formData = new FormData(e.currentTarget);
      await saveBookingRules(formData);
      setMessage('Regras salvas com sucesso!');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao salvar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {message && (
        <div style={{
          padding: '0.75rem',
          borderRadius: 'var(--radius)',
          marginBottom: '1rem',
          fontSize: '0.875rem',
          backgroundColor: message.includes('sucesso') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          color: message.includes('sucesso') ? 'var(--success)' : 'var(--danger)',
        }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {/* Antecedência */}
        <div className="grid-2-col">
          <div>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>
              Antecedência Mínima (minutos)
            </label>
            <input
              name="minAdvanceHours"
              type="number"
              min="0"
              className="input"
              defaultValue={data.minAdvanceHours}
              aria-label="Antecedência mínima em minutos"
            />
            <p style={{ color: 'var(--muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              Ex: 60 = cliente não pode agendar com menos de 1h de antecedência
            </p>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>
              Antecedência Máxima (dias)
            </label>
            <input
              name="maxAdvanceDays"
              type="number"
              min="1"
              className="input"
              defaultValue={data.maxAdvanceDays}
              aria-label="Antecedência máxima em dias"
            />
            <p style={{ color: 'var(--muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              Ex: 60 = cliente pode agendar até 60 dias no futuro
            </p>
          </div>
        </div>

        {/* Cancelamento */}
        <div style={{ padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500, marginBottom: '0.75rem' }}>
            <input type="checkbox" name="allowCancellation" defaultChecked={data.allowCancellation} />
            Permitir cancelamento pelo cliente
          </label>
          <div>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Prazo mínimo para cancelar (horas antes)
            </label>
            <input
              name="cancellationDeadlineHours"
              type="number"
              min="0"
              className="input"
              defaultValue={data.cancellationDeadlineHours}
              style={{ maxWidth: '200px' }}
              aria-label="Prazo mínimo para cancelar em horas"
            />
            <p style={{ color: 'var(--muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              Ex: 6 = cliente pode cancelar até 6h antes do horário
            </p>
          </div>
        </div>

        {/* Reagendamento */}
        <div style={{ padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500, marginBottom: '0.75rem' }}>
            <input type="checkbox" name="allowReschedule" defaultChecked={data.allowReschedule} />
            Permitir reagendamento pelo cliente
          </label>
          <div>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Prazo mínimo para reagendar (horas antes)
            </label>
            <input
              name="rescheduleDeadlineHours"
              type="number"
              min="0"
              className="input"
              defaultValue={data.rescheduleDeadlineHours}
              style={{ maxWidth: '200px' }}
              aria-label="Prazo mínimo para reagendar em horas"
            />
          </div>
        </div>

        {/* Qualquer profissional */}
        <div style={{ padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
            <input type="checkbox" name="allowAnyProfessional" defaultChecked={data.allowAnyProfessional} />
            Exibir opção &quot;Qualquer Profissional&quot; na página pública
          </label>
          <p style={{ color: 'var(--muted)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
            O cliente poderá escolher &quot;Qualquer Disponível&quot; em vez de um profissional específico.
          </p>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar Regras de Agendamento'}
        </button>
      </div>
    </form>
  );
}
