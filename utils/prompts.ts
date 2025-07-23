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
        noResumeNoJobPosting: "기본 시스템 프롬프트를 로드할 수 없습니다.",
        resumeNoJobPosting: "기본 시스템 프롬프트를 로드할 수 없습니다.",
        noResumeJobPosting: "기본 시스템 프롬프트를 로드할 수 없습니다.",
        resumeJobPosting: "기본 시스템 프롬프트를 로드할 수 없습니다."
      },
      positionPrompts: {},
      experiencePrompts: {},
      companyTypePrompts: {},
      outputFormats: {
        noResumeNoJobPosting: "",
        resumeNoJobPosting: "",
        noResumeJobPosting: "",
        resumeJobPosting: ""
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
  resumeText?: string,
  jobPostingText?: string
): string {
  const hasResume = resumeText && resumeText.trim() !== '';
  const hasJobPosting = jobPostingText && jobPostingText.trim() !== '';
  
  // 4가지 케이스에 따라 적절한 프롬프트 선택
  let promptKey: string;
  if (hasResume && hasJobPosting) {
    promptKey = 'resumeJobPosting';
  } else if (hasResume && !hasJobPosting) {
    promptKey = 'resumeNoJobPosting';
  } else if (!hasResume && hasJobPosting) {
    promptKey = 'noResumeJobPosting';
  } else {
    promptKey = 'noResumeNoJobPosting';
  }
  
  const basePrompt = BASE_PROMPTS[promptKey as keyof typeof BASE_PROMPTS] || '';
  const outputFormat = OUTPUT_FORMATS[promptKey as keyof typeof OUTPUT_FORMATS] || '';
  
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
    finalPrompt = finalPrompt.replace('{{이력서}}', resumeText || '');
  }

  // 채용공고가 있는 경우에만 채용공고 내용 추가
  if (hasJobPosting) {
    finalPrompt = finalPrompt.replace('{{채용공고}}', jobPostingText || '');
  }

  return `${finalPrompt}\n\n${outputFormat}`;
} 