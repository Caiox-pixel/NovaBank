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
import { MoreHorizontal, Pencil, Trash2, Wallet } from "lucide-react"
import type { Cliente } from "@/lib/types/bank"

interface ClientsTableProps {
  clientes: Cliente[]
}

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(dateString))
}

const formatCPF = (cpf: string) => {
  const cleaned = cpf.replace(/\D/g, "")
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

export function ClientsTable({ clientes }: ClientsTableProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    if (!deleteId) return
    setLoading(true)

    try {
      const { error } = await supabase
        .from("clientes")
        .delete()
        .eq("id", deleteId)

      if (error) throw error
      toast.success("Cliente excluído com sucesso!")
      router.refresh()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro desconhecido"
      toast.error(`Erro ao excluir cliente: ${message}`)
    } finally {
      setLoading(false)
      setDeleteId(null)
    }
  }

  if (clientes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <p className="text-muted-foreground">Nenhum cliente cadastrado.</p>
        <p className="text-sm text-muted-foreground">
          Clique em &ldquo;Novo Cliente&rdquo; para adicionar.
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
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Data Nascimento</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientes.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell className="font-medium">{cliente.nome}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-mono">
                    {formatCPF(cliente.cpf)}
                  </Badge>
                </TableCell>
                <TableCell>{cliente.email || "-"}</TableCell>
                <TableCell>{cliente.telefone || "-"}</TableCell>
                <TableCell>{formatDate(cliente.data_nascimento)}</TableCell>
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
                        onClick={() => router.push(`/contas?cliente=${cliente.id}`)}
                      >
                        <Wallet className="mr-2 h-4 w-4" />
                        Ver Contas
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push(`/clientes/${cliente.id}/editar`)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteId(cliente.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cliente? Esta ação não pode ser
              desfeita e irá remover todas as contas e transações associadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={loading}
            >
              {loading ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
