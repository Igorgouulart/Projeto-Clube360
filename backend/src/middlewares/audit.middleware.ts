import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../database/prisma';

const ACOES: Record<string, string> = {
  POST: 'CRIAR',
  PUT: 'ATUALIZAR',
  PATCH: 'ATUALIZAR_PARCIAL',
  DELETE: 'EXCLUIR',
};

const ENTIDADES: Record<string, string> = {
  '/socios': 'SOCIO',
  '/sessoes': 'SESSAO',
  '/produtos': 'PRODUTO',
  '/comandas': 'COMANDA',
};

export function auditoria(req: Request, res: Response, next: NextFunction) {
  const acao = ACOES[req.method];
  if (!acao || !req.usuario) return next();

  const entidade = Object.entries(ENTIDADES).find(([path]) =>
    req.path.startsWith(path)
  )?.[1];

  if (!entidade) return next();

  res.on('finish', () => {
    if (res.statusCode < 400) {
      prisma.logAuditoria
        .create({
          data: {
            usuarioId: req.usuario!.id,
            acao,
            entidade,
            entidadeId: req.params.id ?? null,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
          },
        })
        .catch(console.error);
    }
  });

  next();
}
