import { Request, Response } from 'express';
import { LoansService } from '../services/loans.service.js';

export function handleListLoans(req: Request, res: Response): void {
  const loans = LoansService.listLoans(req.user!);
  res.status(200).json(loans);
}

export function handleCreateLoan(req: Request, res: Response): void {
  const { livroId, usuarioId } = req.body ?? {};
  const loan = LoansService.createLoan(req.user!, {
    livroId: Number(livroId),
    usuarioId: usuarioId ? Number(usuarioId) : undefined
  });
  res.status(201).json(loan);
}
