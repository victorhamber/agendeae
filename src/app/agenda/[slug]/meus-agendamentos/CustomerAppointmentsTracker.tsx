'use client';

import { useState } from 'react';
import { findCustomerAppointments } from '../../../actions/appointments';
import { cancelAppointmentByCustomer } from '../../../actions/bookingRules';
import type { Appointment, Professional, Service } from '@prisma/client';
import styles from '../agenda.module.css';

type AppointmentRow = Appointment & {
  service: Service | null;
  professional: Professional | null;
};

function statusLabel(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'Agendado';
    case 'CONFIRMED':
      return 'Confirmado';
    case 'COMPLETED':
      return 'Concluído';
    case 'CANCELLED':
      return 'Cancelado';
    case 'NO_SHOW':
      return 'Faltou';
    default:
      return status;
  }
}

export default function CustomerAppointmentsTracker({ companySlug }: { companySlug: string }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [appointments, setAppointments] = useState<AppointmentRow[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

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

  const handleCancel = async (appointmentId: string) => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;

    setCancellingId(appointmentId);
    try {
      await cancelAppointmentByCustomer(appointmentId, phone);
      const results = await findCustomerAppointments(companySlug, phone);
      setAppointments(results);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao cancelar';
      alert(message);
    } finally {
      setCancellingId(null);
    }
  };

  const isCancellable = (app: AppointmentRow) => {
    return app.status === 'CONFIRMED' || app.status === 'PENDING';
  };

  return (
    <div>
      {!appointments ? (
        <form className={styles.trackerForm} onSubmit={handleSearch}>
          <div>
            <label className={styles.trackerLabel} htmlFor="cat-name">
              Qual o seu nome?
            </label>
            <input
              id="cat-name"
              type="text"
              className={styles.trackerInput}
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Ex: João Silva"
            />
          </div>
          <div>
            <label className={styles.trackerLabel} htmlFor="cat-phone">
              Qual o seu telefone / WhatsApp?
            </label>
            <input
              id="cat-phone"
              type="tel"
              className={styles.trackerInput}
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              placeholder="(11) 99999-9999"
            />
          </div>

          {error ? <p className={styles.trackerError}>{error}</p> : null}

          <button type="submit" className={styles.trackerSubmitBtn} disabled={isLoading || !phone || !name}>
            {isLoading ? 'Buscando...' : 'Buscar Meus Agendamentos'}
          </button>
        </form>
      ) : (
        <div className={styles.trackerList}>
          {appointments.length === 0 ? (
            <div className={styles.trackerEmpty}>
              <p>Nenhum agendamento encontrado para o telefone informado.</p>
              <button type="button" className={styles.trackerLinkPrimary} onClick={() => setAppointments(null)}>
                Tentar outro telefone
              </button>
            </div>
          ) : (
            <>
              <div className={styles.trackerListHeader}>
                <h3 className={styles.trackerListTitle}>Seu Histórico</h3>
                <button type="button" className={styles.trackerLinkMuted} onClick={() => setAppointments(null)}>
                  Nova Busca
                </button>
              </div>

              {appointments.map(app => {
                const appDate = new Date(app.date);
                const cancellable = isCancellable(app);
                const isCancelling = cancellingId === app.id;
                return (
                  <div key={app.id} className={styles.trackerCard}>
                    <div className={styles.trackerCardTop}>
                      <div>
                        <h4 className={styles.trackerServiceTitle}>{app.serviceNames || app.service?.name}</h4>
                        <p className={styles.trackerMuted}>Com {app.professional?.name}</p>
                      </div>
                      <div className={styles.trackerStatusWrap}>
                        <span className={styles.trackerStatusPill} data-status={app.status}>
                          {statusLabel(app.status)}
                        </span>
                      </div>
                    </div>

                    <div className={styles.trackerRowMeta}>
                      <span className={styles.trackerIconCal} aria-hidden>
                        📅
                      </span>
                      {appDate.toLocaleDateString('pt-BR')} às {app.startTime}
                      {app.totalPrice != null ? (
                        <span className={styles.trackerPrice}>
                          R$ {app.totalPrice.toFixed(2).replace('.', ',')}
                        </span>
                      ) : null}
                    </div>

                    {cancellable ? (
                      <button
                        type="button"
                        className={styles.trackerCancelBtn}
                        onClick={() => handleCancel(app.id)}
                        disabled={isCancelling}
                      >
                        {isCancelling ? 'Cancelando...' : '✕ Cancelar Agendamento'}
                      </button>
                    ) : null}
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
