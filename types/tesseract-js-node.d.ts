declare module "tesseract.js" {
  export interface Worker {
    load(): Promise<void>;
    loadLanguage(lang: string): Promise<void>;
    initialize(lang: string): Promise<void>;
    setParameters(params: Record<string, unknown>): Promise<void>;
    recognize(input: string | Buffer): Promise<{ data: { text: string } }>;
    terminate(): Promise<void>;
  }
  export function createWorker(): Promise<Worker>;
  export const PSM: { AUTO: number };
}
