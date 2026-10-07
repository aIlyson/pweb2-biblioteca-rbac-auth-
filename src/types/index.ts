export type Role = 'leitor' | 'bibliotecaria' | 'administrador';

export interface User {
  id: number;
  nome: string;
  papel: Role;
  senhaHash: string;
}

export type SafeUser = Omit<User, 'senhaHash'>;

export interface Book {
  id: number;
  titulo: string;
  autor: string;
  disponivel: boolean;
}

export interface Loan {
  id: number;
  livroId: number;
  usuarioId: number;
  dataEmprestimo: string;
  status: 'ativo' | 'devolvido';
}

export interface AuthPayload {
  sub: number;
  nome: string;
  papel: Role;
  jti: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
      token?: string;
    }
  }
}
