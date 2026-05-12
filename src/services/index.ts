import { apiClient } from './api/client';
import type {
  Socio, CreateSocioDto, UpdateSocioDto,
  Sessao, CreateSessaoDto, VerificarSaidaResult,
  Produto, CreateProdutoDto, UpdateProdutoDto,
  Comanda, DashboardStats,
} from '@/types';

// ── Dashboard ────────────────────────────────────────────────
export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const { data } = await apiClient.get('/dashboard/stats');
    return data;
  },
};

// ── Sócios ───────────────────────────────────────────────────
export const sociosService = {
  async listar(params?: { search?: string; status?: string }): Promise<{ socios: Socio[]; total: number }> {
    const { data } = await apiClient.get('/socios', { params });
    return data;
  },
  async criar(payload: CreateSocioDto): Promise<Socio> {
    const { data } = await apiClient.post('/socios', payload);
    return data;
  },
  async atualizar(id: string, payload: UpdateSocioDto): Promise<Socio> {
    const { data } = await apiClient.put(`/socios/${id}`, payload);
    return data;
  },
  async excluir(id: string): Promise<void> {
    await apiClient.delete(`/socios/${id}`);
  },
};

// ── Sessões ──────────────────────────────────────────────────
export const sessoesService = {
  async listarAtivas(): Promise<Sessao[]> {
    const { data } = await apiClient.get('/sessoes/ativas');
    return data;
  },
  async registrarEntrada(payload: CreateSessaoDto): Promise<Sessao> {
    const { data } = await apiClient.post('/sessoes', payload);
    return data;
  },
  async verificarSaida(id: string): Promise<VerificarSaidaResult> {
    const { data } = await apiClient.get(`/sessoes/${id}/verificar-saida`);
    return data;
  },
  async registrarSaida(id: string): Promise<Sessao> {
    const { data } = await apiClient.patch(`/sessoes/${id}/saida`);
    return data;
  },
};

// ── Produtos ─────────────────────────────────────────────────
export const produtosService = {
  async listar(params?: { search?: string; apenasAtivos?: boolean }): Promise<Produto[]> {
    const { data } = await apiClient.get('/produtos', { params });
    return data;
  },
  async criar(payload: CreateProdutoDto): Promise<Produto> {
    const { data } = await apiClient.post('/produtos', payload);
    return data;
  },
  async atualizar(id: string, payload: UpdateProdutoDto): Promise<Produto> {
    const { data } = await apiClient.put(`/produtos/${id}`, payload);
    return data;
  },
  async excluir(id: string): Promise<void> {
    await apiClient.delete(`/produtos/${id}`);
  },
};

// ── Bar ──────────────────────────────────────────────────────
export const barService = {
  async listarComandas(): Promise<Comanda[]> {
    const { data } = await apiClient.get('/comandas');
    return data;
  },
  async criarComanda(sessaoId: string): Promise<Comanda> {
    const { data } = await apiClient.post('/comandas', { sessaoId });
    return data;
  },
  async adicionarItem(comandaId: string, produtoId: string, quantidade = 1): Promise<Comanda> {
    const { data } = await apiClient.post(`/comandas/${comandaId}/itens`, { produtoId, quantidade });
    return data;
  },
  async alterarQuantidade(comandaId: string, itemId: string, delta: number): Promise<Comanda> {
    const { data } = await apiClient.patch(`/comandas/${comandaId}/itens/${itemId}`, { delta });
    return data;
  },
  async fecharComanda(id: string): Promise<Comanda> {
    const { data } = await apiClient.patch(`/comandas/${id}/fechar`);
    return data;
  },
  async registrarPagamento(id: string, metodo: string): Promise<Comanda> {
    const { data } = await apiClient.post(`/comandas/${id}/pagamento`, { metodo });
    return data;
  },
};
