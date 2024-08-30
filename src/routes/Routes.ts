// Arquivo de configuração das rotas
import { Router, Request, Response } from 'express';
import Controller from '../controllers/Controller';

const router = Router();

// Definição das rotas e chamada dos seus respectivos controllers
router.post('/', (req: Request, res: Response) => {
  Controller.store(req, res);
});

router.patch('/', (req: Request, res: Response) => {
  Controller.confirm(req, res);
})

router.get('/', (req: Request, res: Response) => {
  Controller.list(req, res)
})

export default router;