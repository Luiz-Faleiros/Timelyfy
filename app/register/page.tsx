"use client"

import React, { useState } from "react"
// ...existing code...
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

const ADMIN_CODE = process.env.NEXT_PUBLIC_ADMIN_CODE ?? ""
const ADMIN_INVITE_CODE = process.env.NEXT_PUBLIC_ADMIN_INVITE_CODE ?? ""

export default function RegisterPage() {
  const [stage, setStage] = useState<"gate" | "form" | "done">("gate")
  const [code, setCode] = useState("")

  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  // role is always ADMIN

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { toast } = useToast()

  function handleCheckCode(e: React.FormEvent) {
    e.preventDefault()
    if (!ADMIN_CODE) {
      setError("Código de convite não configurado no ambiente (NEXT_PUBLIC_ADMIN_CODE).")
      return
    }

    if (code === ADMIN_CODE) {
      setError("")
      setStage("form")
    } else {
      setError("Código inválido.")
    }
  }

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
  // voltar para o estado inicial (gate) e limpar campos
  setName("")
  setEmail("")
  setPassword("")
  setCode("")
  setError("")
  setStage("gate")
      // optional: redirect to login
      // router.push('/login')
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
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-blue-900">Registrar</CardTitle>
              <CardDescription>Insira o código de convite para abrir o formulário de registro.</CardDescription>
            </CardHeader>

            <CardContent>
              {stage === "gate" && (
                <form onSubmit={handleCheckCode} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite">Código de convite</Label>
                    <Input id="invite" placeholder="Código de convite" value={code} onChange={(e) => setCode(e.target.value)} />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">Verificar código</Button>
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  {!ADMIN_CODE && (
                    <p className="text-sm text-muted-foreground">Nota: adicione NEXT_PUBLIC_ADMIN_INVITE_CODE em `.env.local` para testar.</p>
                  )}
                </form>
              )}

              {stage === "form" && (
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

                  <div className="space-y-2">
                    <Label htmlFor="role">Papel</Label>
                    <Input id="role" value="ADMIN" readOnly disabled />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={loading}>{loading ? 'Enviando...' : 'Registrar'}</Button>
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}
                </form>
              )}

              {stage === "done" && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Registro enviado</h3>
                  <p className="text-sm text-muted-foreground">Se o cadastro for confirmado, você poderá entrar com suas credenciais.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
