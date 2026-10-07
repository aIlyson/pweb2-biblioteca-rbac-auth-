import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthPayload } from '../types/index.js';
import { store } from '../store/index.js';
import { AppError } from '../errors/app-error.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'dev-key-ufpi-pweb2';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError(401, 'Token nao informado');
  }

  const token = authHeader.slice(7);

  if (store.isTokenRevoked(token)) {
    throw new AppError(401, 'Token revogado');
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as unknown as AuthPayload;
    req.user = payload;
    req.token = token;
    next();
  } catch {
    throw new AppError(401, 'Token invalido ou expirado');
  }
}
