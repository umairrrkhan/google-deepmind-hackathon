import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI with the provided API key
const API_KEY = "AIzaSyCErflHqnsJ8WyYAMr2uS5CE7fSPOD6hA8";
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Generates an image using Google's Gemini API
 * @param prompt The text prompt to generate an image from
 * @param width The width of the image to generate
 * @param height The height of the image to generate
 * @returns A Promise that resolves to a data URL of the generated image
 */
export async function generateImageFromPrompt(prompt: string, contextImages: string[], width: number, height: number): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });

    const promptParts: any[] = [
      ...contextImages.map(imageSrc => {
        const [header, data] = imageSrc.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
        return {
          inlineData: {
            mimeType,
            data
          }
        };
      }),
      { text: `Generate an image based on this description and any provided images: ${prompt}. The image should be ${width}x${height} pixels.` }
    ];

    const result = await model.generateContent(promptParts);
    const response = result.response;
    const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePart && imagePart.inlineData) {
      const { mimeType, data } = imagePart.inlineData;
      return `data:${mimeType};base64,${data}`;
    } else {
      console.error("No image data found in response:", JSON.stringify(response, null, 2));
      throw new Error("No image data found in the response from the AI.");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    return createPlaceholderImage("Error: " + (error as Error).message, width, height);
  }
}

/**
 * Creates a placeholder image with text
 * @param text The text to display on the image
 * @param width The width of the image
 * @param height The height of the image
 * @returns A data URL of the generated image
 */
function createPlaceholderImage(text: string, width: number, height: number): string {
  // Create a canvas to generate the image
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    // Fallback if canvas is not supported
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="20" fill="#333" text-anchor="middle" dy=".3em">Generated Image</text></svg>`;
  }
  
  // Draw background with a gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#ff9a9e');
  gradient.addColorStop(0.5, '#fad0c4');
  gradient.addColorStop(1, '#a1c4fd');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Draw border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, width - 4, height - 4);
  
  // Draw text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Wrap text
  const maxWidth = width - 40;
  const words = text.split(' ');
  let line = '';
  const lines = [];
  
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      lines.push(line);
      line = words[i] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);
  
  // Draw lines
  const lineHeight = 35;
  const startY = (height - (lines.length * lineHeight)) / 2;
  
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], width / 2, startY + (i * lineHeight));
  }
  
  // Draw label
  ctx.font = '18px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('AI Generated', width / 2, height - 30);
  
  return canvas.toDataURL('image/png');
}