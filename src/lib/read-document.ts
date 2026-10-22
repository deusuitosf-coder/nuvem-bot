export async function readDocument(file: File): Promise<{ text: string; pages: number }> {
  if (!file.size || file.size > 5000000) throw new Error("Envie um arquivo de até 5 MB.");
  if (/\.txt$/i.test(file.name)) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    if ((bytes[0] === 0x4d && bytes[1] === 0x5a) || (bytes[0] === 0x50 && bytes[1] === 0x4b) || (bytes[0] === 0x7f && bytes[1] === 0x45 && bytes[2] === 0x4c && bytes[3] === 0x46)) throw new Error("O conteúdo não corresponde a um arquivo de texto.");
    let text: string;
    try { text = new TextDecoder("utf-8", { fatal: true }).decode(bytes); }
    catch { throw new Error("Envie um TXT legível salvo em UTF-8."); }
    if (text.length > 60000) throw new Error("Este texto é muito longo. Separe em documentos menores.");
    if (!text.trim() || text.includes("\u0000")) throw new Error("Envie texto legível.");
    return { text, pages: Math.max(1, Math.ceil(text.length / 2000)) };
  }
  if (!/\.pdf$/i.test(file.name)) throw new Error("Nesta versão, envie PDF com texto selecionável ou TXT.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!/^%PDF-\d\.\d/.test(new TextDecoder().decode(bytes.slice(0, 8)))) throw new Error("O conteúdo não corresponde a um PDF válido.");
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const task = pdfjs.getDocument({ data: bytes, isEvalSupported: false, disableFontFace: true });
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
