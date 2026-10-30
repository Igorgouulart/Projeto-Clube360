import { prisma } from '../database/prisma';
import { AppError } from '../utils/errors';
import type { CreateSessaoDto } from '../validators/schemas';

export const sessoesService = {
  async listarAtivas() {
    return prisma.sessao.findMany({
      where: { status: 'ATIVA' },
      orderBy: { dataEntrada: 'desc' },
      include: { socio: { select: { id: true, nome: true, documento: true } } },
    });
  },

  async listarTodas(params?: { skip?: number; take?: number }) {
    const { skip = 0, take = 50 } = params ?? {};
    const [sessoes, total] = await Promise.all([
      prisma.sessao.findMany({
        orderBy: { dataEntrada: 'desc' },
        skip,
        take,
        include: { socio: { select: { id: true, nome: true } } },
      }),
      prisma.sessao.count(),
    ]);
    return { sessoes, total };
  },

  async registrarEntrada(data: CreateSessaoDto, operadorId: string) {
    // Se for sócio, busca o nome atual
    let pessoaNome = data.pessoaNome;
    if (data.socioId) {
      const socio = await prisma.socio.findUnique({ where: { id: data.socioId } });
      if (!socio) throw new AppError('Sócio não encontrado', 404);
      if (socio.status === 'INATIVO') throw new AppError('Sócio inativo não pode entrar', 422);
      pessoaNome = socio.nome;
    }

    return prisma.sessao.create({
      data: {
        pessoaNome,
        socioId: data.socioId ?? null,
        observacoes: data.observacoes ?? null,
        criadoPor: operadorId,
      },
      include: { socio: { select: { id: true, nome: true } } },
    });
  },

  async verificarSaida(id: string) {
    const sessao = await prisma.sessao.findUnique({
      where: { id },
      include: {
        comandas: {
          where: { status: { not: 'PAGA' } },
          select: { id: true, status: true, valorTotal: true },
        },
      },
    });
    if (!sessao) throw new AppError('Sessão não encontrada', 404);
    if (sessao.status === 'FINALIZADA') throw new AppError('Sessão já finalizada', 422);

    const comandasPendentes = sessao.comandas;
    const podeSair = comandasPendentes.length === 0;
    const totalPendente = comandasPendentes.reduce(
      (acc, c) => acc + Number(c.valorTotal),
      0
    );

    return { sessao, podeSair, comandasPendentes, totalPendente };
  },

  async registrarSaida(id: string) {
    return prisma.sessao.update({
      where: { id },
      data: { status: 'FINALIZADA', dataSaida: new Date() },
    });
  },
};
