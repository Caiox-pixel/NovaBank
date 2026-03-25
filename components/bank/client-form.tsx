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
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import type { Cliente } from "@/lib/types/bank"

interface ClientFormProps {
  cliente?: Cliente
  onSuccess?: () => void
}

export function ClientForm({ cliente, onSuccess }: ClientFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const isEditing = !!cliente

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      nome: formData.get("nome") as string,
      cpf: formData.get("cpf") as string,
      data_nascimento: formData.get("data_nascimento") as string,
      endereco: formData.get("endereco") as string || null,
      telefone: formData.get("telefone") as string || null,
      email: formData.get("email") as string || null,
    }

    try {
      if (isEditing) {
        const { error } = await supabase
          .from("clientes")
          .update(data)
          .eq("id", cliente.id)

        if (error) throw error
        toast.success("Cliente atualizado com sucesso!")
      } else {
        const { error } = await supabase.from("clientes").insert([data])
        if (error) throw error
        toast.success("Cliente cadastrado com sucesso!")
      }

      setOpen(false)
      router.refresh()
      onSuccess?.()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro desconhecido"
      toast.error(`Erro ao ${isEditing ? "atualizar" : "cadastrar"} cliente: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {isEditing ? "Editar" : "Novo Cliente"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Cliente" : "Cadastrar Novo Cliente"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do cliente."
              : "Preencha os dados para cadastrar um novo cliente."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4 py-4">
            <Field>
              <FieldLabel htmlFor="nome">Nome Completo *</FieldLabel>
              <Input
                id="nome"
                name="nome"
                defaultValue={cliente?.nome}
                placeholder="João da Silva"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="cpf">CPF *</FieldLabel>
              <Input
                id="cpf"
                name="cpf"
                defaultValue={cliente?.cpf}
                placeholder="000.000.000-00"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="data_nascimento">Data de Nascimento *</FieldLabel>
              <Input
                id="data_nascimento"
                name="data_nascimento"
                type="date"
                defaultValue={cliente?.data_nascimento}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={cliente?.email || ""}
                placeholder="joao@email.com"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="telefone">Telefone</FieldLabel>
              <Input
                id="telefone"
                name="telefone"
                defaultValue={cliente?.telefone || ""}
                placeholder="(11) 99999-9999"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="endereco">Endereço</FieldLabel>
              <Input
                id="endereco"
                name="endereco"
                defaultValue={cliente?.endereco || ""}
                placeholder="Rua das Flores, 123"
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
            <Button type="submit" disabled={loading}>
              {loading && <Spinner className="mr-2" />}
              {isEditing ? "Salvar" : "Cadastrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
