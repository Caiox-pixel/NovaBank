"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react"
import type { Transacao } from "@/lib/types/bank"
import { cn } from "@/lib/utils"

interface RecentTransactionsProps {
  transactions: Transacao[]
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

const getTransactionColor = (tipo: string) => {
  switch (tipo) {
    case "deposito":
      return "text-accent bg-accent/10"
    case "saque":
      return "text-destructive bg-destructive/10"
    case "transferencia":
      return "text-primary bg-primary/10"
    default:
      return "text-muted-foreground bg-muted"
  }
}

const getTransactionLabel = (tipo: string) => {
  switch (tipo) {
    case "deposito":
      return "Depósito"
    case "saque":
      return "Saque"
    case "transferencia":
      return "Transferência"
    default:
      return tipo
  }
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhuma transação encontrada.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.map((transaction) => {
          const Icon = getTransactionIcon(transaction.tipo)
          const colorClass = getTransactionColor(transaction.tipo)
          
          return (
            <div
              key={transaction.id}
              className="flex items-center justify-between gap-4 rounded-lg border bg-card p-4"
            >
              <div className="flex items-center gap-4">
                <div className={cn("rounded-full p-2", colorClass)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">
                    {getTransactionLabel(transaction.tipo)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.descricao || `Conta #${transaction.conta_origem_id}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={cn(
                    "font-semibold",
                    transaction.tipo === "deposito"
                      ? "text-accent"
                      : transaction.tipo === "saque"
                      ? "text-destructive"
                      : "text-foreground"
                  )}
                >
                  {transaction.tipo === "deposito" ? "+" : "-"}
                  {formatCurrency(transaction.valor)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(transaction.created_at)}
                </p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
