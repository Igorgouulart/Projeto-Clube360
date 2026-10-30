import { prisma } from '../database/prisma';
import { AppError } from '../utils/errors';
import type { CreateProdutoDto, UpdateProdutoDto } from '../validators/schemas';

export const produtosService = {
  async listar(params?: { search?: string; apenasAtivos?: boolean }) {
    const { search, apenasAtivos } = params ?? {};
    return prisma.produto.findMany({
      where: {
        ...(apenasAtivos && { ativo: true }),
        ...(search && {
          OR: [
            { nome: { contains: search, mode: 'insensitive' } },
            { categoria: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: [{ categoria: 'asc' }, { nome: 'asc' }],
    });
  },

  async buscarPorId(id: string) {
    const produto = await prisma.produto.findUnique({ where: { id } });
    if (!produto) throw new AppError('Produto não encontrado', 404);
    return produto;
  },

  async criar(data: CreateProdutoDto) {
    return prisma.produto.create({ data });
  },

  async atualizar(id: string, data: UpdateProdutoDto) {
    await this.buscarPorId(id);
    return prisma.produto.update({ where: { id }, data });
  },

  async excluir(id: string) {
    await this.buscarPorId(id);
    const temItens = await prisma.itemComanda.count({ where: { produtoId: id } });
    if (temItens > 0) {
      // Inativa em vez de deletar para preservar histórico
      return prisma.produto.update({ where: { id }, data: { ativo: false } });
    }
    return prisma.produto.delete({ where: { id } });
  },
};
