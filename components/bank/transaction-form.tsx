"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import type { ContaBancaria, TipoTransacao } from "@/lib/types/bank"

interface TransactionFormProps {
  contas: (ContaBancaria & { cliente?: { nome: string } })[]
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

const formatAccountNumber = (numero: string) => {
  return numero.replace(/(\d{5})(\d{4})/, "$1-$2")
}

export function TransactionForm({ contas }: TransactionFormProps) {
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tipoTransacao, setTipoTransacao] = useState<TipoTransacao>("deposito")
  const [contaOrigemId, setContaOrigemId] = useState<string>("")
  const [contaDestinoId, setContaDestinoId] = useState<string>("")
  const router = useRouter()
  const supabase = createClient()

  const contasAtivas = contas.filter((c) => c.ativa)

  useEffect(() => {
    const contaParam = searchParams.get("conta")
    const tipoParam = searchParams.get("tipo") as TipoTransacao | null

    if (contaParam) {
      setContaOrigemId(contaParam)
      setOpen(true)
    }
    if (tipoParam && ["deposito", "saque", "transferencia"].includes(tipoParam)) {
      setTipoTransacao(tipoParam)
    }
  }, [searchParams])

  const contaOrigem = contasAtivas.find((c) => c.id.toString() === contaOrigemId)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const valor = parseFloat(formData.get("valor") as string)
    const descricao = formData.get("descricao") as string || null

    if (!valor || valor <= 0) {
      toast.error("O valor deve ser maior que zero.")
      setLoading(false)
      return
    }

    if (tipoTransacao === "saque" && contaOrigem && valor > contaOrigem.saldo) {
      toast.error("Saldo insuficiente para realizar o saque.")
      setLoading(false)
      return
    }

    if (tipoTransacao === "transferencia" && contaOrigem && valor > contaOrigem.saldo) {
      toast.error("Saldo insuficiente para realizar a transferência.")
      setLoading(false)
      return
    }

    try {
      // Create transaction record
      const transactionData = {
        conta_origem_id: parseInt(contaOrigemId),
        conta_destino_id: tipoTransacao === "transferencia" ? parseInt(contaDestinoId) : null,
        tipo: tipoTransacao,
        valor,
        descricao,
      }

      const { error: transactionError } = await supabase
        .from("transacoes")
        .insert(transactionData)

      if (transactionError) throw transactionError

      // Update account balances
      if (tipoTransacao === "deposito") {
        const { error } = await supabase
          .from("contas_bancarias")
          .update({ saldo: (contaOrigem?.saldo || 0) + valor })
          .eq("id", parseInt(contaOrigemId))
        if (error) throw error
      } else if (tipoTransacao === "saque") {
        const { error } = await supabase
          .from("contas_bancarias")
          .update({ saldo: (contaOrigem?.saldo || 0) - valor })
          .eq("id", parseInt(contaOrigemId))
        if (error) throw error
      } else if (tipoTransacao === "transferencia") {
        const contaDestino = contasAtivas.find((c) => c.id.toString() === contaDestinoId)
        
        const { error: errorOrigem } = await supabase
          .from("contas_bancarias")
          .update({ saldo: (contaOrigem?.saldo || 0) - valor })
          .eq("id", parseInt(contaOrigemId))
        if (errorOrigem) throw errorOrigem

        const { error: errorDestino } = await supabase
          .from("contas_bancarias")
          .update({ saldo: (contaDestino?.saldo || 0) + valor })
          .eq("id", parseInt(contaDestinoId))
        if (errorDestino) throw errorDestino
      }

      const messages = {
        deposito: "Depósito realizado com sucesso!",
        saque: "Saque realizado com sucesso!",
        transferencia: "Transferência realizada com sucesso!",
      }

      toast.success(messages[tipoTransacao])
      setOpen(false)
      resetForm()
      router.push("/transacoes")
      router.refresh()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro desconhecido"
      toast.error(`Erro ao realizar transação: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setContaOrigemId("")
    setContaDestinoId("")
    setTipoTransacao("deposito")
  }

  const getTitle = () => {
    switch (tipoTransacao) {
      case "deposito":
        return "Realizar Depósito"
      case "saque":
        return "Realizar Saque"
      case "transferencia":
        return "Realizar Transferência"
    }
  }

  const getDescription = () => {
    switch (tipoTransacao) {
      case "deposito":
        return "Adicione fundos a uma conta bancária."
      case "saque":
        return "Retire fundos de uma conta bancária."
      case "transferencia":
        return "Transfira fundos entre contas bancárias."
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => {
      setOpen(v)
      if (!v) {
        router.push("/transacoes")
      }
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4 py-4">
            <Field>
              <FieldLabel>Tipo de Transação</FieldLabel>
              <Select
                value={tipoTransacao}
                onValueChange={(v) => setTipoTransacao(v as TipoTransacao)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposito">Depósito</SelectItem>
                  <SelectItem value="saque">Saque</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>
                {tipoTransacao === "transferencia" ? "Conta de Origem" : "Conta"}
              </FieldLabel>
              <Select value={contaOrigemId} onValueChange={setContaOrigemId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent>
                  {contasAtivas.map((conta) => (
                    <SelectItem key={conta.id} value={conta.id.toString()}>
                      {formatAccountNumber(conta.numero_conta)} - {conta.cliente?.nome} ({formatCurrency(conta.saldo)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {tipoTransacao === "transferencia" && (
              <Field>
                <FieldLabel>Conta de Destino</FieldLabel>
                <Select value={contaDestinoId} onValueChange={setContaDestinoId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta de destino" />
                  </SelectTrigger>
                  <SelectContent>
                    {contasAtivas
                      .filter((c) => c.id.toString() !== contaOrigemId)
                      .map((conta) => (
                        <SelectItem key={conta.id} value={conta.id.toString()}>
                          {formatAccountNumber(conta.numero_conta)} - {conta.cliente?.nome}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </Field>
            )}

            <Field>
              <FieldLabel htmlFor="valor">Valor (R$) *</FieldLabel>
              <Input
                id="valor"
                name="valor"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="descricao">Descrição</FieldLabel>
              <Textarea
                id="descricao"
                name="descricao"
                placeholder="Descrição opcional da transação"
                rows={2}
              />
            </Field>
          </FieldGroup>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false)
                router.push("/transacoes")
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                !contaOrigemId ||
                (tipoTransacao === "transferencia" && !contaDestinoId)
              }
            >
              {loading && <Spinner className="mr-2" />}
              Confirmar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
