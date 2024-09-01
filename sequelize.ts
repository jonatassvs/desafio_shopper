#!/usr/bin/env ts-node

import { execSync } from 'child_process';

// Pega o comando da linha de comando
const command = process.argv.slice(2).join(' ');

// Executa o comando do sequelize-cli com ts-node
try {
  execSync(`npx sequelize-cli ${command}`, { stdio: 'inherit' });
} catch (error) {
  console.error('Erro ao executar o comando:', error);
  process.exit(1);
}
