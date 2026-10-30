import app from './app';
import { prisma } from './database/prisma';

const PORT = process.env.PORT ?? 3001;

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Conectado ao PostgreSQL');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

main();
