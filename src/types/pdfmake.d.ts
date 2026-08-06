declare module "pdfmake/build/pdfmake" {
  interface PdfMakeOutputDocument {
    getBlob: () => Promise<Blob>;
    getBuffer: () => Promise<ArrayBuffer>;
    getBase64: () => Promise<string>;
    getDataUrl: () => Promise<string>;
    download: (filename?: string) => void;
    open: (win?: Window | null) => void;
    print: (win?: Window | null) => void;
  }

  interface PdfMakeInstance {
    addVirtualFileSystem: (vfs: Record<string, string>) => void;
    addFonts: (fonts: Record<string, Record<string, string>>) => void;
    createPdf: (docDefinition: unknown, options?: unknown) => PdfMakeOutputDocument;
  }

  const pdfMake: PdfMakeInstance;
  export default pdfMake;
}
