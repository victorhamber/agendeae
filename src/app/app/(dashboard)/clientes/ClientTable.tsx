'use client';

import { useState } from 'react';
import type { Appointment, Customer, Professional, Service } from '@prisma/client';
import CustomerNotesModal from './CustomerNotesModal';

type CustomerAppointmentRow = Appointment & { service: Service; professional: Professional };
type CustomerRow = Omit<Customer, 'tags'> & {
  tags: Customer['tags'];
  appointments: CustomerAppointmentRow[];
  totalAppointments: number;
  completedCount: number;
  cancelledCount: number;
  noShowCount: number;
  totalSpent: number;
  lastVisit?: CustomerAppointmentRow;
  computedTags: string[];
};

export default function ClientTable({ customerData }: { customerData: CustomerRow[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const tagColors: Record<string, string> = {
    'Novo': '#3B82F6',
    'Recorrente': '#22C55E',
    'Alto Valor': '#F59E0B',
    'Faltou': '#EF4444',
    'Cancela Muito': '#EF4444',
  };

  const filteredCustomers = customerData.filter(c => {
    const term = searchTerm.toLowerCase();
    const nameMatch = c.name?.toLowerCase().includes(term);
    const phoneMatch = c.whatsapp?.toLowerCase().includes(term);
    return nameMatch || phoneMatch;
  });

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          placeholder="Pesquisar por nome ou telefone..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input"
          style={{ maxWidth: '400px' }}
        />
      </div>

      <div className="glass" style={{ borderRadius: 'var(--radius)', overflow: 'hidden', width: '100%', maxWidth: '100%' }}>
        <div className="table-responsive" style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, color: 'var(--muted)' }}>Cliente</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, color: 'var(--muted)' }}>Tags</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 500, color: 'var(--muted)' }}>Atendimentos</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 500, color: 'var(--muted)' }}>Faltas</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 500, color: 'var(--muted)' }}>Cancelamentos</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, color: 'var(--muted)' }}>Total Gasto</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, color: 'var(--muted)' }}>Última Visita</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 500, color: 'var(--muted)' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
                  {customerData.length === 0 
                    ? 'Nenhum cliente cadastrado ainda. Os clientes aparecem automaticamente quando alguém agenda.'
                    : 'Nenhum cliente encontrado para sua pesquisa.'}
                </td>
              </tr>
            ) : (
              filteredCustomers.map(customer => (
                <tr key={customer.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 500 }}>{customer.name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>{customer.whatsapp || '—'}</div>
                    {customer.email && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{customer.email}</div>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {customer.computedTags.map((tag: string) => (
                        <span key={tag} style={{
                          padding: '0.15rem 0.5rem',
                          borderRadius: '9999px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          backgroundColor: `${tagColors[tag] || '#6B7280'}20`,
                          color: tagColors[tag] || '#6B7280'
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 500 }}>{customer.completedCount}</td>
                  <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 500, color: customer.noShowCount > 0 ? 'var(--danger)' : 'var(--muted)' }}>
                    {customer.noShowCount}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 500, color: customer.cancelledCount > 0 ? '#F97316' : 'var(--muted)' }}>
                    {customer.cancelledCount}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--success)', fontWeight: 500 }}>
                    R$ {customer.totalSpent.toFixed(2).replace('.', ',')}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--muted)', fontSize: '0.875rem' }}>
                    {customer.lastVisit 
                      ? `${new Date(customer.lastVisit.date).toLocaleDateString('pt-BR')} às ${customer.lastVisit.startTime}`
                      : '—'
                    }
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <CustomerNotesModal 
                      customerId={customer.id} 
                      customerName={customer.name} 
                      initialNotes={customer.notes || ''} 
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
