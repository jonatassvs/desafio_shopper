import { Request, Response } from 'express';
import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import Measure from '../models/Measure'; 
import GoogleGeminiVision from '../utils/GoogleGeminiVision';

const router = Router();

class MeasureController{
  private googleGeminiVision = new GoogleGeminiVision();

  // Método responsável por fazer o upload da imagem e processa-la no gemini e salvar no banco de dados
  async store(req: Request, res: Response): Promise<void> {
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
    try {
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

      // Decodificar e salvar o arquivo
      await fs.promises.writeFile(filePath, base64Data, 'base64');

      // Chamar o método generate da classe GoogleGeminiVision
      const measureValue = await this.googleGeminiVision.generate(image.replace(/^data:image\/\w+;base64,/, ''));

      // Gerar um UUID único
      const measureUUID = uuidv4();

      // Salvar no banco de dados
      const newMeasure = await Measure.create({
        customer_code,
        measure_datetime,
        measure_type,
        measure_value: measureValue,
        measure_uuid: measureUUID,
        confirmed_value: 0,
      });

      // Retornar resposta de sucesso com o valor calculado
      res.status(200).json({
        image_url: `http://localhost:3000/uploads/images/image.${extension}`,
        measure_value: measureValue,
        measure_uuid: measureUUID
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error_code: "SERVER_ERROR",
        error_description: "Erro ao processar a imagem com o Google Gemini"
      });
    }
  }

  confirm(req: Request, res: Response){
    res.send('Confirmado');
  }

  list(req: Request, res: Response){
    res.send('Lista');
  }
}

export default new MeasureController();