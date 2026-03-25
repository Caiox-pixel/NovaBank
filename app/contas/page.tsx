import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/bank/dashboard-layout"
import { AccountsTable } from "@/components/bank/accounts-table"
import { AccountForm } from "@/components/bank/account-form"

export default async function ContasPage() {
  const supabase = await createClient()

  const [contasResult, clientesResult] = await Promise.all([
    supabase
      .from("contas")
      .select("*, cliente:clientes(nome)")
      .order("created_at", { ascending: false }),
    supabase.from("clientes").select("*").order("nome"),
  ])

  const contas = contasResult.data || []
  const clientes = clientesResult.data || []

  return (
    <DashboardLayout
      title="Contas Bancárias"
      description="Gerencie as contas bancárias dos clientes"
    >
      <div className="flex justify-end mb-6">
        <AccountForm clientes={clientes} />
      </div>
      <AccountsTable contas={contas} />
    </DashboardLayout>
  )
}
