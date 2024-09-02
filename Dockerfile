# Usar uma imagem base com Node.js
FROM node:18

# Definir o diretório de trabalho dentro do container
WORKDIR /usr/src/app

RUN apt update && apt install sqlite3

RUN mkdir -p /usr/src/app/database && chmod -R 777 /usr/src/app/database

# Copiar os arquivos do projeto para o diretório de trabalho
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src

# Remova node_modules se existir (para garantir uma instalação limpa)
RUN rm -rf node_modules

# Instalar as dependências
RUN npm install

# Rodar o build
RUN npm run build

# Expor a porta que o aplicativo usará
EXPOSE 3000

# Definir o comando de inicialização
CMD ["npm", "run", "start"]
