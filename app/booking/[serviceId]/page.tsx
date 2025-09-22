"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from "@/hooks/use-toast"
import { CalendarDays, Clock, User, Mail } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

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
    // Simular busca do serviço - em produção buscar do banco de dados
    const mockServices: Service[] = JSON.parse(localStorage.getItem("services") || "[]")
    let foundService = mockServices.find((s) => s.id === params.serviceId)

    // Se não encontrou serviço, criar um mock para facilitar testes locais
    if (!foundService) {
      // criar um serviço de exemplo com workDays úteis (segunda a sexta)
      const exampleService: Service = {
        id: params.serviceId,
        name: "Corte de Cabelo - Teste",
        duration: 30,
        startTime: "09:00",
        endTime: "17:00",
        interval: 30,
        workDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      }

      const updatedServices = [...mockServices, exampleService]
      localStorage.setItem("services", JSON.stringify(updatedServices))
      foundService = exampleService
    }

    if (foundService) {
      setService(foundService)
    }

    // Carregar agendamentos existentes
    const existingAppointments: Appointment[] = JSON.parse(localStorage.getItem("appointments") || "[]")
    setAppointments(existingAppointments)
  }, [params.serviceId])

  useEffect(() => {
    if (selectedDate && service) {
      generateAvailableTimes()
    }
  }, [selectedDate, service, appointments])

  const generateAvailableTimes = () => {
    if (!service || !selectedDate) return

    const times: string[] = []
    const startTime = parseTime(service.startTime)
    const endTime = parseTime(service.endTime)
    const interval = service.interval
    const duration = service.duration

    let currentTime = startTime

    while (currentTime + duration <= endTime) {
      const timeString = formatTime(currentTime)

      // Verificar se já existe agendamento neste horário
      const dateString = format(selectedDate, "yyyy-MM-dd")
      const isBooked = appointments.some(
        (apt) => apt.serviceId === service.id && apt.date === dateString && apt.time === timeString,
      )

      if (!isBooked) {
        times.push(timeString)
      }

      currentTime += interval
    }

    setAvailableTimes(times)
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

  const isDateAvailable = (date: Date) => {
    if (!service) return false

    const dayOfWeek = date.getDay()
    const dayName = Object.keys(weekDayMap).find((key) => weekDayMap[key as keyof typeof weekDayMap] === dayOfWeek)

    return dayName ? service.workDays.includes(dayName) : false
  }

  const handleBooking = () => {
  if (!selectedDate || !selectedTime || !clientName || !clientEmail) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      serviceId: params.serviceId,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: selectedTime,
      clientName,
  clientEmail,
    }

    const updatedAppointments = [...appointments, newAppointment]
    setAppointments(updatedAppointments)
    localStorage.setItem("appointments", JSON.stringify(updatedAppointments))

    toast({
      title: "Agendamento confirmado!",
      description: `Seu horário foi marcado para ${format(selectedDate, "dd/MM/yyyy", { locale: ptBR })} às ${selectedTime}.`,
    })

    // Limpar formulário
    setSelectedDate(undefined)
    setSelectedTime("")
  setClientName("")
  setClientEmail("")
    setIsLoading(false)
  }

  if (!service) {
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
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || !isDateAvailable(date)}
                locale={ptBR}
                className="rounded-md border"
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
                  {availableTimes.length === 0 ? (
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
