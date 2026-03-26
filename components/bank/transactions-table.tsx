"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react"
import type { Transacao } from "@/lib/types/bank"
import { cn } from "@/lib/utils"

interface TransactionsTableProps {
  transacoes: (Transacao & {
    conta_origem?: { numero_conta: string; cliente?: { nome: string } }
    conta_destino?: { numero_conta: string; cliente?: { nome: string } } | null
  })[]
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString))
}

const formatAccountNumber = (numero: string) => {
  return numero.replace(/(\d{5})(\d{4})/, "$1-$2")
}

const getTransactionIcon = (tipo: string) => {
  switch (tipo) {
    case "deposito":
      return ArrowDownLeft
    case "saque":
      return ArrowUpRight
    case "transferencia":
      return ArrowLeftRight
    default:
      return ArrowLeftRight
  }
}

const getTransactionBadge = (tipo: string) => {
  switch (tipo) {
    case "deposito":
      return { label: "Depósito", variant: "default" as const }
    case "saque":
      return { label: "Saque", variant: "destructive" as const }
    case "transferencia":
      return { label: "Transferência", variant: "secondary" as const }
    default:
      return { label: tipo, variant: "secondary" as const }
  }
}

export function TransactionsTable({ transacoes }: TransactionsTableProps) {
  if (transacoes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <p className="text-muted-foreground">Nenhuma transação encontrada.</p>
        <p className="text-sm text-muted-foreground">
          Clique em &ldquo;Nova Transação&rdquo; para adicionar.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Conta Origem</TableHead>
            <TableHead>Conta Destino</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transacoes.map((transacao) => {
            const Icon = getTransactionIcon(transacao.tipo)
            const badge = getTransactionBadge(transacao.tipo)

            return (
              <TableRow key={transacao.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "rounded-full p-1.5",
                        transacao.tipo === "deposito"
                          ? "bg-accent/10 text-accent"
                          : transacao.tipo === "saque"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-mono text-sm">
                      {transacao.conta_origem
                        ? formatAccountNumber(transacao.conta_origem.numero_conta)
                        : "-"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transacao.conta_origem?.cliente?.nome || ""}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  {transacao.conta_destino ? (
                    <div>
                      <p className="font-mono text-sm">
                        {formatAccountNumber(transacao.conta_destino.numero_conta)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transacao.conta_destino.cliente?.nome || ""}
                      </p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "font-semibold",
                      transacao.tipo === "deposito"
                        ? "text-accent"
                        : transacao.tipo === "saque"
                        ? "text-destructive"
                        : "text-foreground"
                    )}
                  >
                    {transacao.tipo === "deposito" ? "+" : "-"}
                    {formatCurrency(transacao.valor)}
                  </span>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {transacao.descricao || (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(transacao.created_at)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
