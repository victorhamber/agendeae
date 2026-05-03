'use client';

import { useState } from 'react';
import { createLicense } from '@/app/actions/licenses';

type Plan = { id: string; name: string; priceMonthly: number };

export default function NewLicenseForm({ plans }: { plans: Plan[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      await createLicense(formData);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem' }}>1. Dados do Cliente (Acesso)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.25rem', fontSize: '0.875rem' }}>Nome Completo</label>
            <input name="customerName" type="text" className="input" placeholder="Ex: João da Silva" required />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.25rem', fontSize: '0.875rem' }}>E-mail</label>
            <input name="customerEmail" type="email" className="input" placeholder="Ex: joao@email.com" required />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.25rem', fontSize: '0.875rem' }}>Senha de Acesso</label>
            <input name="customerPassword" type="text" className="input" placeholder="Ex: Mudar@123" required />
          </div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem' }}>2. Detalhes da Licença</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.25rem', fontSize: '0.875rem' }}>Plano</label>
            <select name="planId" className="input" required>
              <option value="">Selecione...</option>
              {plans.map(p => <option key={p.id} value={p.id}>{p.name} (R${p.priceMonthly}/mês)</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.25rem', fontSize: '0.875rem' }}>Status</label>
            <select name="status" className="input" defaultValue="ACTIVE">
              <option value="ACTIVE">Ativa</option>
              <option value="TRIAL">Trial</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.25rem', fontSize: '0.875rem' }}>Data Início</label>
            <input name="startsAt" type="date" className="input" defaultValue={new Date().toISOString().split('T')[0]} required />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.25rem', fontSize: '0.875rem' }}>Vencimento (opcional)</label>
            <input name="expiresAt" type="date" className="input" />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Gerando Licença...' : 'Gerar Licença e Acesso'}
        </button>
      </div>
    </form>
  );
}
