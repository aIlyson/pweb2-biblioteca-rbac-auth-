import { User, SafeUser, Book, Loan } from '../types/index.js';
import { hashPassword } from '../utils/crypto.js';

class InMemoryStore {
  private users: User[] = [
    { id: 1, nome: 'Alysson Michel', papel: 'leitor', senhaHash: hashPassword('123') },
    { id: 2, nome: 'Maria Júlia', papel: 'bibliotecaria', senhaHash: hashPassword('123') },
    { id: 3, nome: 'Prof Evandro', papel: 'administrador', senhaHash: hashPassword('123') }
  ];

  private books: Book[] = [
    { id: 1, titulo: 'Sistemas de Informação Gerenciais', autor: 'Kenneth C. Laudon, Jane P. Laudon', disponivel: true },
    { id: 2, titulo: 'Sistemas de Banco de Dados', autor: 'Ramez Elmasri, Shamkant B. Navathe', disponivel: false },
    { id: 3, titulo: 'Engenharia de Software', autor: 'Ian Sommerville', disponivel: true },
    { id: 4, titulo: 'Redes de Computadores', autor: 'Andrew S. Tanenbaum, David J. Wetherall', disponivel: true }
  ];

  private loans: Loan[] = [
    { id: 1, livroId: 2, usuarioId: 1, dataEmprestimo: '2026-10-01', status: 'ativo' }
  ];

  private tokenDenylist = new Set<string>();

  // usuarios
  findUserByName(nome: string): User | undefined {
    const normalizedInput = nome.trim().toLowerCase();
    return this.users.find((u) => u.nome.trim().toLowerCase() === normalizedInput);
  }

  findUserById(id: number): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  listUsers(): SafeUser[] {
    return this.users.map(({ senhaHash: _, ...user }) => user);
  }

  // livros
  listBooks(): Book[] {
    return [...this.books];
  }

  findBookById(id: number): Book | undefined {
    return this.books.find((b) => b.id === id);
  }

  createBook(payload: Pick<Book, 'titulo' | 'autor'>): Book {
    const book: Book = {
      id: this.books.length + 1,
      titulo: payload.titulo,
      autor: payload.autor,
      disponivel: true
    };
    this.books.push(book);
    return book;
  }

  updateBookAvailability(id: number, disponivel: boolean): void {
    const book = this.findBookById(id);
    if (book) {
      book.disponivel = disponivel;
    }
  }

  // emprestimos
  listLoans(filterUserId?: number): Loan[] {
    if (filterUserId !== undefined) {
      return this.loans.filter((l) => l.usuarioId === filterUserId);
    }
    return [...this.loans];
  }

  createLoan(livroId: number, usuarioId: number): Loan {
    this.updateBookAvailability(livroId, false);
    const loan: Loan = {
      id: this.loans.length + 1,
      livroId,
      usuarioId,
      dataEmprestimo: new Date().toISOString().slice(0, 10),
      status: 'ativo'
    };
    this.loans.push(loan);
    return loan;
  }

  // tokens
  revokeToken(token: string): void {
    this.tokenDenylist.add(token);
  }

  isTokenRevoked(token: string): boolean {
    return this.tokenDenylist.has(token);
  }
}

export const store = new InMemoryStore();
