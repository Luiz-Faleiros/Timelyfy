"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getSchedules } from "@/lib/api"
import { Calendar as CalendarIcon, Clock, User, Phone, Trash2, CheckCircle, XCircle, X } from "lucide-react"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Calendar as DatePicker } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { ptBR } from "date-fns/locale"

interface Service {
  id: number
  name: string
  description: string
  price: number
  duration: number
}

interface Appointment {
  id: number
  userId: number
  scheduleId: number
  serviceId: number
  status: string
  createdAt: string
  updatedAt: string
  user?: User
}

interface User {
  id: number
  name: string
  email?: string | null
  phone?: string | null
}

interface Schedule {
  id: number
  serviceId: number
  date: string
  startTime: string
  endTime: string
  isAvailable: boolean
  createdAt: string
  updatedAt: string
  service: Service
  appointments: Appointment[]
}

export default function AppointmentsPage() {

  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const { toast } = useToast()
  const [cancelingIds, setCancelingIds] = useState<number[]>([])

  const cancelAppointment = async (aptId: number) => {
    if (cancelingIds.includes(aptId)) return
    setCancelingIds((s) => [...s, aptId])
    try {
      const res = await fetch(`/api/appointments/${aptId}/cancel`, { method: 'PATCH' })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Erro', description: data?.error || 'Falha ao cancelar agendamento', variant: 'destructive' })
        return
      }

      // Atualiza estado local marcando o agendamento como cancelado
      setSchedules((prev) => prev.map((sch) => ({
        ...sch,
        appointments: sch.appointments.map((a) => (a.id === aptId ? { ...a, status: 'cancelled' } : a)),
      })) )

      toast({ title: 'Cancelado', description: 'Agendamento cancelado com sucesso' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err?.message || 'Erro interno', variant: 'destructive' })
    } finally {
      setCancelingIds((s) => s.filter((id) => id !== aptId))
    }
  }

  useEffect(() => {
    async function loadData(params: Record<string, string> = {}) {
      setLoading(true)
      try {
        // Busca agendamentos da API (pode receber params, ex: { date: 'YYYY-MM-DD' })
        const schedulesData = await getSchedules(params)
        setSchedules(schedulesData?.data || schedulesData)
      } catch (err) {
        console.error('Failed to load schedules', err)
        setSchedules([])
      } finally {
        setLoading(false)
      }
    }

    // Carrega sem filtro de data inicialmente
    loadData()
  }, [])

  // Quando dateFilter mudar, refetch da API passando a data (YYYY-MM-DD)
  useEffect(() => {
    if (dateFilter === 'all') {
      // buscar tudo
      getSchedules().then((d) => setSchedules(d?.data || d)).catch(() => setSchedules([]))
      return
    }

    // mapear os tokens like 'today', 'upcoming', 'past' para uma data concreta
    if (dateFilter === 'today') {
      const today = new Date()
      const dateStr = format(today, 'yyyy-MM-dd')
      getSchedules({ date: dateStr }).then((d) => setSchedules(d?.data || d)).catch(() => setSchedules([]))
      return
    }

    // para 'upcoming' e 'past' não temos um endpoint direto por range; deixar a UI filtrar o que a API retorna sem params
    if (dateFilter === 'upcoming' || dateFilter === 'past') {
      // Reuse full fetch and rely on client-side filter already implemented
      getSchedules().then((d) => setSchedules(d?.data || d)).catch(() => setSchedules([]))
      return
    }

    // Se dateFilter for uma data específica no formato YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateFilter)) {
      getSchedules({ date: dateFilter }).then((d) => setSchedules(d?.data || d)).catch(() => setSchedules([]))
    }
  }, [dateFilter])

  // Sincroniza selectedDate com dateFilter (quando dateFilter for YYYY-MM-DD)
  useEffect(() => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateFilter)) {
  // Parse date at midday to avoid timezone shift that can show previous day
  const d = new Date(`${dateFilter}T12:00:00`)
      setSelectedDate(d)
    } else {
      setSelectedDate(undefined)
    }
  }, [dateFilter])

  useEffect(() => {
    let filtered = schedules

    // Filtrar por termo de busca (nome do serviço)
    if (searchTerm) {
      filtered = filtered.filter(
        (sch) => sch.service.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por status (de agendamento)
    if (statusFilter !== "all") {
      filtered = filtered.filter((sch) =>
        sch.appointments.some((apt) => apt.status.toLowerCase() === statusFilter)
      )
    }

    // Filtrar por data
    if (dateFilter !== "all") {
      const today = new Date()
      const todayString = format(today, "yyyy-MM-dd")

      switch (dateFilter) {
        case "today":
          filtered = filtered.filter((sch) => sch.date.slice(0, 10) === todayString)
          break
        case "upcoming":
          filtered = filtered.filter((sch) => sch.date.slice(0, 10) >= todayString)
          break
        case "past":
          filtered = filtered.filter((sch) => sch.date.slice(0, 10) < todayString)
          break
      }
    }

    // Ordenar por data e horário
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`)
      const dateB = new Date(`${b.date}T${b.startTime}`)
      return dateB.getTime() - dateA.getTime()
    })

    setFilteredSchedules(filtered)
  }, [schedules, searchTerm, statusFilter, dateFilter])

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmado</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelado</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendente</Badge>
    }
  }

  // Estatísticas baseadas nos schedules/appointments
  const getAppointmentStats = () => {
    let total = 0, confirmed = 0, pending = 0, cancelled = 0
    schedules.forEach((sch) => {
      sch.appointments.forEach((apt) => {
        total++
        if (apt.status.toLowerCase() === "confirmed") confirmed++
        else if (apt.status.toLowerCase() === "pending") pending++
        else if (apt.status.toLowerCase() === "cancelled") cancelled++
      })
    })
    return { total, confirmed, pending, cancelled }
  }
  const stats = getAppointmentStats()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Agendamentos</h1>
        <p className="text-gray-600">Gerencie todos os seus agendamentos</p>
      </div>

  {/* Estatísticas */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </>
                )}
              </div>
              <CalendarIcon className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-muted-foreground">Confirmados</p>
                    <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
                  </>
                )}
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
  {/* Pending card removed because appointments default to confirmed */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-muted-foreground">Cancelados</p>
                    <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                  </>
                )}
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros - responsivo */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Grid em mobile empilha, em md distribui */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2 w-full">
              <label className="text-xs md:text-sm font-medium">Buscar</label>
              <Input
                className="w-full"
                placeholder="Nome do serviço"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2 w-full">
              <label className="text-xs md:text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="confirmed">Confirmados</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 w-full sm:col-span-2 lg:col-span-1">
              <label className="text-xs md:text-sm font-medium">Data</label>
              <div className="flex items-center gap-2">
                <Popover>
                  <div className="relative w-full">
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        data-empty={!selectedDate}
                        className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal text-xs md:text-sm pr-8"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR }) : <span>Selecionar data</span>}
                      </Button>
                    </PopoverTrigger>
                    {selectedDate && (
                      <button
                        onClick={() => {
                          setSelectedDate(undefined)
                          setDateFilter('all')
                        }}
                        aria-label="Limpar data"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    <PopoverContent className="w-auto p-0" align="start">
                      <DatePicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          if (!date) return
                          const clicked = format(date, 'yyyy-MM-dd')
                          if (selectedDate && format(selectedDate, 'yyyy-MM-dd') === clicked) {
                            setSelectedDate(undefined)
                            setDateFilter('all')
                            return
                          }
                          setSelectedDate(date)
                          setDateFilter(clicked)
                        }}
                      />
                    </PopoverContent>
                  </div>
                </Popover>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de agendamentos */}
      <div className="space-y-4">
        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[0,1,2,3,4,5].map((i) => (
              <Card key={i}>
                <CardContent className="p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                  <div className="h-2 bg-gray-200 rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredSchedules.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Nenhum agendamento encontrado.</p>
            </CardContent>
          </Card>
        ) : (
          filteredSchedules.map((schedule) => (
            <Card key={schedule.id}>
              <CardContent className="p-5 md:p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  {/* Coluna info do serviço (borda só no mobile) */}
                  <div className="flex-1 space-y-3 pb-4 border-b md:border-none md:pb-0">
                    <div className="flex flex-col gap-1">
                      <h3 className="font-semibold text-lg leading-tight">{schedule.service.name}</h3>
                      <span className="text-xs text-muted-foreground">Horário: {schedule.startTime} - {schedule.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{format(new Date(`${schedule.date.slice(0,10)}T12:00:00`), "dd/MM/yyyy", { locale: ptBR })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-medium">Disponível:</span>
                      <span className={schedule.isAvailable ? 'text-green-600' : 'text-red-600'}>
                        {schedule.isAvailable ? 'Sim' : 'Não'}
                      </span>
                    </div>
                  </div>
                  {/* Coluna agendamentos (layout original no desktop) */}
                  <div className="flex-1 space-y-2">
                    {schedule.appointments.length === 0 ? (
                      <div className="text-muted-foreground text-xs md:text-sm">Nenhum agendamento para este horário.</div>
                    ) : (
                      schedule.appointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="rounded border md:border-0 p-3 md:p-0 flex flex-col gap-2 bg-muted/30 md:bg-transparent"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <User className="h-4 w-4 shrink-0" />
                              <div className="min-w-0">
                                <div className="font-medium text-sm truncate max-w-[180px] md:max-w-[220px]">{apt.user?.name || `ID: ${apt.userId}`}</div>
                                {apt.user?.email && <div className="text-[11px] text-muted-foreground truncate max-w-[180px] md:max-w-[220px]">{apt.user.email}</div>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 self-start">
                              {getStatusBadge(apt.status)}
                              {apt.status.toLowerCase() !== 'cancelled' && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="icon" variant="ghost" className="h-7 w-7" disabled={cancelingIds.includes(apt.id)}>
                                      <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogTitle>Confirmar cancelamento</AlertDialogTitle>
                                    <AlertDialogDescription>Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.</AlertDialogDescription>
                                    <div className="mt-4 flex justify-end gap-2">
                                      <AlertDialogCancel>Fechar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => cancelAppointment(apt.id)}>Confirmar</AlertDialogAction>
                                    </div>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">
                            <span>
                              Criado: {
                                new Intl.DateTimeFormat('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false,
                                  timeZone: 'America/Sao_Paulo',
                                }).format(new Date(apt.createdAt))
                              }
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
