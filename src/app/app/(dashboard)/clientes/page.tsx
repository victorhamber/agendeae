import { PrismaClient } from '@prisma/client';
import styles from '../../app.module.css';
import ClientTable from './ClientTable';

const prisma = new PrismaClient();

export default async function ClientesPage() {
  const company = await prisma.company.findFirst();
  
  if (!company) {
    return <div>Empresa não encontrada.</div>;
  }

  const customers = await prisma.customer.findMany({
    where: { companyId: company.id },
    include: {
      appointments: {
        orderBy: { date: 'desc' },
        include: {
          service: true,
          professional: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Calcular stats por cliente
  const customerData = customers.map(customer => {
    const totalAppointments = customer.appointments.length;
    const completedCount = customer.appointments.filter(a => a.status === 'COMPLETED').length;
    const cancelledCount = customer.appointments.filter(a => a.status === 'CANCELLED').length;
    const noShowCount = customer.appointments.filter(a => a.status === 'NO_SHOW').length;
    const totalSpent = customer.appointments
      .filter(a => a.status === 'COMPLETED')
      .reduce((sum, a) => sum + (a.totalPrice || a.service.price), 0);
    const lastVisit = customer.appointments.find(a => a.status === 'COMPLETED');

    // Tags automáticas
    const tags: string[] = [];
    if (completedCount === 0 && totalAppointments > 0) tags.push('Novo');
    if (completedCount >= 5) tags.push('Recorrente');
    if (totalSpent >= 500) tags.push('Alto Valor');
    if (noShowCount >= 2) tags.push('Faltou');
    if (cancelledCount >= 3) tags.push('Cancela Muito');

    return {
      ...customer,
      totalAppointments,
      completedCount,
      cancelledCount,
      noShowCount,
      totalSpent,
      lastVisit,
      tags
    };
  });

  return (
    <div>
      <header className={styles.header}>
        <h1 className={styles.title}>Clientes</h1>
        <span style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
          {customers.length} cliente{customers.length !== 1 ? 's' : ''} cadastrado{customers.length !== 1 ? 's' : ''}
        </span>
      </header>

      <ClientTable customerData={customerData} />
    </div>
  );
}
