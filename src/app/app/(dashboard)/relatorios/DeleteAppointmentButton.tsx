'use client';

import { useState } from 'react';
import { deleteAppointment } from '@/app/actions/appointments';

export default function DeleteAppointmentButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este agendamento do relatório? Esta ação não pode ser desfeita.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAppointment(id);
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir agendamento.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={isDeleting}
      style={{
        color: 'var(--danger)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: 500,
        opacity: isDeleting ? 0.5 : 1
      }}
    >
      {isDeleting ? 'Excluindo...' : 'Excluir'}
    </button>
  );
}
