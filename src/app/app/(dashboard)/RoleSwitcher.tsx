'use client';

import { useRouter } from 'next/navigation';
import { setMockRole } from '@/app/actions/auth';
import { useState } from 'react';

export default function RoleSwitcher({ currentRole, currentProfId, professionals }: { currentRole: string, currentProfId?: string, professionals: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSwitch(role: 'ADMIN' | 'PROFESSIONAL', profId?: string) {
    setLoading(true);
    await setMockRole(role, profId);
    router.refresh();
    setLoading(false);
  }

  return (
    <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem', marginTop: 'auto' }}>
      <p style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.7)' }}>Simular Acesso</p>
      {loading ? <p style={{ color: 'rgba(255,255,255,0.5)' }}>Trocando...</p> : (
        <select 
          value={currentRole === 'PROFESSIONAL' ? (currentProfId || 'ADMIN') : 'ADMIN'}
          onChange={(e) => {
            const val = e.target.value;
            if (val === 'ADMIN') handleSwitch('ADMIN');
            else handleSwitch('PROFESSIONAL', val);
          }}
          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.8rem' }}
        >
          <option value="ADMIN">Admin da Empresa</option>
          {professionals.map((p: any) => (
            <option key={p.id} value={p.id}>Prof: {p.name}</option>
          ))}
        </select>
      )}
    </div>
  );
}
