# Desenvolvimento Frontend - Timelyfy

## Visão Geral do Projeto

O **Timelyfy** é uma plataforma web moderna de agendamento profissional desenvolvida com as mais recentes tecnologias frontend. O sistema permite que prestadores de serviços gerenciem seus horários e clientes façam agendamentos online de forma intuitiva e eficiente.

## Stack Tecnológica Principal

### Framework e Runtime
- **Next.js 14.2.16**: Framework React full-stack com App Router
- **React 18**: Biblioteca JavaScript para construção de interfaces de usuário
- **TypeScript 5**: Superset do JavaScript com tipagem estática
- **Node.js**: Runtime JavaScript server-side

### Estilização e Design System
- **Tailwind CSS 4.1.9**: Framework CSS utility-first para estilização rápida
- **Shadcn/ui**: Biblioteca de componentes React reutilizáveis
- **Radix UI**: Primitivos de UI acessíveis e não estilizados
- **Lucide React**: Biblioteca de ícones SVG
- **Geist Font**: Tipografia moderna da Vercel

### Gerenciamento de Estado e Formulários
- **React Hook Form 7.60.0**: Biblioteca para gerenciamento de formulários
- **Zod 3.25.67**: Validação de schemas TypeScript-first
- **Local Storage**: Persistência de dados no lado cliente

### Utilitários e Bibliotecas Auxiliares
- **date-fns**: Manipulação e formatação de datas
- **class-variance-authority**: Gerenciamento de variantes de componentes
- **clsx & tailwind-merge**: Utilitários para combinação de classes CSS

## Arquitetura do Projeto

### Estrutura de Diretórios

```
Timelyfy/
├── app/                          # App Router (Next.js 13+)
│   ├── globals.css              # Estilos globais e variáveis CSS
│   ├── layout.tsx               # Layout raiz da aplicação
│   ├── page.tsx                 # Página inicial pública
│   ├── login/                   # Autenticação do prestador
│   │   └── page.tsx
│   ├── admin/                   # Área administrativa
│   │   ├── layout.tsx          # Layout com sidebar e auth guard
│   │   ├── dashboard/          # Dashboard principal
│   │   │   └── page.tsx
│   │   └── appointments/       # Gestão de agendamentos
│   │       └── page.tsx
│   └── booking/                # Agendamento público
│       └── [serviceId]/        # Rota dinâmica por serviço
│           └── page.tsx
├── components/                  # Componentes reutilizáveis
│   ├── ui/                     # Componentes UI base (Shadcn)
│   ├── auth-guard.tsx          # Proteção de rotas
│   ├── sidebar.tsx             # Navegação lateral
│   └── theme-provider.tsx      # Provedor de tema
├── hooks/                      # React Hooks customizados
├── lib/                        # Utilitários e configurações
└── public/                     # Arquivos estáticos
```

### Padrão de Arquitetura: App Router

O projeto utiliza o **App Router** do Next.js 13+, que oferece:

- **Layouts Aninhados**: Permite layouts compartilhados entre rotas
- **Server Components**: Renderização no servidor por padrão
- **Client Components**: Marcados com "use client" quando necessário
- **Roteamento por Pastas**: Estrutura intuitiva baseada no sistema de arquivos

## Módulos e Componentes Detalhados

### 1. Módulo de Autenticação

**Localização**: `app/login/page.tsx` e `components/auth-guard.tsx`

**Funcionalidades**:
- Login com credenciais simples (demo)
- Proteção de rotas administrativas
- Persistência de sessão via localStorage
- Redirecionamento automático

**Tecnologias**:
```typescript
// Exemplo de implementação do AuthGuard
"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem("isAdminLoggedIn") === "true"
      if (!isLoggedIn) {
        router.push("/")
        return
      }
      setIsAuthenticated(true)
      setIsLoading(false)
    }
    checkAuth()
  }, [router])
  
  // Renderização condicional com loading state
}
```

### 2. Módulo de Dashboard Administrativo

**Localização**: `app/admin/dashboard/page.tsx`

**Funcionalidades**:
- Criação e gestão de serviços
- Configuração de horários de funcionamento
- Definição de intervalos e durações
- Geração de links públicos para agendamento
- Estatísticas em tempo real

**Interface de Dados**:
```typescript
interface Service {
  id: string
  name: string
  duration: number        // Duração em minutos
  startTime: string      // Horário de início (HH:MM)
  endTime: string        // Horário de fim (HH:MM)
  interval: number       // Intervalo entre agendamentos
  workDays: string[]     // Dias da semana de funcionamento
}
```

**Componentes UI Utilizados**:
- Cards para exibição de métricas
- Formulários controlados com React Hook Form
- Checkboxes para seleção de dias
- Selects para duração e intervalos
- Botões com estados de loading

### 3. Módulo de Gestão de Agendamentos

**Localização**: `app/admin/appointments/page.tsx`

**Funcionalidades**:
- Visualização de todos os agendamentos
- Filtros por status, data e cliente
- Confirmação e cancelamento de agendamentos
- Busca por nome e telefone
- Estatísticas de agendamentos

**Sistema de Filtros**:
```typescript
// Filtros implementados
const filteredAppointments = appointments.filter(apt => {
  // Filtro por termo de busca
  if (searchTerm) {
    return apt.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           apt.clientPhone.includes(searchTerm)
  }
  
  // Filtro por status
  if (statusFilter !== "all") {
    return apt.status === statusFilter
  }
  
  // Filtro por data
  switch (dateFilter) {
    case "today": return apt.date === todayString
    case "upcoming": return apt.date >= todayString
    case "past": return apt.date < todayString
  }
})
```

### 4. Módulo de Agendamento Público

**Localização**: `app/booking/[serviceId]/page.tsx`

**Funcionalidades**:
- Seleção de data através de calendário
- Visualização de horários disponíveis
- Validação de dias de funcionamento
- Formulário de dados do cliente
- Confirmação de agendamento

**Algoritmo de Horários Disponíveis**:
```typescript
const generateAvailableTimes = () => {
  const times: string[] = []
  const startTime = parseTime(service.startTime)
  const endTime = parseTime(service.endTime)
  
  let currentTime = startTime
  
  while (currentTime + duration <= endTime) {
    const timeString = formatTime(currentTime)
    
    // Verifica se horário já está ocupado
    const isBooked = appointments.some(apt => 
      apt.serviceId === service.id && 
      apt.date === dateString && 
      apt.time === timeString
    )
    
    if (!isBooked) {
      times.push(timeString)
    }
    
    currentTime += interval
  }
  
  setAvailableTimes(times)
}
```

### 5. Sistema de Componentes UI (Shadcn/ui)

**Localização**: `components/ui/`

**Componentes Implementados**:
- **Button**: Botões com variantes e estados
- **Card**: Containers para conteúdo
- **Input**: Campos de entrada de texto
- **Select**: Dropdowns com busca
- **Calendar**: Seletor de datas
- **Badge**: Indicadores de status
- **Toast**: Notificações temporárias
- **Checkbox**: Seleção múltipla
- **Label**: Rótulos acessíveis

**Configuração Shadcn**:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide"
}
```

### 6. Sistema de Roteamento

**App Router Features Utilizadas**:
- **Layouts Aninhados**: Layout administrativo com sidebar
- **Rotas Dinâmicas**: `[serviceId]` para agendamentos
- **Groups de Rotas**: Organização lógica
- **Loading States**: Estados de carregamento
- **Error Boundaries**: Tratamento de erros

**Navegação Programática**:
```typescript
import { useRouter } from "next/navigation"

const router = useRouter()

// Redirecionamentos
router.push("/admin/dashboard")
router.replace("/login")
```

### 7. Sistema de Estado e Persistência

**Estratégia de Estado**:
- **Estado Local**: useState para componentes isolados
- **Props Drilling**: Passagem de dados entre componentes
- **Local Storage**: Persistência de dados sem backend

**Padrão de Persistência**:
```typescript
// Salvamento
const saveServices = (services: Service[]) => {
  localStorage.setItem("services", JSON.stringify(services))
}

// Carregamento
const loadServices = (): Service[] => {
  return JSON.parse(localStorage.getItem("services") || "[]")
}

// Sincronização com estado
useEffect(() => {
  const stored = loadServices()
  setServices(stored)
}, [])
```

## Sistema de Estilização

### Tailwind CSS Configuration

**Design System Implementado**:
- **Cores Primárias**: Esquema baseado em azul (#2563eb)
- **Tipografia**: Geist Sans e Geist Mono
- **Espaçamento**: Sistema 4px base
- **Responsividade**: Mobile-first approach
- **Dark Mode**: Suporte completo com variáveis CSS

**Variáveis CSS Customizadas**:
```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --border: oklch(0.922 0 0);
  --radius: 0.625rem;
}
```

### Padrões de Estilização

**Utility Classes Padrão**:
```typescript
// Exemplo de componente estilizado
<Card className="border-blue-200">
  <CardContent className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Agendamentos Hoje
        </p>
        <p className="text-2xl font-bold">12</p>
      </div>
      <Clock className="h-8 w-8 text-green-600" />
    </div>
  </CardContent>
</Card>
```

**Responsividade**:
```typescript
// Grid responsivo
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">

// Espaçamento responsivo
<div className="px-4 py-12 md:px-8 lg:px-12">

// Tipografia responsiva
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
```

## Gerenciamento de Formulários

### React Hook Form Integration

**Configuração Base**:
```typescript
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

// Schema de validação
const serviceSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  duration: z.number().min(15, "Duração mínima de 15 minutos"),
  workDays: z.array(z.string()).min(1, "Selecione pelo menos um dia")
})

// Hook de formulário
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(serviceSchema)
})
```

**Padrão de Validação**:
- Validação client-side com Zod
- Feedback visual de erros
- Estados de loading durante submissão
- Mensagens de sucesso com Toast

## Tratamento de Datas e Internacionalização

### Date-fns Configuration

**Localização em Português**:
```typescript
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

// Formatação de datas
const formattedDate = format(new Date(), "dd/MM/yyyy", { locale: ptBR })
const dayOfWeek = format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })
```

**Manipulação de Horários**:
```typescript
// Parsing de tempo HH:MM para minutos
const parseTime = (timeString: string): number => {
  const [hours, minutes] = timeString.split(":").map(Number)
  return hours * 60 + minutes
}

// Formatação de minutos para HH:MM
const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
}
```

## Sistema de Notificações

### Toast Notifications

**Implementação**:
```typescript
import { useToast } from "@/hooks/use-toast"

const { toast } = useToast()

// Notificação de sucesso
toast({
  title: "Agendamento confirmado!",
  description: "Seu horário foi marcado com sucesso.",
})

// Notificação de erro
toast({
  title: "Erro",
  description: "Preencha todos os campos obrigatórios.",
  variant: "destructive",
})
```

## Performance e Otimizações

### Next.js Optimizations

**Server Components**: 
- Componentes renderizados no servidor por padrão
- Menor bundle JavaScript no cliente
- Melhor SEO e performance inicial

**Client Components**:
- Marcados com "use client" apenas quando necessário
- Interatividade e hooks do React
- Estados e event handlers

**Static Generation**:
- Páginas estáticas pré-renderizadas
- Melhor performance de carregamento
- Cache eficiente

### Code Splitting

**Lazy Loading**:
```typescript
import { Suspense } from "react"

// Loading boundary
<Suspense fallback={<LoadingSpinner />}>
  {children}
</Suspense>
```

**Dynamic Imports**:
```typescript
import dynamic from "next/dynamic"

const Chart = dynamic(() => import("./Chart"), {
  loading: () => <p>Carregando gráfico...</p>
})
```

## Padrões de Desenvolvimento

### TypeScript Best Practices

**Interfaces e Types**:
```typescript
// Interfaces para dados
interface Appointment {
  id: string
  serviceId: string
  date: string
  time: string
  clientName: string
  clientPhone: string
  status: "pending" | "confirmed" | "cancelled"
}

// Props de componentes
interface ComponentProps {
  data: Appointment[]
  onUpdate: (id: string) => void
  className?: string
}
```

**Generic Types**:
```typescript
// Hook customizado tipado
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })
  
  return [storedValue, setStoredValue] as const
}
```

### Component Patterns

**Compound Components**:
```typescript
// Card compound component
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição</CardDescription>
  </CardHeader>
  <CardContent>
    Conteúdo
  </CardContent>
</Card>
```

**Render Props Pattern**:
```typescript
interface RenderProps {
  data: any[]
  loading: boolean
  error: string | null
}

function DataProvider({ children, render }: {
  children?: (props: RenderProps) => ReactNode
  render?: (props: RenderProps) => ReactNode
}) {
  // Lógica de fetch de dados
  return children ? children(props) : render?.(props)
}
```

## Testing Strategy (Recomendações)

### Ferramentas Sugeridas
- **Jest**: Unit testing
- **React Testing Library**: Component testing
- **Playwright**: E2E testing
- **MSW**: API mocking

### Padrões de Teste
```typescript
// Teste de componente
import { render, screen } from "@testing-library/react"
import { ServiceCard } from "./ServiceCard"

test("renders service information", () => {
  const service = {
    id: "1",
    name: "Corte de Cabelo",
    duration: 30,
    startTime: "09:00",
    endTime: "18:00"
  }
  
  render(<ServiceCard service={service} />)
  
  expect(screen.getByText("Corte de Cabelo")).toBeInTheDocument()
  expect(screen.getByText("30 minutos")).toBeInTheDocument()
})
```

## Deploy e Build

### Configuração Next.js

```javascript
// next.config.mjs
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}
```

### Scripts NPM

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build", 
    "start": "next start",
    "lint": "next lint"
  }
}
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
```

## Considerações de Segurança

### Client-Side Security
- Validação de entrada no frontend e backend
- Sanitização de dados antes da renderização
- Proteção contra XSS com React
- Validação de rotas protegidas

### Data Persistence
- Dados sensíveis não armazenados no localStorage
- Validação de dados antes de persistir
- Backup e sincronização com backend

## Conclusão

O frontend do Timelyfy representa uma implementação moderna e robusta de uma plataforma de agendamentos, utilizando as melhores práticas do ecossistema React/Next.js. A arquitetura modular, tipagem forte com TypeScript, sistema de componentes reutilizáveis e padrões de desenvolvimento consistentes garantem:

- **Manutenibilidade**: Código organizado e bem estruturado
- **Escalabilidade**: Arquitetura preparada para crescimento
- **Performance**: Otimizações de renderização e carregamento
- **UX/UI**: Interface intuitiva e responsiva
- **Acessibilidade**: Componentes acessíveis por padrão
- **Developer Experience**: Tooling moderno e TypeScript

A plataforma está preparada para evoluir com novas funcionalidades mantendo a qualidade e consistência do código base.