import { Router } from 'express';
import {
  criarEmprestimo,
  devolverLivro,
  listarEmprestimos,
  deletarEmprestimo,
} from '../controllers/emprestimos.controller.js';
import { verificarToken, verificarAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Todas as rotas de empréstimo exigem login
router.use(verificarToken);

router.post('/', criarEmprestimo);
router.put('/:id/devolver', devolverLivro); 
router.get('/', listarEmprestimos); 
router.delete('/:id', verificarAdmin, deletarEmprestimo); 

export default router;