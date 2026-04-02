"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  MoreHorizontal,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Power,
  PowerOff,
} from "lucide-react"
import type { ContaBancaria } from "@/lib/types/bank"

interface AccountsTableProps {
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

export function AccountsTable({ contas }: AccountsTableProps) {
  const [toggleAccountId, setToggleAccountId] = useState<number | null>(null)
  const [toggleAction, setToggleAction] = useState<"ativar" | "desativar">("desativar")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleToggleAccount() {
    if (!toggleAccountId) return
    setLoading(true)

    const newStatus = toggleAction === "ativar"

    try {
      const { error } = await supabase // ✅ CORRIGIDO: await estava faltando
        .from("contas") // ✅ CORRIGIDO: era "contas_bancarias"
        .update({ ativa: newStatus })
        .eq("id", toggleAccountId)

      if (error) throw error
      toast.success(`Conta ${newStatus ? "ativada" : "desativada"} com sucesso!`)
      router.refresh()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro desconhecido"
      toast.error(`Erro ao ${toggleAction} conta: ${message}`)
    } finally {
      setLoading(false)
      setToggleAccountId(null)
    }
  }

  function handleToggleClick(id: number, ativa: boolean) {
    setToggleAccountId(id)
    setToggleAction(ativa ? "desativar" : "ativar")
  }

  if (contas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <p className="text-muted-foreground">Nenhuma conta cadastrada.</p>
        <p className="text-sm text-muted-foreground">
          Clique em &ldquo;Nova Conta&rdquo; para adicionar.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número da Conta</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Saldo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contas.map((conta) => (
              <TableRow key={conta.id}>
                <TableCell className="font-mono font-medium">
                  {formatAccountNumber(conta.numero_conta)}
                </TableCell>
                <TableCell>{conta.cliente?.nome || "-"}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {conta.tipo_conta === "corrente"
                      ? "Corrente"
                      : "Poupança"}
                  </Badge>
                </TableCell>
                <TableCell
                  className={
                    conta.saldo >= 0 ? "text-accent font-semibold" : "text-destructive font-semibold"
                  }
                >
                  {formatCurrency(conta.saldo)}
                </TableCell>
                <TableCell>
                  <Badge variant={conta.ativa ? "default" : "secondary"}>
                    {conta.ativa ? "Ativa" : "Inativa"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/transacoes?conta=${conta.id}&tipo=deposito`)
                        }
                        disabled={!conta.ativa}
                      >
                        <ArrowDownLeft className="mr-2 h-4 w-4" />
                        Depositar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/transacoes?conta=${conta.id}&tipo=saque`)
                        }
                        disabled={!conta.ativa}
                      >
                        <ArrowUpRight className="mr-2 h-4 w-4" />
                        Sacar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/transacoes?conta=${conta.id}&tipo=transferencia`)
                        }
                        disabled={!conta.ativa}
                      >
                        <ArrowLeftRight className="mr-2 h-4 w-4" />
                        Transferir
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleToggleClick(conta.id, conta.ativa)}
                      >
                        {conta.ativa ? (
                          <>
                            <PowerOff className="mr-2 h-4 w-4" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <Power className="mr-2 h-4 w-4" />
                            Ativar
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!toggleAccountId}
        onOpenChange={() => setToggleAccountId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleAction === "ativar" ? "Ativar conta" : "Desativar conta"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toggleAction === "ativar"
                ? "Tem certeza que deseja ativar esta conta? O cliente poderá realizar transações novamente."
                : "Tem certeza que deseja desativar esta conta? O cliente não poderá realizar transações enquanto a conta estiver inativa."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleAccount} disabled={loading}>
              {loading ? "Processando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
