import { z } from 'zod';

// ── Auth ────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

// ── Sócios ──────────────────────────────────────────────────
export const createSocioSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(150),
  documento: z.string().min(5, 'Documento obrigatório').max(20),
  telefone: z.string().optional().nullable(),
  email: z.string().email('Email inválido').optional().nullable(),
  endereco: z.string().optional().nullable(),
  status: z.enum(['ATIVO', 'INADIMPLENTE', 'INATIVO']).default('ATIVO'),
});

export const updateSocioSchema = createSocioSchema.partial();

// ── Sessões ─────────────────────────────────────────────────
export const createSessaoSchema = z.object({
  pessoaNome: z.string().min(2, 'Nome obrigatório').max(150),
  socioId: z.string().uuid().optional().nullable(),
  observacoes: z.string().optional().nullable(),
});

// ── Produtos ────────────────────────────────────────────────
export const createProdutoSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(150),
  preco: z.number().positive('Preço deve ser maior que zero'),
  categoria: z.string().optional().nullable(),
  descricao: z.string().optional().nullable(),
  ativo: z.boolean().default(true),
});

export const updateProdutoSchema = createProdutoSchema.partial();

// ── Comandas ────────────────────────────────────────────────
export const createComandaSchema = z.object({
  sessaoId: z.string().uuid('sessaoId inválido'),
});

export const addItemSchema = z.object({
  produtoId: z.string().uuid('produtoId inválido'),
  quantidade: z.number().int().positive().default(1),
});

export const alterarQuantidadeSchema = z.object({
  delta: z.number().int().refine((v) => v !== 0, 'Delta não pode ser zero'),
});

export const registrarPagamentoSchema = z.object({
  metodo: z.enum(['DINHEIRO', 'CARTAO_DEBITO', 'CARTAO_CREDITO', 'PIX', 'CORTESIA']),
});

// ── Tipos DTO ───────────────────────────────────────────────
export type LoginDto = z.infer<typeof loginSchema>;
export type CreateSocioDto = z.infer<typeof createSocioSchema>;
export type UpdateSocioDto = z.infer<typeof updateSocioSchema>;
export type CreateSessaoDto = z.infer<typeof createSessaoSchema>;
export type CreateProdutoDto = z.infer<typeof createProdutoSchema>;
export type UpdateProdutoDto = z.infer<typeof updateProdutoSchema>;
export type CreateComandaDto = z.infer<typeof createComandaSchema>;
export type AddItemDto = z.infer<typeof addItemSchema>;
export type RegistrarPagamentoDto = z.infer<typeof registrarPagamentoSchema>;
