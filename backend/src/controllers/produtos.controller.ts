import type { Request, Response, NextFunction } from 'express';
import { produtosService } from '../services/produtos.service';
import { createProdutoSchema, updateProdutoSchema } from '../validators/schemas';

export const produtosController = {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, apenasAtivos } = req.query as Record<string, string>;
      const produtos = await produtosService.listar({
        search,
        apenasAtivos: apenasAtivos === 'true',
      });
      res.json(produtos);
    } catch (error) {
      next(error);
    }
  },

  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createProdutoSchema.parse(req.body);
      const produto = await produtosService.criar(data);
      res.status(201).json(produto);
    } catch (error) {
      next(error);
    }
  },

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateProdutoSchema.parse(req.body);
      const produto = await produtosService.atualizar(req.params.id, data);
      res.json(produto);
    } catch (error) {
      next(error);
    }
  },

  async excluir(req: Request, res: Response, next: NextFunction) {
    try {
      await produtosService.excluir(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
