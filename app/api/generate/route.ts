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
    const mainTasks = formData.get('mainTasks') as string;
    const organizationalFocus = formData.get('organizationalFocus') as string;
    const resumeFile = formData.get('resume') as File | null;
    const jobPostingFile = formData.get('jobPosting') as File | null;

    // 채용공고가 없는 경우에만 필수 필드 검증
    if (!jobPostingFile || jobPostingFile.size === 0) {
      if (!position || !experience || !companyType || !mainTasks) {
        return NextResponse.json(
          { error: '채용공고가 없는 경우 직무, 경력, 기업형태, 주요 업무 내용은 필수 입력 항목입니다.' },
          { status: 400 }
        );
      }
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
          console.error('Resume file processing error:', error);
          return NextResponse.json(
            { error: '이력서 파일 처리 중 오류가 발생했습니다.' },
            { status: 400 }
          );
        }
      }
    }

    // 채용공고 파일 처리
    let jobPostingContent = null;
    let jobPostingText = '';
    
    if (jobPostingFile && jobPostingFile.size > 0) {
      if (jobPostingFile.type.startsWith('image/')) {
        // 이미지 파일인 경우 - gpt-4.1이 직접 처리
        const fileBuffer = await jobPostingFile.arrayBuffer();
        const base64File = Buffer.from(fileBuffer).toString('base64');
        jobPostingContent = {
          type: 'image_url' as const,
          image_url: {
            url: `data:${jobPostingFile.type};base64,${base64File}`
          }
        };
      } else {
        // PDF, DOCX 파일인 경우 - 텍스트 추출하여 프롬프트에 포함
        try {
          jobPostingText = await processResumeFile(jobPostingFile);
        } catch (error) {
          console.error('Job posting file processing error:', error);
          return NextResponse.json(
            { error: '채용공고 파일 처리 중 오류가 발생했습니다.' },
            { status: 400 }
          );
        }
      }
    }

    // 시스템 프롬프트 생성 (텍스트 추출된 이력서 및 채용공고 포함)
    const systemPrompt = buildSystemPrompt(position, experience, companyType, mainTasks, organizationalFocus, resumeText, jobPostingText);

    // 메시지 배열 구성
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    // 이미지 파일이 있는 경우 메시지에 추가
    if (resumeContent || jobPostingContent) {
      const contentParts: any[] = [];
      
      if (resumeContent && jobPostingContent) {
        contentParts.push({
          type: 'text',
          text: '첨부된 이미지들은 지원자의 이력서와 채용공고입니다. 이 내용을 분석하여 맞춤형 질문을 생성해주세요.'
        });
        contentParts.push(resumeContent);
        contentParts.push(jobPostingContent);
      } else if (resumeContent) {
        contentParts.push({
          type: 'text',
          text: '첨부된 이미지는 지원자의 이력서입니다. 이 이력서 내용을 분석하여 개인 맞춤형 질문을 생성해주세요.'
        });
        contentParts.push(resumeContent);
      } else if (jobPostingContent) {
        contentParts.push({
          type: 'text',
          text: '첨부된 이미지는 채용공고입니다. 이 채용공고 내용을 분석하여 적절한 질문을 생성해주세요.'
        });
        contentParts.push(jobPostingContent);
      }
      
      messages.push({
        role: 'user',
        content: contentParts
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
      // "json" 키워드로 시작하는 경우 제거
      let cleanedResponse = response.trim();
      
      // "json" 키워드가 맨 앞에 있는 경우 제거
      if (cleanedResponse.startsWith('json')) {
        cleanedResponse = cleanedResponse.substring(4).trim();
      }
      
      // 코드 블록 표시(```)가 있는 경우 제거
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      
      console.log('Cleaned response:', cleanedResponse.substring(0, 200) + '...');
      
      questionnaire = JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('JSON parsing error:', error);
      console.error('Raw response:', response.substring(0, 500) + '...');
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