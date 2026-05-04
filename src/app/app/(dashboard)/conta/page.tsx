import styles from '../../app.module.css';
import { prisma } from '@/lib/prisma';
import { requireCompanySession } from '@/lib/auth/server';
import ChangePasswordForm from './ChangePasswordForm';

function formatDate(d?: Date | null) {
  if (!d) return '—';
  return d.toLocaleDateString('pt-BR');
}

export const dynamic = 'force-dynamic';

export default async function ContaPage() {
  const session = await requireCompanySession();

  const [company, license] = await Promise.all([
    prisma.company.findUnique({
      where: { id: session.companyId },
      select: { id: true, name: true, status: true, createdAt: true },
    }),
    prisma.license.findFirst({
      where: { companyId: session.companyId },
      orderBy: [{ expiresAt: 'desc' }, { trialEndsAt: 'desc' }],
      include: { plan: true },
    }),
  ]);

  if (!company) return <div>Empresa não encontrada.</div>;

  const renewalDate = license?.expiresAt ?? license?.trialEndsAt ?? null;

  return (
    <div>
      <header className={styles.header}>
        <h1 className={styles.title}>Minha Conta</h1>
      </header>

      <div className={`glass ${styles.contaCard} ${styles.contaCardSpaced}`}>
        <h2 className={styles.contaSectionTitle}>Status da Licença</h2>

        <div className={styles.licenseGrid}>
          <div className={styles.licenseTile}>
            <p className={styles.licenseTileLabel}>Empresa</p>
            <p className={styles.licenseTileValue}>{company.name}</p>
          </div>

          <div className={styles.licenseTile}>
            <p className={styles.licenseTileLabel}>Plano</p>
            <p className={styles.licenseTileValue}>{license?.plan?.name ?? '—'}</p>
          </div>

          <div className={styles.licenseTile}>
            <p className={styles.licenseTileLabel}>Status</p>
            <p className={styles.licenseTileValue}>{license?.status ?? '—'}</p>
          </div>

          <div className={styles.licenseTile}>
            <p className={styles.licenseTileLabel}>Renovação</p>
            <p className={styles.licenseTileValue}>{formatDate(renewalDate)}</p>
          </div>
        </div>

        {!license && (
          <p className={styles.licenseMissing}>
            Nenhuma licença encontrada para esta empresa.
          </p>
        )}
      </div>

      <div className={`glass ${styles.contaCard}`}>
        <h2 className={`${styles.contaSectionTitle} ${styles.contaSectionTitleTight}`}>Segurança</h2>
        <p className={`${styles.contaMuted} ${styles.contaSecurityText}`}>
          Redefina sua senha para manter sua conta protegida.
        </p>

        <ChangePasswordForm />
      </div>
    </div>
  );
}

