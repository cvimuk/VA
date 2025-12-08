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
  userContext: string,
  customApiKey?: string
): Promise<GeneratedPrompts> => {
  const apiKey = customApiKey || process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API Key is missing. Please enter your Gemini API Key.");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

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
        description: "Prompt for Image 3 cinematic movement (Walkthrough or Orbit).",
      },
      captions: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "3 catchy social media captions/titles (max 100 chars) with hashtags for USA audience.",
      }
    },
    required: ["prompt1", "prompt2", "prompt3", "captions"],
  };

  const systemPrompt = `
    You are an expert Prompt Engineer for Google Veo 3.1 and a Social Media Specialist.
    Your task is to analyze 3 provided images (Start, Middle, End) and user context to create 3 specific video generation prompts AND 3 viral social media captions.

    **The Workflow:**
    1.  **Image 1 (Start):** Empty room/space.
    2.  **Image 2 (Middle):** Construction/Decoration in progress.
    3.  **Image 3 (End):** Finished, decorated room.

    **Global Requirements for ALL Video Prompts:**
    - **Visual Style:** Photorealistic, 8k, highly detailed, DSLR footage, cinematic lighting.
    - **Characters:** MUST include workers or people working in every clip. Their attire must match the theme (e.g., hard hats for construction, casual/formal for finished spaces).
    - **Audio:** MUST include specific ASMR sound effects related to the action.
    - **Audio Negative:** NO MUSIC. Ambient sounds only.
    - **Format:** The prompts should be descriptive and flow naturally.

    **Prompt 1 Specification (Start -> Middle):**
    - **Type:** Timelapse.
    - Describe the transformation from the empty state to the construction state.
    - Mention construction workers entering, bringing materials, setting up scaffolding or tools.
    - Sounds: Echoey footsteps, equipment setting up, light construction noises.

    **Prompt 2 Specification (Middle -> End):**
    - **Type:** Timelapse.
    - Describe the transformation from the construction state to the finished state.
    - Workers applying final touches, cleaning up, placing furniture, then leaving.
    - Sounds: Painting strokes, adjusting furniture, clicking of tools, satisfaction sighs.

    **Prompt 3 Specification (End -> Cinematic Movement):**
    - **Type:** Real-time Cinematic Movement (NOT Timelapse).
    - **CRITICAL:** Analyze the "End" image to determine if it is an Interior or Exterior scene.
    - **If Interior:** Generate a "Walkthrough" or "Dolly In" prompt. Describe the camera smoothly moving *forward into* the space, guiding the viewer to explore details (furniture, lighting, textures).
    - **If Exterior/Building:** Generate an "Orbit" or "Overview" prompt. Describe the camera circling the subject or panning to showcase the scale and architecture, keeping the main building centered.
    - **Movement:** Smooth, professional, steady-cam or gimbal feel.
    - **Characters:** Include a person/worker in the shot to maintain the rule (e.g., an architect checking plans, a cleaner doing a final wipe, or a person simply admiring the space).
    - **Audio:** High-quality ambient room tone, distant city sounds (if urban), wind (if exterior), footsteps on the specific floor material.

    **Caption/Title Generation Specifications:**
    - Generate 3 distinct, catchy titles/captions for this video.
    - **Target Audience:** USA (English language).
    - **Length Constraint:** STRICTLY between 90 and 100 characters total.
    - **Content:** Must relate to the transformation/ASMR/Satisfaction.
    - **Hashtags:** Include 1-2 relevant hashtags (e.g., #asmr #satisfying #interiordesign).

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
