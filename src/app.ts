// Arquivo principal de funcionamento da API, todos mecanismos utilizados devem ser chamados aqui

import dotenv from 'dotenv';
import { resolve } from 'path';
import express, { Application } from 'express';

// Importação dos arquivos de configuração de rotas
import Routes from './routes/measureRoutes';

// Configuração das variáveis de ambiente
dotenv.config({ path: resolve(__dirname, '../.env') });

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }

  // Configuração de middlewares
  private middlewares(): void {
    // Middleware para interpretar JSON
    this.app.use(express.json({ limit: '50mb' }));
  }


  // Definição de rotas da API
  private routes(): void {
    this.app.use('/', Routes);
  }
}

export default new App().app;