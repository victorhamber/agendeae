'use client';

import { useState } from 'react';
import { updateAppointmentStatus } from '@/app/actions/appointments';

const statusLabels: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Concluído',
  NO_SHOW: 'Faltou',
  CANCELLED: 'Cancelado'
};

const statusColors: Record<string, string> = {
  PENDING: '#FBBF24',
  CONFIRMED: 'var(--primary)',
  COMPLETED: 'var(--success)',
  NO_SHOW: '#F97316',
  CANCELLED: 'var(--danger)'
};

export default function StatusSelect({ appointmentId, currentStatus }: { appointmentId: string, currentStatus: string }) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Estados finais — não podem ser alterados
  const isLocked = ['COMPLETED', 'CANCELLED'].includes(currentStatus);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (newStatus === currentStatus) return;
    
    setIsUpdating(true);
    try {
      await updateAppointmentStatus(appointmentId, newStatus);
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar status.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLocked) {
    return (
      <span style={{
        padding: '0.35rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.8rem',
        fontWeight: 600,
        backgroundColor: currentStatus === 'COMPLETED' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
        color: statusColors[currentStatus]
      }}>
        {statusLabels[currentStatus]} ✓
      </span>
    );
  }

  return (
    <select 
      value={currentStatus} 
      onChange={handleStatusChange} 
      disabled={isUpdating}
      className="input"
      style={{ padding: '0.5rem', width: 'auto', borderColor: statusColors[currentStatus] }}
    >
      <option value="PENDING">Pendente</option>
      <option value="CONFIRMED">Confirmado</option>
      <option value="COMPLETED">Concluído</option>
      <option value="NO_SHOW">Faltou</option>
      <option value="CANCELLED">Cancelado</option>
    </select>
  );
}
