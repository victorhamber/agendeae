'use client';

import { useState } from 'react';
import { saveAvailability, AvailabilityData } from '@/app/actions/config';

const DAYS_OF_WEEK = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'
];

export default function AvailabilityForm({ 
  companyId, 
  professionalId, 
  initialData 
}: { 
  companyId: string, 
  professionalId: string, 
  initialData: any[] 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize state with existing data or defaults
  const [formData, setFormData] = useState<AvailabilityData[]>(
    DAYS_OF_WEEK.map((dayName, index) => {
      const existing = initialData.find(d => d.dayOfWeek === index);
      return {
        id: existing?.id,
        dayOfWeek: index,
        isActive: existing ? existing.status === 'ACTIVE' : (index >= 1 && index <= 5), // Default Mon-Fri
        startTime: existing?.startTime || '09:00',
        endTime: existing?.endTime || '18:00',
        breakStartTime: existing?.breakStartTime || '12:00',
        breakEndTime: existing?.breakEndTime || '13:00'
      };
    })
  );

  const handleUpdate = (index: number, field: keyof AvailabilityData, value: any) => {
    const newData = [...formData];
    newData[index] = { ...newData[index], [field]: value };
    setFormData(newData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await saveAvailability(companyId, professionalId, formData);
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar as configurações.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="table-responsive" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '700px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 1fr 1fr 1fr', gap: '1rem', fontWeight: 'bold', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>
            <div>Dia</div>
            <div>Abertura</div>
            <div>Fechamento</div>
            <div>Início Pausa</div>
            <div>Fim Pausa</div>
          </div>

          {formData.map((day, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 1fr 1fr 1fr', gap: '1rem', alignItems: 'center', opacity: day.isActive ? 1 : 0.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  checked={day.isActive} 
                  onChange={(e) => handleUpdate(index, 'isActive', e.target.checked)} 
                />
                <span>{DAYS_OF_WEEK[index]}</span>
              </div>
              
              <input 
                type="time" 
                className="input" 
                value={day.startTime} 
                onChange={(e) => handleUpdate(index, 'startTime', e.target.value)} 
                disabled={!day.isActive}
              />
              
              <input 
                type="time" 
                className="input" 
                value={day.endTime} 
                onChange={(e) => handleUpdate(index, 'endTime', e.target.value)} 
                disabled={!day.isActive}
              />

              <input 
                type="time" 
                className="input" 
                value={day.breakStartTime || ''} 
                onChange={(e) => handleUpdate(index, 'breakStartTime', e.target.value)} 
                disabled={!day.isActive}
              />

              <input 
                type="time" 
                className="input" 
                value={day.breakEndTime || ''} 
                onChange={(e) => handleUpdate(index, 'breakEndTime', e.target.value)} 
                disabled={!day.isActive}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>
    </form>
  );
}
