import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { store } from '../store/index.js';
import { JWT_SECRET } from '../middleware/auth.js';
import { AuthPayload, SafeUser } from '../types/index.js';
import { AppError } from '../errors/app-error.js';
import { verifyPassword } from '../utils/crypto.js';

export interface LoginResult {
  token: string;
  user: SafeUser;
}

export class AuthService {
  static login(nome: string, senha: string): LoginResult {
    if (!nome?.trim() || !senha?.trim()) {
      throw new AppError(400, 'Nome e senha sao obrigatorios');
    }

    const user = store.findUserByName(nome);
    if (!user || !verifyPassword(senha, user.senhaHash)) {
      throw new AppError(401, 'Credenciais invalidas');
    }

    const payload: AuthPayload = {
      sub: user.id,
      nome: user.nome,
      papel: user.papel,
      jti: randomUUID()
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    return {
      token,
      user: {
        id: user.id,
        nome: user.nome,
        papel: user.papel
      }
    };
  }

  static logout(token: string): void {
    if (!token) {
      throw new AppError(400, 'Token nao fornecido para encerramento de sessao');
    }
    store.revokeToken(token);
  }
}
