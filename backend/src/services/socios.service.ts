import { prisma } from '../database/prisma';
import { AppError } from '../utils/errors';
import type { CreateSocioDto, UpdateSocioDto } from '../validators/schemas';
import type { StatusSocio, Prisma } from '@prisma/client';

export const sociosService = {
  async listar(params?: { search?: string; status?: string; skip?: number; take?: number }) {
    const { search, status, skip = 0, take = 50 } = params ?? {};

    const where: Prisma.SocioWhereInput = {
      ...(status && { status: status as StatusSocio }),
      ...(search && {
        OR: [
          { nome: { contains: search, mode: 'insensitive' } },
          { documento: { contains: search } },
        ],
      }),
    };

    const [socios, total] = await Promise.all([
      prisma.socio.findMany({ where, orderBy: { nome: 'asc' }, skip, take }),
      prisma.socio.count({ where }),
    ]);

    return { socios, total };
  },

  async buscarPorId(id: string) {
    const socio = await prisma.socio.findUnique({
      where: { id },
      include: { sessoes: { take: 10, orderBy: { dataEntrada: 'desc' } } },
    });
    if (!socio) throw new AppError('Sócio não encontrado', 404);
    return socio;
  },

  async criar(data: CreateSocioDto) {
    const existente = await prisma.socio.findUnique({
      where: { documento: data.documento.replace(/\D/g, '') },
    });
    if (existente) throw new AppError('Documento já cadastrado para outro sócio', 409);

    return prisma.socio.create({
      data: { ...data, documento: data.documento.replace(/\D/g, '') },
    });
  },

  async atualizar(id: string, data: UpdateSocioDto) {
    await this.buscarPorId(id);

    if (data.documento) {
      const normalizado = data.documento.replace(/\D/g, '');
      const existente = await prisma.socio.findUnique({ where: { documento: normalizado } });
      if (existente && existente.id !== id) {
        throw new AppError('Documento já cadastrado para outro sócio', 409);
      }
      data = { ...data, documento: normalizado };
    }

    return prisma.socio.update({ where: { id }, data });
  },

  async excluir(id: string) {
    const socio = await this.buscarPorId(id);
    const temSessaoAtiva = socio.sessoes?.some((s) => s.status === 'ATIVA');
    if (temSessaoAtiva) {
      throw new AppError('Sócio possui sessão ativa. Finalize a sessão primeiro.', 422);
    }
    return prisma.socio.delete({ where: { id } });
  },
};
