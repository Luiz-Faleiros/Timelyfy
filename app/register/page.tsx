"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
// ...existing code...
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

const ADMIN_INVITE_CODE = process.env.NEXT_PUBLIC_ADMIN_INVITE_CODE ?? ""

export default function RegisterPage() {
  const router = useRouter()
  // removed stage & invite code gate – open form directly
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  // role is always ADMIN

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { toast } = useToast()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const payload: Record<string, any> = {
        email,
        password,
        name,
      }

  // always ADMIN
  payload.role = "ADMIN"
  payload.adminInviteCode = ADMIN_INVITE_CODE

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        toast({ title: "Erro no registro", description: data?.message || "Erro ao registrar.", variant: "destructive" })
        setLoading(false)
        return
      }

  toast({ title: "Registro criado", description: "Registro realizado com sucesso." })
  // limpar campos após sucesso
  setName("")
  setEmail("")
  setPassword("")
  setError("")
  // redirecionar para página principal
  router.push("/")
    } catch (err: any) {
      toast({ title: "Erro", description: err?.message || "Erro ao conectar com o servidor.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center">
          <Card className="w-full max-w-md relative">
            <div className="absolute left-3 top-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => router.push("/")}
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-blue-900">Registrar</CardTitle>
              <CardDescription>Preencha seus dados para criar sua conta de prestador.</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>

                {/* Campo de papel removido (sempre ADMIN no backend) */}

                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Enviando...' : 'Registrar'}</Button>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
