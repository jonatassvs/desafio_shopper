// Arquivo de configuração do servidor
import app from './app';

const port = 3000;
app.listen(port, () => {
  console.log();
  console.log(`Escutando na porta ${port}`);
});
