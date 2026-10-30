import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { loginSchema } from '../validators/schemas';

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, senha } = loginSchema.parse(req.body);
      const result = await authService.login(email, senha);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) return res.status(400).json({ error: 'refreshToken obrigatório' });
      const result = await authService.refresh(refreshToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async me(req: Request, res: Response) {
    res.json(req.usuario);
  },
};
