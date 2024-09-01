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

    // Verificar se já existe uma medida com o mesmo tipo e data
    const existingMeasure = await Measure.findOne({
      where: {
        measure_type: measure_type.toUpperCase(),
        measure_datetime
      }
    });

    if (existingMeasure) {
      res.status(409).json({
        error_code: 'DOUBLE_REPORT',
        error_description: 'Já existe uma medida para este tipo e data.',
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

  // Metodo responsável por confirmar os dados no banco de dados
  async confirm(req: Request, res: Response){
    const {measure_uuid, confirmed_value} = req.body;

    // Validar se todos os campos obrigatórios estão presentes
    if(!measure_uuid || !confirmed_value){
      res.status(400).json({
        error_code: "INVALID_DATA",
        error_description: "Campos obrigatórios não fornecidos."
      });
      return;
    }

    try {
      // Buscar a medida no banco de dados
      const measure = await Measure.findOne({ where: { measure_uuid } });

      // Verificar se a medida foi encontrada
      if (!measure) {
        res.status(404).json({
          error_code: 'MEASURE_NOT_FOUND',
          error_description: 'Leitura não encontrada.'
        });
        return;
      }

      // Verificar se a medida já foi confirmada
      if (measure.confirmed_value !== 0) {
        res.status(409).json({
          error_code: 'CONFIRMATION_DUPLICATE',
          error_description: 'Leitura já confirmada.'
        });
        return;
      }

      // Atualizar o campo confirmed_value
      measure.confirmed_value = confirmed_value;
      await measure.save();

      // Responder com sucesso
      res.status(200).json({
        success: true
      });
    } catch (error) {
      console.error('Erro ao confirmar a leitura:', error);
      res.status(500).json({
        error_code: 'SERVER_ERROR',
        error_description: 'Erro ao processar a confirmação da leitura.'
      });
    }

  }

  // Método para listar todas as medidas de um cliente
  public async list(req: Request, res: Response): Promise<void> {
    const customerCode = req.params.customer_code;
    const measureType = req.query.measure_type as string;

    // Validar se o código do cliente foi fornecido
    if (!customerCode) {
      res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description: 'Código do cliente não fornecido.'
      });
      return;
    }

    // Validar o tipo de medida
    const validMeasureTypes = ['WATER', 'GAS'];
    if (measureType && !validMeasureTypes.includes(measureType.toUpperCase())) {
      res.status(400).json({
        error_code: 'INVALID_TYPE',
        error_description: 'Tipo de medição não permitido.'
      });
      return;
    }

    try {
      // Filtrar medidas com base no código do cliente e no tipo de medida (se fornecido)
      const measures = await Measure.findAll({
        where: {
          customer_code: customerCode,
          ...(measureType ? { measure_type: measureType.toUpperCase() } : {})
        }
      });

      // Verificar se nenhuma medida foi encontrada
      if (measures.length === 0) {
        res.status(404).json({
          error_code: 'MEASURES_NOT_FOUND',
          error_description: 'Nenhuma leitura encontrada.'
        });
        return;
      }

      // Formatar resposta
      const formattedMeasures = measures.map(measure => ({
        measure_uuid: measure.measure_uuid,
        measure_datetime: measure.measure_datetime,
        measure_type: measure.measure_type,
        has_confirmed: measure.confirmed_value !== 0,
        image_url: `http://localhost:3000/uploads/images/image.png` // Exemplo, ajuste conforme necessário
      }));

      res.status(200).json({
        customer_code: customerCode,
        measures: formattedMeasures
      });
    } catch (error) {
      console.error('Erro ao listar medidas:', error);
      res.status(500).json({
        error_code: 'SERVER_ERROR',
        error_description: 'Erro ao buscar medidas no banco de dados.'
      });
    }
  }
}

export default new MeasureController();