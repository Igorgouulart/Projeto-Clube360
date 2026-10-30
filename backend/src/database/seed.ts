/**
 * Seed: cria o usuário admin inicial.
 * Execute com: npm run db:seed
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash('admin123', 12);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@clube360.com' },
    update: {},
    create: {
      email: 'admin@clube360.com',
      senhaHash,
      nome: 'Administrador',
      perfil: 'ADMIN',
    },
  });

  console.log('✅ Usuário admin criado:', admin.email);
  console.log('   Senha padrão: admin123');
  console.log('   ⚠️  Altere a senha após o primeiro login!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
