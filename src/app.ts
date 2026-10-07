import express, { Application, Request, Response, NextFunction } from 'express';
import routes from './routes/index.js';
import { AppError } from './errors/app-error.js';

export function createApp(): Application {
  const app = express();

  app.use(express.json());
  app.use(routes);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: 'Recurso nao encontrado' });
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ message: err.message });
      return;
    }

    console.error('[UnhandledError]', err);
    res.status(500).json({ message: 'Erro interno do servidor' });
  });

  return app;
}
