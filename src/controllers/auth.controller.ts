import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';

export function handleLogin(req: Request, res: Response): void {
  const { nome, senha } = req.body ?? {};
  const result = AuthService.login(nome, senha);
  res.status(200).json(result);
}

export function handleLogout(req: Request, res: Response): void {
  AuthService.logout(req.token!);
  res.status(200).json({ message: 'Sessao encerrada' });
}
