import { Sequelize } from 'sequelize';

// Inicializa o Sequelize com o SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
});

export default sequelize;
