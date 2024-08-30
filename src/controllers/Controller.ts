import { Request, Response } from 'express';
import { Router } from 'express';

const router = Router();

class Controller{

  store(req: Request, res: Response){
    res.send('Upload');
  }

  confirm(req: Request, res: Response){
    res.send('Confirmado');
  }

  list(req: Request, res: Response){
    res.send('Lista');
  }
}

export default new Controller();