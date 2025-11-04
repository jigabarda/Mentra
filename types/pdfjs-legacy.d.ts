declare module "pdfjs-dist/legacy/build/pdf.js" {
  import { getDocument as gd } from "pdfjs-dist";
  export { gd as getDocument };
  export type {
    PDFDocumentProxy,
    TextItem,
  } from "pdfjs-dist/types/src/display/api";
}
