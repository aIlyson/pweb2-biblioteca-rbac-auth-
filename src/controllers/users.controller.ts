import { Request, Response } from 'express';
import { UsersService } from '../services/users.service.js';

export function handleListUsers(_req: Request, res: Response): void {
  const users = UsersService.listUsers();
  res.status(200).json(users);
}
