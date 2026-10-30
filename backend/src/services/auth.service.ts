import bcrypt from 'bcryptjs';
import { prisma } from '../database/prisma';
import { jwtUtils } from '../utils/jwt';
import { AppError } from '../utils/errors';

export const authService = {
  async login(email: string, senha: string) {
    const usuario = await prisma.usuario.findUnique({ where: { email } });

    // Mesma mensagem para usuário não encontrado e senha errada
    // Evita "user enumeration attack"
    if (!usuario || !usuario.ativo) {
      throw new AppError('Credenciais inválidas', 401);
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaCorreta) {
      throw new AppError('Credenciais inválidas', 401);
    }

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoLogin: new Date() },
    });

    const accessToken = jwtUtils.signAccess({
      sub: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
      nome: usuario.nome,
    });

    const refreshToken = jwtUtils.signRefresh(usuario.id);

    return {
      accessToken,
      refreshToken,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      },
    };
  },

  async refresh(refreshToken: string) {
    try {
      const { sub: userId } = jwtUtils.verifyRefresh(refreshToken);
      const usuario = await prisma.usuario.findUnique({ where: { id: userId } });

      if (!usuario || !usuario.ativo) {
        throw new AppError('Não autorizado', 401);
      }

      const accessToken = jwtUtils.signAccess({
        sub: usuario.id,
        email: usuario.email,
        perfil: usuario.perfil,
        nome: usuario.nome,
      });

      return { accessToken };
    } catch {
      throw new AppError('Refresh token inválido', 401);
    }
  },
};
