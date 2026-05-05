'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './agenda.module.css';
import { getAvailableTimeSlots } from '../../actions/availability';
import { createAppointment } from '../../actions/booking';
import PushEnable from './PushEnable';

type Service = {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  imageUrl?: string | null;
  description?: string | null;
};

type Professional = {
  id: string;
  name: string;
  specialty: string | null;
  photoUrl: string | null;
  ratingAverage: number | null;
};

// Helpers for dates
const getNextDays = (numDays: number) => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < numDays; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
};

const dayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export default function BookingFlow({
  services,
  professionals,
  companyId,
  companyWhatsapp,
  allowAnyProfessional = true,
  allowCancellation = true,
  maxAdvanceDays = 60,
}: {
  services: Service[];
  professionals: Professional[];
  companyId: string;
  companyWhatsapp: string;
  allowAnyProfessional?: boolean;
  allowCancellation?: boolean;
  maxAdvanceDays?: number;
}) {
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedDateObj, setSelectedDateObj] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');

  const [step, setStep] = useState<'SERVICES' | 'PROFESSIONALS' | 'DATETIME'>('SERVICES');

  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  // Form states (Checkout)
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedData, setConfirmedData] = useState<{
    services: string;
    date: string;
    time: string;
    professional: string;
    total: string;
  } | null>(null);

  // Datas expandidas até o limite permitido pela empresa
  const [dates] = useState(() => getNextDays(maxAdvanceDays));
  const [visibleMonth, setVisibleMonth] = useState(`${monthNames[dates[0].getMonth()]} ${dates[0].getFullYear()}`);

  // Lógica de Scroll com Mouse (Arrastar)
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = false;
    if (!sliderRef.current) return;
    sliderRef.current.dataset.isDown = 'true';
    startX.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeft.current = sliderRef.current.scrollLeft;
  };

  const onMouseLeaveOrUp = () => {
    if (!sliderRef.current) return;
    sliderRef.current.dataset.isDown = 'false';
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!sliderRef.current || sliderRef.current.dataset.isDown !== 'true') return;
    e.preventDefault();
    isDragging.current = true;
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 2; // Velocidade do scroll
    sliderRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const scrollPos = sliderRef.current.scrollLeft;
    const index = Math.min(Math.max(Math.floor(scrollPos / 72), 0), dates.length - 1);
    const visibleDate = dates[index];
    if (visibleDate) {
      const newMonth = `${monthNames[visibleDate.getMonth()]} ${visibleDate.getFullYear()}`;
      if (visibleMonth !== newMonth) {
        setVisibleMonth(newMonth);
      }
    }
  };

  const handleDateClick = (date: Date) => {
    if (isDragging.current) {
      isDragging.current = false;
      return;
    }
    setSelectedDateObj(date);
  };

  const totalDuration = selectedServices.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalPrice = selectedServices.reduce((acc, curr) => acc + curr.price, 0);

  const toggleService = (service: Service) => {
    setSelectedTime('');
    if (selectedServices.find(s => s.id === service.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const goToProfessionals = () => {
    if (selectedServices.length > 0) {
      setStep('PROFESSIONALS');
    }
  };

  // Horários: `companyId` vem das props (página resolveu pelo slug); `selectedProfessional` só existe
  // porque veio da lista `company.professionals`. O servidor recoloca `companyId` nas queries de conflito.
  useEffect(() => {
    if (selectedProfessional && selectedDateObj && selectedServices.length > 0) {
      const fetchTimes = async () => {
        setLoadingTimes(true);
        setAvailableTimes([]);
        try {
          const dateStr = selectedDateObj.toISOString().split('T')[0];
          const slots = await getAvailableTimeSlots(selectedProfessional.id, dateStr, totalDuration);
          setAvailableTimes(slots);
        } catch (error) {
          console.error(error);
        } finally {
          setLoadingTimes(false);
        }
      };
      fetchTimes();
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAvailableTimes([]);
      setSelectedTime('');
    }
  }, [selectedProfessional, selectedDateObj, totalDuration, selectedServices.length]);

  const handleBookNow = () => {
    if (!selectedProfessional || selectedServices.length === 0 || !selectedDateObj || !selectedTime) return;
    setShowCheckout(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfessional || selectedServices.length === 0 || !selectedDateObj || !selectedTime) return;

    setIsSubmitting(true);
    try {
      // Server action valida `professionalId` ∈ `companyId` e conflitos com filtro por empresa.
      await createAppointment({
        companyId,
        professionalId: selectedProfessional.id,
        serviceIds: selectedServices.map(s => s.id),
        dateStr: selectedDateObj.toISOString().split('T')[0],
        startTime: selectedTime,
        customerName,
        customerWhatsapp,
      });

      setConfirmedData({
        services: selectedServices.map(s => s.name).join(' + '),
        date: selectedDateObj.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        time: selectedTime,
        professional: selectedProfessional.name,
        total: `R$ ${totalPrice.toFixed(2).replace('.', ',')}`,
      });
      setShowConfirmation(true);
    } catch (error) {
      console.error(error);
      alert('Erro ao confirmar o agendamento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // TELA DE CONFIRMAÇÃO
  if (showConfirmation && confirmedData) {
    const whatsappClean = companyWhatsapp.replace(/\D/g, '');
    return (
      <div className={styles.confirmationRoot}>
        <div className={styles.confirmationIcon}>✓</div>

        <h2 className={styles.confirmationHeading}>Agendamento Confirmado!</h2>
        <p className={styles.confirmationLead}>Seu horário foi reservado com sucesso.</p>

        <div className={styles.summaryCard}>
          <div className={styles.summarySection}>
            <p className={styles.fieldLabelMuted}>Serviço(s)</p>
            <p className={styles.fieldValueStrong}>{confirmedData.services}</p>
          </div>
          <div className={styles.summaryGrid2}>
            <div>
              <p className={styles.fieldLabelMuted}>Profissional</p>
              <p className={styles.fieldValueStrong}>{confirmedData.professional}</p>
            </div>
            <div>
              <p className={styles.fieldLabelMuted}>Valor</p>
              <p className={styles.summaryAmount}>{confirmedData.total}</p>
            </div>
          </div>
          <div className={styles.summaryGrid2Spaced}>
            <div>
              <p className={styles.fieldLabelMuted}>Data</p>
              <p className={styles.summaryDate}>{confirmedData.date}</p>
            </div>
            <div>
              <p className={styles.fieldLabelMuted}>Horário</p>
              <p className={styles.fieldValueStrong}>{confirmedData.time}</p>
            </div>
          </div>
        </div>

        {whatsappClean && (
          <a
            href={`https://wa.me/55${whatsappClean}?text=${encodeURIComponent(`Olá! Acabei de agendar ${confirmedData.services} para ${confirmedData.date} às ${confirmedData.time} com ${confirmedData.professional}. Meu nome é ${customerName}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappCta}
          >
            <img src="/icons/whatsapp.png" alt="" className={styles.socialIcon} width={18} height={18} />
            Enviar confirmação no WhatsApp
          </a>
        )}

        <PushEnable companyId={companyId} phone={customerWhatsapp} />

        <button type="button" className={styles.btnNewBooking} onClick={() => window.location.reload()}>
          Fazer Novo Agendamento
        </button>
      </div>
    );
  }

  if (showCheckout) {
    return (
      <div>
        <button type="button" className={styles.backNavButton} onClick={() => setShowCheckout(false)}>
          ← Voltar
        </button>
        <h2 className={styles.flowTitle}>FINALIZAR AGENDAMENTO</h2>

        <div className={styles.checkoutSummaryCard}>
          <p className={styles.fieldLabelMutedMd}>Serviço(s)</p>
          <p className={styles.fieldValueStrongMb}>{selectedServices.map(s => s.name).join(' + ')}</p>

          <div className={styles.summaryGrid2}>
            <div>
              <p className={styles.fieldLabelMutedMd}>Data</p>
              <p className={styles.fieldValueStrong}>{selectedDateObj?.toLocaleDateString()}</p>
            </div>
            <div>
              <p className={styles.fieldLabelMutedMd}>Hora</p>
              <p className={styles.fieldValueStrong}>{selectedTime}</p>
            </div>
          </div>
        </div>

        <form className={styles.formStack} onSubmit={handleSubmit}>
          <div>
            <label className={styles.formLabel} htmlFor="bf-customer-name">
              SEU NOME
            </label>
            <input
              id="bf-customer-name"
              type="text"
              className={styles.darkInput}
              required
              placeholder="Digite seu nome"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
            />
          </div>
          <div>
            <label className={styles.formLabel} htmlFor="bf-customer-wa">
              SEU WHATSAPP
            </label>
            <input
              id="bf-customer-wa"
              type="tel"
              className={styles.darkInput}
              required
              placeholder="(00) 00000-0000"
              value={customerWhatsapp}
              onChange={e => setCustomerWhatsapp(e.target.value)}
            />
          </div>
          <button type="submit" className={`${styles.bookNowBtn} ${styles.bookNowBtnTight}`} disabled={isSubmitting}>
            {isSubmitting ? 'CONFIRMANDO...' : `CONFIRMAR R$ ${totalPrice.toFixed(2).replace('.', ',')}`}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      {step === 'SERVICES' && (
        <div>
          <h2 className={styles.sectionTitle}>ESCOLHA OS SERVIÇOS</h2>
          <div className={styles.servicesListPad}>
            {services.map(service => {
              const isSelected = selectedServices.some(s => s.id === service.id);
              return (
                <div
                  key={service.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleService(service)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleService(service);
                    }
                  }}
                  className={`${styles.serviceRow} ${isSelected ? styles.serviceRowSelected : ''}`}
                >
                  {service.imageUrl ? (
                    <div className={styles.serviceThumb}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={service.imageUrl} alt="" className={styles.serviceThumbImage} />
                    </div>
                  ) : (
                    <div className={styles.serviceThumbPlaceholder}>✂️</div>
                  )}
                  <div className={styles.serviceContent}>
                    <h3 className={styles.serviceTitle}>{service.name}</h3>
                    {service.description && <p className={styles.serviceDesc}>{service.description}</p>}
                    <p className={styles.serviceMeta}>
                      R$ {service.price.toFixed(2).replace('.', ',')} • {service.durationMinutes} min
                    </p>
                  </div>
                  <div className={styles.toggleCell}>
                    <div className={`${styles.toggleSwitch} ${isSelected ? styles.active : ''}`}>
                      <div className={styles.toggleKnob} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedServices.length > 0 && (
            <div className={styles.stickyFooter}>
              <button type="button" className={styles.bookNowBtn} onClick={goToProfessionals}>
                CONTINUAR • {selectedServices.length} SERVIÇO(S)
              </button>
            </div>
          )}
        </div>
      )}

      {step === 'PROFESSIONALS' && (
        <div>
          <div className={styles.selectionRecap}>
            <div className={styles.selectionRecapHeader}>
              <p className={styles.overlineCaps}>Serviços Selecionados</p>
              <button type="button" className={styles.ghostLinkBtn} onClick={() => setStep('SERVICES')}>
                ✎ Trocar
              </button>
            </div>
            <p className={styles.recapNames}>{selectedServices.map(s => s.name).join(' + ')}</p>
            <p className={styles.recapTotal}>
              Total: R$ {totalPrice.toFixed(2).replace('.', ',')} • {totalDuration} min
            </p>
          </div>

          <h2 className={styles.sectionTitle}>ESCOLHA O PROFISSIONAL</h2>
          <div className={styles.profGrid}>
            {allowAnyProfessional && (
              <div
                className={`${styles.profCard} ${styles.profCardAny}`}
                role="button"
                tabIndex={0}
                onClick={() => {
                  const randomProf = professionals[Math.floor(Math.random() * professionals.length)];
                  setSelectedProfessional({ ...randomProf, name: 'Qualquer Disponível' });
                  setStep('DATETIME');
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const randomProf = professionals[Math.floor(Math.random() * professionals.length)];
                    setSelectedProfessional({ ...randomProf, name: 'Qualquer Disponível' });
                    setStep('DATETIME');
                  }
                }}
              >
                <div className={styles.profAvatarPlaceholder}>🔀</div>
                <h3 className={styles.profCardTitle}>Qualquer</h3>
                <p className={styles.profCardSubtitle}>Disponível</p>
              </div>
            )}
            {professionals.map(prof => (
              <div
                key={prof.id}
                className={`${styles.profCard} ${styles.profCardClickable}`}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSelectedProfessional(prof);
                  setStep('DATETIME');
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedProfessional(prof);
                    setStep('DATETIME');
                  }
                }}
              >
                {prof.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={prof.photoUrl} alt="" className={styles.profAvatarPhoto} />
                ) : (
                  <div className={styles.profAvatarEmpty} aria-hidden />
                )}
                <h3 className={styles.profCardTitle}>{prof.name}</h3>
                <p className={styles.profCardSubtitle}>{prof.specialty || 'Profissional'}</p>
                <div className={styles.profRatingStars}>★ {(prof.ratingAverage ?? 5.0).toFixed(1)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'DATETIME' && selectedProfessional && (
        <div>
          <div className={styles.selectionRecapTight}>
            <div className={styles.selectionRecapHeader}>
              <p className={styles.overlineCaps}>Serviços Selecionados</p>
              <button type="button" className={styles.ghostLinkBtn} onClick={() => setStep('SERVICES')}>
                ✎ Trocar
              </button>
            </div>
            <p className={styles.recapNames}>{selectedServices.map(s => s.name).join(' + ')}</p>
          </div>

          <div className={styles.profPickerBar}>
            {selectedProfessional.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selectedProfessional.photoUrl} alt="" className={styles.profPickerAvatarImg} />
            ) : (
              <div className={styles.profPickerAvatarEmpty} aria-hidden />
            )}
            <div className={styles.profPickerBody}>
              <p className={styles.profPickerOverline}>Profissional</p>
              <h2 className={styles.profPickerName}>{selectedProfessional.name}</h2>
            </div>
            <button type="button" className={styles.ghostLinkBtn} onClick={() => setStep('PROFESSIONALS')}>
              ✎ Trocar
            </button>
          </div>

          <h2 className={styles.sectionTitle}>DATA E HORA</h2>
          <p className={styles.monthCaption}>{visibleMonth}</p>

          <div
            className={`${styles.dateScroll} ${styles.dateScrollDraggable}`}
            ref={sliderRef}
            onMouseDown={onMouseDown}
            onMouseLeave={onMouseLeaveOrUp}
            onMouseUp={onMouseLeaveOrUp}
            onMouseMove={onMouseMove}
            onScroll={handleScroll}
          >
            {dates.map(date => {
              const isSelected = selectedDateObj?.getTime() === date.getTime();
              return (
                <div
                  key={date.toISOString()}
                  className={`${styles.dateCard} ${isSelected ? styles.selected : ''} ${styles.dateCardNoSelect}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleDateClick(date)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleDateClick(date);
                    }
                  }}
                >
                  <span className={styles.dayNum}>{date.getDate()}</span>
                  <span className={styles.dayName}>{dayNames[date.getDay()]}</span>
                </div>
              );
            })}
          </div>

          {selectedDateObj && (
            <div className={styles.timeSection}>
              {loadingTimes ? (
                <p className={styles.loadingMuted}>Buscando horários...</p>
              ) : availableTimes.length === 0 ? (
                <p className={styles.errorNoSlots}>Nenhum horário disponível para esta duração.</p>
              ) : (
                <div className={styles.timeGrid}>
                  {availableTimes.map(time => (
                    <button
                      key={time}
                      type="button"
                      className={`${styles.timeButton} ${selectedTime === time ? styles.selected : ''}`}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedDateObj && selectedTime && (
            <div className={styles.stickyFooter}>
              <button type="button" className={styles.bookNowBtn} onClick={handleBookNow}>
                AGENDAR AGORA • R$ {totalPrice.toFixed(2).replace('.', ',')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
