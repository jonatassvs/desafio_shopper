import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

class GoogleGeminiVision {
  private googleAI: GoogleGenerativeAI;
  private geminiModel: any;

  constructor() {
    const geminiApiKey: string | undefined = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }

    this.googleAI = new GoogleGenerativeAI(geminiApiKey);
    this.geminiModel = this.googleAI.getGenerativeModel({
      model: "gemini-1.5-flash", // Atualizado para o novo modelo
    });
  }

  private base64ToGenerativePart(base64String: string, mimeType: string) {
    return {
      inlineData: {
        data: base64String,
        mimeType,
      },
    };
  }

  public async generate(imageBase64: string): Promise<number> {
    try {
      const prompt = "Return only the number in the image";

      const imagePart = this.base64ToGenerativePart(imageBase64, "image/png");

      const result = await this.geminiModel.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = await response.text();

      // Converter o texto retornado para número
      const number = parseInt(text);
      console.log(number);

      if (isNaN(number)) {
        throw new Error("Failed to convert response to a number");
      }

      return number;
    } catch (error) {
      console.error("Error generating content", error);
      throw error;
    }
  }
}

export default GoogleGeminiVision;
