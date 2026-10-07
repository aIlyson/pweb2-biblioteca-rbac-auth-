import { store } from '../store/index.js';
import { Book } from '../types/index.js';
import { AppError } from '../errors/app-error.js';

export interface CreateBookDTO {
  titulo: string;
  autor: string;
}

export class BooksService {
  static listBooks(): Book[] {
    return store.listBooks();
  }

  static createBook(dto: CreateBookDTO): Book {
    const titulo = dto.titulo?.trim();
    const autor = dto.autor?.trim();

    if (!titulo || !autor) {
      throw new AppError(400, 'Titulo e autor sao campos obrigatorios');
    }

    return store.createBook({ titulo, autor });
  }
}
