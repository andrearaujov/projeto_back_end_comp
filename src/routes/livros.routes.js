import { Router } from 'express';
import {
  listarLivros,
  obterLivro,
  criarLivro,
  atualizarLivro,
  deletarLivro,
} from '../controllers/livros.controller.js';
import { verificarToken, verificarAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Rotas públicas (só precisam de login)
router.get('/', verificarToken, listarLivros);
router.get('/:id', verificarToken, obterLivro);

// Rotas de Admin (precisam de login + admin)
router.post('/', [verificarToken, verificarAdmin], criarLivro);
router.put('/:id', [verificarToken, verificarAdmin], atualizarLivro);
router.delete('/:id', [verificarToken, verificarAdmin], deletarLivro);

export default router;