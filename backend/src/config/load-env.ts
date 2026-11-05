import path from 'path';
import dotenv from 'dotenv';

// Carrega o backend/.env de forma explicita e previsivel, ANTES de qualquer outro modulo
// que leia process.env (logger, prisma, jwt, app, server...).
//
// - O caminho e calculado a partir deste arquivo, nao do diretorio de execucao:
//     src/config/load-env.ts   (dev)   -> ../../.env = backend/.env
//     dist/config/load-env.js  (build) -> ../../.env = backend/.env
// - Variaveis que ja existem no ambiente do sistema TEM PRIORIDADE sobre o arquivo.
// - quiet: true evita que o dotenv escreva mensagens no console.
// - Este modulo nunca imprime valores do .env.
const envPath = path.resolve(__dirname, '..', '..', '.env');
const resultado = dotenv.config({ path: envPath, quiet: true });

if (resultado.error) {
  console.warn(`[env] Arquivo .env nao carregado (${envPath}). Usando apenas as variaveis do ambiente.`);
}
