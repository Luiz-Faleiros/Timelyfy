"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Plus, Eye, CalendarDays, Clock, User } from "lucide-react"

interface Service {
  id: string
  name: string
  duration: number // em minutos
  startTime: string
  endTime: string
  interval: number // em minutos
  workDays: string[]
}

export default function AdminDashboard() {
  const [services, setServices] = useState<Service[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [newService, setNewService] = useState({
    name: "",
    duration: 30,
    startTime: "09:00",
    endTime: "18:00",
    interval: 30,
    workDays: [] as string[],
  })
  const { toast } = useToast()

  const weekDays = [
    { id: "monday", label: "Segunda-feira" },
    { id: "tuesday", label: "Terça-feira" },
    { id: "wednesday", label: "Quarta-feira" },
    { id: "thursday", label: "Quinta-feira" },
    { id: "friday", label: "Sexta-feira" },
    { id: "saturday", label: "Sábado" },
    { id: "sunday", label: "Domingo" },
  ]

  const handleCreateService = () => {
    if (!newService.name || newService.workDays.length === 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    const service: Service = {
      id: Date.now().toString(),
      ...newService,
    }

    setServices([...services, service])
    setNewService({
      name: "",
      duration: 30,
      startTime: "09:00",
      endTime: "18:00",
      interval: 30,
      workDays: [],
    })
    setIsCreating(false)

    toast({
      title: "Serviço criado!",
      description: "O serviço foi adicionado com sucesso.",
    })
  }

  const handleDeleteService = (id: string) => {
    setServices(services.filter((service) => service.id !== id))
    toast({
      title: "Serviço removido",
      description: "O serviço foi removido com sucesso.",
    })
  }

  const handleWorkDayChange = (dayId: string, checked: boolean) => {
    if (checked) {
      setNewService({
        ...newService,
        workDays: [...newService.workDays, dayId],
      })
    } else {
      setNewService({
        ...newService,
        workDays: newService.workDays.filter((day) => day !== dayId),
      })
    }
  }

  const getPublicLink = (serviceId: string) => {
    return `${window.location.origin}/booking/${serviceId}`
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Gerencie seus serviços e visualize estatísticas</p>
      </div>

      {services.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Serviços Ativos</p>
                  <p className="text-2xl font-bold">{services.length}</p>
                </div>
                <CalendarDays className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Agendamentos Hoje</p>
                  <p className="text-2xl font-bold">
                    {
                      JSON.parse(localStorage.getItem("appointments") || "[]").filter(
                        (apt: any) => apt.date === new Date().toISOString().split("T")[0],
                      ).length
                    }
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Agendamentos</p>
                  <p className="text-2xl font-bold">
                    {JSON.parse(localStorage.getItem("appointments") || "[]").length}
                  </p>
                </div>
                <User className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Botão para criar novo serviço */}
      <div className="mb-8">
        <Button onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      {/* Formulário de criação */}
      {isCreating && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Criar Novo Serviço</CardTitle>
            <CardDescription>Configure os detalhes do seu serviço</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serviceName">Nome do Serviço *</Label>
                <Input
                  id="serviceName"
                  placeholder="Ex: Corte de Cabelo"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duração (minutos)</Label>
                <Select
                  value={newService.duration.toString()}
                  onValueChange={(value) => setNewService({ ...newService, duration: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="90">1h 30min</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Horário de Início</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newService.startTime}
                  onChange={(e) => setNewService({ ...newService, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Horário de Fim</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newService.endTime}
                  onChange={(e) => setNewService({ ...newService, endTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interval">Intervalo (minutos)</Label>
                <Select
                  value={newService.interval.toString()}
                  onValueChange={(value) => setNewService({ ...newService, interval: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Dias de Funcionamento *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {weekDays.map((day) => (
                  <div key={day.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={day.id}
                      checked={newService.workDays.includes(day.id)}
                      onCheckedChange={(checked) => handleWorkDayChange(day.id, checked as boolean)}
                    />
                    <Label htmlFor={day.id} className="text-sm">
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleCreateService} className="bg-blue-600 hover:bg-blue-700">
                Criar Serviço
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de serviços */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Meus Serviços</h2>
        {services.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Nenhum serviço cadastrado ainda.</p>
              <p className="text-sm text-muted-foreground mt-1">Clique em "Novo Serviço" para começar.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {services.map((service) => (
              <Card key={service.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">{service.name}</h3>
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <p>Duração: {service.duration} minutos</p>
                        <p>
                          Horário: {service.startTime} às {service.endTime}
                        </p>
                        <p>Intervalo: {service.interval} minutos</p>
                        <p>
                          Dias: {service.workDays.map((day) => weekDays.find((d) => d.id === day)?.label).join(", ")}
                        </p>
                      </div>
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">Link público:</p>
                        <p className="text-sm text-blue-700 break-all">{getPublicLink(service.id)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(getPublicLink(service.id), "_blank")}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteService(service.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
