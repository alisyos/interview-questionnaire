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

    // 이력서 파일 처리
    let resumeContent = null;
    let resumeText = '';
    
    if (resumeFile && resumeFile.size > 0) {
      if (resumeFile.type.startsWith('image/')) {
        // 이미지 파일인 경우 - gpt-4.1이 직접 처리 (기존 방식 유지)
        const fileBuffer = await resumeFile.arrayBuffer();
        const base64File = Buffer.from(fileBuffer).toString('base64');
        resumeContent = {
          type: 'image_url' as const,
          image_url: {
            url: `data:${resumeFile.type};base64,${base64File}`
          }
        };
      } else {
        // PDF, DOCX 파일인 경우 - 텍스트 추출하여 프롬프트에 포함
        try {
          resumeText = await processResumeFile(resumeFile);
        } catch (error) {
          console.error('File processing error:', error);
          return NextResponse.json(
            { error: '파일 처리 중 오류가 발생했습니다.' },
            { status: 400 }
          );
        }
      }
    }

    // 시스템 프롬프트 생성 (텍스트 추출된 이력서 포함)
    const systemPrompt = buildSystemPrompt(position, experience, companyType, resumeText);

    // 메시지 배열 구성
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    // 이미지 파일이 있는 경우 메시지에 추가
    if (resumeContent) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: '첨부된 이미지는 지원자의 이력서입니다. 이 이력서 내용을 분석하여 개인 맞춤형 질문을 생성해주세요.'
          },
          resumeContent
        ]
      });
    }

    // gpt-4.1 모델로 처리
    console.log('Sending request to OpenAI with messages count:', messages.length);
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1', // ⚠️ 절대 바꾸지 말 것! 사용자 요청 모델
      messages: messages,
      temperature: 0.7,
      max_tokens: 4000,
    });

    const response = completion.choices[0]?.message?.content || '';
    
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