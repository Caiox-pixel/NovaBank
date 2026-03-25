import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/bank/dashboard-layout"
import { ClientsTable } from "@/components/bank/clients-table"
import { ClientForm } from "@/components/bank/client-form"

export default async function ClientesPage() {
  const supabase = await createClient()

  const { data: clientes } = await supabase
    .from("clientes")
    .select("*")
    .order("nome")

  return (
    <DashboardLayout
      title="Clientes"
      description="Gerencie os clientes do banco"
    >
      <div className="flex justify-end mb-6">
        <ClientForm />
      </div>
      <ClientsTable clientes={clientes || []} />
    </DashboardLayout>
  )
}
