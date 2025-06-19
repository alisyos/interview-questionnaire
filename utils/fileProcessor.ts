import pdfParse from 'pdf-parse';
import { createWorker } from 'tesseract.js';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('PDF 파일을 읽는 중 오류가 발생했습니다.');
  }
}

export async function extractTextFromImage(buffer: Buffer): Promise<string> {
  try {
    const worker = await createWorker();
    await worker.loadLanguage('kor+eng');
    await worker.initialize('kor+eng');
    
    const { data: { text } } = await worker.recognize(buffer);
    await worker.terminate();
    
    return text;
  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error('이미지에서 텍스트를 추출하는 중 오류가 발생했습니다.');
  }
}

export async function processResumeFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type;
  
  if (mimeType === 'application/pdf') {
    return await extractTextFromPDF(buffer);
  } else if (mimeType.startsWith('image/')) {
    return await extractTextFromImage(buffer);
  } else {
    throw new Error('지원하지 않는 파일 형식입니다. PDF 또는 이미지 파일을 업로드해주세요.');
  }
} 