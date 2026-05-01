'use client';

import { useState } from 'react';
import { findCustomerAppointments } from '../../../actions/appointments';
import type { Appointment, Professional, Service } from '@prisma/client';

type AppointmentRow = Appointment & {
  service: Service | null;
  professional: Professional | null;
};

export default function CustomerAppointmentsTracker({ companySlug }: { companySlug: string }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [appointments, setAppointments] = useState<AppointmentRow[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const results = await findCustomerAppointments(companySlug, phone);
      setAppointments(results);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar agendamentos.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatStatus = (status: string) => {
    switch(status) {
      case 'PENDING': return { label: 'Agendado', color: 'var(--company-primary)' };
      case 'COMPLETED': return { label: 'Concluído', color: '#22c55e' };
      case 'CANCELLED': return { label: 'Cancelado', color: '#ef4444' };
      case 'NO_SHOW': return { label: 'Faltou', color: '#f97316' };
      default: return { label: status, color: '#A1A1AA' };
    }
  };

  return (
    <div>
      {!appointments ? (
        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#A1A1AA' }}>
              Qual o seu nome?
            </label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required
              style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #27272A', backgroundColor: '#18181B', color: '#FFF', fontSize: '1rem', outline: 'none' }}
              placeholder="Ex: João Silva"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#A1A1AA' }}>
              Qual o seu telefone / WhatsApp?
            </label>
            <input 
              type="tel" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              required
              style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #27272A', backgroundColor: '#18181B', color: '#FFF', fontSize: '1rem', outline: 'none' }}
              placeholder="(11) 99999-9999"
            />
          </div>
          
          {error && <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</p>}
          
          <button 
            type="submit" 
            disabled={isLoading || !phone || !name}
            style={{ 
              marginTop: '0.5rem',
              width: '100%', 
              padding: '1rem', 
              borderRadius: '0.75rem', 
              backgroundColor: 'var(--company-primary)', 
              color: '#000', 
              fontWeight: 'bold', 
              fontSize: '1rem', 
              border: 'none', 
              cursor: isLoading || !phone || !name ? 'not-allowed' : 'pointer',
              opacity: isLoading || !phone || !name ? 0.7 : 1
            }}
          >
            {isLoading ? 'Buscando...' : 'Buscar Meus Agendamentos'}
          </button>
        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {appointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: '#A1A1AA' }}>
              <p>Nenhum agendamento encontrado para o telefone informado.</p>
              <button 
                onClick={() => setAppointments(null)} 
                style={{ marginTop: '1rem', background: 'none', border: 'none', color: 'var(--company-primary)', textDecoration: 'underline', cursor: 'pointer' }}
              >
                Tentar outro telefone
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontWeight: 600, color: '#FFF' }}>Seu Histórico</h3>
                <button 
                  onClick={() => setAppointments(null)} 
                  style={{ background: 'none', border: 'none', color: '#A1A1AA', fontSize: '0.875rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Nova Busca
                </button>
              </div>
              
              {appointments.map((app) => {
                const statusInfo = formatStatus(app.status);
                const appDate = new Date(app.date);
                return (
                  <div key={app.id} style={{ 
                    padding: '1.25rem', 
                    borderRadius: '1rem', 
                    backgroundColor: '#18181B', 
                    border: '1px solid #27272A',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ fontWeight: 'bold', color: '#FFF', fontSize: '1rem', marginBottom: '0.25rem' }}>
                          {app.serviceNames || app.service?.name}
                        </h4>
                        <p style={{ color: '#A1A1AA', fontSize: '0.875rem' }}>
                          Com {app.professional?.name}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '9999px', 
                          fontSize: '0.75rem', 
                          fontWeight: 600, 
                          color: '#000',
                          backgroundColor: statusInfo.color 
                        }}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FFF', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      <span style={{ color: 'var(--company-primary)' }}>📅</span>
                      {appDate.toLocaleDateString('pt-BR')} às {app.startTime}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
