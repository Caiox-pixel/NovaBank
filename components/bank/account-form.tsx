"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import type { Cliente, TipoConta } from "@/lib/types/bank"

interface AccountFormProps {
  clientes: Cliente[]
  preselectedClienteId?: number
}

function generateAccountNumber() {
  const random = Math.floor(Math.random() * 900000000) + 100000000
  return random.toString()
}

export function AccountForm({ clientes, preselectedClienteId }: AccountFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [clienteId, setClienteId] = useState<string>(
    preselectedClienteId?.toString() || ""
  )
  const [tipoConta, setTipoConta] = useState<TipoConta>("corrente")
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const saldoInicial = parseFloat(formData.get("saldo_inicial") as string) || 0

    const data = {
      cliente_id: parseInt(clienteId),
      numero_conta: generateAccountNumber(),
      tipo_conta: tipoConta,
      saldo: saldoInicial,
      ativa: true,
    }

    try {
      const { error } = await supabase.from("contas_bancarias").insert(data)
      if (error) throw error
      
      toast.success("Conta criada com sucesso!")
      setOpen(false)
      setClienteId("")
      setTipoConta("corrente")
      router.refresh()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro desconhecido"
      toast.error(`Erro ao criar conta: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Conta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Conta</DialogTitle>
          <DialogDescription>
            Selecione o cliente e o tipo de conta para criar uma nova conta bancária.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4 py-4">
            <Field>
              <FieldLabel>Cliente *</FieldLabel>
              <Select value={clienteId} onValueChange={setClienteId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id.toString()}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Tipo de Conta *</FieldLabel>
              <Select
                value={tipoConta}
                onValueChange={(v) => setTipoConta(v as TipoConta)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corrente">Conta Corrente</SelectItem>
                  <SelectItem value="poupanca">Conta Poupança</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="saldo_inicial">Saldo Inicial</FieldLabel>
              <Input
                id="saldo_inicial"
                name="saldo_inicial"
                type="number"
                step="0.01"
                min="0"
                defaultValue="0"
                placeholder="0,00"
              />
            </Field>
          </FieldGroup>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !clienteId}>
              {loading && <Spinner className="mr-2" />}
              Criar Conta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
