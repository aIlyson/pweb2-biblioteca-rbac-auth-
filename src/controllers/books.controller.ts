import { Request, Response } from 'express';
import { BooksService } from '../services/books.service.js';

export function handleListBooks(_req: Request, res: Response): void {
  const books = BooksService.listBooks();
  res.status(200).json(books);
}

export function handleCreateBook(req: Request, res: Response): void {
  const { titulo, autor } = req.body ?? {};
  const book = BooksService.createBook({ titulo, autor });
  res.status(201).json(book);
}
