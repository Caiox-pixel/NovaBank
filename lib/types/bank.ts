export interface Cliente {
  id: number
  nome: string
  cpf: string
  data_nascimento: string
  endereco: string | null
  telefone: string | null
  email: string | null
  created_at: string
}

export interface ContaBancaria {
  id: number
  cliente_id: number
  numero_conta: string
  tipo_conta: 'corrente' | 'poupanca'
  saldo: number
  ativa: boolean
  created_at: string
  cliente?: Cliente
}

export interface Transacao {
  id: number
  conta_origem_id: number
  conta_destino_id: number | null
  tipo: 'deposito' | 'saque' | 'transferencia'
  valor: number
  descricao: string | null
  created_at: string
  conta_origem?: ContaBancaria
  conta_destino?: ContaBancaria
}

export type TipoTransacao = 'deposito' | 'saque' | 'transferencia'
export type TipoConta = 'corrente' | 'poupanca'
