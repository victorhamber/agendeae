'use client';

import { useState } from 'react';
import { deleteProfessional } from '@/app/actions/professionals';

export default function DeleteProfessionalButton({ professionalId }: { professionalId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir (inativar) este profissional?')) return;
    
    setIsDeleting(true);
    try {
      await deleteProfessional(professionalId);
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir profissional.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      style={{ color: 'var(--danger)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', opacity: isDeleting ? 0.5 : 1 }}
    >
      {isDeleting ? 'Excluindo...' : 'Excluir'}
    </button>
  );
}
