import type { Request, Response, NextFunction } from 'express';
import { sociosService } from '../services/socios.service';
import { createSocioSchema, updateSocioSchema } from '../validators/schemas';

export const sociosController = {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, status, skip, take } = req.query as Record<string, string>;
      const result = await sociosService.listar({
        search,
        status,
        skip: skip ? parseInt(skip) : undefined,
        take: take ? parseInt(take) : undefined,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const socio = await sociosService.buscarPorId(req.params.id);
      res.json(socio);
    } catch (error) {
      next(error);
    }
  },

  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createSocioSchema.parse(req.body);
      const socio = await sociosService.criar(data);
      res.status(201).json(socio);
    } catch (error) {
      next(error);
    }
  },

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateSocioSchema.parse(req.body);
      const socio = await sociosService.atualizar(req.params.id, data);
      res.json(socio);
    } catch (error) {
      next(error);
    }
  },

  async excluir(req: Request, res: Response, next: NextFunction) {
    try {
      await sociosService.excluir(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
