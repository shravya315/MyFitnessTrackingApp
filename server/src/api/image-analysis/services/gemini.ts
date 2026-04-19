import fs from "fs";

export const analyzeImage = async (filePath: string) => {
  const { GoogleGenAI } = await import("@google/genai");

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    const base64ImageFile = fs.readFileSync(filePath, {
      encoding: "base64",
    });

    const contents = [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64ImageFile,
        },
      },
      {
        text: "Extract the food name and estimate calories from this image in a JSON object.",
      },
    ];

    const config = {
      responseMimeType: "application/json",
      responseJsonSchema: {
        type: "object",
        properties: {
          name: { type: "string" },
          calories: { type: "number" },
        },
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config,
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.log(error);
    throw error;
  }
};