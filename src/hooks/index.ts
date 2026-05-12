import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  sociosService,
  sessoesService,
  produtosService,
  barService,
  dashboardService,
} from '@/services';
import type { CreateSocioDto, UpdateSocioDto, CreateSessaoDto, CreateProdutoDto, UpdateProdutoDto } from '@/types';

// ── Dashboard ─────────────────────────────────────────────────
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

// ── Sócios ────────────────────────────────────────────────────
export function useSocios(params?: { search?: string; status?: string }) {
  return useQuery({
    queryKey: ['socios', params],
    queryFn: () => sociosService.listar(params),
    staleTime: 30_000,
  });
}

export function useSocioMutations() {
  const qc = useQueryClient();
  const invalidar = () => qc.invalidateQueries({ queryKey: ['socios'] });

  const criar = useMutation({
    mutationFn: (data: CreateSocioDto) => sociosService.criar(data),
    onSuccess: () => { toast.success('Sócio cadastrado!'); invalidar(); },
    onError: (e: unknown) => toast.error(getApiError(e, 'Erro ao cadastrar sócio')),
  });

  const atualizar = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateSocioDto) =>
      sociosService.atualizar(id, data),
    onSuccess: () => { toast.success('Sócio atualizado!'); invalidar(); },
    onError: (e: unknown) => toast.error(getApiError(e, 'Erro ao atualizar sócio')),
  });

  const excluir = useMutation({
    mutationFn: (id: string) => sociosService.excluir(id),
    onSuccess: () => { toast.success('Sócio excluído!'); invalidar(); },
    onError: (e: unknown) => toast.error(getApiError(e, 'Erro ao excluir sócio')),
  });

  return { criar, atualizar, excluir };
}

// ── Sessões ───────────────────────────────────────────────────
export function useSessoesAtivas() {
  return useQuery({
    queryKey: ['sessoes-ativas'],
    queryFn: sessoesService.listarAtivas,
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
}

export function useSociosAtivosSelect() {
  return useQuery({
    queryKey: ['socios', { status: 'ATIVO' }],
    queryFn: () => sociosService.listar({ status: 'ATIVO' }),
    staleTime: 60_000,
  });
}

export function useSessoesMutations() {
  const qc = useQueryClient();
  const invalidarSessoes = () => {
    qc.invalidateQueries({ queryKey: ['sessoes-ativas'] });
    qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
  };

  const registrarEntrada = useMutation({
    mutationFn: (data: CreateSessaoDto) => sessoesService.registrarEntrada(data),
    onSuccess: () => { toast.success('Entrada registrada!'); invalidarSessoes(); },
    onError: (e: unknown) => toast.error(getApiError(e, 'Erro ao registrar entrada')),
  });

  const registrarSaida = useMutation({
    mutationFn: (id: string) => sessoesService.registrarSaida(id),
    onSuccess: () => { toast.success('Saída registrada!'); invalidarSessoes(); },
    onError: (e: unknown) => toast.error(getApiError(e, 'Erro ao registrar saída')),
  });

  return { registrarEntrada, registrarSaida };
}

// ── Produtos ──────────────────────────────────────────────────
export function useProdutos(params?: { search?: string; apenasAtivos?: boolean }) {
  return useQuery({
    queryKey: ['produtos', params],
    queryFn: () => produtosService.listar(params),
    staleTime: 60_000,
  });
}

export function useProdutoMutations() {
  const qc = useQueryClient();
  const invalidar = () => qc.invalidateQueries({ queryKey: ['produtos'] });

  const criar = useMutation({
    mutationFn: (data: CreateProdutoDto) => produtosService.criar(data),
    onSuccess: () => { toast.success('Produto cadastrado!'); invalidar(); },
    onError: (e: unknown) => toast.error(getApiError(e, 'Erro ao cadastrar produto')),
  });

  const atualizar = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateProdutoDto) =>
      produtosService.atualizar(id, data),
    onSuccess: () => { toast.success('Produto atualizado!'); invalidar(); },
    onError: (e: unknown) => toast.error(getApiError(e, 'Erro ao atualizar produto')),
  });

  const excluir = useMutation({
    mutationFn: (id: string) => produtosService.excluir(id),
    onSuccess: () => { toast.success('Produto excluído!'); invalidar(); },
    onError: (e: unknown) => toast.error(getApiError(e, 'Erro ao excluir produto')),
  });

  return { criar, atualizar, excluir };
}

// ── Bar ───────────────────────────────────────────────────────
export function useComandas() {
  return useQuery({
    queryKey: ['comandas'],
    queryFn: barService.listarComandas,
    staleTime: 5_000,
    refetchInterval: 15_000,
  });
}

export function useBarMutations() {
  const qc = useQueryClient();
  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ['comandas'] });
    qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
  };

  const criarComanda = useMutation({
    mutationFn: (sessaoId: string) => barService.criarComanda(sessaoId),
    onSuccess: () => { toast.success('Comanda criada!'); invalidar(); },
    onError: (e: unknown) => toast.error(getApiError(e, 'Erro ao criar comanda')),
  });

  const adicionarItem = useMutation({
    mutationFn: ({ comandaId, produtoId, quantidade }: { comandaId: string; produtoId: string; quantidade?: number }) =>
      barService.adicionarItem(comandaId, produtoId, quantidade),
    onSuccess: (data) => {
      toast.success('Item adicionado!');
      qc.setQueryData(['comandas'], (old: unknown[] | undefined) =>
        old?.map((c: unknown) => {
          const comanda = c as { id: string };
          return comanda.id === data.id ? data : c;
        })
      );
    },
    onError: (e: unknown) => toast.error(getApiError(e, 'Erro ao adicionar item')),
  });

  const alterarQuantidade = useMutation({
    mutationFn: ({ comandaId, itemId, delta }: { comandaId: string; itemId: string; delta: number }) =>
      barService.alterarQuantidade(comandaId, itemId, delta),
    onSuccess: (data) => {
      qc.setQueryData(['comandas'], (old: unknown[] | undefined) =>
        old?.map((c: unknown) => {
          const comanda = c as { id: string };
          return comanda.id === data.id ? data : c;
        })
      );
    },
    onError: (e: unknown) => toast.error(getApiError(e, 'Erro ao alterar quantidade')),
  });

  const fecharComanda = useMutation({
    mutationFn: (id: string) => barService.fecharComanda(id),
    onSuccess: () => { toast.success('Comanda fechada!'); invalidar(); },
    onError: (e: unknown) => toast.error(getApiError(e, 'Erro ao fechar comanda')),
  });

  const registrarPagamento = useMutation({
    mutationFn: ({ id, metodo }: { id: string; metodo: string }) =>
      barService.registrarPagamento(id, metodo),
    onSuccess: () => { toast.success('Pagamento registrado!'); invalidar(); },
    onError: (e: unknown) => toast.error(getApiError(e, 'Erro ao registrar pagamento')),
  });

  return { criarComanda, adicionarItem, alterarQuantidade, fecharComanda, registrarPagamento };
}

// ── Helper ────────────────────────────────────────────────────
function getApiError(error: unknown, fallback: string): string {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error
  ) {
    const response = (error as { response?: { data?: { error?: string } } }).response;
    return response?.data?.error ?? fallback;
  }
  return fallback;
}
