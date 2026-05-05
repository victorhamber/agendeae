import styles from './agenda.module.css';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  // Manifest por slug (instala como "app separado")
  return {
    manifest: `/${slug}/manifest.webmanifest`,
  };
}

export default function AgendaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.container}>
      {children}
    </div>
  );
}
