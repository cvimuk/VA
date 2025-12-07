export interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
  label: string;
  description: string;
}

export interface GeneratedPrompts {
  prompt1: string; // Empty -> In Progress
  prompt2: string; // In Progress -> Finished
  prompt3: string; // Finished -> Cinematic Move
  captions: string[]; // 3 Social Media Captions
}

export enum AppState {
  IDLE,
  ANALYZING,
  SUCCESS,
  ERROR
}