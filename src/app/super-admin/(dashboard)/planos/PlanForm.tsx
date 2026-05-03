'use client';

import { useState } from 'react';
import { createPlan, updatePlan, togglePlanStatus } from '@/app/actions/plans';

type PlanData = {
  id: string;
  name: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number;
  maxProfessionals: number;
  maxUnits: number;
  allowReports: boolean;
  allowWhatsappReminders: boolean;
  allowCustomDomain: boolean;
  allowMultipleUsers: boolean;
  status: string;
};

export default function PlanForm({ plan, isEdit }: { plan?: PlanData; isEdit?: boolean }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      if (isEdit && plan) {
        await updatePlan(plan.id, formData);
        setShowEditForm(false);
      } else {
        await createPlan(formData);
        (e.target as HTMLFormElement).reset();
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async () => {
    if (!plan) return;
    if (!confirm(`Tem certeza que deseja ${plan.status === 'ACTIVE' ? 'desativar' : 'ativar'} este plano?`)) return;
    try {
      await togglePlanStatus(plan.id);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro');
    }
  };

  if (isEdit && plan) {
    if (!showEditForm) {
      return (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setShowEditForm(true)}
            style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '0.875rem' }}
          >
            Editar
          </button>
          <button
            onClick={handleToggle}
            style={{ color: plan.status === 'ACTIVE' ? 'var(--danger)' : 'var(--success)', fontWeight: 500, fontSize: '0.875rem' }}
          >
            {plan.status === 'ACTIVE' ? 'Desativar' : 'Ativar'}
          </button>
        </div>
      );
    }

    return (
      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ fontWeight: 'bold' }}>Editar Plano</h4>
          <button onClick={() => setShowEditForm(false)} style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>✕ Fechar</button>
        </div>
        <FormFields plan={plan} onSubmit={handleSubmit} isSubmitting={isSubmitting} buttonLabel="Salvar Alterações" />
      </div>
    );
  }

  return <FormFields onSubmit={handleSubmit} isSubmitting={isSubmitting} buttonLabel="Criar Plano" />;
}

function FormFields({
  plan,
  onSubmit,
  isSubmitting,
  buttonLabel,
}: {
  plan?: PlanData;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  buttonLabel: string;
}) {
  return (
    <form onSubmit={onSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.25rem', fontSize: '0.875rem' }}>Nome</label>
          <input name="name" className="input" defaultValue={plan?.name || ''} required placeholder="Ex: Solo" />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.25rem', fontSize: '0.875rem' }}>Descrição</label>
          <input name="description" className="input" defaultValue={plan?.description || ''} placeholder="Ex: Para profissionais individuais" />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.25rem', fontSize: '0.875rem' }}>Preço Mensal (R$)</label>
          <input name="priceMonthly" type="number" step="0.01" className="input" defaultValue={plan?.priceMonthly || ''} required />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.25rem', fontSize: '0.875rem' }}>Preço Anual (R$)</label>
          <input name="priceYearly" type="number" step="0.01" className="input" defaultValue={plan?.priceYearly || ''} required />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.25rem', fontSize: '0.875rem' }}>Máx. Profissionais</label>
          <input name="maxProfessionals" type="number" className="input" defaultValue={plan?.maxProfessionals || 1} required />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.25rem', fontSize: '0.875rem' }}>Máx. Unidades</label>
          <input name="maxUnits" type="number" className="input" defaultValue={plan?.maxUnits || 1} required />
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {[
          { name: 'allowReports', label: 'Relatórios', defaultChecked: plan?.allowReports },
          { name: 'allowWhatsappReminders', label: 'Lembretes WhatsApp', defaultChecked: plan?.allowWhatsappReminders },
          { name: 'allowCustomDomain', label: 'Domínio Personalizado', defaultChecked: plan?.allowCustomDomain },
          { name: 'allowMultipleUsers', label: 'Múltiplos Usuários', defaultChecked: plan?.allowMultipleUsers },
        ].map((item) => (
          <label key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
            <input type="checkbox" name={item.name} defaultChecked={item.defaultChecked} />
            {item.label}
          </label>
        ))}
      </div>

      <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ width: 'auto' }}>
        {isSubmitting ? 'Salvando...' : buttonLabel}
      </button>
    </form>
  );
}
