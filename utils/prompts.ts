import fs from 'fs';
import path from 'path';

// 프롬프트 데이터 읽기 함수
function readPromptsFromFile() {
  try {
    const promptsPath = path.join(process.cwd(), 'data', 'prompts.json');
    const data = fs.readFileSync(promptsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading prompts file:', error);
    // 기본 프롬프트 반환
    return {
      basePrompts: {
        withoutResume: "기본 시스템 프롬프트를 로드할 수 없습니다.",
        withResume: "기본 시스템 프롬프트를 로드할 수 없습니다."
      },
      positionPrompts: {},
      experiencePrompts: {},
      companyTypePrompts: {},
      outputFormats: {
        withoutResume: "",
        withResume: ""
      }
    };
  }
}

const promptsData = readPromptsFromFile();

export const BASE_PROMPTS = promptsData.basePrompts;

export const POSITION_PROMPTS = promptsData.positionPrompts;

export const EXPERIENCE_PROMPTS = promptsData.experiencePrompts;

export const COMPANY_TYPE_PROMPTS = promptsData.companyTypePrompts;

export const OUTPUT_FORMATS = promptsData.outputFormats;

export function buildSystemPrompt(
  position: string,
  experience: string,
  companyType: string,
  mainTasks: string,
  organizationalFocus: string,
  resumeText: string
): string {
  const hasResume = resumeText && resumeText.trim() !== '';
  
  // 이력서 유무에 따라 기본 프롬프트 선택
  const basePrompt = hasResume ? BASE_PROMPTS.withResume : BASE_PROMPTS.withoutResume;
  const outputFormat = hasResume ? OUTPUT_FORMATS.withResume : OUTPUT_FORMATS.withoutResume;
  
  const positionPrompt = POSITION_PROMPTS[position as keyof typeof POSITION_PROMPTS] || '';
  const experiencePrompt = EXPERIENCE_PROMPTS[experience as keyof typeof EXPERIENCE_PROMPTS] || '';
  const companyTypePrompt = COMPANY_TYPE_PROMPTS[companyType as keyof typeof COMPANY_TYPE_PROMPTS] || '';

  // 프롬프트 템플릿에서 플레이스홀더 교체
  let finalPrompt = basePrompt
    .replace('{{직무프롬프트}}', positionPrompt)
    .replace('{{경력프롬프트}}', experiencePrompt)
    .replace('{{기업형태프롬프트}}', companyTypePrompt)
    .replace('{{주요 업무 내용}}', mainTasks || '-')
    .replace('{{조직 차원의 핵심 고려 요소}}', organizationalFocus || '-');

  // 이력서가 있는 경우에만 이력서 내용 추가
  if (hasResume) {
    finalPrompt = finalPrompt.replace('{{이력서}}', resumeText);
  }

  return `${finalPrompt}\n\n${outputFormat}`;
} 