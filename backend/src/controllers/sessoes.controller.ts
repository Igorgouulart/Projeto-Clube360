import type { Request, Response, NextFunction } from 'express';
import { sessoesService } from '../services/sessoes.service';
import { createSessaoSchema } from '../validators/schemas';

export const sessoesController = {
  async listarAtivas(req: Request, res: Response, next: NextFunction) {
    try {
      const sessoes = await sessoesService.listarAtivas();
      res.json(sessoes);
    } catch (error) {
      next(error);
    }
  },

  async listarTodas(req: Request, res: Response, next: NextFunction) {
    try {
      const { skip, take } = req.query as Record<string, string>;
      const result = await sessoesService.listarTodas({
        skip: skip ? parseInt(skip) : undefined,
        take: take ? parseInt(take) : undefined,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async registrarEntrada(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createSessaoSchema.parse(req.body);
      const sessao = await sessoesService.registrarEntrada(data, req.usuario!.id);
      res.status(201).json(sessao);
    } catch (error) {
      next(error);
    }
  },

  async verificarSaida(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await sessoesService.verificarSaida(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async registrarSaida(req: Request, res: Response, next: NextFunction) {
    try {
      const sessao = await sessoesService.registrarSaida(req.params.id);
      res.json(sessao);
    } catch (error) {
      next(error);
    }
  },
};
