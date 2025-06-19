import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PROMPTS_FILE_PATH = path.join(process.cwd(), 'data', 'prompts.json');

// 프롬프트 데이터 읽기
function readPrompts() {
  try {
    const data = fs.readFileSync(PROMPTS_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading prompts file:', error);
    throw new Error('프롬프트 파일을 읽을 수 없습니다.');
  }
}

// 프롬프트 데이터 쓰기
function writePrompts(data: any) {
  try {
    const dir = path.dirname(PROMPTS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PROMPTS_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing prompts file:', error);
    throw new Error('프롬프트 파일을 저장할 수 없습니다.');
  }
}

// GET - 모든 프롬프트 조회
export async function GET() {
  try {
    const prompts = readPrompts();
    return NextResponse.json(prompts);
  } catch (error) {
    return NextResponse.json(
      { error: '프롬프트를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT - 프롬프트 업데이트
export async function PUT(request: NextRequest) {
  try {
    const updateData = await request.json();
    
    // 비밀번호 필드가 있다면 제거 (테스트 환경이므로 인증 생략)
    const { password, ...promptData } = updateData;

    const currentPrompts = readPrompts();
    const updatedPrompts = { ...currentPrompts, ...promptData };
    
    writePrompts(updatedPrompts);

    return NextResponse.json({ 
      message: '프롬프트가 성공적으로 저장되었습니다.',
      data: updatedPrompts 
    });
  } catch (error) {
    console.error('Error updating prompts:', error);
    return NextResponse.json(
      { error: '프롬프트 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 