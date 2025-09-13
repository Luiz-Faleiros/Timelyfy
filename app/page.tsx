"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Calendar, Users } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-900">Timelyfy</h1>
          <Button onClick={() => router.push("/login")} className="bg-blue-600 hover:bg-blue-700">
            Área do Prestador
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-blue-900 mb-4">Plataforma de Agendamento Profissional</h2>
          <p className="text-xl text-gray-600 mb-8">
            Gerencie seus serviços e agendamentos de forma simples e eficiente
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
            <Card className="border-blue-200">
              <CardContent className="p-6">
                <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestão de Horários</h3>
                <p className="text-gray-600">Configure seus horários de atendimento, intervalos e dias disponíveis</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardContent className="p-6">
                <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Agendamentos Online</h3>
                <p className="text-gray-600">Seus clientes podem agendar horários facilmente através de um link</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
