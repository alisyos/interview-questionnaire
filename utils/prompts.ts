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
      basePrompt: "기본 시스템 프롬프트를 로드할 수 없습니다.",
      positionPrompts: {},
      experiencePrompts: {},
      companyTypePrompts: {},
      outputFormat: ""
    };
  }
}

const promptsData = readPromptsFromFile();

export const BASE_PROMPT = promptsData.basePrompt;

export const POSITION_PROMPTS = promptsData.positionPrompts;

export const EXPERIENCE_PROMPTS = promptsData.experiencePrompts;

export const COMPANY_TYPE_PROMPTS = promptsData.companyTypePrompts;

export const OUTPUT_FORMAT = promptsData.outputFormat;

export function buildSystemPrompt(
  position: string,
  experience: string,
  companyType: string,
  resumeText: string
): string {
  const positionPrompt = POSITION_PROMPTS[position as keyof typeof POSITION_PROMPTS] || '';
  const experiencePrompt = EXPERIENCE_PROMPTS[experience as keyof typeof EXPERIENCE_PROMPTS] || '';
  const companyTypePrompt = COMPANY_TYPE_PROMPTS[companyType as keyof typeof COMPANY_TYPE_PROMPTS] || '';

  return `${BASE_PROMPT}

###직무
${positionPrompt}

###경력
${experiencePrompt}

###기업형태
${companyTypePrompt}

###이력서
${resumeText || '-'}

${OUTPUT_FORMAT}`;
} 