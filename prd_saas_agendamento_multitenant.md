# PRD — SaaS de Agendamento Online Multiempresa

## 1. Visão Geral do Produto

O produto será um SaaS de agendamento online para negócios que dependem de horários marcados, como barbearias, salões de beleza, clínicas de estética, lash designers, studios de tatuagem, massoterapeutas, consultórios e prestadores de serviço em geral.

A plataforma permitirá que o dono do negócio configure sua própria agenda online personalizada e compartilhe um link público para que seus clientes finais possam escolher serviço, profissional, data e horário sem precisar chamar manualmente pelo WhatsApp.

A estrutura do produto será baseada em três ambientes principais:

1. **Super Admin** — painel interno do dono da plataforma para controlar clientes, planos, licenças, pagamentos, uso e configurações globais.
2. **Admin da Empresa** — painel do comprador do SaaS para configurar seu negócio, serviços, profissionais, horários, regras e personalização da página pública.
3. **Front do Cliente Final** — página pública onde o cliente do comprador faz o agendamento.

---

## 2. Objetivo do Produto

Criar uma plataforma SaaS simples, escalável e vendável, que permita que pequenos negócios transformem sua marcação de horários em um processo automático, organizado e profissional.

O objetivo comercial é vender assinaturas recorrentes para empresas que desejam reduzir a dependência do WhatsApp, evitar agenda bagunçada, diminuir esquecimentos e facilitar o agendamento de clientes.

---

## 3. Proposta de Valor

### Promessa principal

**Permita que seus clientes agendem horários sozinhos, 24 horas por dia, sem você precisar responder cada mensagem no WhatsApp.**

### Benefícios principais

- Reduzir o tempo gasto respondendo mensagens.
- Organizar horários em uma agenda online.
- Evitar conflitos de agenda.
- Permitir que clientes escolham serviço, profissional e horário disponível.
- Melhorar a experiência do cliente final.
- Passar mais profissionalismo para o negócio.
- Facilitar o controle de profissionais e serviços.
- Criar uma página pública personalizada para cada empresa.
- Permitir controle de licença, planos e pagamentos pelo dono da plataforma.

---

## 4. Público-Alvo Inicial

O foco inicial deve ser em negócios pequenos e médios que dependem de agendamento recorrente.

### Nichos prioritários

- Barbearias.
- Salões de beleza.
- Esmalterias.
- Clínicas de estética.
- Lash designers.
- Designers de sobrancelha.
- Studios de tatuagem.
- Massoterapeutas.
- Personal trainers.
- Consultórios particulares.
- Prestadores de serviço com agenda recorrente.

### Perfil do comprador

- Dono ou gestor de pequeno negócio.
- Usa WhatsApp para marcar horários.
- Tem dificuldade em organizar agenda manualmente.
- Quer parecer mais profissional.
- Não tem equipe técnica.
- Precisa de uma solução simples e rápida de configurar.
- Valoriza preço acessível e facilidade de uso.

---

## 5. Estrutura Geral da Plataforma

A plataforma será multiempresa/multitenant.

Cada empresa cadastrada terá seus próprios dados, usuários, serviços, profissionais, horários, clientes, agendamentos e configurações.

Todas as entidades principais devem estar vinculadas a um `company_id`, garantindo isolamento de dados entre empresas.

### Ambientes principais

- `/super-admin` — painel do dono da plataforma.
- `/app` — painel administrativo da empresa compradora.
- `/agenda/{slug-da-empresa}` — página pública de agendamento.

Também poderá ser considerado futuramente:

- `{slug-da-empresa}.seudominio.com.br`
- Domínio personalizado por empresa.

---

## 6. Tipos de Usuário e Permissões

### 6.1 Super Admin

Usuário dono da plataforma.

Pode:

- Acessar todos os dados da plataforma.
- Criar, editar, bloquear e excluir empresas.
- Gerenciar planos.
- Gerenciar licenças.
- Gerenciar pagamentos.
- Ver dashboards globais.
- Ver uso por empresa.
- Acessar conta de cliente para suporte.
- Configurar integrações globais.
- Gerenciar templates globais de e-mail e mensagens.
- Bloquear empresas inadimplentes.
- Liberar ou remover recursos por plano.

### 6.2 Dono da Empresa

Usuário comprador do SaaS.

Pode:

- Configurar dados da empresa.
- Personalizar página pública.
- Criar serviços.
- Criar profissionais.
- Configurar horários de atendimento.
- Ver agenda.
- Criar agendamentos manuais.
- Editar/cancelar/reagendar agendamentos.
- Ver clientes.
- Ver relatórios.
- Configurar regras de agendamento.
- Configurar mensagens.
- Gerenciar usuários internos, dependendo do plano.

Não pode:

- Ver dados de outras empresas.
- Alterar planos globais.
- Alterar sua própria licença manualmente.
- Acessar configurações globais da plataforma.

### 6.3 Admin da Empresa

Usuário operacional dentro da empresa.

Pode:

- Ver e gerenciar agenda.
- Cadastrar serviços, se permitido pelo dono.
- Cadastrar profissionais, se permitido pelo dono.
- Criar e editar agendamentos.
- Ver clientes.

Permissões específicas podem ser configuradas pelo dono da empresa em versões futuras.

### 6.4 Profissional

Usuário que presta o serviço.

Pode:

- Ver sua própria agenda.
- Ver seus próprios agendamentos.
- Bloquear horários.
- Marcar atendimento como concluído.
- Marcar cliente como ausente.

Não pode:

- Ver agenda completa da empresa, salvo permissão.
- Alterar plano.
- Alterar dados financeiros.
- Alterar outros profissionais.

### 6.5 Cliente Final

Pessoa que acessa o link público para agendar.

No MVP, não precisa ter login.

Pode:

- Ver página pública da empresa.
- Escolher serviço.
- Escolher profissional, se permitido.
- Escolher data e horário.
- Informar nome e WhatsApp.
- Confirmar agendamento.
- Cancelar ou reagendar, se a empresa permitir.

---

## 7. Módulo Super Admin

O Super Admin é o painel central do dono da plataforma.

### 7.1 Dashboard Global

Deve exibir:

- Total de empresas cadastradas.
- Empresas ativas.
- Empresas em teste grátis.
- Empresas bloqueadas.
- Empresas vencidas.
- Novas empresas no mês.
- Receita mensal recorrente estimada.
- Receita anual estimada.
- Agendamentos totais.
- Agendamentos do mês.
- Consumo de créditos de WhatsApp, se houver.
- Planos mais vendidos.
- Empresas com maior uso.

### 7.2 Gestão de Empresas

Campos da empresa:

- ID.
- Nome da empresa.
- Slug público.
- Nome do responsável.
- E-mail do responsável.
- WhatsApp.
- Plano atual.
- Status.
- Data de criação.
- Data de vencimento.
- Trial ativo ou não.
- Quantidade de profissionais.
- Quantidade de agendamentos.
- Créditos disponíveis.

Status possíveis:

- `trial`
- `active`
- `past_due`
- `blocked`
- `cancelled`
- `suspended`

Ações disponíveis:

- Criar empresa manualmente.
- Editar empresa.
- Ativar empresa.
- Bloquear empresa.
- Suspender empresa.
- Cancelar empresa.
- Alterar plano.
- Alterar vencimento.
- Adicionar créditos.
- Acessar como cliente.
- Excluir empresa, com confirmação.

### 7.3 Gestão de Planos

Campos do plano:

- Nome do plano.
- Descrição.
- Preço mensal.
- Preço anual.
- Limite de profissionais.
- Limite de unidades.
- Permite relatórios.
- Permite lembrete por WhatsApp.
- Permite domínio personalizado.
- Permite múltiplos usuários.
- Status ativo/inativo.

Exemplo de planos iniciais:

#### Plano Solo

- 1 profissional.
- 1 unidade.
- Serviços ilimitados.
- Agendamentos ilimitados.
- Link público personalizado.
- Personalização básica.

#### Plano Pro

- Até 5 profissionais.
- Serviços ilimitados.
- Agendamentos ilimitados.
- Multiagenda.
- Relatórios básicos.
- Personalização avançada.
- Lembretes por crédito.

#### Plano Business

- Até 15 profissionais.
- Múltiplas unidades.
- Relatórios avançados.
- Domínio personalizado.
- Suporte prioritário.
- Integrações futuras.

### 7.4 Gestão de Licenças

Cada empresa deve ter uma licença vinculada.

Campos da licença:

- ID da licença.
- Empresa vinculada.
- Plano vinculado.
- Status.
- Data de início.
- Data de expiração.
- Data final do teste grátis.
- ID externo da assinatura.
- Gateway de pagamento.
- Renovação automática.

Status da licença:

- `trial`
- `active`
- `expired`
- `cancelled`
- `refunded`
- `chargeback`
- `blocked`

Regras:

- Se a licença estiver ativa, a empresa pode usar normalmente.
- Se estiver em trial, pode usar até o fim do período de teste.
- Se estiver vencida, o sistema deve restringir ações administrativas.
- Se estiver bloqueada, o front público pode ser desativado.
- Os dados da empresa devem ser preservados por um período definido após vencimento/cancelamento.

### 7.5 Webhooks de Pagamento

O sistema deve receber eventos de plataformas de pagamento.

Eventos esperados:

- Compra aprovada.
- Assinatura criada.
- Assinatura renovada.
- Pagamento pendente.
- Pagamento recusado.
- Assinatura cancelada.
- Reembolso.
- Chargeback.
- Trial expirado.

Fluxo de compra aprovada:

1. Receber webhook.
2. Validar assinatura/secret do webhook.
3. Identificar produto/plano.
4. Criar ou localizar empresa.
5. Criar ou atualizar licença.
6. Liberar acesso.
7. Enviar e-mail de boas-vindas.
8. Registrar log da transação.

### 7.6 Logs e Auditoria

O sistema deve registrar ações importantes:

- Login.
- Alteração de plano.
- Bloqueio/desbloqueio de empresa.
- Alteração de licença.
- Acesso como cliente.
- Exclusão de dados.
- Webhooks recebidos.
- Falhas de integração.

---

## 8. Módulo Admin da Empresa

Esse é o painel usado pelo comprador do SaaS.

### 8.1 Onboarding Inicial

Ao primeiro acesso, o usuário deve passar por um fluxo guiado.

#### Passo 1 — Dados do Negócio

Campos:

- Nome do negócio.
- Segmento.
- WhatsApp.
- E-mail.
- Endereço.
- Instagram.
- Logo.

#### Passo 2 — Personalização

Campos:

- Cor principal.
- Cor secundária.
- Foto/banner.
- Descrição curta.
- Mensagem de boas-vindas.

#### Passo 3 — Serviços

Campos:

- Nome do serviço.
- Descrição.
- Preço.
- Duração em minutos.
- Categoria.
- Status ativo/inativo.

#### Passo 4 — Profissionais

Campos:

- Nome.
- Foto.
- Especialidade.
- WhatsApp.
- E-mail.
- Serviços atendidos.

#### Passo 5 — Horários

Campos:

- Dias de atendimento.
- Horário de abertura.
- Horário de fechamento.
- Intervalo.
- Tempo mínimo de antecedência para agendamento.
- Tempo máximo de antecedência para agendamento.

#### Passo 6 — Link Público

Ao concluir, o sistema deve gerar o link público da empresa.

Exemplo:

`https://seudominio.com.br/agenda/barbearia-do-joao`

Tela final:

**Sua agenda está pronta. Copie seu link e coloque na bio do Instagram, WhatsApp e Google Meu Negócio.**

### 8.2 Dashboard da Empresa

Deve exibir:

- Agendamentos de hoje.
- Agendamentos da semana.
- Próximos agendamentos.
- Novos clientes.
- Cancelamentos.
- Faltas.
- Serviços mais agendados.
- Profissionais mais agendados.
- Receita estimada.
- Horários mais procurados.

### 8.3 Agenda

Funcionalidades:

- Visualização diária.
- Visualização semanal.
- Visualização mensal.
- Filtro por profissional.
- Filtro por serviço.
- Filtro por status.
- Criar agendamento manual.
- Editar agendamento.
- Cancelar agendamento.
- Reagendar.
- Marcar como concluído.
- Marcar como não compareceu.

Status do agendamento:

- `pending`
- `confirmed`
- `completed`
- `cancelled`
- `no_show`
- `rescheduled`

### 8.4 Serviços

O usuário deve poder:

- Criar serviço.
- Editar serviço.
- Ativar/inativar serviço.
- Excluir serviço, se não houver agendamentos vinculados.
- Vincular serviço a um ou mais profissionais.

Campos:

- Nome.
- Descrição.
- Categoria.
- Preço.
- Duração.
- Tempo de intervalo após o serviço.
- Imagem opcional.
- Status.

### 8.5 Profissionais

O usuário deve poder:

- Criar profissional.
- Editar profissional.
- Ativar/inativar profissional.
- Excluir profissional, se não houver agendamentos futuros.
- Definir serviços atendidos.
- Definir disponibilidade individual.

Campos:

- Nome.
- Foto.
- Especialidade.
- WhatsApp.
- E-mail.
- Descrição curta.
- Status.

### 8.6 Disponibilidade

Cada profissional deve ter sua própria disponibilidade.

Campos:

- Dia da semana.
- Horário inicial.
- Horário final.
- Intervalo inicial.
- Intervalo final.
- Status ativo/inativo.

Exemplo:

- Segunda-feira: 09:00 às 18:00, intervalo 12:00 às 13:00.
- Terça-feira: 09:00 às 18:00, intervalo 12:00 às 13:00.

### 8.7 Bloqueios de Horário

Permitir bloquear horários específicos.

Exemplos:

- Feriado.
- Folga.
- Viagem.
- Manutenção.
- Compromisso pessoal.

Campos:

- Profissional.
- Data.
- Hora inicial.
- Hora final.
- Motivo.

### 8.8 Clientes

O sistema deve criar automaticamente um cliente quando alguém agenda pela primeira vez.

Campos:

- Nome.
- WhatsApp.
- E-mail.
- Data de nascimento, opcional.
- Observações internas.
- Tags.
- Histórico de agendamentos.
- Total de faltas.
- Total de cancelamentos.

Tags sugeridas:

- Novo.
- Recorrente.
- VIP.
- Faltou.
- Inativo.
- Alto valor.

### 8.9 Personalização da Página Pública

Campos personalizáveis:

- Logo.
- Foto de capa.
- Nome do negócio.
- Descrição.
- Cor principal.
- Cor secundária.
- Botão de WhatsApp.
- Instagram.
- Endereço.
- Mapa, futuramente.
- Política de cancelamento.
- Mensagem de confirmação.

### 8.10 Regras de Agendamento

Configurações:

- Permitir escolha de profissional.
- Permitir agendamento com qualquer profissional disponível.
- Tempo mínimo de antecedência.
- Tempo máximo de antecedência.
- Permitir cancelamento pelo cliente.
- Prazo limite para cancelamento.
- Permitir reagendamento pelo cliente.
- Prazo limite para reagendamento.
- Exigir aprovação manual.
- Permitir múltiplos serviços no mesmo agendamento.
- Intervalo entre horários.
- Limite de agendamentos por dia.

### 8.11 Mensagens e Lembretes

No MVP, pode começar apenas com mensagens de confirmação na tela e e-mail simples.

Em fase posterior, adicionar WhatsApp automático.

Templates futuros:

#### Confirmação

Olá, {{nome}}! Seu horário foi confirmado para {{data}} às {{hora}} com {{profissional}}.

#### Lembrete

Olá, {{nome}}! Passando para lembrar do seu horário {{data}} às {{hora}}.

#### Cancelamento

Seu horário em {{data}} às {{hora}} foi cancelado com sucesso.

#### Pós-atendimento

Obrigado pela visita, {{nome}}! Quando quiser agendar novamente, acesse: {{link_agendamento}}

### 8.12 Relatórios

Relatórios iniciais:

- Total de agendamentos.
- Agendamentos por período.
- Agendamentos por serviço.
- Agendamentos por profissional.
- Cancelamentos.
- Faltas.
- Clientes novos.
- Receita estimada.

---

## 9. Front do Cliente Final

Esse é o ambiente público de agendamento.

Deve ser simples, rápido e responsivo, principalmente para celular.

### 9.1 Página Pública da Empresa

Elementos:

- Logo.
- Nome do negócio.
- Foto de capa.
- Descrição curta.
- Endereço.
- Instagram.
- Botão de WhatsApp.
- Lista de serviços.
- Botão “Agendar agora”.

### 9.2 Fluxo de Agendamento

#### Etapa 1 — Escolher Serviço

Mostrar:

- Nome do serviço.
- Duração.
- Preço, se a empresa quiser exibir.
- Descrição curta.

#### Etapa 2 — Escolher Profissional

Mostrar se a empresa permitir.

Opções:

- Profissional específico.
- Qualquer profissional disponível.

#### Etapa 3 — Escolher Data e Horário

Mostrar apenas horários realmente disponíveis.

Regras:

- Não mostrar horários ocupados.
- Não mostrar horários bloqueados.
- Respeitar duração do serviço.
- Respeitar intervalo do profissional.
- Respeitar antecedência mínima.
- Respeitar limite de agendamento futuro.

#### Etapa 4 — Dados do Cliente

Campos mínimos:

- Nome.
- WhatsApp.

Campos opcionais:

- E-mail.
- Observação.

#### Etapa 5 — Confirmação

Mostrar:

- Serviço.
- Profissional.
- Data.
- Horário.
- Endereço.
- Botão para adicionar ao calendário.
- Botão para falar no WhatsApp.
- Link para cancelar ou reagendar, se permitido.

Mensagem:

**Agendamento confirmado! Você receberá os detalhes do seu horário.**

---

## 10. Regras de Negócio

### 10.1 Isolamento de Dados

Toda entidade deve ter `company_id`.

Nenhum usuário de uma empresa pode acessar dados de outra empresa.

### 10.2 Conflito de Horário

O sistema não pode permitir dois agendamentos no mesmo horário para o mesmo profissional.

Antes de confirmar um agendamento, o backend deve validar:

- Empresa ativa.
- Licença ativa.
- Serviço ativo.
- Profissional ativo.
- Profissional atende o serviço.
- Horário dentro da disponibilidade.
- Horário não bloqueado.
- Horário não ocupado.

### 10.3 Licença Vencida

Se a licença estiver vencida:

- O admin da empresa deve ver aviso de renovação.
- O sistema pode bloquear criação de novos serviços/profissionais.
- O front público pode ser desativado, dependendo da regra comercial.
- Dados existentes devem ser preservados.

### 10.4 Trial

O sistema deve permitir teste grátis.

Exemplo:

- Trial de 7 ou 15 dias.
- Não exigir cartão no início, se essa for a estratégia comercial.
- Ao final do trial, bloquear ou limitar acesso até escolha de plano.

### 10.5 Cancelamento e Reagendamento

A empresa define se o cliente pode cancelar ou reagendar.

O sistema deve respeitar o prazo mínimo configurado.

Exemplo:

- Cancelamento permitido até 6 horas antes.
- Reagendamento permitido até 12 horas antes.

---

## 11. Modelo de Dados Inicial

### 11.1 users

- id
- name
- email
- password_hash
- role
- status
- created_at
- updated_at

### 11.2 companies

- id
- owner_id
- name
- slug
- segment
- logo_url
- cover_url
- primary_color
- secondary_color
- whatsapp
- email
- instagram
- address
- description
- status
- created_at
- updated_at

### 11.3 plans

- id
- name
- description
- price_monthly
- price_yearly
- max_professionals
- max_units
- allow_reports
- allow_whatsapp_reminders
- allow_custom_domain
- allow_multiple_users
- status
- created_at
- updated_at

### 11.4 licenses

- id
- company_id
- plan_id
- status
- starts_at
- expires_at
- trial_ends_at
- payment_provider
- external_customer_id
- external_subscription_id
- created_at
- updated_at

### 11.5 services

- id
- company_id
- name
- description
- category
- price
- duration_minutes
- buffer_after_minutes
- image_url
- status
- created_at
- updated_at

### 11.6 professionals

- id
- company_id
- name
- photo_url
- specialty
- whatsapp
- email
- description
- status
- created_at
- updated_at

### 11.7 professional_services

- id
- company_id
- professional_id
- service_id
- created_at

### 11.8 availability

- id
- company_id
- professional_id
- day_of_week
- start_time
- end_time
- break_start_time
- break_end_time
- status
- created_at
- updated_at

### 11.9 blocked_times

- id
- company_id
- professional_id
- date
- start_time
- end_time
- reason
- created_at
- updated_at

### 11.10 customers

- id
- company_id
- name
- whatsapp
- email
- birth_date
- notes
- tags
- created_at
- updated_at

### 11.11 appointments

- id
- company_id
- customer_id
- professional_id
- service_id
- date
- start_time
- end_time
- status
- source
- notes
- cancellation_reason
- created_at
- updated_at

### 11.12 message_templates

- id
- company_id
- type
- content
- status
- created_at
- updated_at

### 11.13 message_logs

- id
- company_id
- appointment_id
- customer_id
- channel
- status
- provider_response
- cost
- sent_at
- created_at

### 11.14 payment_transactions

- id
- company_id
- license_id
- provider
- external_transaction_id
- event_type
- amount
- status
- raw_payload
- created_at

### 11.15 audit_logs

- id
- user_id
- company_id
- action
- entity
- entity_id
- metadata
- created_at

---

## 12. MVP — Primeira Versão Vendável

O MVP deve ser simples, mas funcional o suficiente para vender.

### 12.1 Super Admin no MVP

- Login de Super Admin.
- Dashboard simples.
- Criar empresa manualmente.
- Editar empresa.
- Ativar/bloquear empresa.
- Criar planos.
- Vincular plano à empresa.
- Definir vencimento da licença.
- Ver lista de empresas.
- Acessar empresa como suporte.

### 12.2 Admin da Empresa no MVP

- Login.
- Onboarding básico.
- Configurar dados do negócio.
- Personalizar logo e cor.
- Criar serviços.
- Criar profissionais.
- Configurar horários.
- Ver agenda.
- Criar agendamento manual.
- Editar/cancelar agendamento.
- Ver clientes.
- Copiar link público.

### 12.3 Cliente Final no MVP

- Acessar página pública.
- Escolher serviço.
- Escolher profissional.
- Escolher data e horário.
- Preencher nome e WhatsApp.
- Confirmar agendamento.
- Ver tela de confirmação.

### 12.4 Fora do MVP

Deixar para depois:

- WhatsApp automático.
- Compra de créditos.
- Integração com Google Calendar.
- App mobile.
- Múltiplas unidades.
- Domínio personalizado.
- Pagamento antecipado.
- Programa de fidelidade.
- Campanhas automáticas.
- Relatórios avançados.
- Lista de espera.
- Integrações com Meta Ads.

---

## 13. Requisitos Não Funcionais

### 13.1 Performance

- O front público deve carregar rápido em celulares.
- O agendamento deve ser confirmado em poucos segundos.
- A busca de horários disponíveis deve ser otimizada.

### 13.2 Segurança

- Senhas criptografadas.
- Sessões seguras.
- Controle de permissões por papel.
- Isolamento de dados por empresa.
- Validação de webhooks.
- Logs de ações sensíveis.

### 13.3 Escalabilidade

- Arquitetura preparada para múltiplas empresas.
- Banco de dados com índices em `company_id`, datas e status.
- Separação clara entre backend, painel administrativo e front público.

### 13.4 Responsividade

- Todos os ambientes devem funcionar bem no celular.
- O front do cliente final deve ser mobile-first.
- O painel administrativo deve ser utilizável em desktop e tablet.

### 13.5 Usabilidade

- O comprador precisa conseguir configurar a agenda sem suporte técnico.
- Onboarding deve ser guiado.
- Textos simples.
- Poucos passos para agendar.

---

## 14. Jornada do Usuário

### 14.1 Jornada do Comprador

1. Acessa página de vendas.
2. Escolhe plano ou inicia teste grátis.
3. Cria conta.
4. Passa pelo onboarding.
5. Cadastra serviços.
6. Cadastra profissionais.
7. Define horários.
8. Personaliza página.
9. Copia link.
10. Compartilha no WhatsApp, Instagram e Google Meu Negócio.
11. Começa a receber agendamentos.

### 14.2 Jornada do Cliente Final

1. Acessa link público.
2. Escolhe serviço.
3. Escolhe profissional.
4. Escolhe data e horário.
5. Informa nome e WhatsApp.
6. Confirma agendamento.
7. Recebe confirmação.

### 14.3 Jornada do Super Admin

1. Acessa painel interno.
2. Visualiza empresas e licenças.
3. Acompanha vencimentos.
4. Bloqueia ou libera empresas.
5. Verifica pagamentos.
6. Dá suporte quando necessário.

---

## 15. Possível Stack Técnica

A stack pode variar, mas uma estrutura recomendada seria:

### Opção moderna

- Frontend: Next.js ou React.
- Backend: Node.js com NestJS ou Express.
- Banco de dados: PostgreSQL.
- ORM: Prisma.
- Autenticação: JWT/session segura.
- Hospedagem: VPS, Render, Railway, Fly.io ou AWS.
- Storage de imagens: S3 compatível ou Cloudflare R2.
- E-mails: Resend, SendGrid ou Amazon SES.
- Pagamentos: Stripe, Mercado Pago, Asaas, Kirvano, Kiwify, Hotmart ou outro gateway.

### Opção com Laravel

- Backend + painel: Laravel.
- Front: Blade, Vue ou React.
- Banco: MySQL ou PostgreSQL.
- Autenticação: Laravel Breeze/Jetstream.
- Pagamentos: integração via webhook.

### Opção WordPress não recomendada para o core

WordPress pode ser usado para a página de vendas, mas não é o ideal para o core do SaaS, principalmente por questões de performance, segurança, escalabilidade e multiempresa.

---

## 16. Estratégia de Monetização

### Planos sugeridos

#### Solo

Preço sugerido: R$47/mês ou R$497/ano.

Para profissionais individuais.

Inclui:

- 1 profissional.
- Agenda online.
- Link personalizado.
- Serviços ilimitados.
- Agendamentos ilimitados.
- Personalização básica.

#### Pro

Preço sugerido: R$97/mês ou R$997/ano.

Para pequenos negócios.

Inclui:

- Até 5 profissionais.
- Multiagenda.
- Relatórios básicos.
- Personalização avançada.
- Reagendamento/cancelamento.
- Lembretes por crédito.

#### Business

Preço sugerido: R$197/mês ou R$1.997/ano.

Para negócios maiores.

Inclui:

- Até 15 profissionais.
- Múltiplas unidades futuramente.
- Relatórios avançados.
- Domínio personalizado futuramente.
- Suporte prioritário.

### Add-ons futuros

- Créditos de WhatsApp.
- Domínio personalizado.
- Profissionais extras.
- Unidades extras.
- Relatórios avançados.
- Automações de reativação.

---

## 17. Métricas de Sucesso

### Métricas de produto

- Empresas cadastradas.
- Empresas ativas.
- Empresas que concluíram onboarding.
- Empresas que criaram ao menos um serviço.
- Empresas que receberam ao menos um agendamento.
- Agendamentos por empresa.
- Taxa de cancelamento.
- Taxa de falta.
- Uso semanal por empresa.

### Métricas comerciais

- MRR.
- ARR.
- Churn.
- Trial para pago.
- CAC.
- LTV.
- Receita por plano.
- Taxa de inadimplência.

### Métricas de ativação

A empresa deve ser considerada ativada quando:

- Configurou dados do negócio.
- Criou pelo menos um serviço.
- Criou pelo menos um profissional.
- Configurou horários.
- Compartilhou ou acessou o link público.
- Recebeu o primeiro agendamento.

---

## 18. Critérios de Aceite do MVP

O MVP estará pronto para validação quando:

1. O Super Admin conseguir criar e controlar empresas.
2. O Super Admin conseguir ativar e bloquear licenças.
3. O dono da empresa conseguir configurar seu negócio.
4. O dono da empresa conseguir criar serviços.
5. O dono da empresa conseguir criar profissionais.
6. O dono da empresa conseguir definir disponibilidade.
7. O cliente final conseguir acessar o link público.
8. O cliente final conseguir escolher serviço, profissional, data e horário.
9. O sistema impedir conflito de horários.
10. O agendamento aparecer na agenda da empresa.
11. A empresa não conseguir acessar dados de outra empresa.
12. O sistema funcionar bem no celular.

---

## 19. Riscos e Pontos Críticos

### 19.1 Motor de disponibilidade

É a parte mais crítica.

Precisa calcular corretamente os horários disponíveis com base em:

- Duração do serviço.
- Disponibilidade do profissional.
- Bloqueios.
- Agendamentos existentes.
- Intervalos.
- Antecedência mínima.
- Regras de cancelamento/reagendamento.

### 19.2 Isolamento multiempresa

Todo dado precisa estar protegido por empresa.

Erro aqui pode causar vazamento de dados.

### 19.3 Simplicidade do onboarding

Se o usuário não conseguir configurar sozinho, o produto perde força.

O onboarding precisa ser extremamente simples.

### 19.4 WhatsApp automático

WhatsApp é desejável, mas pode gerar custo, complexidade e dependência de API.

Recomendação: deixar para fase 2.

### 19.5 Suporte

Pequenos negócios podem precisar de suporte inicial.

Adicionar vídeos curtos e checklists dentro do painel pode reduzir chamados.

---

## 20. Roadmap Sugerido

### Fase 1 — Base do SaaS

- Banco multiempresa.
- Login.
- Permissões.
- Super Admin básico.
- Empresas.
- Planos.
- Licenças.

### Fase 2 — Agenda funcional

- Serviços.
- Profissionais.
- Disponibilidade.
- Bloqueios.
- Agendamentos.
- Agenda visual.

### Fase 3 — Página pública

- Página da empresa.
- Fluxo de agendamento.
- Confirmação.
- Responsividade.

### Fase 4 — Comercialização

- Página de planos.
- Webhooks de pagamento.
- Trial.
- Bloqueio automático.
- E-mails transacionais.

### Fase 5 — Melhorias

- Relatórios.
- Mensagens automáticas.
- Créditos de WhatsApp.
- Domínio personalizado.
- Integrações.

---

## 21. Resumo Executivo

O SaaS será uma plataforma de agendamento online multiempresa com três frentes: Super Admin, Admin da Empresa e Front do Cliente Final.

A primeira versão deve focar em resolver o problema principal: permitir que empresas criem uma agenda online personalizada e recebam agendamentos sem depender do WhatsApp.

O MVP deve priorizar:

- Controle de empresas e licenças.
- Configuração de serviços, profissionais e horários.
- Link público de agendamento.
- Prevenção de conflitos de agenda.
- Interface simples e responsiva.

Recursos mais avançados, como WhatsApp automático, créditos, domínio personalizado e relatórios avançados, devem entrar em fases futuras para evitar atrasar o lançamento.

A mensagem comercial central do produto deve ser:

**A agenda automática para negócios que querem parar de depender do WhatsApp para marcar horários.**

