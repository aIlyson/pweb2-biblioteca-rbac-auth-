import { Request, Response, NextFunction } from 'express';
import { Role } from '../types/index.js';
import { AppError } from '../errors/app-error.js';

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(401, 'Usuario nao autenticado');
    }

    if (!allowedRoles.includes(req.user.papel)) {
      throw new AppError(403, 'Acesso negado para o papel atual');
    }

    next();
  };
}
