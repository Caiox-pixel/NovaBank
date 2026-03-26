import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/bank/dashboard-layout"
import { TransactionsTable } from "@/components/bank/transactions-table"
import { TransactionForm } from "@/components/bank/transaction-form"
import { Skeleton } from "@/components/ui/skeleton"

async function TransactionsContent() {
  const supabase = createClient()

  const [transacoesResult, contasResult] = Promise.all([
    supabase
      .from("transacoes")
      .select(`
        *,
        conta_origem:contas_bancarias!transacoes_conta_origem_id_fkey(
          numero_conta,
          cliente:clientes(nome)
        ),
        conta_destino:contas_bancarias!transacoes_conta_destino_id_fkey(
          numero_conta,
          cliente:clientes(nome)
        )
      `)
      .order("created_at", { ascending: false }),
    supabase
      .from("contas_bancarias")
      .select("*, cliente:clientes(nome)")
      .eq("ativa", true)
      .order("numero_conta"),
  ])

  const transacoes = transacoesResult.data || []
  const contas = contasResult.data || []

  return (
    <>
      <div className="flex justify-end mb-6">
        <TransactionForm contas={contas} />
      </div>
      <TransactionsTable transacoes={transacoes} />
    </>
  )
}

function TransactionsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Skeleton className="h-10 w-40" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  )
}

export default function TransacoesPage() {
  return (
    <DashboardLayout
      title="Transações"
      description="Gerencie depósitos, saques e transferências"
    >
      <Suspense fallback={<TransactionsSkeleton />}>
        <TransactionsContent />
      </Suspense>
    </DashboardLayout>
  )
}
