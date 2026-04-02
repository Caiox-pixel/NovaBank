import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/bank/dashboard-layout"
import { StatsCard } from "@/components/bank/stats-card"
import { RecentTransactions } from "@/components/bank/recent-transactions"
import { Users, Wallet, ArrowLeftRight, TrendingUp } from "lucide-react"

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export default async function DashboardPage() {
  const supabase = await createClient() // ✅ await correto após server.ts ser async

  const [clientesResult, contasResult, transacoesResult] = await Promise.all([
    supabase.from("clientes").select("*", { count: "exact", head: true }),
    supabase.from("contas").select("*"), // ✅ CORRIGIDO: era "contas_bancarias"
    supabase.from("transacoes").select("*").order("created_at", { ascending: false }).limit(5),
  ])

  const totalClientes = clientesResult.count || 0
  const contas = contasResult.data || []
  const transacoes = transacoesResult.data || []

  const totalContas = contas.length
  const contasAtivas = contas.filter((c) => c.ativa).length
  const saldoTotal = contas.reduce((acc, c) => acc + (c.saldo || 0), 0)
  const totalTransacoes = transacoes.length

  return (
    <DashboardLayout
      title="Dashboard"
      description="Visão geral do sistema bancário"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Clientes"
          value={totalClientes}
          description="clientes cadastrados"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Contas Ativas"
          value={`${contasAtivas}/${totalContas}`}
          description="contas bancárias"
          icon={Wallet}
        />
        <StatsCard
          title="Saldo Total"
          value={formatCurrency(saldoTotal)}
          description="em todas as contas"
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Transações Recentes"
          value={totalTransacoes}
          description="últimas transações"
          icon={ArrowLeftRight}
        />
      </div>

      <div className="mt-8">
        <RecentTransactions transactions={transacoes} />
      </div>
    </DashboardLayout>
  )
}
