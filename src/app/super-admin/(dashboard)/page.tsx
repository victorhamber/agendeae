import styles from '../super-admin.module.css';

export default function SuperAdminDashboard() {
  return (
    <div>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard Global</h1>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
          <h3 style={{ color: 'var(--muted)', fontSize: '0.875rem', fontWeight: 500 }}>Empresas Ativas</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>12</p>
        </div>
        <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
          <h3 style={{ color: 'var(--muted)', fontSize: '0.875rem', fontWeight: 500 }}>Agendamentos (Mês)</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>1,284</p>
        </div>
        <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
          <h3 style={{ color: 'var(--muted)', fontSize: '0.875rem', fontWeight: 500 }}>Receita Estimada</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>R$ 1.164</p>
        </div>
      </div>
    </div>
  );
}
