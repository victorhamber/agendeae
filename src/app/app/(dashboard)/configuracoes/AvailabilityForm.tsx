'use client';

import { useState } from 'react';
import { saveAvailability, AvailabilityData } from '@/app/actions/config';
import styles from '../../app.module.css';

const DAYS_OF_WEEK = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'
];

export default function AvailabilityForm({ 
  professionalId, 
  initialData 
}: { 
  professionalId: string, 
  initialData: Array<{
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    breakStartTime: string | null;
    breakEndTime: string | null;
    status: string;
  }>
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<AvailabilityData[]>(
    DAYS_OF_WEEK.map((dayName, index) => {
      const existing = initialData.find(d => d.dayOfWeek === index);
      return {
        id: existing?.id,
        dayOfWeek: index,
        isActive: existing ? existing.status === 'ACTIVE' : (index >= 1 && index <= 5),
        startTime: existing?.startTime || '09:00',
        endTime: existing?.endTime || '18:00',
        breakStartTime: existing?.breakStartTime || '12:00',
        breakEndTime: existing?.breakEndTime || '13:00'
      };
    })
  );

  const handleUpdate = (index: number, field: keyof AvailabilityData, value: string | boolean) => {
    const newData = [...formData];
    newData[index] = { ...newData[index], [field]: value };
    setFormData(newData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await saveAvailability(professionalId, formData);
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
      <div className={`table-responsive ${styles.availTableWrap}`}>
        <div className={styles.availTableInner}>
          <div className={styles.availGridHeader}>
            <div>Dia</div>
            <div>Abertura</div>
            <div>Fechamento</div>
            <div>Início Pausa</div>
            <div>Fim Pausa</div>
          </div>

          {formData.map((day, index) => (
            <div
              key={index}
              className={`${styles.availGridRow} ${!day.isActive ? styles.availGridRowInactive : ''}`}
            >
              <div className={styles.availDayCell}>
                <input 
                  type="checkbox" 
                  checked={day.isActive} 
                  onChange={(e) => handleUpdate(index, 'isActive', e.target.checked)} 
                  aria-label={`Ativar dia ${DAYS_OF_WEEK[index]}`}
                />
                <span>{DAYS_OF_WEEK[index]}</span>
              </div>
              
              <input 
                type="time" 
                className="input" 
                value={day.startTime} 
                onChange={(e) => handleUpdate(index, 'startTime', e.target.value)} 
                disabled={!day.isActive}
                aria-label={`Horário de abertura (${DAYS_OF_WEEK[index]})`}
              />
              
              <input 
                type="time" 
                className="input" 
                value={day.endTime} 
                onChange={(e) => handleUpdate(index, 'endTime', e.target.value)} 
                disabled={!day.isActive}
                aria-label={`Horário de fechamento (${DAYS_OF_WEEK[index]})`}
              />

              <input 
                type="time" 
                className="input" 
                value={day.breakStartTime || ''} 
                onChange={(e) => handleUpdate(index, 'breakStartTime', e.target.value)} 
                disabled={!day.isActive}
                aria-label={`Início da pausa (${DAYS_OF_WEEK[index]})`}
              />

              <input 
                type="time" 
                className="input" 
                value={day.breakEndTime || ''} 
                onChange={(e) => handleUpdate(index, 'breakEndTime', e.target.value)} 
                disabled={!day.isActive}
                aria-label={`Fim da pausa (${DAYS_OF_WEEK[index]})`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.availSubmitRow}>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>
    </form>
  );
}
