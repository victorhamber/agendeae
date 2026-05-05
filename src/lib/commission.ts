/**
 * Repasse ao profissional: `commissionPercent` = % do valor bruto do atendimento para o profissional.
 * O que sobra é receita líquida da empresa (após repasse).
 */
export type AppointmentFinancialSplit = {
  gross: number;
  professionalShare: number;
  companyNet: number;
  commissionPercent: number;
};

export function splitAppointmentGross(
  gross: number,
  commissionPercent: number | null | undefined
): AppointmentFinancialSplit {
  const p = Math.min(100, Math.max(0, commissionPercent ?? 0));
  const professionalShare = Math.round(gross * (p / 100) * 100) / 100;
  const companyNet = Math.round((gross - professionalShare) * 100) / 100;
  return {
    gross,
    professionalShare,
    companyNet,
    commissionPercent: p,
  };
}
