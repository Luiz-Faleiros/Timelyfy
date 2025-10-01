"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from "@/hooks/use-toast"
import { CalendarDays, Clock, User, Mail } from "lucide-react"
import { format, startOfDay, startOfMonth, endOfMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Skeleton } from "@/components/ui/skeleton"

interface Service {
  id: string
  name: string
  duration: number
  startTime: string
  endTime: string
  interval: number
  workDays: string[]
}

interface Appointment {
  id: string
  serviceId: string
  date: string
  time: string
  clientName: string
  clientEmail: string
}

interface BookingPageProps {
  params: {
    serviceId: string
  }
}

export default function BookingPage({ params }: BookingPageProps) {
  const [service, setService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [visibleMonth, setVisibleMonth] = useState<Date | null>(null)
  const [fullyBookedDates, setFullyBookedDates] = useState<Record<string, boolean>>({})
  const [bookedTimesForDate, setBookedTimesForDate] = useState<Record<string, string[]>>({})
  const [schedulesLoading, setSchedulesLoading] = useState(false)

  const weekDayMap = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 0,
  }

  useEffect(() => {
    // Buscar serviço da API
    async function loadService() {
      try {
        const res = await fetch('/api/services')
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || 'Erro ao carregar serviços')

  const list: any[] = json?.data?.data || json?.data || []

        const slugify = (text: string) =>
          text
            .toString()
            .normalize('NFKD')
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/--+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '')
            .toLowerCase()

        let foundService = list.find((s) => s.id === params.serviceId)
        if (!foundService) {
          foundService = list.find((s) => s.name && slugify(s.name) === params.serviceId)
        }

        if (foundService) {
          const extractDays = (s: any): string[] => {
            const raw = s.workDays ?? s.daysofwEEK ?? s.daysOfWeek ?? s.days_of_week ?? s.daysofweek ?? s.daysofWeek ?? s.days ?? s.day_map ?? []

            // If backend provided an object map like { monday: true, tuesday: false }
            if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
              try {
                const keys = Object.keys(raw).filter((k) => {
                  const v = raw[k]
                  return v === true || v === 'true' || v === 1 || v === '1'
                })
                if (keys.length) return keys.map((k) => String(k))
              } catch (e) {
                // fallthrough
              }
            }

            if (Array.isArray(raw)) return raw.map((v) => String(v).trim()).filter(Boolean)
            if (typeof raw === 'string') return raw.split(/[,;|]/).map((v) => v.trim()).filter(Boolean)
            return []
          }

          const normalized: Service = {
            id: String(foundService.id),
            name: foundService.name,
            duration: Number(foundService.duration ?? foundService.length ?? 60),
            startTime: String(foundService.startTime ?? foundService.start_time ?? foundService.start ?? '09:00'),
            endTime: String(foundService.endTime ?? foundService.end_time ?? foundService.end ?? '17:00'),
            interval: Number(foundService.interval ?? foundService.step ?? 30),
            workDays: extractDays(foundService),
          }

          setService(normalized)
        }

      } catch (err) {
        console.error('Erro ao carregar serviço', err)
      }
    }

    loadService()

  // Carregar agendamentos existentes (não usa mais localStorage)
  // mantém o estado de agendamentos apenas em memória
  }, [params.serviceId])

  // Removed monthly range fetch: schedules will be fetched only when user selects a date

  // fetch schedules for the selected date to refresh availability
  useEffect(() => {
    if (!service || !selectedDate) return
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const fetchForDate = async () => {
      setSchedulesLoading(true)
      try {
        const res = await fetch(`/api/public/services/${service.id}/schedules?date=${dateStr}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || 'Erro ao carregar agendas')
        const list: any[] = json?.data || json || []

        // booked times are schedules that have appointments
        const booked = list
          .filter((i) => i.appointments && i.appointments.some((a: any) => a.status === 'CONFIRMED'))
          .map((i) => i.startTime || i.time || (i.datetime ? i.datetime.split('T')[1]?.slice(0,5) : null))
          .filter(Boolean)

        // available times are schedules without CONFIRMED appointments
        const available = list
          .filter((i) => !(i.appointments && i.appointments.some((a: any) => a.status === 'CONFIRMED')))
          .map((i) => i.startTime || i.time || (i.datetime ? i.datetime.split('T')[1]?.slice(0,5) : null))
          .filter(Boolean)

        setBookedTimesForDate((prev) => ({ ...prev, [dateStr]: booked }))

        // Filter out past times if the selected date is today
        const todayStrNow = format(new Date(), 'yyyy-MM-dd')
        const nowMinutes = (() => {
          const n = new Date()
          return n.getHours() * 60 + n.getMinutes()
        })()

        const filterFutureTimes = (times: string[]) =>
          times.filter((t) => {
            if (!t) return false
            try {
              const mins = parseTime(t)
              if (dateStr === todayStrNow) {
                return mins > nowMinutes
              }
              return true
            } catch (e) {
              return false
            }
          })

        const availableFiltered = filterFutureTimes(available)

        if (availableFiltered.length > 0) {
          setAvailableTimes(availableFiltered)
          setFullyBookedDates((prev) => ({ ...prev, [dateStr]: false }))
        } else {
          // fallback: generate slots from service config excluding CONFIRMED bookings
          const timesFallback: string[] = []
          const startTime = parseTime(service.startTime)
          const endTime = parseTime(service.endTime)
          const interval = service.interval
          const duration = service.duration

          let currentTime = startTime
          while (currentTime + duration <= endTime) {
            const timeString = formatTime(currentTime)
            if (!booked.includes(timeString)) {
              timesFallback.push(timeString)
            }
            currentTime += interval
          }

          const fallbackFiltered = filterFutureTimes(timesFallback)

          setAvailableTimes(fallbackFiltered)
          setFullyBookedDates((prev) => ({ ...prev, [dateStr]: fallbackFiltered.length === 0 }))
        }
      } catch (err) {
        console.error('Erro ao carregar agendas do dia', err)
      } finally {
        setSchedulesLoading(false)
      }
    }

    fetchForDate()
  }, [service, selectedDate])

  const computeTotalSlotsForDate = (svc: Service, _dateStr: string) => {
    // compute how many possible appointment slots exist in the day using same logic as generateAvailableTimes
    const start = parseTime(svc.startTime)
    const end = parseTime(svc.endTime)
    const interval = svc.interval
    const duration = svc.duration

    let count = 0
    let current = start
    while (current + duration <= end) {
      count++
      current += interval
    }
    return count
  }

  const parseTime = (timeString: string): number => {
    const [hours, minutes] = timeString.split(":").map(Number)
    return hours * 60 + minutes
  }

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
  }

  // helper: check if a given date still has future slots based on service config
  const hasFutureSlotsForDate = (svc: Service, date: Date) => {
    try {
      const todayStrNow = format(new Date(), 'yyyy-MM-dd')
      const nowMinutes = (() => {
        const n = new Date()
        return n.getHours() * 60 + n.getMinutes()
      })()

      const start = parseTime(svc.startTime)
      const end = parseTime(svc.endTime)
      const interval = svc.interval
      const duration = svc.duration

      let current = start
      while (current + duration <= end) {
        if (format(date, 'yyyy-MM-dd') === todayStrNow) {
          if (current > nowMinutes) return true
        } else {
          return true
        }
        current += interval
      }
      return false
    } catch (e) {
      return true
    }
  }

  const isDateAvailable = (date: Date) => {
    if (!service) return false

    // don't disable today
    const todayStart = startOfDay(new Date())
    if (date < todayStart) return false

    const dayOfWeek = date.getDay() // 0 = Sunday, 6 = Saturday

    const dayNameByIndex = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ]

    const dayName = dayNameByIndex[dayOfWeek]

  // Normalize workDays into weekday indices (0 = Sunday .. 6 = Saturday).
  // Accept numbers (0-6), English names and Portuguese names.
  const normalizeToIndex = (input: any): number | null => {
    if (input === null || input === undefined) return null
    const s = String(input).toLowerCase().trim()
    const asNum = Number(s)
    if (!Number.isNaN(asNum)) {
      return asNum
    }

  // remove diacritics and non-alpha characters
  const stripped = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '')

  // mapping of common names without accents/punctuation to weekday index
  const namesToIndex: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      domingo: 0,
      segunda: 1,
      segundafeira: 1,
      terca: 2,
      tercafeira: 2,
      quarta: 3,
      quartafeira: 3,
      quinta: 4,
      quintafeira: 4,
      sexta: 5,
      sextafeira: 5,
      sabado: 6,
    }
  const key = stripped
  if (namesToIndex[key] !== undefined) return namesToIndex[key]
    return null
  }

  const workDayIndexes = (service.workDays || [])
    .map((d) => normalizeToIndex(d))
    .filter((i): i is number => i !== null && !Number.isNaN(i))

  // If backend didn't provide workDays, allow selection by default
  if (workDayIndexes.length === 0) return true

  // check fully booked from remote schedules
  const dateStr = format(date, 'yyyy-MM-dd')
  if (fullyBookedDates[dateStr]) return false

  // Only allow if the day's index is present in configured work days
  return workDayIndexes.includes(dayOfWeek)
  }

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !clientName || !clientEmail) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    const dateStr = format(selectedDate, "yyyy-MM-dd")

    const payload = {
      serviceId: isNaN(Number(service?.id)) ? service?.id : Number(service?.id),
      date: dateStr,
      time: selectedTime,
      name: clientName,
      email: clientEmail,
    }

    try {
      const res = await fetch('/api/public/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()

      // Consider HTTP 200 explicitly as success. Also accept other OK responses
      // unless the API explicitly indicates failure in the JSON payload.
      const isSuccessfulStatus = res.status === 200
      const isSuccessfulBody = res.ok && json?.success !== false

      if (!isSuccessfulStatus && !isSuccessfulBody) {
        throw new Error(json?.error || json?.message || 'Erro ao criar agendamento')
      }

      // Update local appointments store (in-memory)
      const newAppointment: Appointment = {
        id: String(json?.data?.id || Date.now().toString()),
        serviceId: String(payload.serviceId),
        date: payload.date,
        time: payload.time,
        clientName: clientName,
        clientEmail: clientEmail,
      }

  const updatedAppointments = [...appointments, newAppointment]
  setAppointments(updatedAppointments)
  // Não persiste mais em localStorage — manter apenas em memória

      // update booked times for the date locally to reflect new booking
      setBookedTimesForDate((prev) => {
        const prevList = prev[dateStr] || []
        return { ...prev, [dateStr]: [...prevList, selectedTime] }
      })

      // remove the selected time from availableTimes for immediate UI update
      setAvailableTimes((prev) => prev.filter((t) => t !== selectedTime))

      // recompute fully booked flag for that date
      setFullyBookedDates((prev) => {
        const booked = (bookedTimesForDate[dateStr] || []).length + 1 // include this new booking
        const total = computeTotalSlotsForDate(service as Service, dateStr)
        return { ...prev, [dateStr]: booked >= total }
      })

      toast({
        title: 'Agendamento realizado com sucesso',
        description: `Seu horário foi marcado para ${format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })} às ${selectedTime}.`,
      })

      // Resetar estado da página (limpar formulário e disponibilidades)
      setSelectedDate(undefined)
      setSelectedTime('')
      setClientName('')
      setClientEmail('')
      setAvailableTimes([])
      setVisibleMonth(null)
    } catch (err: any) {
      console.error('Erro ao criar agendamento', err)
      toast({
        title: 'Erro ao confirmar agendamento',
        description: err?.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }


  // Exibe Skeleton enquanto carrega o serviço
  if (service === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="text-center mb-8">
            <Skeleton className="h-10 w-1/2 mx-auto mb-2" />
            <Skeleton className="h-5 w-1/3 mx-auto" />
          </div>
          {/* Card de informações do serviço */}
          <div className="mb-8">
            <Skeleton className="h-24 w-full rounded-md" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Skeleton do calendário */}
            <div>
              <Skeleton className="h-80 w-full rounded-md" />
            </div>
            {/* Skeleton dos horários disponíveis e formulário */}
            <div className="space-y-6">
              <Skeleton className="h-40 w-full rounded-md" />
              <Skeleton className="h-56 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Se não encontrou serviço após carregar
  if (service === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Serviço não encontrado.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Agendar Horário</h1>
          <p className="text-muted-foreground">Escolha o melhor horário para você</p>
        </div>

        {/* Informações do serviço */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <CalendarDays className="h-5 w-5" />
              {service.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 text-base">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {service.duration} minutos
              </span>
              <span>
                {service.startTime} às {service.endTime}
              </span>
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Seleção de data */}
          <Card>
            <CardHeader>
              <CardTitle>Escolha a Data</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => {
                  setSelectedDate(d as Date)
                  setAvailableTimes([])
                  setSelectedTime('')
                }}
                disabled={(date) => !isDateAvailable(date)}
                locale={ptBR}
                className="rounded-md border"
                onMonthChange={(d) => setVisibleMonth(d)}
              />
            </CardContent>
          </Card>

          {/* Seleção de horário e dados do cliente */}
          <div className="space-y-6">
            {/* Horários disponíveis */}
            {selectedDate && (
              <Card>
                <CardHeader>
                  <CardTitle>Horários Disponíveis</CardTitle>
                  <CardDescription>{format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}</CardDescription>
                </CardHeader>
                <CardContent>
                  {schedulesLoading ? (
                    <div className="grid grid-cols-3 gap-2">
                      <Skeleton className="h-10" />
                      <Skeleton className="h-10" />
                      <Skeleton className="h-10" />
                    </div>
                  ) : availableTimes.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">Nenhum horário disponível para esta data.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {availableTimes.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          className={
                            selectedTime === time
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "hover:bg-blue-50 hover:border-blue-300"
                          }
                          onClick={() => setSelectedTime(time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Dados do cliente */}
            {selectedTime && (
              <Card>
                <CardHeader>
                  <CardTitle>Seus Dados</CardTitle>
                  <CardDescription>Preencha suas informações para confirmar o agendamento</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Nome Completo *
                    </Label>
                    <Input
                      id="clientName"
                      placeholder="Digite seu nome completo"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientEmail" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email *
                    </Label>
                    <Input
                      id="clientEmail"
                      placeholder="Digite seu email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={handleBooking}
                      disabled={isLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? "Confirmando..." : "Confirmar Agendamento"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
