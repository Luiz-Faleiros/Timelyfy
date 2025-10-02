"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Plus, Eye, CalendarDays, Clock, User } from "lucide-react"
import { format } from 'date-fns'
import { getSchedules } from '@/lib/api'

interface Service {
  id: string
  name: string
  duration: number // em minutos
  startTime: string
  endTime: string
  interval: number // em minutos
  workDays: string[]
  description?: string
  price?: number
}

export default function AdminDashboard() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [todayCount, setTodayCount] = useState<number>(0)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [isCreating, setIsCreating] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [newService, setNewService] = useState({
    name: "",
  description: "",
  price: 0,
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

  const _dayIndexToId = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']

  const normalizeWorkDays = (raw: any): string[] => {
    if (!Array.isArray(raw)) return []
    const ids = _dayIndexToId
    const normalized = raw
      .map((r) => String(r).trim().toLowerCase())
      .map((s) => {
        // numeric representation (0 = sunday)
        if (/^\d+$/.test(s)) {
          const n = Number(s)
          if (n >= 0 && n <= 6) return ids[n]
        }

        // already an id like 'monday'
        if (ids.includes(s)) return s

        // backend might send uppercase english names like 'friday' or 'FRIDAY'
        const simple = s.replace(/[^a-z]/g, '')
        if (ids.includes(simple)) return simple

        return s
      })
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)

    return normalized
  }

  const handleCreateService = async () => {
    if (!newService.name || newService.workDays.length === 0) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    const payload = {
      name: newService.name,
      description: newService.description,
      price: Number(newService.price) || 0,
      duration: Number(newService.duration) || 0,
      startTime: newService.startTime,
      endTime: newService.endTime,
      interval: Number(newService.interval) || 0,
      daysOfWeek: newService.workDays.map((d) => d.toUpperCase()),
    }

    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || 'Erro ao criar serviço')
      }

      const created: Service = {
        id: data?.data?.id || Date.now().toString(),
        name: newService.name,
        duration: newService.duration,
        startTime: newService.startTime,
        endTime: newService.endTime,
        interval: newService.interval,
        workDays: newService.workDays,
        description: newService.description,
        price: newService.price,
      }

      const updatedList = [...services, created]
      setServices(updatedList)
      localStorage.setItem('services', JSON.stringify(updatedList))

      setNewService({ name: '', description: '', price: 0, duration: 30, startTime: '09:00', endTime: '18:00', interval: 30, workDays: [] })
      setIsCreating(false)

      toast({ title: 'Serviço criado!', description: 'O serviço foi adicionado com sucesso.' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err?.message || 'Erro ao criar serviço', variant: 'destructive' })
    }
  }

  const handleDeleteService = (id: string) => {
    ;(async () => {
      try {
        const res = await fetch(`/api/services/${id}`, { method: 'DELETE' })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || 'Erro ao remover serviço')

        const updated = services.filter((service) => service.id !== id)
        setServices(updated)

        toast({
          title: 'Serviço removido',
          description: 'O serviço foi removido com sucesso.',
        })
      } catch (err: any) {
        toast({ title: 'Erro', description: err?.message || 'Erro ao remover serviço', variant: 'destructive' })
      }
    })()
  }

  // Iniciar edição: preencher o formulário e abrir o painel
  const handleEditService = (id: string) => {
    const service = services.find((s) => s.id === id)
    if (!service) return
    setNewService({
  name: service.name,
  description: (service as any).description || '',
  price: (service as any).price || 0,
  duration: service.duration,
  startTime: service.startTime,
  endTime: service.endTime,
  interval: service.interval,
  workDays: normalizeWorkDays((service as any).workDays || (service as any).daysOfWeek || []),
    })
    setEditingServiceId(id)
    setIsCreating(true)
  }

  const handleUpdateService = () => {
    if (!editingServiceId) return
    if (!newService.name || newService.workDays.length === 0) {
      toast({ title: 'Erro', description: 'Preencha todos os campos obrigatórios.', variant: 'destructive' })
      return
    }

    ;(async () => {
      try {
        const payload = {
          name: newService.name,
          description: newService.description,
          price: Number(newService.price) || 0,
          duration: Number(newService.duration) || 0,
          startTime: newService.startTime,
          endTime: newService.endTime,
          interval: Number(newService.interval) || 0,
          daysOfWeek: newService.workDays.map((d) => d.toUpperCase()),
        }

        const res = await fetch(`/api/services/${editingServiceId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || 'Erro ao atualizar serviço')

        // backend may return updated resource in json.data
        let updatedService = json?.data?.data || json?.data || { id: editingServiceId, ...newService }

        updatedService = {
          ...(updatedService as any),
          workDays: normalizeWorkDays((updatedService as any).workDays || (updatedService as any).daysOfWeek || newService.workDays),
        }

        const updated = services.map((s) => (s.id === editingServiceId ? { ...s, id: s.id, ...(updatedService as any) } : s))
        setServices(updated)
        setEditingServiceId(null)
        setIsCreating(false)

        toast({ title: 'Serviço atualizado', description: 'O serviço foi atualizado com sucesso.' })
      } catch (err: any) {
        toast({ title: 'Erro', description: err?.message || 'Erro ao atualizar serviço', variant: 'destructive' })
      }
    })()
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

  const slugify = (text: string) =>
    text
      .toString()
      .normalize('NFKD')
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/--+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, '') // Trim - from end of text
      .toLowerCase()

  const getPublicLink = (serviceNameOrId: string) => {
    // If input looks like an id (no spaces), fallback to id route; otherwise use slugified name
    const hasSpace = /\s/.test(serviceNameOrId)
    const slug = hasSpace ? slugify(serviceNameOrId) : slugify(serviceNameOrId)
    return `${window.location.origin}/booking/${slug}`
  }

  // carregar serviços do localStorage ao montar
  useEffect(() => {
    async function loadServices() {
  setLoading(true)
      try {
        const res = await fetch('/api/services')
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || 'Erro ao carregar serviços')

        // backend returns { data: [...] } or similar
        const list: any[] = json?.data?.data || json?.data || []
        if (Array.isArray(list) && list.length > 0) {
          const normalized = list.map((s) => ({
            ...s,
            workDays: normalizeWorkDays(s.workDays || s.daysOfWeek),
          }))
          setServices(normalized as Service[])
        } else {
          // ensure services is empty array when none returned
          setServices([])
        }
      } catch (err) {
        // leave services empty
        console.error('Failed to load services', err)
      }
      finally {
        setLoading(false)
      }
    }

    loadServices()
    // also fetch schedule counts
    ;(async () => {
      try {
        const today = format(new Date(), 'yyyy-MM-dd')
        const todayRes = await getSchedules({ date: today })
        const todayData = todayRes?.data || todayRes || []
        const todayAppointments = Array.isArray(todayData)
          ? todayData.reduce((acc: number, sch: any) => acc + ((sch.appointments && sch.appointments.length) || 0), 0)
          : 0
        setTodayCount(todayAppointments)

        const allRes = await getSchedules()
        const allData = allRes?.data || allRes || []
        const allAppointments = Array.isArray(allData)
          ? allData.reduce((acc: number, sch: any) => acc + ((sch.appointments && sch.appointments.length) || 0), 0)
          : 0
        setTotalCount(allAppointments)
      } catch (err) {
        console.error('Failed to load schedule counts', err)
        setTodayCount(0)
        setTotalCount(0)
      }
    })()
  }, [])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Gerencie seus serviços e visualize estatísticas</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="p-6 bg-white rounded-lg shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/5 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : services.length > 0 ? (
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
                  <p className="text-2xl font-bold">{todayCount}</p>
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
                  <p className="text-2xl font-bold">{totalCount}</p>
                </div>
                <User className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

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
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newService.price?.toString?.() || ''}
                  onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
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

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <textarea
                id="description"
                className="w-full p-2 border rounded-md"
                rows={3}
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                placeholder="Descrição do serviço"
              />
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
              <Button
                onClick={editingServiceId ? handleUpdateService : handleCreateService}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editingServiceId ? "Atualizar Serviço" : "Criar Serviço"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false)
                  setEditingServiceId(null)
                    setNewService({
                      name: "",
                      description: "",
                      price: 0,
                      duration: 30,
                      startTime: "09:00",
                      endTime: "18:00",
                      interval: 30,
                      workDays: [],
                    })
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de serviços */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Meus Serviços</h2>
        {loading ? (
          <div className="grid gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="p-6 bg-white rounded-lg shadow-sm animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
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
                          Dias: {(service.workDays || []).map((day) => weekDays.find((d) => d.id === day)?.label).join(", ")}
                        </p>
                      </div>
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">Link público:</p>
                        <p className="text-sm text-blue-700 break-all">{getPublicLink(service.name)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(getPublicLink(service.name), "_blank")}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditService(service.id)}
                        className="flex items-center gap-1"
                      >
                        Editar
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
