import jwt from 'jsonwebtoken';
import type { PerfilUsuario } from '@prisma/client';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret-troque-em-producao';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-troque-em-producao';

export interface JwtPayload {
  sub: string;
  email: string;
  perfil: PerfilUsuario;
  nome: string;
}

export const jwtUtils = {
  signAccess(payload: JwtPayload): string {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
  },

  signRefresh(userId: string): string {
    return jwt.sign({ sub: userId }, REFRESH_SECRET, { expiresIn: '7d' });
  },

  verifyAccess(token: string): JwtPayload {
    return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
  },

  verifyRefresh(token: string): { sub: string } {
    return jwt.verify(token, REFRESH_SECRET) as { sub: string };
  },
};
