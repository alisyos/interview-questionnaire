import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { buildSystemPrompt } from '@/utils/prompts';
import { processResumeFile } from '@/utils/fileProcessor';
import { QuestionnaireOutput } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const position = formData.get('position') as string;
    const experience = formData.get('experience') as string;
    const companyType = formData.get('companyType') as string;
    const resumeFile = formData.get('resume') as File | null;

    // 필수 필드 검증
    if (!position || !experience || !companyType) {
      return NextResponse.json(
        { error: '직무, 경력, 기업형태는 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }

    // 이력서 텍스트 추출
    let resumeText = '';
    if (resumeFile && resumeFile.size > 0) {
      try {
        resumeText = await processResumeFile(resumeFile);
      } catch (error) {
        console.error('Resume processing error:', error);
        return NextResponse.json(
          { error: '이력서 파일 처리 중 오류가 발생했습니다.' },
          { status: 400 }
        );
      }
    }

    // 시스템 프롬프트 생성
    const systemPrompt = buildSystemPrompt(position, experience, companyType, resumeText);

    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('OpenAI API에서 응답을 받지 못했습니다.');
    }

    // JSON 파싱 및 검증
    let questionnaire: QuestionnaireOutput;
    try {
      questionnaire = JSON.parse(response);
    } catch (error) {
      console.error('JSON parsing error:', error);
      throw new Error('생성된 질문 형식이 올바르지 않습니다.');
    }

    return NextResponse.json(questionnaire);

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: '질문 생성 중 오류가 발생했습니다. 다시 시도해주세요.' },
      { status: 500 }
    );
  }
} 