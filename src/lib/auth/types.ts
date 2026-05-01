export type UserRole = 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'PROFESSIONAL';

export type SessionPayload = {
  sub: string; // userId
  role: UserRole;
  companyId?: string;
  professionalId?: string;
};

