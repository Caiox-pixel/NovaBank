-- NeoBank - Sistema Bancário Digital
-- Schema do Banco de Dados

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20),
  data_nascimento DATE,
  endereco TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Contas Bancárias
CREATE TABLE IF NOT EXISTS contas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  numero_conta VARCHAR(20) UNIQUE NOT NULL,
  tipo_conta VARCHAR(20) DEFAULT 'corrente' CHECK (tipo_conta IN ('corrente', 'poupanca')),
  saldo DECIMAL(15, 2) DEFAULT 0.00,
  limite DECIMAL(15, 2) DEFAULT 0.00,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Transações
CREATE TABLE IF NOT EXISTS transacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conta_origem_id UUID REFERENCES contas(id) ON DELETE SET NULL,
  conta_destino_id UUID REFERENCES contas(id) ON DELETE SET NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('deposito', 'saque', 'transferencia')),
  valor DECIMAL(15, 2) NOT NULL CHECK (valor > 0),
  descricao TEXT,
  status VARCHAR(20) DEFAULT 'concluida' CHECK (status IN ('pendente', 'concluida', 'cancelada')),
  usou_limite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_clientes_cpf ON clientes(cpf);
CREATE INDEX IF NOT EXISTS idx_contas_cliente ON contas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_contas_numero ON contas(numero_conta);
CREATE INDEX IF NOT EXISTS idx_transacoes_conta_origem ON transacoes(conta_origem_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_conta_destino ON transacoes(conta_destino_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_created_at ON transacoes(created_at DESC);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_clientes_updated_at ON clientes;
CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contas_updated_at ON contas;
CREATE TRIGGER update_contas_updated_at
  BEFORE UPDATE ON contas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público (para simplificar - em produção seria mais restritivo)
CREATE POLICY "Allow public read clientes" ON clientes FOR SELECT USING (true);
CREATE POLICY "Allow public insert clientes" ON clientes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update clientes" ON clientes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete clientes" ON clientes FOR DELETE USING (true);

CREATE POLICY "Allow public read contas" ON contas FOR SELECT USING (true);
CREATE POLICY "Allow public insert contas" ON contas FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update contas" ON contas FOR UPDATE USING (true);
CREATE POLICY "Allow public delete contas" ON contas FOR DELETE USING (true);

CREATE POLICY "Allow public read transacoes" ON transacoes FOR SELECT USING (true);
CREATE POLICY "Allow public insert transacoes" ON transacoes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update transacoes" ON transacoes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete transacoes" ON transacoes FOR DELETE USING (true);
