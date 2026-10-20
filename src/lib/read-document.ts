export async function readDocument(file: File): Promise<{ text: string; pages: number }> {
  if (!file.size || file.size > 5000000) throw new Error("Envie um arquivo de até 5 MB.");
  if (/\.txt$/i.test(file.name)) {
    const text = await file.text();
    if (text.length > 60000) throw new Error("Este texto é muito longo. Separe em documentos menores.");
    if (!text.trim() || text.includes("\u0000")) throw new Error("Envie texto legível.");
    return { text, pages: Math.max(1, Math.ceil(text.length / 2000)) };
  }
  if (!/\.pdf$/i.test(file.name)) throw new Error("Nesta versão, envie PDF com texto selecionável ou TXT.");
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false, disableFontFace: true });
  const document = await task.promise;
  try {
    if (document.numPages > 30) throw new Error("Separe PDFs com mais de 30 páginas antes de importar.");
    let text = "";
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      text += content.items.map(item => "str" in item ? item.str : "").join(" ") + "\n";
      if (text.length > 60000) throw new Error("O documento é muito longo. Separe em arquivos menores.");
    }
    if (!text.trim()) throw new Error("Este PDF parece ser uma imagem. OCR ainda não está disponível; envie um PDF com texto ou cole a transcrição.");
    return { text, pages: document.numPages };
  } finally { await document.destroy(); }
}
