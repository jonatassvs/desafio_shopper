import { Request, Response } from 'express';
import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

class Controller{

  // Método responsável por fazer o upload da imagem e processa-la no gemini e salvar no banco de dados
  store(req: Request, res: Response): void {
    const { image, customer_code, measure_datetime, measure_type } = req.body;

    // Validar se todos os campos obrigatórios estão presentes
    if (!image || !customer_code || !measure_datetime || !measure_type) {
      res.status(400).json({
        error_code: "INVALID_DATA",
        error_description: "Campos obrigatórios não fornecidos."
      });
      return;
    }

    // Validar o tipo de medida
    const validMeasureTypes = ["WATER", "GAS"];

    if (!validMeasureTypes.includes(measure_type.toUpperCase())) {
      res.status(400).json({
        error_code: "INVALID_DATA",
        error_description: "Tipo de medida inválido."
      });
      return;
    }

    // Validar o formato da imagem Base64
    const matches = image.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      res.status(400).json({
        error_code: "INVALID_DATA",
        error_description: "Formato de imagem Base64 inválido."
      });
      return;
    }

    const extension = matches[1];
    const base64Data = matches[2];

    // Definir o caminho onde o arquivo será salvo
    const filePath = path.join(__dirname, '..', '..', 'uploads', 'images', `image.${extension}`);

    // Simular verificação de duplicidade
    const isDuplicate = false; // Substitua pela lógica real de verificação de duplicidade
    if (isDuplicate) {
      res.status(409).json({
        error_code: "DOUBLE_REPORT",
        error_description: "Leitura do mês já realizada"
      });
      return;
    }

    // Criar o diretório se não existir
    fs.mkdir(path.dirname(filePath), { recursive: true }, (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({
          error_code: "SERVER_ERROR",
          error_description: "Erro ao criar o diretório"
        });
        return;
      }

      // Decodificar e salvar o arquivo
      fs.writeFile(filePath, base64Data, 'base64', (err) => {
        if (err) {
          console.error(err);
          res.status(500).json({
            error_code: "SERVER_ERROR",
            error_description: "Erro ao salvar a imagem"
          });
          return;
        }

        // Retornar resposta de sucesso com dados fictícios
        res.status(200).json({
          image_url: `http://example.com/uploads/images/image.${extension}`,
          measure_value: 123, // Substitua pelo valor calculado
          measure_uuid: 'abc-123-uuid' // Substitua pelo UUID real
        });
      });
    });
  }

  confirm(req: Request, res: Response){
    res.send('Confirmado');
  }

  list(req: Request, res: Response){
    res.send('Lista');
  }
}

export default new Controller();