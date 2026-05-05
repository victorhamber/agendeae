'use client';

import { useState } from 'react';
import StatusSelect from './StatusSelect';
import type { Appointment, Customer, Professional, Service } from '@prisma/client';
import styles from '../../app.module.css';
import { DateTime } from 'luxon';

type AppointmentRow = Appointment & {
  customer: Customer;
  service: Service;
  professional: Professional;
};

export default function AgendaTable({
  appointments,
  showFinancials = true,
  companyTimezone = 'America/Sao_Paulo',
}: {
  appointments: AppointmentRow[];
  /** Profissional logado não vê valores monetários (repasse/comissão). */
  showFinancials?: boolean;
  companyTimezone?: string;
}) {
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
  const totalRevenue = showFinancials
    ? filteredAppointments
        .filter(a => !['CANCELLED', 'NO_SHOW'].includes(a.status))
        .reduce((sum, a) => sum + (a.totalPrice || a.service.price), 0)
    : 0;

  const nowTz = DateTime.now().setZone(companyTimezone);
  const colCount = showFinancials ? 6 : 5;
  const todayTz = nowTz.startOf('day');

  const tableClass = `${styles.agendaTable} ${showFinancials ? styles.agendaTableWithFinance : styles.agendaTableNoFinance}`;

  return (
    <div>
      <div className={styles.agendaSearchWrap}>
        <input
          type="text"
          placeholder="Pesquisar por cliente (nome ou telefone)..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className={`input ${styles.agendaSearchInput}`}
        />
      </div>

      <div className={styles.agendaStatsGrid}>
        <div className={styles.agendaStatCard}>
          <p className={styles.agendaStatLabel}>Total</p>
          <p className={styles.agendaStatValue}>{totalAppointments}</p>
        </div>
        <div className={styles.agendaStatCard}>
          <p className={styles.agendaStatLabel}>Confirmados</p>
          <p className={`${styles.agendaStatValue} ${styles.agendaStatValuePrimary}`}>{confirmedCount}</p>
        </div>
        <div className={styles.agendaStatCard}>
          <p className={styles.agendaStatLabel}>Concluídos</p>
          <p className={`${styles.agendaStatValue} ${styles.agendaStatValueSuccess}`}>{completedCount}</p>
        </div>
        <div className={styles.agendaStatCard}>
          <p className={styles.agendaStatLabel}>Cancelados</p>
          <p className={`${styles.agendaStatValue} ${styles.agendaStatValueDanger}`}>{cancelledCount}</p>
        </div>
        {showFinancials ? (
          <div className={styles.agendaStatCard}>
            <p className={styles.agendaStatLabel}>Receita (bruto)</p>
            <p className={`${styles.agendaStatValue} ${styles.agendaStatValueSuccess}`}>
              R$ {totalRevenue.toFixed(2).replace('.', ',')}
            </p>
          </div>
        ) : null}
      </div>

      <div className={`glass ${styles.agendaTableShell}`}>
        <div className={`table-responsive ${styles.agendaTableScroll}`}>
          <table className={tableClass}>
            <thead>
              <tr className={styles.agendaTheadRow}>
                <th className={styles.agendaTh}>Data e Hora</th>
                <th className={styles.agendaTh}>Cliente</th>
                <th className={styles.agendaTh}>Serviço(s)</th>
                {showFinancials ? <th className={styles.agendaTh}>Valor</th> : null}
                <th className={styles.agendaTh}>Profissional</th>
                <th className={styles.agendaThRight}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className={styles.agendaEmptyCell}>
                    {appointments.length === 0
                      ? 'Nenhum agendamento encontrado para este período.'
                      : 'Nenhum agendamento encontrado para sua pesquisa.'}
                  </td>
                </tr>
              ) : (
                filteredAppointments.map(app => {
                  const appDayTz = DateTime.fromJSDate(app.date, { zone: 'utc' }).setZone(companyTimezone).startOf('day');
                  const isToday = appDayTz.toMillis() === todayTz.toMillis();
                  return (
                    <tr
                      key={app.id}
                      className={`${styles.agendaRow} ${app.status === 'CANCELLED' ? styles.agendaRowCancelled : ''}`}
                    >
                      <td className={styles.agendaTd}>
                        <div className={styles.agendaDateLine}>
                          {isToday ? 'Hoje' : new Date(app.date).toLocaleDateString('pt-BR')}
                        </div>
                        <div className={styles.agendaTimeLine}>
                          {app.startTime} - {app.endTime}
                        </div>
                      </td>
                      <td className={styles.agendaTd}>
                        <div className={styles.agendaCustomerName}>{app.customer.name}</div>
                        <div className={styles.agendaCustomerPhone}>{app.customer.whatsapp}</div>
                      </td>
                      <td className={styles.agendaTd}>{app.serviceNames || app.service.name}</td>
                      {showFinancials ? (
                        <td className={`${styles.agendaTd} ${styles.agendaValueCell}`}>
                          R$ {(app.totalPrice || app.service.price).toFixed(2).replace('.', ',')}
                        </td>
                      ) : null}
                      <td className={styles.agendaTd}>{app.professional.name}</td>
                      <td className={styles.agendaTdRight}>
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
