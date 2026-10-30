import { prisma } from '../database/prisma';

export const dashboardService = {
  async getStats() {
    const [socios, sessoesAtivas, comandasAbertas, atividadeRecente] = await Promise.all([
      prisma.socio.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.sessao.count({ where: { status: 'ATIVA' } }),
      prisma.comanda.count({ where: { status: { in: ['ABERTA', 'FECHADA'] } } }),
      prisma.sessao.findMany({
        take: 5,
        orderBy: { dataEntrada: 'desc' },
        select: { id: true, pessoaNome: true, dataEntrada: true, status: true },
      }),
    ]);

    const totalSocios = socios.reduce((acc, s) => acc + s._count.id, 0);
    const sociosAtivos = socios.find((s) => s.status === 'ATIVO')?._count.id ?? 0;

    return { totalSocios, sociosAtivos, sessoesAtivas, comandasAbertas, atividadeRecente };
  },
};
