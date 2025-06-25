export interface QuestionnaireInput {
  position: string;
  experience: string;
  companyType: string;
  mainTasks: string;
  organizationalFocus: string;
  resume?: string;
}

export interface Question {
  question: string;
  followUps: string[];
}

export interface IndividualQuestion extends Question {
  resumeSource: string;
}

export interface QuestionnaireOutput {
  commonQuestions: Question[];
  individualQuestions: IndividualQuestion[];
}

export const POSITIONS = [
  '경영·전략',
  '제품·서비스 기획',
  '연구·개발 (R&D) / 엔지니어링',
  '생산·운영 / 프로젝트 딜리버리',
  '품질·안전 / 규제 대응',
  '영업·BizDev',
  '마케팅·브랜드',
  '고객지원·CX',
  '재무·회계',
  '인사·총무 / 조직문화',
  'IT 인프라·보안',
  '법무·컴플라이언스'
];

export const EXPERIENCES = ['신입', '경력'];

export const COMPANY_TYPES = ['공기업', '사기업', '공공기관']; 