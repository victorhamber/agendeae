'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './agenda.module.css';
import { getAvailableTimeSlots } from '../../actions/availability';
import { createAppointment } from '../../actions/booking';

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
  companySlug,
  allowAnyProfessional = true,
  allowCancellation = true,
  maxAdvanceDays = 60,
}: { 
  services: Service[], 
  professionals: Professional[],
  companyId: string,
  companyWhatsapp: string,
  companySlug: string,
  allowAnyProfessional?: boolean,
  allowCancellation?: boolean,
  maxAdvanceDays?: number,
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
    services: string; date: string; time: string; professional: string; total: string;
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
    // Largura aproximada de cada card (min-width: 60px + gap: 12px) = 72px
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
    setSelectedTime(''); // Reset time if duration changes
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


  useEffect(() => {
    if (selectedProfessional && selectedDateObj && selectedServices.length > 0) {
      // Fetch times
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
      await createAppointment({
        companyId,
        professionalId: selectedProfessional.id,
        serviceIds: selectedServices.map(s => s.id),
        dateStr: selectedDateObj.toISOString().split('T')[0],
        startTime: selectedTime,
        customerName,
        customerWhatsapp
      });
      
      // Salvar dados para a tela de confirmação
      setConfirmedData({
        services: selectedServices.map(s => s.name).join(' + '),
        date: selectedDateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
        time: selectedTime,
        professional: selectedProfessional.name,
        total: `R$ ${totalPrice.toFixed(2).replace('.', ',')}`
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
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <div style={{ 
          width: '80px', height: '80px', borderRadius: '50%', 
          background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem', fontSize: '2rem'
        }}>
          ✓
        </div>
        
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Agendamento Confirmado!</h2>
        <p style={{ color: '#A1A1AA', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Seu horário foi reservado com sucesso.
        </p>

        <div style={{ 
          backgroundColor: '#1A1A1A', padding: '1.5rem', borderRadius: '16px', 
          textAlign: 'left', marginBottom: '2rem' 
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ color: '#A1A1AA', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Serviço(s)</p>
            <p style={{ fontWeight: 600 }}>{confirmedData.services}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid #27272A', paddingTop: '1rem' }}>
            <div>
              <p style={{ color: '#A1A1AA', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Profissional</p>
              <p style={{ fontWeight: 600 }}>{confirmedData.professional}</p>
            </div>
            <div>
              <p style={{ color: '#A1A1AA', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Valor</p>
              <p style={{ fontWeight: 600, color: '#22C55E' }}>{confirmedData.total}</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid #27272A', paddingTop: '1rem', marginTop: '1rem' }}>
            <div>
              <p style={{ color: '#A1A1AA', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Data</p>
              <p style={{ fontWeight: 600, textTransform: 'capitalize' }}>{confirmedData.date}</p>
            </div>
            <div>
              <p style={{ color: '#A1A1AA', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Horário</p>
              <p style={{ fontWeight: 600 }}>{confirmedData.time}</p>
            </div>
          </div>
        </div>

        {whatsappClean && (
          <a 
            href={`https://wa.me/55${whatsappClean}?text=${encodeURIComponent(`Olá! Acabei de agendar ${confirmedData.services} para ${confirmedData.date} às ${confirmedData.time} com ${confirmedData.professional}. Meu nome é ${customerName}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              padding: '1rem',
              borderRadius: '12px',
              backgroundColor: '#25D366',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
              textAlign: 'center',
              marginBottom: '1rem'
            }}
          >
            💬 Falar no WhatsApp
          </a>
        )}

        <button
          onClick={() => window.location.reload()}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '12px',
            border: '1px solid #27272A',
            backgroundColor: 'transparent',
            color: '#fff',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer',
            marginBottom: '0.75rem'
          }}
        >
          Fazer Novo Agendamento
        </button>

        <a
          href={`/${companySlug}/meus-agendamentos`}
          style={{
            display: 'block',
            width: '100%',
            padding: '1rem',
            borderRadius: '12px',
            border: '1px solid #27272A',
            backgroundColor: '#18181B',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            textDecoration: 'none',
            textAlign: 'center'
          }}
        >
          📅 Ver Meus Agendamentos
        </a>
      </div>
    );
  }

  if (showCheckout) {
    return (
      <div>
        <button onClick={() => setShowCheckout(false)} style={{ color: 'var(--company-primary, #FFD700)', background: 'none', border: 'none', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', marginBottom: '2rem' }}>
          ← Voltar
        </button>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem' }}>FINALIZAR AGENDAMENTO</h2>
        
        <div style={{ backgroundColor: '#1A1A1A', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem' }}>
          <p style={{ color: '#A1A1AA', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Serviço(s)</p>
          <p style={{ fontWeight: 600, marginBottom: '1rem' }}>{selectedServices.map(s => s.name).join(' + ')}</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid #27272A', paddingTop: '1rem' }}>
            <div>
              <p style={{ color: '#A1A1AA', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Data</p>
              <p style={{ fontWeight: 600 }}>{selectedDateObj?.toLocaleDateString()}</p>
            </div>
            <div>
              <p style={{ color: '#A1A1AA', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Hora</p>
              <p style={{ fontWeight: 600 }}>{selectedTime}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', color: '#A1A1AA', fontSize: '0.875rem', marginBottom: '0.5rem' }}>SEU NOME</label>
            <input 
              type="text" 
              className={styles.darkInput}
              required 
              placeholder="Digite seu nome" 
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', color: '#A1A1AA', fontSize: '0.875rem', marginBottom: '0.5rem' }}>SEU WHATSAPP</label>
            <input 
              type="tel" 
              className={styles.darkInput}
              required 
              placeholder="(00) 00000-0000" 
              value={customerWhatsapp}
              onChange={e => setCustomerWhatsapp(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            className={styles.bookNowBtn}
            disabled={isSubmitting}
            style={{ marginTop: '1rem' }}
          >
            {isSubmitting ? 'CONFIRMANDO...' : `CONFIRMAR R$ ${totalPrice.toFixed(2).replace('.', ',')}`}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      {/* STEP 1: SERVICES */}
      {step === 'SERVICES' && (
        <div>
          <h2 className={styles.sectionTitle}>ESCOLHA OS SERVIÇOS</h2>
          <div style={{ marginBottom: '6rem' }}>
            {services.map(service => {
              const isSelected = selectedServices.some(s => s.id === service.id);
              return (
                <div 
                  key={service.id} 
                  onClick={() => toggleService(service)}
                  style={{ 
                    display: 'flex', 
                    gap: '1rem', 
                    padding: '1rem', 
                    backgroundColor: isSelected ? '#27272A' : '#1A1A1A', 
                    borderRadius: '12px', 
                    marginBottom: '1rem',
                    border: isSelected ? '1px solid var(--company-primary)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {service.imageUrl ? (
                    <div style={{ 
                      width: '80px', height: '80px', borderRadius: '8px', backgroundColor: '#27272A', flexShrink: 0,
                      backgroundImage: `url(${service.imageUrl})`,
                      backgroundSize: 'cover', backgroundPosition: 'center'
                    }}></div>
                  ) : (
                    <div style={{ 
                      width: '80px', height: '80px', borderRadius: '8px', backgroundColor: '#27272A', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717A'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>✂️</span>
                    </div>
                  )}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: isSelected ? 'var(--company-primary)' : '#FFF' }}>{service.name}</h3>
                    {service.description && (
                      <p style={{ fontSize: '0.75rem', color: '#A1A1AA', margin: '0 0 0.5rem 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {service.description}
                      </p>
                    )}
                    <p style={{ fontSize: '0.875rem', color: '#E4E4E7', fontWeight: 600, margin: 0 }}>R$ {service.price.toFixed(2).replace('.', ',')} • {service.durationMinutes} min</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className={`${styles.toggleSwitch} ${isSelected ? styles.active : ''}`}>
                      <div className={styles.toggleKnob}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {selectedServices.length > 0 && (
            <div className={styles.stickyFooter}>
              <button 
                className={styles.bookNowBtn}
                onClick={goToProfessionals}
              >
                CONTINUAR • {selectedServices.length} SERVIÇO(S)
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: PROFESSIONALS */}
      {step === 'PROFESSIONALS' && (
        <div>
          {/* Active Services Header */}
          <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#1A1A1A', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <p style={{ fontSize: '0.65rem', color: '#A1A1AA', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px', margin: 0 }}>Serviços Selecionados</p>
              <button onClick={() => setStep('SERVICES')} style={{ background: 'none', border: 'none', color: '#A1A1AA', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}>✎ Trocar</button>
            </div>
            <p style={{ fontWeight: 600, margin: '0 0 0.25rem 0' }}>{selectedServices.map(s => s.name).join(' + ')}</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--company-primary)', margin: 0, fontWeight: 600 }}>Total: R$ {totalPrice.toFixed(2).replace('.', ',')} • {totalDuration} min</p>
          </div>

          <h2 className={styles.sectionTitle}>ESCOLHA O PROFISSIONAL</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
            {/* Opção "Qualquer Profissional" */}
            {allowAnyProfessional && (
              <div 
                className={styles.profCard}
                onClick={() => {
                  // Pick a random professional for "any" — the backend will validate availability
                  const randomProf = professionals[Math.floor(Math.random() * professionals.length)];
                  setSelectedProfessional({ ...randomProf, name: 'Qualquer Disponível' });
                  setStep('DATETIME');
                }}
                style={{ cursor: 'pointer', borderColor: 'var(--company-primary)', borderWidth: '1px', borderStyle: 'dashed' }}
              >
                <div style={{ 
                  width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#27272A', margin: '0 auto 1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
                }}>🔀</div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>Qualquer</h3>
                <p style={{ fontSize: '0.75rem', color: '#A1A1AA', margin: '0 0 0.25rem 0' }}>Disponível</p>
              </div>
            )}
            {professionals.map(prof => (
              <div 
                key={prof.id} 
                className={styles.profCard}
                onClick={() => {
                  setSelectedProfessional(prof);
                  setStep('DATETIME');
                }}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ 
                  width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#27272A', margin: '0 auto 1rem',
                  backgroundImage: prof.photoUrl ? `url(${prof.photoUrl})` : 'none',
                  backgroundSize: 'cover', backgroundPosition: 'center'
                }}></div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>{prof.name}</h3>
                <p style={{ fontSize: '0.75rem', color: '#A1A1AA', margin: '0 0 0.25rem 0' }}>{prof.specialty || 'Profissional'}</p>
                <div style={{ fontSize: '0.75rem', color: '#FBBF24', fontWeight: 'bold' }}>
                  ★ {(prof.ratingAverage ?? 5.0).toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: DATE & TIME */}
      {step === 'DATETIME' && selectedProfessional && (
        <div>
          {/* Active Services Header */}
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#1A1A1A', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <p style={{ fontSize: '0.65rem', color: '#A1A1AA', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px', margin: 0 }}>Serviços Selecionados</p>
              <button onClick={() => setStep('SERVICES')} style={{ background: 'none', border: 'none', color: '#A1A1AA', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}>✎ Trocar</button>
            </div>
            <p style={{ fontWeight: 600, margin: '0 0 0.25rem 0' }}>{selectedServices.map(s => s.name).join(' + ')}</p>
          </div>

          {/* Active Professional Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', padding: '1rem', backgroundColor: '#1A1A1A', borderRadius: '12px' }}>
            <div style={{ 
              width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#27272A', flexShrink: 0,
              backgroundImage: selectedProfessional.photoUrl ? `url(${selectedProfessional.photoUrl})` : 'none',
              backgroundSize: 'cover', backgroundPosition: 'center'
            }}></div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.65rem', color: '#A1A1AA', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px', margin: '0 0 0.25rem 0' }}>Profissional</p>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {selectedProfessional.name}
              </h2>
            </div>
            <button onClick={() => setStep('PROFESSIONALS')} style={{ background: 'none', border: 'none', color: '#A1A1AA', fontSize: '0.75rem', cursor: 'pointer' }}>✎ Trocar</button>
          </div>

          <h2 className={styles.sectionTitle}>DATA E HORA</h2>
          <p style={{ color: '#A1A1AA', fontSize: '0.875rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {visibleMonth}
          </p>
          
          {/* Date Scroll */}
          <div 
            className={styles.dateScroll}
            ref={sliderRef}
            onMouseDown={onMouseDown}
            onMouseLeave={onMouseLeaveOrUp}
            onMouseUp={onMouseLeaveOrUp}
            onMouseMove={onMouseMove}
            onScroll={handleScroll}
            style={{ cursor: 'grab' }}
          >
            {dates.map(date => {
              const isSelected = selectedDateObj?.getTime() === date.getTime();
              return (
                <div 
                  key={date.toISOString()}
                  className={`${styles.dateCard} ${isSelected ? styles.selected : ''}`}
                  onClick={() => handleDateClick(date)}
                  style={{ userSelect: 'none' }}
                >
                  <span className={styles.dayNum}>{date.getDate()}</span>
                  <span className={styles.dayName}>{dayNames[date.getDay()]}</span>
                </div>
              );
            })}
          </div>

          {/* Time Grid */}
          {selectedDateObj && (
            <div style={{ minHeight: '150px', paddingBottom: '6rem' }}>
              {loadingTimes ? (
                <p style={{ color: '#A1A1AA', textAlign: 'center', marginTop: '2rem' }}>Buscando horários...</p>
              ) : availableTimes.length === 0 ? (
                <p style={{ color: '#EF4444', textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem' }}>Nenhum horário disponível para esta duração.</p>
              ) : (
                <div className={styles.timeGrid}>
                  {availableTimes.map(time => (
                    <button
                      key={time}
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

          {/* Sticky Book Now Button */}
          {selectedDateObj && selectedTime && (
            <div className={styles.stickyFooter}>
              <button 
                className={styles.bookNowBtn}
                onClick={handleBookNow}
              >
                AGENDAR AGORA • R$ {totalPrice.toFixed(2).replace('.', ',')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
