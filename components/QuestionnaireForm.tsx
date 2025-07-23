'use client';

import { useState } from 'react';
import { QuestionnaireInput, QuestionnaireOutput, POSITIONS, EXPERIENCES, COMPANY_TYPES } from '@/types';
import LoadingModal from './LoadingModal';

interface QuestionnaireFormProps {
  onSubmit: (data: QuestionnaireOutput) => void;
}

export default function QuestionnaireForm({ onSubmit }: QuestionnaireFormProps) {
  const [formData, setFormData] = useState<QuestionnaireInput>({
    position: '',
    experience: '',
    companyType: '',
    mainTasks: '',
    organizationalFocus: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobPostingFile, setJobPostingFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleInputChange = (field: keyof QuestionnaireInput, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'resume' | 'jobPosting') => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 크기 검증 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('파일 크기는 10MB를 초과할 수 없습니다.');
        return;
      }
      
      // 디버깅을 위한 로그
      console.log('업로드된 파일:', file.name, '타입:', file.type);
      
      // 파일 형식 검증 (확장자도 함께 확인)
      const allowedTypes = [
        'application/pdf', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
        'image/png', 
        'image/jpeg', 
        'image/jpg',
        'image/gif'
      ];
      
      const fileName = file.name.toLowerCase();
      const isDocx = fileName.endsWith('.docx');
      const isPdf = fileName.endsWith('.pdf');
      const isImage = fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.gif');
      
      if (!allowedTypes.includes(file.type) && !(isDocx || isPdf || isImage)) {
        setError(`지원하지 않는 파일 형식입니다. 파일 타입: ${file.type}, 파일명: ${file.name}`);
        return;
      }
      
      if (fileType === 'resume') {
        setResumeFile(file);
      } else {
        setJobPostingFile(file);
      }
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 채용공고가 있는 경우와 없는 경우의 필수 필드 검증
      if (!jobPostingFile) {
        // 채용공고가 없는 경우 기존 필수 필드 검증
        if (!formData.position || !formData.experience || !formData.companyType || !formData.mainTasks) {
          throw new Error('채용공고가 없는 경우 직무, 경력, 기업형태, 주요 업무 내용은 필수 입력 항목입니다.');
        }
      }
      // 채용공고가 있는 경우 필수 필드 검증 생략

      const submitFormData = new FormData();
      submitFormData.append('position', formData.position);
      submitFormData.append('experience', formData.experience);
      submitFormData.append('companyType', formData.companyType);
      submitFormData.append('mainTasks', formData.mainTasks);
      submitFormData.append('organizationalFocus', formData.organizationalFocus);
      
      if (resumeFile) {
        submitFormData.append('resume', resumeFile);
      }

      if (jobPostingFile) {
        submitFormData.append('jobPosting', jobPostingFile);
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: submitFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '질문 생성에 실패했습니다.');
      }

      const result: QuestionnaireOutput = await response.json();
      onSubmit(result);

    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6">
        면접 질문지 생성
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 채용공고 업로드 - 최상단 배치 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            채용공고 업로드
          </label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, 'jobPosting')}
            accept=".pdf,.docx,.png,.jpg,.jpeg,.gif"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            문서 파일(DOCX, PDF) 또는 이미지 파일(JPG, PNG, GIF) (최대 10MB)
          </p>
          {jobPostingFile && (
            <p className="text-sm text-green-600 mt-1">
              선택된 파일: {jobPostingFile.name}
            </p>
          )}
          
          {/* 항상 표시되는 안내 문구 */}
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">
              💡 채용공고를 업로드 하시면, 자동으로 직무, 경력, 기업 정보를 추출함으로, 필수 입력 항목 입력을 생략할 수 있습니다.
            </p>
          </div>
          
          {jobPostingFile && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">
                ✅ 채용공고가 업로드되었습니다. 아래 필수 입력 항목들이 선택사항으로 변경되었습니다.
              </p>
            </div>
          )}
        </div>

        {/* 직무 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            직무 {!jobPostingFile && <span className="text-red-500">*</span>}
            {jobPostingFile && <span className="text-green-600">(선택사항)</span>}
          </label>
          <select
            value={formData.position}
            onChange={(e) => handleInputChange('position', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required={!jobPostingFile}
          >
            <option value="">직무를 선택해주세요</option>
            {POSITIONS.map(position => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
          {jobPostingFile && (
            <p className="text-sm text-gray-500 mt-1">
              채용공고에서 직무 정보를 추출합니다. 필요시 수동으로 선택할 수 있습니다.
            </p>
          )}
        </div>

        {/* 경력 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            경력 {!jobPostingFile && <span className="text-red-500">*</span>}
            {jobPostingFile && <span className="text-green-600">(선택사항)</span>}
          </label>
          <select
            value={formData.experience}
            onChange={(e) => handleInputChange('experience', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required={!jobPostingFile}
          >
            <option value="">경력을 선택해주세요</option>
            {EXPERIENCES.map(experience => (
              <option key={experience} value={experience}>
                {experience}
              </option>
            ))}
          </select>
          {jobPostingFile && (
            <p className="text-sm text-gray-500 mt-1">
              채용공고에서 경력 정보를 추출합니다. 필요시 수동으로 선택할 수 있습니다.
            </p>
          )}
        </div>

        {/* 기업형태 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            기업형태 {!jobPostingFile && <span className="text-red-500">*</span>}
            {jobPostingFile && <span className="text-green-600">(선택사항)</span>}
          </label>
          <select
            value={formData.companyType}
            onChange={(e) => handleInputChange('companyType', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required={!jobPostingFile}
          >
            <option value="">기업형태를 선택해주세요</option>
            {COMPANY_TYPES.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {jobPostingFile && (
            <p className="text-sm text-gray-500 mt-1">
              채용공고에서 기업형태 정보를 추출합니다. 필요시 수동으로 선택할 수 있습니다.
            </p>
          )}
        </div>

        {/* 주요 업무 내용 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            주요 업무 내용 {!jobPostingFile && <span className="text-red-500">*</span>}
            {jobPostingFile && <span className="text-green-600">(선택사항)</span>}
          </label>
          <textarea
            value={formData.mainTasks}
            onChange={(e) => handleInputChange('mainTasks', e.target.value)}
            placeholder={jobPostingFile ? "채용공고에서 주요 업무를 추출합니다. 추가 정보가 있다면 입력해주세요." : "예: 신규 제품 기획, 웹상세페이지 개발 등"}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            required={!jobPostingFile}
          />
          {jobPostingFile && (
            <p className="text-sm text-gray-500 mt-1">
              채용공고에서 주요 업무 내용을 추출합니다. 추가 정보가 있다면 입력해주세요.
            </p>
          )}
        </div>

        {/* 조직 차원의 핵심 고려 요소 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            조직 차원의 핵심 고려 요소
          </label>
          <textarea
            value={formData.organizationalFocus}
            onChange={(e) => handleInputChange('organizationalFocus', e.target.value)}
            placeholder="예: 커뮤니케이션 능력, 문제해결력, 인성 적합성 등"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>

        {/* 이력서 업로드 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이력서 업로드
          </label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, 'resume')}
            accept=".pdf,.docx,.png,.jpg,.jpeg,.gif"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            문서 파일(DOCX, PDF) 또는 이미지 파일(JPG, PNG, GIF) (최대 10MB)
          </p>
          {resumeFile && (
            <p className="text-sm text-green-600 mt-1">
              선택된 파일: {resumeFile.name}
            </p>
          )}
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? '질문 생성 중...' : '면접 질문 생성'}
        </button>
      </form>
      
      {/* 하단 여백 */}
      <div className="pb-8"></div>
      
      {/* 로딩 모달 */}
      <LoadingModal isOpen={isLoading} />
    </div>
  );
} 