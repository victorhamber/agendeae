'use client';

import { useState } from 'react';
import { deleteService } from '@/app/actions/services';

export default function DeleteServiceButton({ serviceId }: { serviceId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir (inativar) este serviço?')) return;
    
    setIsDeleting(true);
    try {
      await deleteService(serviceId);
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir serviço.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      style={{ color: 'var(--danger)', fontWeight: 500, opacity: isDeleting ? 0.5 : 1 }}
    >
      {isDeleting ? 'Excluindo...' : 'Excluir'}
    </button>
  );
}
