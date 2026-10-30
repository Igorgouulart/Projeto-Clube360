import { prisma } from '../database/prisma';
import { AppError } from '../utils/errors';
import type { AddItemDto, RegistrarPagamentoDto } from '../validators/schemas';

const comandaInclude = {
  sessao: { select: { id: true, pessoaNome: true } },
  itens: {
    include: { produto: { select: { id: true, nome: true, preco: true } } },
    orderBy: { criadoEm: 'asc' as const },
  },
  pagamentos: true,
};

export const barService = {
  async listarComandas() {
    return prisma.comanda.findMany({
      where: { status: { in: ['ABERTA', 'FECHADA'] } },
      orderBy: { criadoEm: 'desc' },
      include: comandaInclude,
    });
  },

  async buscarComanda(id: string) {
    const comanda = await prisma.comanda.findUnique({ where: { id }, include: comandaInclude });
    if (!comanda) throw new AppError('Comanda não encontrada', 404);
    return comanda;
  },

  async criarComanda(sessaoId: string) {
    const sessao = await prisma.sessao.findUnique({ where: { id: sessaoId } });
    if (!sessao) throw new AppError('Sessão não encontrada', 404);
    if (sessao.status === 'FINALIZADA') throw new AppError('Sessão já finalizada', 422);

    return prisma.comanda.create({
      data: { sessaoId },
      include: comandaInclude,
    });
  },

  async adicionarItem(comandaId: string, data: AddItemDto) {
    const comanda = await prisma.comanda.findUnique({
      where: { id: comandaId },
      include: { itens: true },
    });
    if (!comanda) throw new AppError('Comanda não encontrada', 404);
    if (comanda.status !== 'ABERTA') throw new AppError('Comanda não está aberta', 422);

    const produto = await prisma.produto.findUnique({ where: { id: data.produtoId } });
    if (!produto || !produto.ativo) throw new AppError('Produto não encontrado ou inativo', 404);

    const itemExistente = comanda.itens.find((i) => i.produtoId === data.produtoId);

    if (itemExistente) {
      await prisma.itemComanda.update({
        where: { id: itemExistente.id },
        data: { quantidade: { increment: data.quantidade } },
      });
    } else {
      await prisma.itemComanda.create({
        data: {
          comandaId,
          produtoId: data.produtoId,
          quantidade: data.quantidade,
          valorUnitario: produto.preco,
        },
      });
    }

    return this._recalcularTotal(comandaId);
  },

  async alterarQuantidade(itemId: string, delta: number) {
    const item = await prisma.itemComanda.findUnique({ where: { id: itemId } });
    if (!item) throw new AppError('Item não encontrado', 404);

    const novaQtd = item.quantidade + delta;

    if (novaQtd <= 0) {
      await prisma.itemComanda.delete({ where: { id: itemId } });
    } else {
      await prisma.itemComanda.update({ where: { id: itemId }, data: { quantidade: novaQtd } });
    }

    return this._recalcularTotal(item.comandaId);
  },

  async fecharComanda(id: string) {
    const comanda = await prisma.comanda.findUnique({ where: { id } });
    if (!comanda) throw new AppError('Comanda não encontrada', 404);
    if (comanda.status !== 'ABERTA') throw new AppError('Comanda não está aberta', 422);
    return prisma.comanda.update({ where: { id }, data: { status: 'FECHADA' } });
  },

  async registrarPagamento(id: string, data: RegistrarPagamentoDto) {
    const comanda = await prisma.comanda.findUnique({ where: { id } });
    if (!comanda) throw new AppError('Comanda não encontrada', 404);
    if (comanda.status === 'PAGA') throw new AppError('Comanda já foi paga', 422);

    await prisma.pagamento.create({
      data: { comandaId: id, valor: comanda.valorTotal, metodo: data.metodo },
    });

    return prisma.comanda.update({
      where: { id },
      data: { status: 'PAGA' },
      include: comandaInclude,
    });
  },

  async _recalcularTotal(comandaId: string) {
    const itens = await prisma.itemComanda.findMany({ where: { comandaId } });
    const total = itens.reduce(
      (acc, i) => acc + Number(i.valorUnitario) * i.quantidade,
      0
    );
    return prisma.comanda.update({
      where: { id: comandaId },
      data: { valorTotal: total },
      include: comandaInclude,
    });
  },
};
