import { Sequelize } from 'sequelize';

// Inicializa o Sequelize com o SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',  // Caminho para o arquivo do banco de dados SQLite
});

export default sequelize;
