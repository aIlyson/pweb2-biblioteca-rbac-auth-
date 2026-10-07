import { store } from '../store/index.js';
import { Loan, AuthPayload } from '../types/index.js';
import { AppError } from '../errors/app-error.js';

export interface CreateLoanDTO {
  livroId: number;
  usuarioId?: number;
}

export class LoansService {
  static listLoans(requester: AuthPayload): Loan[] {
    const filterUserId = requester.papel === 'leitor' ? requester.sub : undefined;
    return store.listLoans(filterUserId);
  }

  static createLoan(requester: AuthPayload, dto: CreateLoanDTO): Loan {
    if (!dto.livroId || isNaN(Number(dto.livroId))) {
      throw new AppError(400, 'Identificador de livro invalido');
    }

    const book = store.findBookById(Number(dto.livroId));
    if (!book) {
      throw new AppError(404, 'Livro nao encontrado');
    }

    if (!book.disponivel) {
      throw new AppError(409, 'Livro indisponivel para emprestimo');
    }

    let targetUserId = requester.sub;

    if (requester.papel !== 'leitor' && dto.usuarioId) {
      const targetUser = store.findUserById(Number(dto.usuarioId));
      if (!targetUser) {
        throw new AppError(404, 'Usuario beneficiario nao encontrado');
      }
      targetUserId = targetUser.id;
    }

    return store.createLoan(book.id, targetUserId);
  }
}
