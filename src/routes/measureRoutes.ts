// Arquivo de configuração das rotas
import { Router, Request, Response } from 'express';
import MeasureController from '../controllers/MeasureController';

const router = Router();

// Definição das rotas e chamada dos seus respectivos controllers
router.post('/', (req: Request, res: Response) => {
  MeasureController.store(req, res);
});

router.patch('/', (req: Request, res: Response) => {
  MeasureController.confirm(req, res);
})

router.get('/', (req: Request, res: Response) => {
  MeasureController.list(req, res)
})

export default router;