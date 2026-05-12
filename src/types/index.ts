// ── Enums ────────────────────────────────────────────────────
export type PerfilUsuario = 'ADMIN' | 'GERENTE' | 'OPERADOR';
export type StatusSocio = 'ATIVO' | 'INADIMPLENTE' | 'INATIVO';
export type StatusSessao = 'ATIVA' | 'FINALIZADA';
export type StatusComanda = 'ABERTA' | 'FECHADA' | 'PAGA';
export type MetodoPagamento = 'DINHEIRO' | 'CARTAO_DEBITO' | 'CARTAO_CREDITO' | 'PIX' | 'CORTESIA';

// ── Entidades ────────────────────────────────────────────────
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
}

export interface Socio {
  id: string;
  nome: string;
  documento: string;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  status: StatusSocio;
  dataCadastro: string;
  atualizadoEm: string;
}

export interface Sessao {
  id: string;
  pessoaNome: string;
  socioId: string | null;
  dataEntrada: string;
  dataSaida: string | null;
  status: StatusSessao;
  observacoes: string | null;
  socio?: Pick<Socio, 'id' | 'nome' | 'documento'> | null;
}

export interface Produto {
  id: string;
  nome: string;
  preco: number;
  categoria: string | null;
  descricao: string | null;
  ativo: boolean;
}

export interface ItemComanda {
  id: string;
  produtoId: string;
  quantidade: number;
  valorUnitario: number;
  produto?: Pick<Produto, 'id' | 'nome' | 'preco'>;
}

export interface Comanda {
  id: string;
  sessaoId: string;
  status: StatusComanda;
  valorTotal: number;
  criadoEm: string;
  sessao?: { id: string; pessoaNome: string };
  itens?: ItemComanda[];
  pagamentos?: Pagamento[];
}

export interface Pagamento {
  id: string;
  comandaId: string;
  valor: number;
  metodo: MetodoPagamento;
  dataPagamento: string;
}

// ── DTOs ─────────────────────────────────────────────────────
export interface CreateSocioDto {
  nome: string;
  documento: string;
  telefone?: string | null;
  email?: string | null;
  endereco?: string | null;
  status?: StatusSocio;
}
export type UpdateSocioDto = Partial<CreateSocioDto>;

export interface CreateSessaoDto {
  pessoaNome: string;
  socioId?: string | null;
  observacoes?: string | null;
}

export interface CreateProdutoDto {
  nome: string;
  preco: number;
  categoria?: string | null;
  descricao?: string | null;
  ativo?: boolean;
}
export type UpdateProdutoDto = Partial<CreateProdutoDto>;

// ── Respostas da API ─────────────────────────────────────────
export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export interface DashboardStats {
  totalSocios: number;
  sociosAtivos: number;
  sessoesAtivas: number;
  comandasAbertas: number;
  atividadeRecente: Pick<Sessao, 'id' | 'pessoaNome' | 'dataEntrada' | 'status'>[];
}

export interface VerificarSaidaResult {
  sessao: Sessao;
  podeSair: boolean;
  comandasPendentes: Pick<Comanda, 'id' | 'status' | 'valorTotal'>[];
  totalPendente: number;
}
