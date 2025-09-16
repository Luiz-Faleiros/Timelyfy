# 📅 Timelyfy Platform

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/luiz-faleiros-projects/v0-scheduling-platform)

## 📝 Visão Geral
A **Scheduling Platform** é uma aplicação web para gerenciamento de agendamentos, ideal para prestadores de serviço e empresas que desejam oferecer aos clientes uma forma prática de marcar compromissos.  
O sistema possibilita o gerenciamento de serviços, visualização de horários disponíveis, envio de confirmações e lembretes automáticos por e-mail.

---

## 🚀 Deploy
A versão mais recente está disponível em:  
➡️ **[v0-scheduling-platform](https://vercel.com/luiz-faleiros-projects/v0-scheduling-platform)**

---

## 📌 Requisitos Funcionais

### Gerenciamento de Serviços

#### RF2.1 – Gerenciar tipos de serviços
| Campo | Descrição |
|-------|-----------|
| Nome | Gerenciar tipos de serviços |
| Descrição | Permitir ao administrador cadastrar, editar e remover tipos de serviços (ex.: consultas médicas, horários de estética, aulas particulares). |
| Atores | Administrador |
| Prioridade | Essencial |
| Requisitos Não Funcionais | Interface intuitiva e responsiva; compatibilidade com navegadores principais. |
| Entradas e Pré-condições | Entradas: Nome e descrição do serviço. Pré-condições: Administrador autenticado. |
| Saídas e Pós-condições | Saídas: Confirmação de cadastro, edição ou remoção. Pós-condições: Serviços atualizados no sistema. |
| Regra de Negócio | Regra: Não permitir duplicidade de serviços. Justificativa: Evitar confusão para os usuários. Impacto: Serviços duplicados prejudicam o agendamento. |

#### RF2.2 – Listar serviços disponíveis
| Campo | Descrição |
|-------|-----------|
| Nome | Listar serviços disponíveis |
| Descrição | Listar todos os serviços disponíveis para que usuários possam visualizar opções antes de realizar agendamentos. |
| Atores | Cliente, Administrador |
| Prioridade | Essencial |
| Requisitos Não Funcionais | Desempenho rápido na listagem; compatibilidade com dispositivos móveis. |
| Entradas e Pré-condições | Nenhuma entrada necessária. Pré-condições: Serviços cadastrados. |
| Saídas e Pós-condições | Saídas: Lista de serviços exibida. Pós-condições: Usuário pode selecionar serviço. |
| Regra de Negócio | Regra: Exibir apenas serviços ativos. Justificativa: Evitar confusão do cliente. Impacto: Serviços inativos não devem ser mostrados. |

### Agendamento de Compromissos

#### RF3.1 – Visualizar e selecionar horários disponíveis
| Campo | Descrição |
|-------|-----------|
| Nome | Visualizar e selecionar horários disponíveis |
| Descrição | Permitir ao cliente visualizar a agenda com horários disponíveis e selecionar o horário desejado para agendamento. |
| Atores | Cliente |
| Prioridade | Essencial |
| Requisitos Não Funcionais | Interface responsiva e tempo de carregamento rápido. |
| Entradas e Pré-condições | Entradas: Seleção de serviço. Pré-condições: Serviço ativo e horários disponíveis. |
| Saídas e Pós-condições | Saídas: Horário selecionado. Pós-condições: Compromisso registrado no sistema. |
| Regra de Negócio | Regra: Bloquear horários já reservados. Justificativa: Evitar conflitos de agendamento. Impacto: Horários sobrepostos prejudicam a operação. |

#### RF3.2 – Envio automático de confirmações de agendamento
| Campo | Descrição |
|-------|-----------|
| Nome | Enviar confirmações de agendamento automaticamente |
| Descrição | Enviar automaticamente e-mails de confirmação para os usuários após o agendamento ser realizado com sucesso. |
| Atores | Cliente |
| Prioridade | Essencial |
| Requisitos Não Funcionais | Sistema de envio de e-mails confiável, com entrega rápida e suporte a notificações. |
| Entradas e Pré-condições | Entradas: Dados do agendamento (serviço, horário, e-mail do cliente). Pré-condições: Cliente com e-mail válido e agendamento confirmado. |
| Saídas e Pós-condições | Saídas: E-mail de confirmação enviado. Pós-condições: Cliente recebe confirmação e pode consultá-la. |
| Regra de Negócio | Regra: Confirmar envio antes de finalizar agendamento. Justificativa: Garantir notificação do cliente. Impacto: Falha no envio gera registro de erro e alerta ao administrador. |


---

## 🛡 Requisitos Não Funcionais

#### RNF1.1 – Integração com serviço de e-mails
| Campo | Descrição |
|-------|-----------|
| Nome | Integração com serviço de e-mails |
| Descrição | A integração com o serviço de envio de e-mails (Nodemailer) deve ser capaz de disparar lotes de lembretes em período reduzido, evitando atrasos significativos. |
| Critério de Aplicação | O sistema deve gerenciar filas de envio e otimizar a comunicação com o servidor de e-mails para garantir desempenho adequado. |
| Consequências da Violação | Atrasos no envio de lembretes, insatisfação dos clientes e perda de confiabilidade. |

#### RNF2.1 – Autenticação segura de usuários
| Campo | Descrição |
|-------|-----------|
| Nome | Autenticação segura de usuários |
| Descrição | A autenticação deve usar protocolos seguros (HTTPS) e armazenamento de senhas com criptografia. |
| Critério de Aplicação | Implementar login seguro e proteger dados sensíveis. |
| Consequências da Violação | Possível acesso não autorizado e vazamento de dados. |

#### RNF3.1 – Interface intuitiva e responsiva
| Campo | Descrição |
|-------|-----------|
| Nome | Interface intuitiva e responsiva |
| Descrição | A interface deve ser intuitiva, responsiva e adaptável a diferentes dispositivos. |
| Critério de Aplicação | Testes de usabilidade e adaptação em diferentes telas. |
| Consequências da Violação | Usuários têm dificuldade de navegação, afetando adoção do sistema. |
