import { Router } from 'express';
import { handleLogin, handleLogout } from '../controllers/auth.controller.js';
import { handleListBooks, handleCreateBook } from '../controllers/books.controller.js';
import { handleListLoans, handleCreateLoan } from '../controllers/loans.controller.js';
import { handleListUsers } from '../controllers/users.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

// auth
router.post('/login', handleLogin);
router.post('/logout', authenticate, handleLogout);

// livros
router.get('/livros', authenticate, handleListBooks);
router.post('/livros', authenticate, authorize('bibliotecaria', 'administrador'), handleCreateBook);

// emprestimos
router.get('/emprestimos', authenticate, handleListLoans);
router.post('/emprestimos', authenticate, handleCreateLoan);

// rota de admin
router.get('/usuarios', authenticate, authorize('administrador'), handleListUsers);

export default router;
