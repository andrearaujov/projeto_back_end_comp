import { Router } from 'express';
import {
  criarEmprestimo,
  devolverLivro,
  listarEmprestimos,
} from '../controllers/emprestimos.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Todas as rotas de empréstimo exigem login
router.use(verificarToken);

router.post('/', criarEmprestimo);
router.put('/:id/devolver', devolverLivro); 
router.get('/', listarEmprestimos); 

export default router;