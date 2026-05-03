'use client';

import { useState } from 'react';
import { createLicense } from '@/app/actions/licenses';

type Company = { id: string; name: string };
type Plan = { id: string; name: string; priceMonthly: number };

export default function NewLicenseForm({ companies, plans }: { companies: Company[]; plans: Plan[] }) {
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
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.25rem', fontSize: '0.875rem' }}>Cliente / Empresa</label>
          <select name="companyId" className="input" required>
            <option value="">Selecione...</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
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
        <div>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.25rem', fontSize: '0.875rem' }}>Trial até (opcional)</label>
          <input name="trialEndsAt" type="date" className="input" />
        </div>
      </div>
      <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ width: 'auto' }}>
        {isSubmitting ? 'Criando...' : 'Criar Licença'}
      </button>
    </form>
  );
}
