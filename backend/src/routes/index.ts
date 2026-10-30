import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { sociosController } from '../controllers/socios.controller';
import { sessoesController } from '../controllers/sessoes.controller';
import { produtosController } from '../controllers/produtos.controller';
import { barController } from '../controllers/bar.controller';
import { dashboardController } from '../controllers/dashboard.controller';
import { autenticar } from '../middlewares/auth.middleware';
import { auditoria } from '../middlewares/audit.middleware';
import { loginRateLimit } from '../middlewares/rate-limit.middleware';

const router = Router();

// ── Auth (público) ───────────────────────────────────────────
router.post('/auth/login', loginRateLimit, authController.login);
router.post('/auth/refresh', authController.refresh);
router.get('/auth/me', autenticar, authController.me);

// ── Dashboard ────────────────────────────────────────────────
router.get('/dashboard/stats', autenticar, dashboardController.getStats);

// ── Sócios ───────────────────────────────────────────────────
router.get('/socios', autenticar, sociosController.listar);
router.get('/socios/:id', autenticar, sociosController.buscarPorId);
router.post('/socios', autenticar, auditoria, sociosController.criar);
router.put('/socios/:id', autenticar, auditoria, sociosController.atualizar);
router.delete('/socios/:id', autenticar, auditoria, sociosController.excluir);

// ── Sessões ──────────────────────────────────────────────────
router.get('/sessoes/ativas', autenticar, sessoesController.listarAtivas);
router.get('/sessoes', autenticar, sessoesController.listarTodas);
router.post('/sessoes', autenticar, auditoria, sessoesController.registrarEntrada);
router.get('/sessoes/:id/verificar-saida', autenticar, sessoesController.verificarSaida);
router.patch('/sessoes/:id/saida', autenticar, auditoria, sessoesController.registrarSaida);

// ── Produtos ─────────────────────────────────────────────────
router.get('/produtos', autenticar, produtosController.listar);
router.post('/produtos', autenticar, auditoria, produtosController.criar);
router.put('/produtos/:id', autenticar, auditoria, produtosController.atualizar);
router.delete('/produtos/:id', autenticar, auditoria, produtosController.excluir);

// ── Bar / Comandas ───────────────────────────────────────────
router.get('/comandas', autenticar, barController.listarComandas);
router.get('/comandas/:id', autenticar, barController.buscarComanda);
router.post('/comandas', autenticar, auditoria, barController.criarComanda);
router.post('/comandas/:id/itens', autenticar, barController.adicionarItem);
router.patch('/comandas/:id/itens/:itemId', autenticar, barController.alterarQuantidade);
router.patch('/comandas/:id/fechar', autenticar, auditoria, barController.fecharComanda);
router.post('/comandas/:id/pagamento', autenticar, auditoria, barController.registrarPagamento);

export default router;
