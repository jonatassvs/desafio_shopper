// Arquivo principal de funcionamento da API, todos mecanismos utilizados devem ser chamados aqui
import dotenv from 'dotenv';
import { resolve } from 'path';
import express, { Application } from 'express';

// Importação do Sequelize e do modelo Measure
import sequelize from './database';
import Measure from './models/Measure';

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
    this.database();
  }

  // Configuração de middlewares
  private middlewares(): void {
    // Middleware para interpretar JSON
    this.app.use(express.json({ limit: '50mb' }));

    // Middleware para servir arquivos estáticos da pasta uploads
    this.app.use('/uploads', express.static(resolve(__dirname, '../uploads')));
  }

  // Definição de rotas da API
  private routes(): void {
    this.app.use('/', Routes);
  }

  // Inicialização do banco de dados
  private async database(): Promise<void> {
    try {
      // Sincroniza todos os modelos com o banco de dados
      await sequelize.sync({ force: false });
      console.log('Banco de dados sincronizado com sucesso!');
    } catch (error) {
      console.error('Erro ao sincronizar o banco de dados:', error);
    }
  }
}

export default new App().app;