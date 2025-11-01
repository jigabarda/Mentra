declare module "pdf-parse" {
  export interface PDFData {
    text: string;
    numpages: number;
    info: Record<string, unknown>;
  }

  export default function pdfParse(dataBuffer: Buffer): Promise<PDFData>;
}
