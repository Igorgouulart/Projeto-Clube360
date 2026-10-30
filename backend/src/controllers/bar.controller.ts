import type { Request, Response, NextFunction } from 'express';
import { barService } from '../services/bar.service';
import {
  createComandaSchema,
  addItemSchema,
  alterarQuantidadeSchema,
  registrarPagamentoSchema,
} from '../validators/schemas';

export const barController = {
  async listarComandas(req: Request, res: Response, next: NextFunction) {
    try {
      const comandas = await barService.listarComandas();
      res.json(comandas);
    } catch (error) {
      next(error);
    }
  },

  async buscarComanda(req: Request, res: Response, next: NextFunction) {
    try {
      const comanda = await barService.buscarComanda(req.params.id);
      res.json(comanda);
    } catch (error) {
      next(error);
    }
  },

  async criarComanda(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessaoId } = createComandaSchema.parse(req.body);
      const comanda = await barService.criarComanda(sessaoId);
      res.status(201).json(comanda);
    } catch (error) {
      next(error);
    }
  },

  async adicionarItem(req: Request, res: Response, next: NextFunction) {
    try {
      const data = addItemSchema.parse(req.body);
      const comanda = await barService.adicionarItem(req.params.id, data);
      res.json(comanda);
    } catch (error) {
      next(error);
    }
  },

  async alterarQuantidade(req: Request, res: Response, next: NextFunction) {
    try {
      const { delta } = alterarQuantidadeSchema.parse(req.body);
      const comanda = await barService.alterarQuantidade(req.params.itemId, delta);
      res.json(comanda);
    } catch (error) {
      next(error);
    }
  },

  async fecharComanda(req: Request, res: Response, next: NextFunction) {
    try {
      const comanda = await barService.fecharComanda(req.params.id);
      res.json(comanda);
    } catch (error) {
      next(error);
    }
  },

  async registrarPagamento(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registrarPagamentoSchema.parse(req.body);
      const comanda = await barService.registrarPagamento(req.params.id, data);
      res.json(comanda);
    } catch (error) {
      next(error);
    }
  },
};
