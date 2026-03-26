export interface Cliente {
  id: string
  nome: string
  cpf: string
  email: string | null
  telefone: string | null
  data_nascimento: string | null
  endereco: string | null
  created_at: string
  updated_at: string
}

export interface Conta {
  id: string
  cliente_id: string
  numero_conta: string
  tipo_conta: 'corrente' | 'poupanca'
  saldo: number
  limite: number
  ativa: boolean
  created_at: string
  updated_at: string
  cliente?: Cliente
}

export interface Transacao {
  id: string
  conta_origem_id: string | null
  conta_destino_id: string | null
  tipo: 'deposito' | 'saque' | 'transferencia'
  valor: number
  descricao: string | null
  status: 'pendente' | 'concluida' | 'cancelada'
  usou_limite: boolean
  created_at: string
  conta_origem?: Conta
  conta_destino?: Conta
}

export interface CreateClienteInput {
  nome: string
  cpf: string
  email?: string
  telefone?: string
  data_nascimento?: string
  endereco?: string
}

export interface CreateContaInput {
  cliente_id: string
  tipo_conta?: 'corrente' | 'poupanca'
  deposito_inicial?: number
  limite?: number
}

export interface OperacaoInput {
  conta_id: string
  valor: number
  descricao?: string
  confirmar_uso_limite?: boolean
}

export interface TransferenciaInput {
  conta_origem_id: string
  conta_destino_id: string
  valor: number
  descricao?: string
  confirmar_uso_limite?: boolean
}
