'use client';

import { useState } from 'react';
import StatusSelect from './StatusSelect';
import type { Appointment, Customer, Professional, Service } from '@prisma/client';

type AppointmentRow = Appointment & {
  customer: Customer;
  service: Service;
  professional: Professional;
};

export default function AgendaTable({ appointments }: { appointments: AppointmentRow[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAppointments = appointments.filter(app => {
    const term = searchTerm.toLowerCase();
    const nameMatch = app.customer.name?.toLowerCase().includes(term);
    const phoneMatch = app.customer.whatsapp?.toLowerCase().includes(term);
    return nameMatch || phoneMatch;
  });

  const totalAppointments = filteredAppointments.length;
  const confirmedCount = filteredAppointments.filter(a => a.status === 'CONFIRMED').length;
  const completedCount = filteredAppointments.filter(a => a.status === 'COMPLETED').length;
  const cancelledCount = filteredAppointments.filter(a => a.status === 'CANCELLED').length;
  const totalRevenue = filteredAppointments
    .filter(a => !['CANCELLED', 'NO_SHOW'].includes(a.status))
    .reduce((sum, a) => sum + (a.totalPrice || a.service.price), 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          placeholder="Pesquisar por cliente (nome ou telefone)..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input"
          style={{ maxWidth: '400px' }}
        />
      </div>

      {/* Mini Stats do período selecionado */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Total</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalAppointments}</p>
        </div>
        <div style={{ padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Confirmados</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{confirmedCount}</p>
        </div>
        <div style={{ padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Concluídos</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>{completedCount}</p>
        </div>
        <div style={{ padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Cancelados</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--danger)' }}>{cancelledCount}</p>
        </div>
        <div style={{ padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Receita</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>R$ {totalRevenue.toFixed(2).replace('.', ',')}</p>
        </div>
      </div>

      <div className="glass" style={{ borderRadius: 'var(--radius)', overflow: 'hidden', width: '100%', maxWidth: '100%' }}>
        <div className="table-responsive" style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, color: 'var(--muted)' }}>Data e Hora</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, color: 'var(--muted)' }}>Cliente</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, color: 'var(--muted)' }}>Serviço(s)</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, color: 'var(--muted)' }}>Valor</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, color: 'var(--muted)' }}>Profissional</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 500, color: 'var(--muted)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
                  {appointments.length === 0 
                    ? 'Nenhum agendamento encontrado para este período.'
                    : 'Nenhum agendamento encontrado para sua pesquisa.'}
                </td>
              </tr>
            ) : (
              filteredAppointments.map((app) => {
                const isToday = new Date(app.date).getTime() === today.getTime();
                return (
                  <tr key={app.id} style={{ borderBottom: '1px solid var(--border)', opacity: app.status === 'CANCELLED' ? 0.5 : 1 }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 500 }}>{isToday ? 'Hoje' : new Date(app.date).toLocaleDateString('pt-BR')}</div>
                      <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{app.startTime} - {app.endTime}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 500 }}>{app.customer.name}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>{app.customer.whatsapp}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>{app.serviceNames || app.service.name}</td>
                    <td style={{ padding: '1rem', color: 'var(--success)', fontWeight: 500 }}>R$ {(app.totalPrice || app.service.price).toFixed(2).replace('.', ',')}</td>
                    <td style={{ padding: '1rem' }}>{app.professional.name}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <StatusSelect appointmentId={app.id} currentStatus={app.status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
