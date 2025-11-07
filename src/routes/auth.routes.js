import { Router } from 'express';
import { cadastrarMembro, login } from '../controllers/auth.controller.js';

const router = Router();

router.post('/membros', cadastrarMembro);
router.post('/login', login);

export default router;