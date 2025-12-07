import { GoogleGenAI, Type } from "@google/genai";
import { UploadedImage, GeneratedPrompts } from "../types";

// Helper to convert File to Base64
const fileToPart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateVeoPrompts = async (
  images: UploadedImage[],
  userContext: string
): Promise<GeneratedPrompts> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepare image parts
  const imageParts = await Promise.all(images.map((img) => fileToPart(img.file)));

  // Schema for JSON output
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      prompt1: {
        type: Type.STRING,
        description: "Prompt for transition from Image 1 to Image 2 (Construction phase).",
      },
      prompt2: {
        type: Type.STRING,
        description: "Prompt for transition from Image 2 to Image 3 (Finishing phase).",
      },
      prompt3: {
        type: Type.STRING,
        description: "Prompt for Image 3 cinematic movement.",
      },
    },
    required: ["prompt1", "prompt2", "prompt3"],
  };

  const systemPrompt = `
    You are an expert Prompt Engineer for Google Veo 3.1, a high-fidelity video generation model.
    Your task is to analyze 3 provided images (Start, Middle, End) and user context to create 3 specific video generation prompts.

    **The Workflow:**
    1.  **Image 1 (Start):** Empty room/space.
    2.  **Image 2 (Middle):** Construction/Decoration in progress.
    3.  **Image 3 (End):** Finished, decorated room.

    **Global Requirements for ALL Prompts:**
    - **Visual Style:** Photorealistic, 8k, highly detailed, DSLR footage, cinematic lighting.
    - **Characters:** MUST include workers or people working. Their attire must match the theme of the room/work.
    - **Audio:** MUST include specific ASMR sound effects related to the action (e.g., drilling, painting, shuffling, footsteps).
    - **Audio Negative:** NO MUSIC. Ambient sounds only.
    - **Format:** The prompts should be descriptive and flow naturally.

    **Prompt 1 Specification (Start -> Middle):**
    - Describe a timelapse transformation from the empty state to the construction state.
    - Mention construction workers entering, bringing materials, setting up scaffolding or tools.
    - Sounds: Echoey footsteps, equipment setting up, light construction noises.

    **Prompt 2 Specification (Middle -> End):**
    - Describe a timelapse transformation from the construction state to the finished state.
    - Workers applying final touches, cleaning up, placing furniture, then leaving.
    - Sounds: Painting strokes, adjusting furniture, clicking of tools, satisfaction sighs.

    **Prompt 3 Specification (End -> Cinematic):**
    - Describe a slow, cinematic camera movement (e.g., slow pan, dolly in) showcasing the finished room.
    - The room is now alive but peaceful. Maybe one person enjoying the space or just pure architectural beauty.
    - Sounds: Room tone, distant city sound or nature sounds (depending on window view), soft fabric rustle.

    **User Context:** ${userContext}
    
    **Input Images:**
    - The first image provided is the START.
    - The second image provided is the MIDDLE.
    - The third image provided is the END.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          ...imageParts,
          { text: systemPrompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7, 
      },
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from Gemini.");

    const parsed = JSON.parse(resultText) as GeneratedPrompts;
    return parsed;
  } catch (error) {
    console.error("Error generating prompts:", error);
    throw error;
  }
};
